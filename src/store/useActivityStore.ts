import { create } from 'zustand';

export interface DailyActivity {
  date: string;
  steps: number;
  stepGoal: number;
  activeMinutes: number;
  activeMinutesGoal: number;
  distance: number;
  caloriesBurned: number;
  heartRate?: number;
  floorsClimbed?: number;
}

export interface WeeklyStats {
  totalSteps: number;
  totalActiveMinutes: number;
  totalCalories: number;
  totalDistance: number;
  averageSteps: number;
  averageActiveMinutes: number;
  daysActive: number;
}

interface ActivityState {
  today: DailyActivity;
  history: DailyActivity[];
  weeklyStats: WeeklyStats;
  isTracking: boolean;
  permissions: {
    pedometer: boolean;
    heartRate: boolean;
    location: boolean;
  };

  updateSteps: (steps: number) => void;
  addSteps: (steps: number) => void;
  updateActiveMinutes: (minutes: number) => void;
  addActiveMinutes: (minutes: number) => void;
  setTracking: (tracking: boolean) => void;
  requestPermissions: () => Promise<void>;
  calculateWeeklyStats: () => void;
  syncWithHealth: () => Promise<void>;
}

const createDefaultDay = (date?: string): DailyActivity => ({
  date: date || new Date().toISOString().split('T')[0],
  steps: 0,
  stepGoal: 10000,
  activeMinutes: 0,
  activeMinutesGoal: 30,
  distance: 0,
  caloriesBurned: 0,
  floorsClimbed: 0,
});

export const useActivityStore = create<ActivityState>((set, get) => ({
  today: createDefaultDay(),
  history: [],
  weeklyStats: {
    totalSteps: 0,
    totalActiveMinutes: 0,
    totalCalories: 0,
    totalDistance: 0,
    averageSteps: 0,
    averageActiveMinutes: 0,
    daysActive: 0,
  },
  isTracking: false,
  permissions: {
    pedometer: false,
    heartRate: false,
    location: false,
  },

  updateSteps: (steps) => set((state) => ({
    today: {
      ...state.today,
      steps,
      distance: Math.round((steps * 0.000762) * 100) / 100,
      caloriesBurned: Math.round(steps * 0.04),
    },
  })),

  addSteps: (steps) => set((state) => ({
    today: {
      ...state.today,
      steps: state.today.steps + steps,
      distance: Math.round(((state.today.steps + steps) * 0.000762) * 100) / 100,
      caloriesBurned: Math.round((state.today.steps + steps) * 0.04),
    },
  })),

  updateActiveMinutes: (minutes) => set((state) => ({
    today: {
      ...state.today,
      activeMinutes: minutes,
    },
  })),

  addActiveMinutes: (minutes) => set((state) => ({
    today: {
      ...state.today,
      activeMinutes: state.today.activeMinutes + minutes,
    },
  })),

  setTracking: (tracking) => set({ isTracking: tracking }),

  requestPermissions: async () => {
    set({
      permissions: {
        pedometer: true,
        heartRate: false,
        location: true,
      },
      isTracking: true,
    });
  },

  calculateWeeklyStats: () => {
    const state = get();
    const last7Days = state.history.slice(-7);

    if (last7Days.length === 0) {
      set({
        weeklyStats: {
          totalSteps: 0,
          totalActiveMinutes: 0,
          totalCalories: 0,
          totalDistance: 0,
          averageSteps: 0,
          averageActiveMinutes: 0,
          daysActive: 0,
        },
      });
      return;
    }

    const totalSteps = last7Days.reduce((a, d) => a + d.steps, 0);
    const totalActiveMinutes = last7Days.reduce((a, d) => a + d.activeMinutes, 0);
    const totalCalories = last7Days.reduce((a, d) => a + d.caloriesBurned, 0);
    const totalDistance = last7Days.reduce((a, d) => a + d.distance, 0);
    const daysActive = last7Days.filter(d => d.steps > 0).length;

    set({
      weeklyStats: {
        totalSteps,
        totalActiveMinutes,
        totalCalories,
        totalDistance: Math.round(totalDistance * 100) / 100,
        averageSteps: Math.round(totalSteps / Math.max(last7Days.length, 1)),
        averageActiveMinutes: Math.round(totalActiveMinutes / Math.max(last7Days.length, 1)),
        daysActive,
      },
    });
  },

  syncWithHealth: async () => {
    const state = get();
    const simulatedSteps = Math.floor(Math.random() * 5000) + 2000;
    const simulatedMinutes = Math.floor(Math.random() * 20) + 5;

    set({
      today: {
        ...state.today,
        steps: simulatedSteps,
        activeMinutes: simulatedMinutes,
        distance: Math.round((simulatedSteps * 0.000762) * 100) / 100,
        caloriesBurned: Math.round(simulatedSteps * 0.04 + simulatedMinutes * 7),
      },
    });

    get().calculateWeeklyStats();
  },
}));

export function startSimulatedPedometer(onStep: (steps: number) => void) {
  let totalSteps = 0;
  const interval = setInterval(() => {
    const newSteps = Math.floor(Math.random() * 3) + 1;
    totalSteps += newSteps;
    onStep(totalSteps);
  }, 1000);

  return () => clearInterval(interval);
}

export function calculateActivityCalories(
  activity: string,
  durationMinutes: number,
  weightKg: number = 70
): number {
  const metValues: Record<string, number> = {
    'walking': 3.5,
    'running': 8.0,
    'cycling': 6.0,
    'swimming': 7.0,
    'yoga': 2.5,
    'strength': 5.0,
    'hiit': 8.0,
    'stretching': 2.0,
    'dancing': 5.5,
    'hiking': 5.0,
    'gardening': 3.0,
    'cleaning': 3.5,
  };

  const met = metValues[activity.toLowerCase()] || 3.0;
  return Math.round((met * weightKg * durationMinutes) / 60);
}
