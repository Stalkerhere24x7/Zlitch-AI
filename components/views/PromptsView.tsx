import React, { useState } from 'react';
import { SavedPrompt } from '../../types';
import { PlusCircleIcon, Edit3Icon, Trash2Icon, PlayIcon, SearchIcon, TagIcon } from 'lucide-react';

interface PromptsViewProps {
  prompts: SavedPrompt[];
  addPrompt: (promptData: Omit<SavedPrompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deletePrompt: (promptId: string) => void;
  usePrompt: (promptText: string) => void;
}

const PromptsView: React.FC<PromptsViewProps> = ({ prompts, addPrompt, deletePrompt, usePrompt }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptText, setNewPromptText] = useState('');
  const [newPromptTags, setNewPromptTags] = useState('');

  const handleAddPrompt = () => {
    if (newPromptTitle.trim() && newPromptText.trim()) {
      addPrompt({ 
        title: newPromptTitle, 
        promptText: newPromptText,
        tags: newPromptTags.split(',').map(tag => tag.trim()).filter(tag => tag) 
      });
      setNewPromptTitle('');
      setNewPromptText('');
      setNewPromptTags('');
      setShowAddModal(false);
    } else {
      alert("Title and Prompt Text cannot be empty.");
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 md:p-8 bg-[#1f2023] overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-neutral-100">Prompt Library</h1>
        <p className="text-neutral-400 mt-1">Manage and reuse your favorite prompts.</p>
      </header>

      <div className="mb-6 flex justify-between items-center">
         <div className="relative w-full max-w-md">
          <input 
            type="text" 
            placeholder="Search prompts..." 
            className="w-full p-3 pl-10 bg-[#2b2d30] border border-neutral-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-500" />
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold px-5 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 transform active:scale-95"
        >
          <PlusCircleIcon size={20} className="mr-2.5" />
          Add New Prompt
        </button>
      </div>

      {prompts.length === 0 ? (
         <div className="text-center py-10 text-neutral-500">
          <p className="text-lg">Your prompt library is empty.</p>
          <p>Click "Add New Prompt" to save your first prompt.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map(prompt => (
            <div key={prompt.id} className="bg-[#2a2c2f] p-5 rounded-xl shadow-lg border border-neutral-700/80 hover:border-sky-600/70 transition-colors group flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold text-sky-400 group-hover:text-sky-300 transition-colors mb-2">{prompt.title}</h2>
                <p className="text-sm text-neutral-400 mb-3 h-20 overflow-hidden line-clamp-4">{prompt.promptText}</p>
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1.5 items-center">
                    <TagIcon size={14} className="text-neutral-500 mr-1" />
                    {prompt.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 text-xs bg-neutral-600/70 text-neutral-300 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2.5 mt-auto pt-3 border-t border-neutral-700/50">
                <button title="Use Prompt" onClick={() => usePrompt(prompt.promptText)} className="p-2 text-neutral-400 hover:text-green-400 transition-colors"><PlayIcon size={18} /></button>
                <button title="Edit Prompt" onClick={() => alert("Edit prompt: " + prompt.title)} className="p-2 text-neutral-400 hover:text-sky-400 transition-colors"><Edit3Icon size={18} /></button>
                <button title="Delete Prompt" onClick={() => { if(window.confirm(`Delete "${prompt.title}"?`)) deletePrompt(prompt.id)}} className="p-2 text-neutral-400 hover:text-red-400 transition-colors"><Trash2Icon size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Prompt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#2b2d30] p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg border border-neutral-700">
            <h2 className="text-2xl font-semibold mb-6 text-neutral-100">Add New Prompt</h2>
            <div className="space-y-5">
              <input
                type="text"
                placeholder="Prompt Title"
                value={newPromptTitle}
                onChange={(e) => setNewPromptTitle(e.target.value)}
                className="w-full p-3 bg-[#1f2023] border border-neutral-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors text-neutral-100"
              />
              <textarea
                placeholder="Prompt Text..."
                value={newPromptText}
                onChange={(e) => setNewPromptText(e.target.value)}
                rows={5}
                className="w-full p-3 bg-[#1f2023] border border-neutral-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors text-neutral-100 resize-none"
              />
              <input
                type="text"
                placeholder="Tags (comma-separated)"
                value={newPromptTags}
                onChange={(e) => setNewPromptTags(e.target.value)}
                className="w-full p-3 bg-[#1f2023] border border-neutral-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors text-neutral-100"
              />
            </div>
            <div className="mt-8 flex justify-end space-x-3">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-lg text-neutral-300 bg-neutral-600/70 hover:bg-neutral-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddPrompt}
                className="px-6 py-2.5 rounded-lg text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 font-semibold shadow-md hover:shadow-lg transition-all duration-150 transform active:scale-95"
              >
                Save Prompt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptsView;