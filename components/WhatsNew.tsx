import React from 'react';
import { LinkIcon, MessageSquareTextIcon, ImageIcon, Code2Icon, UsersIcon, HistoryIcon } from 'lucide-react'; // Updated icons

interface WhatsNewCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tags?: string[];
}

const WhatsNewCard: React.FC<WhatsNewCardProps> = ({ icon, title, description, tags }) => {
  return (
    <div className="bg-[var(--theme-bg-secondary)] p-4 rounded-xl shadow-lg hover:shadow-[var(--theme-accent-orange)]/10 transition-all duration-300 cursor-pointer border border-[var(--theme-border-primary)] hover:border-[var(--theme-accent-orange)]/70 group transform hover:-translate-y-0.5">
      <div className="flex items-start space-x-3.5">
        <div className="p-2.5 bg-[var(--theme-bg-tertiary)] rounded-lg text-[var(--theme-accent-orange)] group-hover:text-[var(--theme-accent-orange-hover)] transition-colors duration-200 border border-[var(--theme-border-secondary)]">
          {icon}
        </div>
        <div>
          <h3 className="text-md font-semibold text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent-orange)] transition-colors duration-200">{title}</h3>
          <p className="text-sm text-[var(--theme-text-secondary)] mt-1.5 leading-relaxed">{description}</p>
        </div>
      </div>
      {tags && tags.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-2">
          {tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 text-xs bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)] rounded-full font-medium border border-[var(--theme-border-secondary)]">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};


const WhatsNew: React.FC = () => {
  const iconProps = { size: 20, strokeWidth:1.75 };
  const features = [
    {
      icon: <UsersIcon {...iconProps} />,
      title: "Define Custom Agents",
      description: "Create specialized AI agents with unique capabilities and system prompts.",
      tags: ["ADK Core", "Customization"]
    },
    {
      icon: <MessageSquareTextIcon {...iconProps} />,
      title: "Orchestrate with Nexus Core",
      description: "Let Gemini (Nexus Core) plan and delegate tasks to your defined agents.",
      tags: ["Orchestration", "AI Planning"]
    },
    {
      icon: <ImageIcon {...iconProps} />,
      title: "Generate Multimedia",
      description: "Request images and (simulated) audio as part of your agent workflows.",
      tags: ["Multimodal", "Creative Output"]
    },
     {
      icon: <Code2Icon {...iconProps} />,
      title: "Code Generation & Analysis",
      description: "Integrate code-focused agents for development and analytical tasks.",
      tags: ["Development", "Code Agents"]
    },
  ];

  return (
    <div className="w-full max-w-4xl mt-10">
      <h2 className="text-xl font-semibold text-[var(--theme-text-primary)] mb-5 text-left">Explore Zlitch ADK Capabilities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {features.map((feature, index) => (
          <WhatsNewCard key={index} {...feature} />
        ))}
      </div>
    </div>
  );
};

export default WhatsNew;