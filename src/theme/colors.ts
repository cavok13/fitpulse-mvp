// FitPulse Design System - Colors
export const Colors = {
  // Primary brand colors
  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  primaryDark: '#4A42DB',

  // Accent colors
  accent: '#FF6B6B',
  accentLight: '#FF8E8E',
  accentDark: '#E84545',

  // Success / Warning / Error / Info
  success: '#4CAF50',
  successLight: '#81C784',
  warning: '#FFB74D',
  error: '#F44336',
  info: '#2196F3',
  infoLight: '#64B5F6',

  // Neutrals - Dark theme (default)
  background: '#0D0D1A',
  surface: '#1A1A2E',
  surfaceLight: '#252542',
  surfaceElevated: '#2D2D50',
  card: '#16213E',

  // Text
  text: '#FFFFFF',
  textSecondary: '#B0B0CC',
  textMuted: '#6B6B8D',
  textInverse: '#0D0D1A',

  // Borders & Dividers
  border: '#2D2D50',
  divider: '#1E1E3A',

  // Gradient presets
  gradients: {
    primary: ['#6C63FF', '#4A42DB'],
    accent: ['#FF6B6B', '#EE5A24'],
    dark: ['#1A1A2E', '#0D0D1A'],
    card: ['#1E1E3A', '#16213E'],
    warm: ['#FF6B6B', '#FFB74D'],
    cool: ['#6C63FF', '#48C9B0'],
  },

  // Tab bar
  tabActive: '#6C63FF',
  tabInactive: '#6B6B8D',
  tabBackground: '#1A1A2E',

  // Chart colors
  chart: ['#6C63FF', '#FF6B6B', '#4CAF50', '#FFB74D', '#48C9B0', '#9B59B6'],

  // XP & Gamification
  xpGold: '#FFD700',
  xpSilver: '#C0C0C0',
  xpBronze: '#CD7F32',
  levelUp: '#4CAF50',
} as const;

// Light theme override
export const LightColors = {
  ...Colors,
  background: '#F5F5FA',
  surface: '#FFFFFF',
  surfaceLight: '#F0F0F8',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#5A5A7A',
  textMuted: '#9A9ABB',
  textInverse: '#FFFFFF',
  border: '#E0E0EE',
  divider: '#EEEEF5',
  tabBackground: '#FFFFFF',
} as const;

export type ColorScheme = typeof Colors;
