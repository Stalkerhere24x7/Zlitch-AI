import React from 'react';

export const GEMINI_MODEL_NAME: string = 'gemini-2.5-flash-preview-04-17';
export const APP_TITLE = "Zlitch Agent Development Kit";

export const VIEW_TYPES = {
  CHAT: 'chat',
  AGENTS: 'agents',
  PROMPTS: 'prompts',
  HISTORY: 'history',
  SETTINGS: 'settings',
} as const;

export type ViewType = typeof VIEW_TYPES[keyof typeof VIEW_TYPES];
