import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, BotIcon, ImageIcon, MusicIcon, Code2Icon, SparklesIcon } from 'lucide-react'; // Added icons for output types
import LoadingSpinner from './LoadingSpinner';
import { AgentCapability } from '../types'; // Assuming AgentCapability includes 'code' and 'text'

export type SelectedOutputType = AgentCapability | 'auto-detect';

interface OutputTypeButtonProps {
  label: string;
  value: SelectedOutputType;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: (type: SelectedOutputType) => void;
}

const OutputTypeButton: React.FC<OutputTypeButtonProps> = ({ label, value, icon, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(value)}
    title={label}
    className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium border-2 transition-all duration-150
                ${isSelected 
                  ? 'bg-[var(--theme-accent-orange)] border-[var(--theme-accent-orange)] text-white shadow-md' 
                  : 'bg-[var(--theme-bg-tertiary)] border-[var(--theme-border-primary)] text-[var(--theme-text-secondary)] hover:border-[var(--theme-accent-orange)] hover:text-[var(--theme-accent-orange)]'}`}
  >
    {icon}
    <span className="ml-1.5 hidden sm:inline">{label}</span>
  </button>
);

interface PromptInputProps {
  onSendMessage: (message: string, outputType: SelectedOutputType) => void; // Updated signature
  isLoading: boolean;
  isWelcomeScreen?: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSendMessage, isLoading, isWelcomeScreen }) => {
  const [inputText, setInputText] = useState('');
  const [selectedOutputType, setSelectedOutputType] = useState<SelectedOutputType>('auto-detect');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText.trim(), selectedOutputType);
      setInputText('');
      // Optionally reset output type: setSelectedOutputType('auto-detect');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 160; // Approx 4 lines, can adjust
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      textareaRef.current.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [inputText]);

  const outputTypes: { label: string, value: SelectedOutputType, icon: React.ReactNode }[] = [
    { label: 'Auto-Detect', value: 'auto-detect', icon: <SparklesIcon size={14} /> },
    { label: 'Text', value: 'text', icon: <BotIcon size={14} /> },
    { label: 'Image', value: 'image', icon: <ImageIcon size={14} /> },
    { label: 'Audio', value: 'audio', icon: <MusicIcon size={14} /> },
    { label: 'Code', value: 'code', icon: <Code2Icon size={14} /> },
  ];

  const inputWrapperClass = `w-full flex items-start p-2 pl-4 pr-2.5 rounded-xl shadow-md transition-all duration-200 border-2 
                           bg-[var(--theme-bg-secondary)] border-[var(--theme-border-primary)] 
                           focus-within:border-[var(--theme-accent-orange)] focus-within:ring-1 focus-within:ring-[var(--theme-accent-orange)]`;
  
  return (
    <form onSubmit={handleSubmit} className={`relative flex flex-col ${isWelcomeScreen ? 'max-w-3xl mx-auto' : ''}`}>
      {!isWelcomeScreen && (
        <div className="flex items-center space-x-2 mb-2.5 px-1 overflow-x-auto pb-1">
          <span className="text-xs text-[var(--theme-text-secondary)] mr-1 whitespace-nowrap">Output:</span>
          {outputTypes.map(type => (
            <OutputTypeButton 
              key={type.value}
              {...type}
              isSelected={selectedOutputType === type.value}
              onSelect={setSelectedOutputType}
            />
          ))}
        </div>
      )}
      <div className={inputWrapperClass}>
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isWelcomeScreen ? "Ask Zlitch anything... e.g., 'Generate a Python script to analyze a CSV file'" : "Send a message (Ctrl+Enter to send)"}
          disabled={isLoading}
          rows={1}
          className="flex-1 py-2.5 bg-transparent text-[var(--theme-text-primary)] placeholder-[var(--theme-text-tertiary)] resize-none focus:outline-none overflow-y-hidden text-base min-h-[24px]"
          style={{ maxHeight: '160px' }} 
          aria-label="Chat input"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className={`ml-2 p-2.5 rounded-lg transition-all duration-150 self-end mb-0.5 transform active:scale-95
                      ${isLoading || !inputText.trim() 
                        ? 'bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-tertiary)] cursor-not-allowed' 
                        : 'bg-[var(--theme-accent-orange)] hover:bg-[var(--theme-accent-orange-hover)] text-white shadow-sm hover:shadow-md'}`}
          aria-label={isLoading ? 'Sending...' : 'Send message'}
          title="Send (Ctrl/Cmd + Enter)"
        >
          {isLoading ? <LoadingSpinner size={20} color="text-white" /> : <SendIcon size={20} strokeWidth={2.25} />}
        </button>
      </div>
       {!isWelcomeScreen && (
         <p className="text-xs text-[var(--theme-text-tertiary)] mt-2 pl-1.5">
          Submit: <kbd className="px-1.5 py-0.5 border border-[var(--theme-border-primary)] rounded bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)] text-xs font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 border border-[var(--theme-border-primary)] rounded bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)] text-xs font-mono">Enter</kbd>
        </p>
      )}
    </form>
  );
};

export default PromptInput;