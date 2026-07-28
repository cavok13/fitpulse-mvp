import { create } from 'zustand';
import { User, ActiveWorkout, DailyNutrition, MealEntry, Achievement, DailyQuest, WorkoutPlan } from '../types';

interface AppState {
  // User
  user: User;
  updateUser: (updates: Partial<User>) => void;
  setUser: (user: User) => void;

  // Active Workout
  activeWorkout: ActiveWorkout | null;
  startWorkout: (workout: ActiveWorkout) => void;
  completeWorkout: (calories: number, minutes: number) => void;
  endWorkout: () => void;

  // Nutrition
  dailyNutrition: DailyNutrition;
  addMeal: (entry: Omit<MealEntry, 'id' | 'loggedAt'>) => void;
  removeMeal: (id: string) => void;
  addWater: (glasses: number) => void;
  resetNutrition: () => void;

  // Achievements
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  dailyQuests: DailyQuest[];
  completeQuest: (id: string) => void;

  // Workout History
  workoutHistory: Array<{
    id: string;
    name: string;
    date: string;
    duration: number;
    calories: number;
    exercises: number;
  }>;
  addWorkoutToHistory: (workout: { name: string; duration: number; calories: number; exercises: number }) => void;

  // Selected plan
  selectedPlan: WorkoutPlan | null;
  setSelectedPlan: (plan: WorkoutPlan | null) => void;

