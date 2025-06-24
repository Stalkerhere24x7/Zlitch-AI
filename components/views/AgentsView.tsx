
import React, { useState } from 'react';
import { Agent, AgentCapability, AgentSuggestionResponse } from '../../types';
import { saveAgent as saveAgentToStorage, deleteAgentById as deleteAgentFromStorage, getAgents } from '../../services/localStorageService';
import { geminiService } from '../../services/geminiService';
import { PlusCircleIcon, Edit3Icon, Trash2Icon, SearchIcon, XIcon, CheckIcon, ImagePlayIcon, TextIcon, MicIcon, UsersIcon, Code2Icon, SparklesIcon, AlertTriangleIcon } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';


const capabilityIcons: Record<AgentCapability, React.ReactNode> = {
  text: <TextIcon size={16} className="mr-1.5" />,
  image: <ImagePlayIcon size={16} className="mr-1.5" />,
  audio: <MicIcon size={16} className="mr-1.5" />,
  code: <Code2Icon size={16} className="mr-1.5" />,
};

const AgentCapabilityPill: React.FC<{ capability: AgentCapability }> = ({ capability }) => (
  <span className="flex items-center px-2.5 py-1 text-xs bg-neutral-600/70 text-neutral-300 rounded-full font-medium">
    {capabilityIcons[capability]}
    {capability.charAt(0).toUpperCase() + capability.slice(1)}
  </span>
);

interface AgentFormModalProps {
  agentToEdit?: Agent | null;
  onClose: () => void;
  onSave: (agentData: Agent) => void;
}

