
import React, { useState } from 'react';
import { Code2Icon, Share2Icon, SaveIcon, XIcon } from 'lucide-react';
import { ChatMessage } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"> {/* Increased z-index */}
      <div className="bg-[var(--theme-bg-tertiary)] p-6 rounded-xl shadow-2xl w-full max-w-lg border border-[var(--theme-border-primary)] max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[var(--theme-text-primary)]">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-1.5 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] rounded-md hover:bg-[var(--theme-bg-secondary)] transition-colors"
          >
            <XIcon size={20} />
          </button>
        </div>
        <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-600/80 scrollbar-track-neutral-800/50 pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};

interface TopBarProps {
  onSavePrompt: (title: string, text?: string) => void;
  chatMessages: ChatMessage[];
}

const TopBar: React.FC<TopBarProps> = ({ onSavePrompt, chatMessages }) => {
  const [isGetCodeModalOpen, setIsGetCodeModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const iconButtonClass = "p-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent-orange)] hover:bg-[var(--theme-bg-tertiary)] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent-orange)]";

  const handleSave = () => {
    const title = window.prompt("Enter a title for this prompt/chat:", "My Saved Chat");
    if (title) {
      const chatContent = chatMessages.map(msg => `${msg.sender === 'user' ? 'User' : msg.sender === 'agent' ? (msg.agentId || 'Agent') : 'Nexus'}: ${msg.text}${msg.imageUrl ? ' (Image Attached)' : ''}`).join('\n');
      onSavePrompt(title, chatContent); 
    }
  };
  
  const generateCodeSnippet = () => {
    const lastUserMessage = chatMessages.filter(m => m.sender === 'user').pop();
    const rawPrompt = lastUserMessage?.text || "Your prompt here";
    
    // Escape backslashes, backticks, and dollar signs for safe inclusion 
    // within a JavaScript template literal string in the generated code.
    const escapedPrompt = rawPrompt
      .replace(/\\/g, '\\\\') // Escape backslashes first (e.g., \ -> \\)
      .replace(/`/g, '\\`')   // Escape backticks (e.g., ` -> \`)
      .replace(/\$/g, '\\$'); // Escape dollar signs (e.g., $ -> \$ to prevent \${})

    return `
// Gemini API Call Example (Zlitch ADK)
// Ensure you have the @google/genai library installed.

import { GoogleGenAI } from "@google/genai";

// API Key should be handled securely, typically via environment variables.
// const API_KEY = process.env.API_KEY; 
// const ai = new GoogleGenAI({ apiKey: API_KEY });

async function runZlitchTask() {
  // The prompt from your Zlitch ADK session:
  const prompt = \`${escapedPrompt}\`;

  try {
    // This is a simplified call. For agent orchestration, 
    // refer to Zlitch's internal geminiService.ts.
    console.log("Prompt to send to Gemini: ", prompt);
    // const response = await ai.models.generateContent({
    //   model: "gemini-2.5-flash-preview-04-17",
    //   contents: [{ parts: [{ text: prompt }] }],
    // });
    // console.log("Response:", response.text);
    console.log("Conceptual API call. Implement with your Gemini setup.");
  } catch (error) {
    console.error("Error:", error);
  }
}

runZlitchTask();
    `;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy to clipboard", err);
      alert("Failed to copy. See console for details.");
    });
  };

  return (
    <>
      <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-[var(--theme-border-primary)] bg-[var(--theme-bg-secondary)] sticky top-0 z-50"> {/* Increased z-index */}
        <div>
          <h1 className="text-lg font-semibold text-[var(--theme-text-primary)]">Zlitch ADK - Chat</h1>
        </div>
        <div className="flex items-center space-x-1.5">
          <button className={iconButtonClass} title="Get code" onClick={() => setIsGetCodeModalOpen(true)}>
            <Code2Icon size={19} strokeWidth={2} />
          </button>
          <button className={iconButtonClass} title="Save current chat as prompt" onClick={handleSave}>
            <SaveIcon size={19} strokeWidth={2} />
          </button>
          <button className={iconButtonClass} title="Share (placeholder)" onClick={() => setIsShareModalOpen(true)}>
            <Share2Icon size={19} strokeWidth={2} />
          </button>
        </div>
      </header>

      <Modal isOpen={isGetCodeModalOpen} onClose={() => setIsGetCodeModalOpen(false)} title="Get Code Snippet">
        <p className="text-sm text-[var(--theme-text-secondary)] mb-3">This is a conceptual code snippet based on your last prompt.</p>
        <pre className="bg-[var(--theme-bg-primary)] p-3.5 rounded-md text-sm text-[var(--theme-text-primary)] overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-500 scrollbar-track-neutral-700">
          <code>{generateCodeSnippet()}</code>
        </pre>
        <button 
          onClick={() => copyToClipboard(generateCodeSnippet())}
          className="mt-4 px-4 py-2 bg-[var(--theme-accent-orange)] hover:bg-[var(--theme-accent-orange-hover)] text-white rounded-md text-sm font-medium transition-colors"
        >
          Copy Code
        </button>
      </Modal>

      <Modal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title="Share Chat (Conceptual)">
        <p className="text-sm text-[var(--theme-text-secondary)] mb-3">
          Sharing functionality is conceptual. This could generate a shareable link or export the chat.
        </p>
        <input 
          type="text" 
          readOnly 
          value="https://zlitch.example.com/shared/chat_id_placeholder" 
          className="w-full p-2.5 bg-[var(--theme-bg-primary)] border border-[var(--theme-border-primary)] rounded-md text-[var(--theme-text-secondary)] text-sm focus:ring-1 focus:ring-[var(--theme-accent-orange)] focus:border-[var(--theme-accent-orange)]"
        />
        <button 
          onClick={() => copyToClipboard("https://zlitch.example.com/shared/chat_id_placeholder")}
          className="mt-4 px-4 py-2 bg-[var(--theme-accent-orange)] hover:bg-[var(--theme-accent-orange-hover)] text-white rounded-md text-sm font-medium transition-colors"
        >
          Copy Link (Placeholder)
        </button>
      </Modal>
    </>
  );
};

export default TopBar;
