import { create } from 'zustand';

// Try to load local development keys (gitignored, not committed)
let localKeys: { groqApiKey?: string; usdaApiKey?: string; openAiApiKey?: string } = {};
try {
  // This file is gitignored - exists only for local development
  localKeys = require('../config/keys.local').LOCAL_KEYS || {};
} catch {
  // File doesn't exist - that's fine, use empty defaults
}

export type AiProvider = 'groq' | 'openai' | 'local';

export interface AiModelConfig {
  label: string;
  value: string;
  provider: AiProvider;
}

export const GROQ_MODELS: AiModelConfig[] = [
  { label: 'Llama 3.3 70B (best)', value: 'llama-3.3-70b-versatile', provider: 'groq' },
  { label: 'Llama 3.1 8B (fast)', value: 'llama-3.1-8b-instant', provider: 'groq' },
  { label: 'Mixtral 8x7B', value: 'mixtral-8x7b-32768', provider: 'groq' },
  { label: 'Gemma 2 9B', value: 'gemma2-9b-it', provider: 'groq' },
];

interface SettingsState {
  // AI Provider
  aiProvider: AiProvider;
  setAiProvider: (provider: AiProvider) => void;

  // Groq (free, open-source AI)
  groqApiKey: string;
  groqModel: string;
  setGroqApiKey: (key: string) => void;
  setGroqModel: (model: string) => void;
  hasGroqKey: () => boolean;

  // OpenAI (paid, kept for compatibility)
  openAiApiKey: string;
  setOpenAiApiKey: (key: string) => void;
  hasOpenAiKey: () => boolean;

  // USDA (free government database)
  usdaApiKey: string;
  setUsdaApiKey: (key: string) => void;
  hasUsdaKey: () => boolean;

  // Active AI config helper
  getActiveAiKey: () => string;
  getActiveAiUrl: () => string;
  getActiveAiModel: (task: 'meal' | 'workout') => string;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // Default to Groq (free, open-source)
  aiProvider: localKeys.groqApiKey ? 'groq' : 'local',
  setAiProvider: (provider) => set({ aiProvider: provider }),

  // Groq
  groqApiKey: localKeys.groqApiKey || '',
  groqModel: 'llama-3.3-70b-versatile',
  setGroqApiKey: (key) => set({ groqApiKey: key }),
  setGroqModel: (model) => set({ groqModel: model }),
  hasGroqKey: () => get().groqApiKey.length > 0,

  // OpenAI
  openAiApiKey: localKeys.openAiApiKey || '',
  setOpenAiApiKey: (key) => set({ openAiApiKey: key }),
  hasOpenAiKey: () => get().openAiApiKey.length > 0,

  // USDA
  usdaApiKey: localKeys.usdaApiKey || '',
  setUsdaApiKey: (key) => set({ usdaApiKey: key }),
  hasUsdaKey: () => get().usdaApiKey.length > 0,

  // Active AI config
  getActiveAiKey: () => {
    const state = get();
    if (state.aiProvider === 'groq') return state.groqApiKey;
    if (state.aiProvider === 'openai') return state.openAiApiKey;
    return '';
  },
  getActiveAiUrl: () => {
    const state = get();
    if (state.aiProvider === 'groq') return 'https://api.groq.com/openai/v1/chat/completions';
    if (state.aiProvider === 'openai') return 'https://api.openai.com/v1/chat/completions';
    return '';
  },
  getActiveAiModel: (task) => {
    const state = get();
    if (state.aiProvider === 'groq') return state.groqModel || 'llama-3.3-70b-versatile';
    if (state.aiProvider === 'openai') return task === 'meal' ? 'gpt-4o-mini' : 'gpt-4o-mini';
    return '';
  },
}));