  // XP System
  addXP: (amount: number) => void;

  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const createDefaultNutrition = (): DailyNutrition => ({
  date: new Date().toISOString().split('T')[0],
  entries: [],
  water: 0,
  totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  targets: { calories: 2200, protein: 165, carbs: 250, fat: 73, water: 8 },
});

const createDefaultUser = (name: string = 'Athlete'): User => ({
  id: `user-${Date.now()}`,
  name,
  email: '',
  avatar: undefined,
  bio: '',
  level: 1,
  xp: 0,
  streak: 0,
  joinedAt: new Date().toISOString().split('T')[0],
  goals: [],
  stats: {
    totalWorkouts: 0,
    totalMinutes: 0,
    totalCalories: 0,
    personalRecords: 0,
    friendsCount: 0,
    badgesCount: 0,
  },
});

const defaultAchievements: Achievement[] = [
  { id: 'ach-1', name: 'Welcome Aboard', description: 'Complete account setup', icon: 'rocket', category: 'foundation', rarity: 'bronze', xpReward: 50, unlocked: false, progress: 0, target: 1 },
  { id: 'ach-2', name: 'First Steps', description: 'Complete your first workout', icon: 'fitness', category: 'foundation', rarity: 'bronze', xpReward: 100, unlocked: false, progress: 0, target: 1 },
  { id: 'ach-3', name: 'Profile Complete', description: 'Fill out your profile 100%', icon: 'person', category: 'foundation', rarity: 'bronze', xpReward: 50, unlocked: false, progress: 0, target: 1 },
  { id: 'ach-4', name: 'Week Warrior', description: '7-day workout streak', icon: 'flame', category: 'consistency', rarity: 'bronze', xpReward: 200, unlocked: false, progress: 0, target: 7 },
  { id: 'ach-5', name: 'Fortnight Fighter', description: '14-day workout streak', icon: 'flame', category: 'consistency', rarity: 'silver', xpReward: 500, unlocked: false, progress: 0, target: 14 },
  { id: 'ach-6', name: 'Monthly Master', description: '30-day workout streak', icon: 'flame', category: 'consistency', rarity: 'gold', xpReward: 1000, unlocked: false, progress: 0, target: 30 },
  { id: 'ach-7', name: 'Quarter Champion', description: '90-day workout streak', icon: 'flame', category: 'consistency', rarity: 'platinum', xpReward: 2500, unlocked: false, progress: 0, target: 90 },
  { id: 'ach-8', name: 'Year Legend', description: '365-day workout streak', icon: 'flame', category: 'consistency', rarity: 'diamond', xpReward: 10000, unlocked: false, progress: 0, target: 365 },
  { id: 'ach-9', name: 'First PR', description: 'Achieve your first personal record', icon: 'trophy', category: 'strength', rarity: 'bronze', xpReward: 100, unlocked: false, progress: 0, target: 1 },
  { id: 'ach-10', name: 'PR Machine', description: 'Achieve 10 personal records', icon: 'trophy', category: 'strength', rarity: 'silver', xpReward: 500, unlocked: false, progress: 0, target: 10 },
  { id: 'ach-11', name: 'PR Legend', description: 'Achieve 50 personal records', icon: 'trophy', category: 'strength', rarity: 'gold', xpReward: 2000, unlocked: false, progress: 0, target: 50 },
  { id: 'ach-12', name: 'Social Butterfly', description: 'Add 5 friends', icon: 'people', category: 'social', rarity: 'bronze', xpReward: 100, unlocked: false, progress: 0, target: 5 },
  { id: 'ach-13', name: 'Community Star', description: 'Post 10 workout updates', icon: 'chatbubbles', category: 'social', rarity: 'silver', xpReward: 200, unlocked: false, progress: 0, target: 10 },
  { id: 'ach-14', name: 'Food Logger', description: 'Log meals for 7 days', icon: 'restaurant', category: 'nutrition', rarity: 'bronze', xpReward: 200, unlocked: false, progress: 0, target: 7 },
  { id: 'ach-15', name: 'Hydration Hero', description: 'Hit water goal for 14 days', icon: 'water', category: 'nutrition', rarity: 'silver', xpReward: 300, unlocked: false, progress: 0, target: 14 },
  { id: 'ach-16', name: 'Workout Machine', description: 'Complete 100 workouts', icon: 'trophy', category: 'legendary', rarity: 'gold', xpReward: 3000, unlocked: false, progress: 0, target: 100 },
  { id: 'ach-17', name: 'Level 25', description: 'Reach level 25', icon: 'star', category: 'legendary', rarity: 'gold', xpReward: 2000, unlocked: false, progress: 0, target: 25 },
  { id: 'ach-18', name: 'Level 50', description: 'Reach max level', icon: 'star', category: 'legendary', rarity: 'diamond', xpReward: 10000, unlocked: false, progress: 0, target: 50 },
];

const defaultQuests: DailyQuest[] = [
  { id: 'q-1', name: 'Morning Workout', description: 'Complete a workout before noon', category: 'fitness', xpReward: 30, completed: false, progress: 0, target: 1 },
  { id: 'q-2', name: 'Hydration Goal', description: 'Drink 8 glasses of water', category: 'nutrition', xpReward: 20, completed: false, progress: 0, target: 8 },
  { id: 'q-3', name: 'Log All Meals', description: 'Log breakfast, lunch, and dinner', category: 'nutrition', xpReward: 25, completed: false, progress: 0, target: 3 },
  { id: 'q-4', name: 'Social Boost', description: 'React to 3 friend workouts', category: 'social', xpReward: 15, completed: false, progress: 0, target: 3 },
  { id: 'q-5', name: 'New Exercise', description: 'Try an exercise from the library', category: 'exploration', xpReward: 20, completed: false, progress: 0, target: 1 },
];

let mealCounter = 0;

export const useAppStore = create<AppState>((set, get) => ({
  // User
  user: createDefaultUser('Athlete'),
  updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
  setUser: (user) => set({ user }),

  // Active Workout
  activeWorkout: null,
  startWorkout: (workout) => set({ activeWorkout: workout }),
  completeWorkout: (calories, minutes) => set((state) => {
    const newWorkouts = state.user.stats.totalWorkouts + 1;
    const newMinutes = state.user.stats.totalMinutes + minutes;
    const newCalories = state.user.stats.totalCalories + calories;
    const xpGain = Math.floor(minutes * 2 + calories * 0.1);

    return {
      activeWorkout: null,
      user: {
        ...state.user,
        streak: state.user.streak + 1,
        stats: {
          ...state.user.stats,
          totalWorkouts: newWorkouts,
          totalMinutes: newMinutes,
          totalCalories: newCalories,
        },
      },
      workoutHistory: [
        {
          id: `wh-${Date.now()}`,
          name: state.activeWorkout?.session?.name || 'Workout',
          date: 'Just now',
          duration: minutes,
          calories,
          exercises: state.activeWorkout?.session?.exercises?.length || 0,
        },
        ...state.workoutHistory,
      ],
    };
  }),
  endWorkout: () => set({ activeWorkout: null }),

  // Nutrition
  dailyNutrition: createDefaultNutrition(),
  addMeal: (entry) => set((state) => {
    mealCounter++;
    const newEntry: MealEntry = {
      ...entry,
      id: `meal-${Date.now()}-${mealCounter}`,
      loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const entries = [...state.dailyNutrition.entries, newEntry];
    const totals = entries.reduce(
      (acc, e) => ({
        calories: acc.calories + e.calories,
        protein: acc.protein + e.protein,
        carbs: acc.carbs + e.carbs,
        fat: acc.fat + e.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    return { dailyNutrition: { ...state.dailyNutrition, entries, totals } };
  }),
  removeMeal: (id) => set((state) => {
    const entries = state.dailyNutrition.entries.filter((e) => e.id !== id);
    const totals = entries.reduce(
      (acc, e) => ({
        calories: acc.calories + e.calories,
        protein: acc.protein + e.protein,
        carbs: acc.carbs + e.carbs,
        fat: acc.fat + e.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    return { dailyNutrition: { ...state.dailyNutrition, entries, totals } };
  }),
  addWater: (glasses) => set((state) => ({
    dailyNutrition: {
      ...state.dailyNutrition,
      water: Math.min(state.dailyNutrition.water + glasses, state.dailyNutrition.targets.water + 4),
    },
  })),
  resetNutrition: () => set({ dailyNutrition: createDefaultNutrition() }),

  // Achievements
  achievements: defaultAchievements,
  unlockAchievement: (id) => set((state) => ({
    achievements: state.achievements.map((a) =>
      a.id === id ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() } : a
    ),
  })),

  // Daily Quests
  dailyQuests: defaultQuests,
  completeQuest: (id) => set((state) => ({
    dailyQuests: state.dailyQuests.map((q) =>
      q.id === id ? { ...q, completed: true, progress: q.target } : q
    ),
  })),

  // Workout History
  workoutHistory: [],
  addWorkoutToHistory: (workout) => set((state) => ({
    workoutHistory: [
      {
        id: `wh-${Date.now()}`,
        date: 'Just now',
        ...workout,
      },
      ...state.workoutHistory,
    ],
  })),

  // Selected plan
  selectedPlan: null,
  setSelectedPlan: (plan) => set({ selectedPlan: plan }),

  // XP System
  addXP: (amount) => set((state) => {
    const newXP = state.user.xp + amount;
    const xpPerLevel = 500;
    const newLevel = Math.floor(newXP / xpPerLevel) + 1;
    const leveledUp = newLevel > state.user.level;

    return {
      user: {
        ...state.user,
        xp: newXP,
        level: newLevel,
        stats: {
          ...state.user.stats,
          badgesCount: leveledUp
            ? state.user.stats.badgesCount + 1
            : state.user.stats.badgesCount,
        },
      },
    };
  }),

  // Theme
  isDarkMode: true,
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));
