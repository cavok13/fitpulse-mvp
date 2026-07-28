// FitPulse Design System - Typography
import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const Typography = {
  // Display
  displayLarge: {
    fontFamily,
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 41,
    letterSpacing: 0.25,
  },
  displayMedium: {
    fontFamily,
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  displaySmall: {
    fontFamily,
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 30,
  },

  // Headings
  h1: {
    fontFamily,
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  h2: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
  },
  h3: {
    fontFamily,
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 23,
  },
  h4: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 21,
  },

  // Body
  bodyLarge: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },

  // Labels
  labelLarge: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  label: {
    fontFamily,
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily,
    fontSize: 10,
    fontWeight: '600' as const,
    lineHeight: 14,
  },

  // Special
  stat: {
    fontFamily,
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  statSmall: {
    fontFamily,
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 25,
  },
  button: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  buttonSmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
} as const;
