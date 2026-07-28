// FitPulse Subscription Store
// Manages subscription state, feature access, and usage limits

import { create } from 'zustand';

export type SubscriptionTier = 'free' | 'pro' | 'elite';

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: string;
  period: string;
  features: string[];
  limits: {
    aiMealsPerDay: number;
    aiWorkoutAnalysis: boolean;
    advancedStats: boolean;
    customWorkoutPlans: number;
    friendChallenges: number;
    exportData: boolean;
    prioritySupport: boolean;
    adFree: boolean;
  };
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    tier: 'free',
    name: 'FitPulse Free',
    price: '$0',
    period: 'forever',
    features: [
      'Basic workout tracking',
      '100 exercise library',
      '10 workout plans',
      'Basic nutrition logging',
      '5 daily quests',
      'Community feed',
    ],
    limits: {
      aiMealsPerDay: 3,
      aiWorkoutAnalysis: false,
      advancedStats: false,
      customWorkoutPlans: 3,
      friendChallenges: 1,
      exportData: false,
      prioritySupport: false,
      adFree: false,
    },
  },
  pro: {
    tier: 'pro',
    name: 'FitPulse Pro',
    price: '$9.99',
    period: '/month',
    features: [
      'Everything in Free',
      'AI meal photo analysis (unlimited)',
      'AI workout coaching',
      'Advanced progress analytics',
      'Unlimited custom plans',
      'Unlimited challenges',
      'Export your data',
      'No ads',
    ],
    limits: {
      aiMealsPerDay: -1, // unlimited
      aiWorkoutAnalysis: true,
      advancedStats: true,
      customWorkoutPlans: -1,
      friendChallenges: -1,
      exportData: true,
      prioritySupport: false,
      adFree: true,
    },
  },
  elite: {
    tier: 'elite',
    name: 'FitPulse Elite',
    price: '$19.99',
    period: '/month',
    features: [
      'Everything in Pro',
      'Personalized AI workout plans',
      'Body composition tracking',
      'Meal plan generator',
      'Recovery & sleep analysis',
      'Priority support',
      'Early access to features',
      'Exclusive achievements',
    ],
    limits: {
      aiMealsPerDay: -1,
      aiWorkoutAnalysis: true,
      advancedStats: true,
      customWorkoutPlans: -1,
      friendChallenges: -1,
      exportData: true,
      prioritySupport: true,
      adFree: true,
    },
  },
};

interface SubscriptionState {
  tier: SubscriptionTier;
  isActive: boolean;
  expiresAt?: string;
  aiMealsUsedToday: number;
  lastMealResetDate: string;

  // Actions
  subscribe: (tier: SubscriptionTier) => void;
  cancelSubscription: () => void;
  canUseFeature: (feature: keyof typeof SUBSCRIPTION_PLANS.free.limits) => boolean;
  trackAiMealUse: () => boolean;
  resetDailyLimits: () => void;
  getLimits: () => typeof SUBSCRIPTION_PLANS.free.limits;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  tier: 'free',
  isActive: true,
  aiMealsUsedToday: 0,
  lastMealResetDate: new Date().toISOString().split('T')[0],

  subscribe: (tier) => set({
    tier,
    isActive: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  }),

  cancelSubscription: () => set({
    tier: 'free',
    isActive: true,
    expiresAt: undefined,
  }),

  canUseFeature: (feature) => {
    const state = get();
    const limits = SUBSCRIPTION_PLANS[state.tier].limits;
    const value = limits[feature];

    if (typeof value === 'boolean') return value;
    if (value === -1) return true; // unlimited
    if (feature === 'aiMealsPerDay') {
      return state.aiMealsUsedToday < value;
    }
    return true;
  },

  trackAiMealUse: () => {
    const state = get();
    const limits = SUBSCRIPTION_PLANS[state.tier].limits;

    // Reset daily counter if new day
    const today = new Date().toISOString().split('T')[0];
    if (today !== state.lastMealResetDate) {
      set({ aiMealsUsedToday: 0, lastMealResetDate: today });
    }

    if (limits.aiMealsPerDay === -1) return true; // unlimited
    if (state.aiMealsUsedToday >= limits.aiMealsPerDay) return false;

    set({ aiMealsUsedToday: state.aiMealsUsedToday + 1 });
    return true;
  },

  resetDailyLimits: () => {
    const today = new Date().toISOString().split('T')[0];
    set({ aiMealsUsedToday: 0, lastMealResetDate: today });
  },

  getLimits: () => {
    const state = get();
    return SUBSCRIPTION_PLANS[state.tier].limits;
  },
}));
