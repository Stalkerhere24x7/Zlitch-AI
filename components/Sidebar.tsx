import React from 'react';
import {
  BrainCircuitIcon,
  MessageSquareTextIcon,
  Settings2Icon,
  HistoryIcon,
  InfoIcon,
  FileTextIcon,
  UsersIcon,
  HelpCircleIcon,
} from 'lucide-react';
import { ViewType, VIEW_TYPES } from '../constants';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick, className }) => (
  <button
    onClick={onClick}
    title={label}
    aria-label={label}
    className={`flex items-center justify-center p-3 w-full h-12 rounded-lg transition-colors duration-200 ease-in-out
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent-orange)] focus-visible:ring-opacity-75
                ${isActive 
                  ? 'bg-[var(--theme-accent-orange)] text-white' 
                  : 'text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-tertiary)] hover:text-[var(--theme-text-primary)]'}
                ${className}`}
  >
    {icon}
  </button>
);

interface SidebarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const iconSize = 22;
  const iconStrokeWidth = 1.75;

  const navItems = [
    { viewType: VIEW_TYPES.CHAT, label: "Chat Prompt", icon: <MessageSquareTextIcon size={iconSize} strokeWidth={iconStrokeWidth} /> },
    { viewType: VIEW_TYPES.AGENTS, label: "Agents", icon: <UsersIcon size={iconSize} strokeWidth={iconStrokeWidth} /> },
    { viewType: VIEW_TYPES.PROMPTS, label: "Prompt Library", icon: <FileTextIcon size={iconSize} strokeWidth={iconStrokeWidth} /> },
    { viewType: VIEW_TYPES.HISTORY, label: "History", icon: <HistoryIcon size={iconSize} strokeWidth={iconStrokeWidth} /> },
    { viewType: VIEW_TYPES.SETTINGS, label: "Settings", icon: <Settings2Icon size={iconSize} strokeWidth={iconStrokeWidth} /> },
  ];

  return (
    <div className="w-16 bg-[var(--theme-bg-secondary)] flex flex-col items-center py-5 shadow-xl border-r border-[var(--theme-border-primary)]">
      {/* App Icon/Logo */}
      <div className="mb-8">
        <BrainCircuitIcon size={30} className="text-[var(--theme-accent-orange)]" />
      </div>

      {/* Main Navigation */}
      <nav className="flex-grow w-full px-2.5 space-y-2.5">
        {navItems.map((item) => (
          <NavItem 
            key={item.viewType}
            icon={item.icon} 
            label={item.label} 
            isActive={currentView === item.viewType} 
            onClick={() => setCurrentView(item.viewType)}
          />
        ))}
      </nav>

      {/* Bottom Utilities */}
      <div className="w-full px-2.5 space-y-2.5 pb-2">
        <NavItem 
          icon={<HelpCircleIcon size={iconSize} strokeWidth={iconStrokeWidth} />} 
          label="Help" 
          onClick={() => {/* TODO: Show help modal or view */}}
        />
        <NavItem 
          icon={<InfoIcon size={iconSize} strokeWidth={iconStrokeWidth} />} 
          label="About" 
          onClick={() => {/* TODO: Show about info modal */}}
        />
      </div>
    </div>
  );
};

export default Sidebar;