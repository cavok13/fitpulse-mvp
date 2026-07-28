import { create } from 'zustand';

interface SettingsState {
  // API Keys
  openAiApiKey: string;
  usdaApiKey: string;

  // Actions
  setOpenAiApiKey: (key: string) => void;
  setUsdaApiKey: (key: string) => void;
  hasOpenAiKey: () => boolean;
  hasUsdaKey: () => boolean;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  openAiApiKey: '',
  usdaApiKey: '',

  setOpenAiApiKey: (key) => set({ openAiApiKey: key }),
  setUsdaApiKey: (key) => set({ usdaApiKey: key }),
  hasOpenAiKey: () => get().openAiApiKey.length > 0,
  hasUsdaKey: () => get().usdaApiKey.length > 0,
}));
