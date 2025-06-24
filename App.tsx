import React, { useState, useEffect, useCallback } from 'react';
import { ChatMessage, SavedPrompt, HistoryEntry, Agent, OrchestrationResponse, OrchestrationStep, AgentCapability } from './types';
import { geminiService } from './services/geminiService';
import Sidebar from './components/Sidebar';
import MainArea from './components/MainArea';
import AgentsView from './components/views/AgentsView';
import PromptsView from './components/views/PromptsView';
import HistoryView from './components/views/HistoryView';
import SettingsView from './components/views/SettingsView';
import { APP_TITLE, VIEW_TYPES, ViewType } from './constants';
import { v4 as uuidv4 } from 'uuid';
import { 
  getPrompts, savePrompt as savePromptToStorage, deletePromptById as deletePromptFromStorage,
  getAgents as getAgentsFromStorage, saveAgent as saveAgentToStorage, deleteAgentById as deleteAgentFromStorage,
  getHistory as getHistoryFromStorage, saveHistoryEntry, deleteHistoryEntryById as deleteHistoryFromStorage
} from './services/localStorageService';
import { SelectedOutputType } from './components/PromptInput'; // Import SelectedOutputType


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(VIEW_TYPES.CHAT);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(true);

  const [agents, setAgents] = useState<Agent[]>(getAgentsFromStorage());
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>(getPrompts());
  const [history, setHistory] = useState<HistoryEntry[]>(getHistoryFromStorage());
  const [currentOrchestration, setCurrentOrchestration] = useState<OrchestrationStep[] | null>(null);
  
  useEffect(() => {
    document.title = APP_TITLE;
  }, []);

  useEffect(() => {
    setAgents(getAgentsFromStorage());
  }, [currentView]);


  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage => {
    const newMessage: ChatMessage = {
      id: uuidv4(),
      timestamp: new Date(),
      ...message,
    };
    setChatMessages(prev => [...prev, newMessage]);
    return newMessage;
  };
  
  const updateMessage = (id: string, updates: Partial<ChatMessage>) => {
    setChatMessages(prev => prev.map(msg => msg.id === id ? {...msg, ...updates, isLoading: false} : msg));
  };
  
  const updateOrchestrationStepStatus = (stepIndex: number, status: OrchestrationStep['status'], result?: string, errorMsg?: string) => {
    setCurrentOrchestration(prev => {
      if (!prev) return null;
      const newOrchestration = [...prev];
      if (newOrchestration[stepIndex]) {
        newOrchestration[stepIndex] = {
          ...newOrchestration[stepIndex],
          status,
          result: result || newOrchestration[stepIndex].result,
          error: errorMsg || newOrchestration[stepIndex].error,
        };
      }
      return newOrchestration;
    });
  };


  const processOrchestrationStep = async (step: OrchestrationStep, stepIndex: number): Promise<Partial<ChatMessage>> => {
    updateOrchestrationStepStatus(stepIndex, 'processing');
    const loadingAgentMsg = addMessage({
        sender: 'agent',
        agentId: step.agentId,
        text: `Agent '${step.agentId}' starting task: ${step.taskDescription.substring(0, 50)}...`,
        isLoading: true,
      });

    try {
      let resultText = "";
      let imageUrl: string | undefined = undefined;
      let audioText: string | undefined = undefined;
      
      const targetAgent = agents.find(a => a.id === step.agentId || a.name === step.agentId);

      switch (step.outputType) {
        case 'text':
          // Use specific agent's system prompt if available
          resultText = await geminiService.generateTextForAgent(step.taskDescription, targetAgent?.systemPrompt);
          updateOrchestrationStepStatus(stepIndex, 'completed', resultText);
          break;

        case 'image':
          imageUrl = await geminiService.generateImage(step.taskDescription);
          resultText = `Agent '${step.agentId}' generated an image for: ${step.taskDescription}`;
          updateOrchestrationStepStatus(stepIndex, 'completed', imageUrl);
          break;
          
        case 'audio':
          audioText = step.taskDescription; // This is the text to be synthesized
          resultText = `Agent '${step.agentId}' processed audio task: ${step.taskDescription}. (Audio playback simulation pending)`;
          // Simulate audio generation:
          if ('speechSynthesis' in window && targetAgent?.capabilities.includes('audio')) { // Check if agent actually has audio cap
             // const utterance = new SpeechSynthesisUtterance(audioText);
             // window.speechSynthesis.speak(utterance); 
             // For now, this is fire-and-forget. Proper handling would involve events.
             console.log(`Simulating speech synthesis for: "${audioText}" by agent ${step.agentId}`);
          }
          updateOrchestrationStepStatus(stepIndex, 'completed', "Audio task processed");
          break;
        
        case 'code': // Assuming 'code' is a valid AgentCapability
             resultText = await geminiService.generateTextForAgent(step.taskDescription, targetAgent?.systemPrompt || "You are a helpful code assistant.");
             updateOrchestrationStepStatus(stepIndex, 'completed', resultText);
             break;

        default:
          resultText = `Agent '${step.agentId}' task type '${step.outputType}' not fully supported.`;
          updateOrchestrationStepStatus(stepIndex, 'error', undefined, resultText);
          updateMessage(loadingAgentMsg.id, { text: resultText, isError: true, isLoading: false, agentId: step.agentId, sender: 'agent' });
          return { text: resultText, isError: true, agentId: step.agentId, sender: 'agent'};
      }
      updateMessage(loadingAgentMsg.id, { text: resultText, imageUrl, audioText, isLoading: false, agentId: step.agentId, sender: 'agent' });
      return { text: resultText, imageUrl, audioText, agentId: step.agentId, sender: 'agent'};

    } catch (err: any) {
      const errorText = `Agent '${step.agentId}' failed: ${err.message}`;
      updateOrchestrationStepStatus(stepIndex, 'error', undefined, err.message);
      updateMessage(loadingAgentMsg.id, { text: errorText, isError: true, isLoading: false, agentId: step.agentId, sender: 'agent' });
      return { text: errorText, isError: true, agentId: step.agentId, sender: 'agent'};
    }
  };

  const handleSendMessage = useCallback(async (messageText: string, outputType: SelectedOutputType) => {
    if (!messageText.trim()) return;

    if (showWelcomeScreen) setShowWelcomeScreen(false);
    if (currentView !== VIEW_TYPES.CHAT) setCurrentView(VIEW_TYPES.CHAT);

    const userMsg = addMessage({ text: messageText, sender: 'user' });
    setIsLoading(true);
    setError(null);
    setCurrentOrchestration(null); // Clear previous orchestration

    const loadingNexusMsg = addMessage({ text: 'Nexus Core is analyzing your request...', sender: 'ai', isLoading: true });

    try {
      // Pass both defined agents and the user's desired output type
      const availableUserAgents = agents.map(a => ({id: a.id, name:a.name, capabilities: a.capabilities, systemPrompt: a.systemPrompt}));
      const response: OrchestrationResponse = await geminiService.generateOrchestrationPlan(messageText, availableUserAgents, outputType);
      
      updateMessage(loadingNexusMsg.id, { isLoading: false, text: response.initialNexusResponse || response.directResponse || "Received plan."});

      if (response.directResponse) {
        // Direct response handled
      } else if (response.orchestrationPlan && response.orchestrationPlan.steps.length > 0) {
        addMessage({ sender: 'ai', text: response.orchestrationPlan.summary, orchestrationPlan: response.orchestrationPlan.steps });
        setCurrentOrchestration(response.orchestrationPlan.steps); // Set the plan with initial 'pending' states

        for (let i = 0; i < response.orchestrationPlan.steps.length; i++) {
          const step = response.orchestrationPlan.steps[i];
          await processOrchestrationStep(step, i); // Process step and update its status
        }
        addMessage({sender: 'ai', text: "All planned agent tasks have been processed."});
      } else {
         updateMessage(loadingNexusMsg.id, { text: "Nexus Core couldn't determine a clear plan. Please try rephrasing.", isError: true });
      }

    } catch (err: any) {
      console.error("Error handling message:", err);
      const errorMessageText = err.message || "An unexpected error occurred with Nexus Core.";
      setError(errorMessageText);
      updateMessage(loadingNexusMsg.id, { text: `Nexus Core Error: ${errorMessageText}`, isError: true, isLoading: false });
    } finally {
      setIsLoading(false);
      // Debounce or intelligently save history
      // For now, save at the end of full processing.
      // This logic needs refinement to capture the full state accurately after async operations.
      // A simple timeout might be too naive.
      setTimeout(() => {
        setChatMessages(currentMessages => {
          if (currentMessages.length > 0 && currentMessages[0].id === userMsg.id) { // check if this is the latest interaction
            const title = currentMessages.find(m => m.sender === 'user')?.text.substring(0, 50) || "Chat Session";
            const newHistoryEntry = saveHistoryEntry({ title, messages: [...currentMessages] });
            setHistory(prev => [newHistoryEntry, ...prev.filter(h => h.id !== newHistoryEntry.id)]);
          }
          return currentMessages;
        });
      }, 500);
    }
  }, [showWelcomeScreen, currentView, agents]); // Removed chatMessages, will manage history saving differently


  const addSavedPromptHandler = (prompt: Omit<SavedPrompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPrompt = savePromptToStorage(prompt);
    setSavedPrompts(prev => [newPrompt, ...prev.filter(p => p.id !== newPrompt.id)]);
  };
  
  const deleteSavedPromptHandler = (promptId: string) => {
    deletePromptFromStorage(promptId);
    setSavedPrompts(prev => prev.filter(p => p.id !== promptId));
  };

  const loadChatFromHistory = (historyEntry: HistoryEntry) => {
    setChatMessages(historyEntry.messages);
    setShowWelcomeScreen(false);
    setCurrentView(VIEW_TYPES.CHAT);
    setError(null);
    setCurrentOrchestration(null);
  };
  
  const deleteHistoryHandler = (entryId: string) => {
    deleteHistoryFromStorage(entryId);
    setHistory(prev => prev.filter(h => h.id !== entryId));
  };


  const renderView = () => {
    switch (currentView) {
      case VIEW_TYPES.CHAT:
        return (
          <MainArea
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            error={error}
            showWelcomeScreen={showWelcomeScreen}
            clearError={() => setError(null)}
            onSavePrompt={(title, text) => addSavedPromptHandler({title, promptText: text || chatMessages.map(cm => `${cm.sender}: ${cm.text}`).join('\n')})}
            activeOrchestration={currentOrchestration}
            agents={agents}
          />
        );
      case VIEW_TYPES.AGENTS:
        return <AgentsView agents={agents} setAgents={setAgents} />;
      case VIEW_TYPES.PROMPTS:
        return <PromptsView 
                  prompts={savedPrompts} 
                  addPrompt={addSavedPromptHandler} 
                  deletePrompt={deleteSavedPromptHandler} 
                  usePrompt={(promptText) => {
                    setShowWelcomeScreen(false);
                    setCurrentView(VIEW_TYPES.CHAT);
                    const promptInput = document.querySelector('textarea[aria-label="Chat input"]') as HTMLTextAreaElement;
                    if(promptInput) {
                        promptInput.value = promptText;
                        promptInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    // Consider passing a default output type or letting user select
                    setTimeout(() => handleSendMessage(promptText, 'auto-detect'), 100); 
                  }} 
                />;
      case VIEW_TYPES.HISTORY:
        return <HistoryView history={history} loadChat={loadChatFromHistory} deleteHistoryEntry={deleteHistoryHandler} />;
      case VIEW_TYPES.SETTINGS:
        return <SettingsView />;
      default:
        return <div className="p-8 text-[var(--theme-text-primary)]">Unknown View. Select an option from the sidebar.</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[var(--theme-bg-primary)] text-[var(--theme-text-primary)] antialiased overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      {renderView()}
    </div>
  );
};

export default App;