const AgentFormModal: React.FC<AgentFormModalProps> = ({ agentToEdit, onClose, onSave }) => {
  const [userNaturalDescription, setUserNaturalDescription] = useState('');
  const [name, setName] = useState(agentToEdit?.name || '');
  const [description, setDescription] = useState(agentToEdit?.description || '');
  const [systemPrompt, setSystemPrompt] = useState(agentToEdit?.systemPrompt || '');
  const [capabilities, setCapabilities] = useState<AgentCapability[]>(agentToEdit?.capabilities || []);
  const [isGeneratingDetails, setIsGeneratingDetails] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);


  const availableCapabilities: AgentCapability[] = ['text', 'image', 'audio', 'code'];

  const toggleCapability = (cap: AgentCapability) => {
    setCapabilities(prev => 
      prev.includes(cap) ? prev.filter(c => c !== cap) : [...prev, cap]
    );
  };

  const handleGenerateDetails = async () => {
    if (!userNaturalDescription.trim()) {
      setGenerationError("Please describe the agent you want to create.");
      return;
    }
    setIsGeneratingDetails(true);
    setGenerationError(null);
    try {
      const suggestions: AgentSuggestionResponse = await geminiService.generateAgentDetailsFromDescription(userNaturalDescription);
      setName(suggestions.suggestedName);
      setDescription(suggestions.suggestedDescription);
      setSystemPrompt(suggestions.suggestedSystemPrompt);
      setCapabilities(suggestions.suggestedCapabilities.filter(cap => availableCapabilities.includes(cap))); // Ensure only valid caps
    } catch (error: any) {
      setGenerationError(error.message || "Failed to generate agent details.");
    } finally {
      setIsGeneratingDetails(false);
    }
  };

  const handleSubmit = () => {
    if (!name.trim() || !systemPrompt.trim()) {
      alert("Agent Name and System Prompt are required.");
      return;
    }
    onSave({
      id: agentToEdit?.id || '', 
      name,
      description,
      systemPrompt,
      capabilities,
      createdAt: agentToEdit?.createdAt || new Date(),
      updatedAt: agentToEdit?.updatedAt || new Date(),
    });
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--theme-bg-tertiary)] p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-[var(--theme-border-primary)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[var(--theme-text-primary)]">{agentToEdit ? 'Edit Agent' : 'Create New Agent'}</h2>
          <button onClick={onClose} className="p-1.5 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] rounded-md hover:bg-[var(--theme-bg-secondary)] transition-colors">
            <XIcon size={20} />
          </button>
        </div>
        
        <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-600/80 scrollbar-track-neutral-800/50">
          {!agentToEdit && (
            <div className="p-4 bg-[var(--theme-bg-secondary)] rounded-lg border border-[var(--theme-border-secondary)]">
              <label htmlFor="agentNaturalDescription" className="block text-sm font-medium text-[var(--theme-text-primary)] mb-1.5">Describe the agent you want to create:</label>
              <textarea 
                id="agentNaturalDescription"
                placeholder="e.g., An expert Python developer that writes scripts for data visualization and can explain them." 
                value={userNaturalDescription} 
                onChange={e => setUserNaturalDescription(e.target.value)} 
                rows={3} 
                className="w-full p-3 bg-[var(--theme-bg-primary)] border border-[var(--theme-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--theme-accent-orange)] focus:border-[var(--theme-accent-orange)] outline-none transition-colors text-[var(--theme-text-primary)] resize-none"
              />
              <button 
                onClick={handleGenerateDetails}
                disabled={isGeneratingDetails || !userNaturalDescription.trim()}
                className="mt-3 w-full flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[var(--theme-accent-orange)] hover:bg-[var(--theme-accent-orange-hover)] disabled:bg-opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGeneratingDetails ? <LoadingSpinner size={18} color="text-white"/> : <SparklesIcon size={18} className="mr-2" />}
                {isGeneratingDetails ? 'Generating Details...' : 'Suggest Details with AI'}
              </button>
              {generationError && (
                <p className="mt-2 text-xs text-[var(--theme-error-red)] flex items-center"><AlertTriangleIcon size={14} className="mr-1.5" />{generationError}</p>
              )}
            </div>
          )}

          <hr className="border-[var(--theme-border-primary)] my-3" />
          
          <div>
            <label htmlFor="agentName" className="block text-sm font-medium text-[var(--theme-text-primary)] mb-1">Agent Name*</label>
            <input id="agentName" type="text" placeholder="e.g., Python Data Viz Expert" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-[var(--theme-bg-primary)] border border-[var(--theme-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--theme-accent-orange)] focus:border-[var(--theme-accent-orange)] outline-none transition-colors text-[var(--theme-text-primary)]" />
          </div>
          <div>
            <label htmlFor="agentDescription" className="block text-sm font-medium text-[var(--theme-text-primary)] mb-1">Agent Description</label>
            <textarea id="agentDescription" placeholder="e.g., Specializes in creating Python scripts for data visualization using Matplotlib and Seaborn." value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-3 bg-[var(--theme-bg-primary)] border border-[var(--theme-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--theme-accent-orange)] focus:border-[var(--theme-accent-orange)] outline-none transition-colors text-[var(--theme-text-primary)] resize-none" />
          </div>
          <div>
            <label htmlFor="agentSystemPrompt" className="block text-sm font-medium text-[var(--theme-text-primary)] mb-1">System Prompt* (Instructions for this agent)</label>
            <textarea id="agentSystemPrompt" placeholder="e.g., You are an expert Python programmer specializing in data visualization..." value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={5} className="w-full p-3 bg-[var(--theme-bg-primary)] border border-[var(--theme-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--theme-accent-orange)] focus:border-[var(--theme-accent-orange)] outline-none transition-colors text-[var(--theme-text-primary)] resize-none" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--theme-text-primary)] mb-2">Capabilities:</label>
            <div className="flex flex-wrap gap-2.5">
              {availableCapabilities.map(cap => (
                <button
                  key={cap}
                  onClick={() => toggleCapability(cap)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium border-2 transition-all
                              ${capabilities.includes(cap) 
                                ? 'bg-[var(--theme-accent-orange)]/20 border-[var(--theme-accent-orange)] text-[var(--theme-accent-orange)]' 
                                : 'bg-[var(--theme-bg-secondary)] border-[var(--theme-border-primary)] text-[var(--theme-text-secondary)] hover:border-[var(--theme-accent-orange)]/70 hover:text-[var(--theme-accent-orange)]'}`}
                >
                  {capabilities.includes(cap) && <CheckIcon size={16} className="mr-1.5"/>}
                  {capabilityIcons[cap]}
                  {cap.charAt(0).toUpperCase() + cap.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-[var(--theme-text-secondary)] bg-[var(--theme-bg-secondary)] hover:bg-[var(--theme-border-primary)] transition-colors font-medium">Cancel</button>
          <button onClick={handleSubmit} className="px-6 py-2.5 rounded-lg text-white bg-[var(--theme-accent-orange)] hover:bg-[var(--theme-accent-orange-hover)] font-semibold shadow-md hover:shadow-lg transition-all duration-150 transform active:scale-95">
            {agentToEdit ? 'Save Changes' : 'Create Agent'}
          </button>
        </div>
      </div>
    </div>
  );
};


interface AgentsViewProps {
  agents: Agent[];
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
}

const AgentsView: React.FC<AgentsViewProps> = ({ agents, setAgents }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSaveAgent = (agentData: Agent) => {
    saveAgentToStorage(agentData);
    setAgents(getAgents()); 
  };

  const handleDeleteAgent = (agentId: string) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      deleteAgentFromStorage(agentId);
      setAgents(getAgents()); 
    }
  };

  const openEditModal = (agent: Agent) => {
    setEditingAgent(agent);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingAgent(null);
    setShowModal(true);
  };

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.capabilities.some(cap => cap.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col p-6 md:p-8 bg-[var(--theme-bg-primary)] text-[var(--theme-text-primary)] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-600/80 scrollbar-track-neutral-800/50">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-[var(--theme-text-primary)] flex items-center">
            <UsersIcon size={32} className="mr-3 text-[var(--theme-accent-orange)]" />Manage Agents
        </h1>
        <p className="text-[var(--theme-text-secondary)] mt-1">Define and configure your AI agents for specialized tasks in the Zlitch ADK.</p>
      </header>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <input 
            type="text" 
            placeholder="Search agents by name, description, capability..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-primary)] rounded-lg focus:ring-2 focus:ring-[var(--theme-accent-orange)] focus:border-[var(--theme-accent-orange)] outline-none transition-colors"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--theme-text-tertiary)]" />
        </div>
        <button 
          onClick={openCreateModal}
          className="w-full sm:w-auto flex items-center justify-center bg-[var(--theme-accent-orange)] hover:bg-[var(--theme-accent-orange-hover)] text-white font-semibold px-5 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 transform active:scale-95"
        >
          <PlusCircleIcon size={20} className="mr-2.5" />
          New Agent
        </button>
      </div>

      {filteredAgents.length === 0 ? (
        <div className="text-center py-10 text-[var(--theme-text-secondary)]">
          <UsersIcon size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">{searchTerm ? "No agents match your search." : "No agents configured yet."}</p>
          {!searchTerm && <p>Click "New Agent" to get started.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAgents.map(agent => (
            <div key={agent.id} className="bg-[var(--theme-bg-secondary)] p-5 rounded-xl shadow-lg border border-[var(--theme-border-primary)] hover:border-[var(--theme-accent-orange)]/70 transition-all duration-200 group flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold text-[var(--theme-accent-orange)] group-hover:text-[var(--theme-accent-orange-hover)] transition-colors duration-150">{agent.name}</h2>
              </div>
              <p className="text-sm text-[var(--theme-text-secondary)] mb-3 h-16 overflow-hidden line-clamp-3 flex-grow">{agent.description || "No description provided."}</p>
              
              <div className="mb-3">
                <h4 className="text-xs text-[var(--theme-text-tertiary)] mb-1.5">Capabilities:</h4>
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.length > 0 ? agent.capabilities.map(cap => <AgentCapabilityPill key={cap} capability={cap} />) : <span className="text-xs text-[var(--theme-text-tertiary)] italic">None specified</span>}
                </div>
              </div>
              
              <p className="text-xs text-[var(--theme-text-tertiary)] mb-1">System Prompt:</p>
              <p className="text-xs text-[var(--theme-text-secondary)] italic bg-[var(--theme-bg-primary)] p-2 rounded line-clamp-2 h-10 overflow-hidden mb-4 border border-[var(--theme-border-secondary)]">{agent.systemPrompt}</p>
              
              <div className="flex justify-end space-x-2.5 mt-auto pt-3 border-t border-[var(--theme-border-primary)]">
                <button onClick={() => openEditModal(agent)} title="Edit Agent" className="p-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent-orange)] transition-colors"><Edit3Icon size={18} /></button>
                <button onClick={() => handleDeleteAgent(agent.id)} title="Delete Agent" className="p-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-error-red)] transition-colors"><Trash2Icon size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && <AgentFormModal agentToEdit={editingAgent} onClose={() => setShowModal(false)} onSave={handleSaveAgent} />}
    </div>
  );
};

export default AgentsView;