
import { SavedPrompt, Agent, HistoryEntry } from '../types';
import { v4 as uuidv4 } from 'uuid';

const PROMPTS_KEY = 'zlitch_saved_prompts';
const AGENTS_KEY = 'zlitch_agents';
const HISTORY_KEY = 'zlitch_history';

// Helper to get items from localStorage
function getItems<T>(key: string): T[] {
  try {
    const itemsJson = localStorage.getItem(key);
    return itemsJson ? JSON.parse(itemsJson) : [];
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    localStorage.removeItem(key); // Clear corrupted data
    return [];
  }
}

// Helper to save items to localStorage
function saveItems<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

// Prompts Management
export const getPrompts = (): SavedPrompt[] => {
  return getItems<SavedPrompt>(PROMPTS_KEY).map(p => ({...p, createdAt: new Date(p.createdAt), updatedAt: new Date(p.updatedAt)}));
};

export const savePrompt = (promptData: Omit<SavedPrompt, 'id' | 'createdAt' | 'updatedAt'>): SavedPrompt => {
  const prompts = getPrompts();
  const now = new Date();
  const newPrompt: SavedPrompt = {
    ...promptData,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  prompts.unshift(newPrompt); // Add to the beginning
  saveItems(PROMPTS_KEY, prompts);
  return newPrompt;
};

export const updatePrompt = (updatedPrompt: SavedPrompt): SavedPrompt | null => {
  let prompts = getPrompts();
  const index = prompts.findIndex(p => p.id === updatedPrompt.id);
  if (index !== -1) {
    prompts[index] = { ...updatedPrompt, updatedAt: new Date() };
    saveItems(PROMPTS_KEY, prompts);
    return prompts[index];
  }
  return null;
};

export const deletePromptById = (promptId: string): void => {
  let prompts = getPrompts();
  prompts = prompts.filter(p => p.id !== promptId);
  saveItems(PROMPTS_KEY, prompts);
};


// Agents Management
export const getAgents = (): Agent[] => {
  return getItems<Agent>(AGENTS_KEY).map(a => ({...a, createdAt: new Date(a.createdAt), updatedAt: new Date(a.updatedAt)}));
};

export const saveAgent = (agentData: Agent): Agent => {
  let agents = getAgents();
  const now = new Date();
  if (agentData.id && agents.some(a => a.id === agentData.id)) { // Update existing
    agents = agents.map(a => a.id === agentData.id ? { ...agentData, updatedAt: now } : a);
  } else { // Create new
    const newAgent: Agent = {
      ...agentData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    agents.unshift(newAgent);
  }
  saveItems(AGENTS_KEY, agents);
  // Return the newly saved/updated agent from the potentially modified list
  return agents.find(a => a.id === (agentData.id || agents[0].id))!;
};

export const deleteAgentById = (agentId: string): void => {
  let agents = getAgents();
  agents = agents.filter(a => a.id !== agentId);
  saveItems(AGENTS_KEY, agents);
};

// History Management (TODO: Implement fully)
export const getHistory = (): HistoryEntry[] => {
  return getItems<HistoryEntry>(HISTORY_KEY).map(h => ({...h, createdAt: new Date(h.createdAt), messages: h.messages.map(m => ({...m, timestamp: new Date(m.timestamp)})) }));
};

export const saveHistoryEntry = (historyData: Omit<HistoryEntry, 'id' | 'createdAt'>) : HistoryEntry => {
  const history = getHistory();
  const newEntry : HistoryEntry = {
    ...historyData,
    id: uuidv4(),
    createdAt: new Date(),
  };
  history.unshift(newEntry);
  if (history.length > 50) history.pop(); // Limit history size
  saveItems(HISTORY_KEY, history);
  return newEntry;
};

export const deleteHistoryEntryById = (entryId: string): void => {
  let history = getHistory();
  history = history.filter(entry => entry.id !== entryId);
  saveItems(HISTORY_KEY, history);
};
