// ChatMessage remains crucial for the chat functionality
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'agent'; // Added 'agent' sender
  timestamp: Date;
  isError?: boolean;
  metadata?: Record<string, any>;
  isLoading?: boolean; // For optimistic UI updates with streaming
  imageUrl?: string; // For base64 image data
  audioText?: string; // For text to be synthesized or description of audio
  agentId?: string; // ID of the agent that produced this message
  orchestrationPlan?: OrchestrationStep[]; // If this message contains a plan
}

export type AgentCapability = 'text' | 'image' | 'audio' | 'code'; // Added 'code'

export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string; // Core instruction for this specific agent's behavior when prompted by Nexus Core
  icon?: string; // Icon name from lucide-react or a URL
  capabilities: AgentCapability[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedPrompt {
  id: string;
  title: string;
  promptText: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HistoryEntry {
  id: string;
  title: string; // e.g., first user message or a summary
  messages: ChatMessage[];
  starred?: boolean;
  createdAt: Date;
}

export interface OrchestrationStep {
  agentId: string; // User-defined agent ID or generic like 'image-agent'
  taskDescription: string; // Specific prompt from Nexus Core for this agent/task
  outputType: AgentCapability; // The type of output this step aims to produce
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: string; // Could store image URL, text output, or path to audio if generated
  error?: string;
}

// OrchestrationResponse is what Nexus Core (Gemini orchestrator) returns
export interface OrchestrationResponse {
  orchestrationPlan?: {
    summary: string; // Natural language summary of the plan
    steps: OrchestrationStep[]; // The sequence of tasks for agents
  };
  initialNexusResponse?: string; // Nexus Core's initial friendly message to the user (can include summary)
  directResponse?: string; // If no orchestration is needed, Nexus provides a direct answer
}

// User's selection from the PromptInput UI
export type SelectedOutputType = AgentCapability | 'auto-detect';

// For Gemini-assisted agent creation
export interface AgentSuggestionResponse {
  suggestedName: string;
  suggestedDescription: string;
  suggestedSystemPrompt: string;
  suggestedCapabilities: AgentCapability[];
}