
import React from 'react';
import { ChatMessage, OrchestrationStep, Agent } from '../types';
import TopBar from './TopBar';
import PromptInput, { SelectedOutputType } from './PromptInput'; // Import SelectedOutputType
import ChatDisplay from './ChatDisplay';
import WhatsNew from './WhatsNew';
import LoadingSpinner from './LoadingSpinner';
import { AlertTriangleIcon, XIcon, ZapIcon, CheckCircleIcon, AlertCircleIcon, Loader2Icon } from 'lucide-react';

interface AgentStatusDashboardProps {
  activeOrchestration: OrchestrationStep[] | null;
  agents: Agent[];
}

const AgentStatusDashboard: React.FC<AgentStatusDashboardProps> = ({ activeOrchestration, agents }) => {
  if (!activeOrchestration || activeOrchestration.length === 0) {
    return null;
  }

  return (
    <div className="p-3 my-4 bg-[var(--theme-bg-secondary)] rounded-lg border border-[var(--theme-border-primary)] shadow-md">
      <h3 className="text-sm font-semibold text-[var(--theme-accent-orange)] mb-2.5 flex items-center">
        <ZapIcon size={16} className="mr-2" />
        Active Orchestration Plan
      </h3>
      <div className="space-y-2">
        {activeOrchestration.map((step, index) => {
          const agentInfo = agents.find(a => a.name === step.agentId || a.id === step.agentId);
          const agentDisplayName = agentInfo?.name || step.agentId;
          let statusIcon;
          let statusColor = 'text-[var(--theme-text-secondary)]';
          let borderColor = 'border-[var(--theme-border-primary)]';

          switch (step.status) {
            case 'pending':
              statusIcon = <Loader2Icon size={14} className="animate-spin text-[var(--theme-text-tertiary)]" />;
              statusColor = 'text-[var(--theme-text-tertiary)]';
              borderColor = 'border-[var(--theme-text-tertiary)]';
              break;
            case 'processing':
              statusIcon = <Loader2Icon size={14} className="animate-spin text-[var(--theme-accent-orange)]" />;
              statusColor = 'text-[var(--theme-accent-orange)]';
              borderColor = 'border-[var(--theme-accent-orange)]';
              break;
            case 'completed':
              statusIcon = <CheckCircleIcon size={14} className="text-[var(--theme-success-green)]" />;
              statusColor = 'text-[var(--theme-success-green)]';
              borderColor = 'border-[var(--theme-success-green)]';
              break;
            case 'error':
              statusIcon = <AlertCircleIcon size={14} className="text-[var(--theme-error-red)]" />;
              statusColor = 'text-[var(--theme-error-red)]';
              borderColor = 'border-[var(--theme-error-red)]';
              break;
            default:
              statusIcon = <Loader2Icon size={14} className="animate-spin text-[var(--theme-text-tertiary)]" />;
          }

          return (
            <div key={index} className={`text-xs p-2 rounded bg-[var(--theme-bg-tertiary)] border-l-2 ${borderColor}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-[var(--theme-text-primary)]">
                  {agentDisplayName} ({step.outputType})
                </span>
                <span className={`flex items-center font-medium ${statusColor}`}>
                  {statusIcon}
                  <span className="ml-1.5">{step.status.charAt(0).toUpperCase() + step.status.slice(1)}</span>
                </span>
              </div>
              <p className="text-[var(--theme-text-secondary)] mt-1 truncate" title={step.taskDescription}>Task: {step.taskDescription}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};


interface MainAreaProps {
  chatMessages: ChatMessage[];
  onSendMessage: (message: string, outputType: SelectedOutputType) => void; // Updated signature
  isLoading: boolean;
  error: string | null;
  showWelcomeScreen: boolean;
  clearError: () => void;
  onSavePrompt: (title: string, text?: string) => void;
  activeOrchestration: OrchestrationStep[] | null;
  agents: Agent[];
}

const MainArea: React.FC<MainAreaProps> = ({
  chatMessages,
  onSendMessage,
  isLoading,
  error,
  showWelcomeScreen,
  clearError,
  onSavePrompt,
  activeOrchestration,
  agents
}) => {
  return (
    <div className="flex-1 flex flex-col bg-[var(--theme-bg-primary)] overflow-hidden">
      <TopBar onSavePrompt={onSavePrompt} chatMessages={chatMessages} />
      <main className="flex-1 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-600/80 scrollbar-track-neutral-800/50">
        <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
          {error && (
            <div className="bg-[var(--theme-error-red)]/10 border border-[var(--theme-error-red)]/30 text-[var(--theme-error-red)] px-4 py-3 rounded-lg shadow-md flex items-start justify-between">
              <div className="flex items-center">
                <AlertTriangleIcon className="h-5 w-5 text-[var(--theme-error-red)] mr-3 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
              <button
                onClick={clearError}
                className="text-[var(--theme-error-red)] hover:text-opacity-80 ml-2 p-1 rounded-md hover:bg-[var(--theme-error-red)]/20 transition-colors"
                aria-label="Close error message"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
          )}

          {activeOrchestration && activeOrchestration.length > 0 && !showWelcomeScreen && (
             <AgentStatusDashboard activeOrchestration={activeOrchestration} agents={agents} />
          )}

          {showWelcomeScreen ? (
            <div className="flex flex-col items-center justify-center text-center space-y-8 flex-grow pt-8 pb-12">
              <h1 className="text-4xl md:text-5xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[var(--theme-accent-orange)] via-[#FF9A4D] to-[#FFB880]">
                Welcome to Zlitch ADK
              </h1>
              <p className="text-lg text-[var(--theme-text-secondary)] max-w-xl">
                Define agents, craft prompts, and orchestrate complex AI workflows with precision.
              </p>
              <div className="w-full max-w-2xl lg:max-w-3xl mt-4">
                 <PromptInput onSendMessage={onSendMessage} isLoading={isLoading} isWelcomeScreen={true}/>
              </div>
              <WhatsNew />
            </div>
          ) : (
            <ChatDisplay messages={chatMessages} />
          )}
        </div>
      </main>
      
      {!showWelcomeScreen && (
         <div className="p-3 md:p-4 border-t border-[var(--theme-border-primary)] bg-[var(--theme-bg-primary)] mt-auto">
            {isLoading && !chatMessages.some(msg => msg.isLoading && (msg.sender === 'ai' || msg.sender === 'agent')) && (
              <div className="flex items-center justify-center mb-2.5 text-xs text-[var(--theme-text-secondary)]">
                <LoadingSpinner size={16} color="text-[var(--theme-accent-orange)]" />
                <span className="ml-2.5">Nexus Core is processing...</span>
              </div>
            )}
            <PromptInput onSendMessage={onSendMessage} isLoading={isLoading} isWelcomeScreen={false}/>
          </div>
      )}
    </div>
  );
};

export default MainArea;
