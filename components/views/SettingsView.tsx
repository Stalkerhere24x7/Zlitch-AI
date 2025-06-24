import React, { useState, useEffect } from 'react';
import { KeyRoundIcon, MoonIcon, SunIcon, Trash2Icon, InfoIcon } from 'lucide-react';

const SettingsView: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark'); // Assuming dark is default

  useEffect(() => {
    // Attempt to read API_KEY from process.env (won't work directly in browser like this)
    // This is for display purposes only as per guidelines.
    // In a real scenario, this would be handled server-side or via a secure configuration mechanism.
    const envApiKey = process.env.API_KEY;
    if (envApiKey) {
      // For display, show only part of the key
      setApiKey(`••••••••${envApiKey.slice(-4)}`);
    } else {
      setApiKey('Not configured (requires server-side environment variable)');
    }
    
    // Load theme from localStorage if saved
    const savedTheme = localStorage.getItem('zlitch_theme') as 'dark' | 'light';
    if (savedTheme) setTheme(savedTheme);

  }, []);

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('zlitch_theme', newTheme);
    // TODO: Actually apply theme change to the app (e.g., by adding/removing a class on body)
    alert(`Theme changed to ${newTheme}. Full theme switching needs implementation.`);
  };
  
  const handleClearLocalStorage = () => {
    if (window.confirm("Are you sure you want to clear all Zlitch data from your browser? This includes saved prompts, history, and agents.")) {
      localStorage.removeItem('zlitch_saved_prompts');
      localStorage.removeItem('zlitch_agents');
      localStorage.removeItem('zlitch_history');
      localStorage.removeItem('zlitch_theme'); // if you save theme
      alert("Local data cleared. Please refresh the application.");
    }
  };


  return (
    <div className="flex-1 flex flex-col p-6 md:p-8 bg-[#1f2023] overflow-y-auto text-neutral-200">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Application Settings</h1>
        <p className="text-neutral-400 mt-1">Configure Zlitch ADK preferences.</p>
      </header>

      <div className="space-y-8 max-w-2xl">
        {/* API Key Section */}
        <section>
          <h2 className="text-xl font-medium mb-3 text-sky-400">API Configuration</h2>
          <div className="bg-[#2a2c2f] p-5 rounded-lg border border-neutral-700/80">
            <div className="flex items-center mb-2">
              <KeyRoundIcon size={20} className="mr-3 text-neutral-400" />
              <h3 className="text-lg font-medium">Google Gemini API Key</h3>
            </div>
            <p className="text-sm text-neutral-400 mb-2">
              The API key is configured via the <code className="px-1.5 py-0.5 bg-neutral-700/70 rounded text-xs text-sky-300">process.env.API_KEY</code> environment variable. 
              This application does not allow direct input or modification of the API key for security reasons.
            </p>
            <div className="bg-[#1f2023] p-3 rounded text-sm text-neutral-300 border border-neutral-600">
              Current Status: <span className="font-mono">{apiKey || 'Not Set'}</span>
            </div>
             <div className="mt-3 text-xs text-neutral-500 flex items-start">
                <InfoIcon size={14} className="mr-1.5 mt-0.5 flex-shrink-0"/> 
                <span>This value is for display only and reflects the key's presence in the build/server environment.</span>
            </div>
          </div>
        </section>

        {/* Theme Settings Section */}
        <section>
          <h2 className="text-xl font-medium mb-3 text-sky-400">Appearance</h2>
          <div className="bg-[#2a2c2f] p-5 rounded-lg border border-neutral-700/80">
            <div className="flex items-center mb-3">
              {theme === 'dark' ? <MoonIcon size={20} className="mr-3 text-neutral-400" /> : <SunIcon size={20} className="mr-3 text-neutral-400" />}
              <h3 className="text-lg font-medium">Theme</h3>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => handleThemeChange('dark')}
                className={`px-4 py-2 rounded-md transition-colors ${theme === 'dark' ? 'bg-sky-600 text-white' : 'bg-neutral-600 hover:bg-neutral-500'}`}
              >
                Dark Mode
              </button>
              <button 
                onClick={() => handleThemeChange('light')}
                className={`px-4 py-2 rounded-md transition-colors ${theme === 'light' ? 'bg-sky-400 text-neutral-800' : 'bg-neutral-600 hover:bg-neutral-500'}`}
              >
                Light Mode
              </button>
            </div>
             <p className="text-xs text-neutral-500 mt-3">Full theme switching is a visual placeholder. Further implementation needed to change app-wide styles.</p>
          </div>
        </section>
        
        {/* Data Management Section */}
        <section>
          <h2 className="text-xl font-medium mb-3 text-sky-400">Data Management</h2>
          <div className="bg-[#2a2c2f] p-5 rounded-lg border border-neutral-700/80">
            <div className="flex items-center mb-2">
              <Trash2Icon size={20} className="mr-3 text-neutral-400" />
              <h3 className="text-lg font-medium">Local Data</h3>
            </div>
            <p className="text-sm text-neutral-400 mb-3">
              This application stores data like saved prompts, chat history, and agent configurations in your browser's local storage.
            </p>
            <button 
              onClick={handleClearLocalStorage}
              className="bg-red-600/80 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm flex items-center"
            >
              <Trash2Icon size={16} className="mr-2"/> Clear All Local Data
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default SettingsView;