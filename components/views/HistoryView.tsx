
import React, { useState } from 'react';
import { HistoryEntry } from '../../types';
import { EyeIcon, StarIcon, Trash2Icon, SearchIcon } from 'lucide-react';

interface HistoryViewProps {
  history: HistoryEntry[];
  loadChat: (entry: HistoryEntry) => void;
  deleteHistoryEntry: (entryId: string) => void;
  // TODO: Add star/unstar functionality
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, loadChat, deleteHistoryEntry }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.messages.some(msg => msg.text.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleDelete = (entryId: string, entryTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the history entry: "${entryTitle}"?`)) {
      deleteHistoryEntry(entryId);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 md:p-8 bg-[#1f2023] overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-neutral-100">Chat History</h1>
        <p className="text-neutral-400 mt-1">Review your past conversations with Zlitch ADK.</p>
      </header>

       <div className="mb-6 flex justify-between items-center">
         <div className="relative w-full max-w-md">
          <input 
            type="text" 
            placeholder="Search history by title or content..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 bg-[#2b2d30] border border-neutral-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-500" />
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-10 text-neutral-500">
          <p className="text-lg">{searchTerm ? "No history entries match your search." : "No chat history found."}</p>
          {!searchTerm && <p>Your conversations will appear here once you start chatting.</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map(entry => (
            <div key={entry.id} className="bg-[#2a2c2f] p-4 rounded-lg shadow-md border border-neutral-700/80 hover:border-sky-600/60 transition-colors group flex items-center justify-between">
              <div className="flex-1 min-w-0"> {/* Allow title to truncate */}
                <h2 className="text-lg font-medium text-neutral-200 group-hover:text-sky-400 transition-colors truncate" title={entry.title}>{entry.title || `Chat from ${new Date(entry.createdAt).toLocaleDateString()}`}</h2>
                <p className="text-xs text-neutral-500 mt-0.5">{entry.messages.length} messages · Created: {new Date(entry.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0 ml-2">
                <button onClick={() => loadChat(entry)} title="View Chat" className="p-2 text-neutral-400 hover:text-sky-400 transition-colors rounded-md hover:bg-neutral-700/70"><EyeIcon size={18} /></button>
                <button title={entry.starred ? "Unstar" : "Star (feature pending)"} className={`p-2 transition-colors rounded-md hover:bg-neutral-700/70 ${entry.starred ? 'text-yellow-400 hover:text-yellow-300' : 'text-neutral-400 hover:text-yellow-400'}`}>
                  <StarIcon size={18} fill={entry.starred ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => handleDelete(entry.id, entry.title)} title="Delete Chat" className="p-2 text-neutral-400 hover:text-red-400 transition-colors rounded-md hover:bg-neutral-700/70"><Trash2Icon size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
       <p className="mt-8 text-sm text-neutral-600">History is stored locally in your browser. Clearing browser data will remove it.</p>
    </div>
  );
};

export default HistoryView;
