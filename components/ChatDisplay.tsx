import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { BotIcon, UserIcon, AlertTriangleIcon, SparklesIcon, SigmaSquareIcon, CopyIcon, CheckIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown@9'; 
import remarkGfm from 'remark-gfm@4';
import LoadingSpinner from './LoadingSpinner';

interface ChatDisplayProps {
  messages: ChatMessage[];
}

const ChatDisplay: React.FC<ChatDisplayProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = React.useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleCopy = (textToCopy: string, messageId: string) => {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000); // Reset after 2 seconds
      })
      .catch(err => console.error("Failed to copy text: ", err));
  };

  const getSenderIcon = (msg: ChatMessage) => {
    const iconProps = { size: 20, strokeWidth: 1.75 };
    if (msg.sender === 'user') return <UserIcon {...iconProps} className="text-[var(--theme-accent-orange)]" />;
    if (msg.isError) return <AlertTriangleIcon {...iconProps} className="text-[var(--theme-error-red)]" />;
    if (msg.sender === 'agent') {
        return <SigmaSquareIcon {...iconProps} className="text-purple-400" />; 
    }
    return <BotIcon {...iconProps} className="text-sky-400" />; // Nexus Core (AI)
  };

  return (
    <div className="flex-1 space-y-5 pb-4">
      {messages.map((msg) => {
        // Extract content specifically for copying, e.g. code block content if present
        let contentToCopy = msg.text || '';
        if (msg.text) {
          const codeBlockMatch = msg.text.match(/```(?:\w*\n)?([\s\S]*?)```/);
          if (codeBlockMatch && codeBlockMatch[1]) {
            contentToCopy = codeBlockMatch[1].trim();
          }
        }
        if (msg.imageUrl) contentToCopy = msg.imageUrl;
        if (msg.audioText && !msg.imageUrl) contentToCopy = msg.audioText;


        return (
          <div
            key={msg.id}
            className={`flex group ${msg.sender === 'user' ? 'justify-end pl-10 sm:pl-16' : 'justify-start pr-10 sm:pr-16'}`}
          >
            <div
              className={`relative flex items-start max-w-xl lg:max-w-2xl xl:max-w-3xl rounded-xl shadow-md 
                          ${msg.sender === 'user' 
                            ? 'bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-secondary)]' 
                            : msg.isError 
                            ? 'bg-[var(--theme-bg-secondary)] border border-[var(--theme-error-red)]' 
                            : 'bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-secondary)]'}`} 
            >
              <div className={`p-3.5 flex-1 min-w-0 ${msg.sender === 'user' ? 'border-l-2 border-[var(--theme-accent-orange)] rounded-l-md' : msg.sender === 'agent' ? 'border-l-2 border-purple-500 rounded-l-md' : 'border-l-2 border-sky-500 rounded-l-md'}`}>
                <div className="flex items-center justify-between mb-1.5">
                   <span className="font-semibold text-sm flex items-center">
                    {msg.sender !== 'user' && <span className="mr-2">{getSenderIcon(msg)}</span>}
                    {msg.sender === 'user' ? 'You' 
                      : msg.sender === 'agent' ? (msg.agentId || 'Agent')
                      : msg.isError ? 'Error' 
                      : 'Zlitch AI'}
                     {msg.sender === 'user' && <span className="ml-2">{getSenderIcon(msg)}</span>}
                  </span>
                  <span className="text-xs text-[var(--theme-text-tertiary)] ml-4">{formatTimestamp(msg.timestamp)}</span>
                </div>
                
                {/* Copy Button - appears on hover */}
                 {(contentToCopy || msg.imageUrl) && (
                    <button
                        onClick={() => handleCopy(contentToCopy, msg.id)}
                        title="Copy content"
                        className="absolute top-1 right-1 p-1.5 text-[var(--theme-text-tertiary)] hover:text-[var(--theme-accent-orange)] 
                                   bg-[var(--theme-bg-tertiary)] rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150
                                   focus:opacity-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--theme-accent-orange)]"
                    >
                        {copiedMessageId === msg.id ? <CheckIcon size={14} className="text-[var(--theme-success-green)]" /> : <CopyIcon size={14} />}
                    </button>
                )}

                {msg.isLoading && (msg.sender === 'ai' || msg.sender === 'agent') ? (
                  <div className="flex items-center space-x-2 py-1">
                    <LoadingSpinner size={16} color="text-[var(--theme-text-secondary)]" />
                    <span className="text-sm text-[var(--theme-text-secondary)]">{msg.text || "Processing..."}</span>
                  </div>
                ) : (
                  <>
                    {msg.text && (
                      <div className="prose prose-sm prose-invert max-w-none 
                                      prose-p:my-1.5 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2
                                      prose-blockquote:border-l-[var(--theme-accent-orange)] prose-blockquote:pl-3 prose-blockquote:text-[var(--theme-text-secondary)]
                                      prose-code:bg-[var(--theme-bg-primary)] prose-code:p-1 prose-code:px-1.5 prose-code:rounded-md prose-code:text-sm prose-code:font-mono prose-code:text-[var(--theme-text-primary)] prose-code:border prose-code:border-[var(--theme-border-primary)]
                                      prose-pre:bg-[var(--theme-bg-primary)] prose-pre:p-3 prose-pre:rounded-md prose-pre:border prose-pre:border-[var(--theme-border-primary)] prose-pre:text-[var(--theme-text-primary)] prose-pre:overflow-x-auto
                                      text-[var(--theme-text-primary)] break-words leading-relaxed"
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    )}
                    {msg.imageUrl && (
                      <div className="mt-2.5">
                        <img src={msg.imageUrl} alt="Generated image" className="max-w-xs h-auto rounded-lg border border-[var(--theme-border-primary)] shadow-md" />
                      </div>
                    )}
                    {msg.audioText && !msg.imageUrl && (
                      <div className="mt-2.5 p-2.5 bg-[var(--theme-bg-tertiary)] rounded-lg text-sm text-[var(--theme-text-secondary)] italic border border-[var(--theme-border-primary)]">
                        Audio task processed for: "{msg.audioText.substring(0,100)}{msg.audioText.length > 100 ? '...' : ''}" (Playback UI pending)
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatDisplay;