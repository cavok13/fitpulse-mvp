// FitPulse Type Definitions

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  level: number;
  xp: number;
  streak: number;
  joinedAt: string;
  goals: string[];
  experience?: string;
  stats: UserStats;
}

export interface UserStats {
  totalWorkouts: number;
  totalMinutes: number;
  totalCalories: number;
  personalRecords: number;
  friendsCount: number;
  badgesCount: number;
}

export type FitnessGoal =
  | 'muscle_gain'
  | 'fat_loss'
  | 'endurance'
  | 'flexibility'
  | 'general_fitness';

export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
  | 'legs' | 'glutes' | 'core' | 'full_body';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type Equipment =
  | 'bodyweight' | 'dumbbells' | 'barbell' | 'kettlebell'
  | 'resistance_bands' | 'machines' | 'pull_up_bar' | 'cable';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  difficulty: Difficulty;
  equipment: Equipment[];
  category: 'compound' | 'isolation' | 'cardio' | 'mobility' | 'core';
  description: string;
  instructions: string[];
  tips: string[];
  caloriesPerMinute: number;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  goal: FitnessGoal;
  difficulty: Difficulty;
  durationWeeks: number;
  sessionsPerWeek: number;
  sessions: WorkoutSession[];
  category?: string;
  totalExercises?: number;
  estimatedDuration?: number;
}

export interface WorkoutSession {
  id: string;
  name: string;
  dayOfWeek: number;
  exercises: WorkoutExercise[];
  estimatedDuration: number;
}

export interface WorkoutExercise {
  exercise: Exercise;
  sets: number;
  reps: number | string;
  restSeconds: number;
  weight?: number;
  tempo?: string;
  notes?: string;
}

export interface ActiveWorkout {
  planId?: string;
  session?: any;
  startedAt?: string;
  elapsed?: number;
  caloriesBurned?: number;
  id: string;
  startTime: number;
  currentExerciseIndex: number;
  currentSet: number;
  completedSets: CompletedSet[];
  isActive: boolean;
  isPaused: boolean;
}

export interface CompletedSet {
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight?: number;
  completed: boolean;
}

// Social Types
export interface SocialPost {
  id: string;
  user: Pick<User, 'id' | 'name' | 'avatar' | 'level'>;
  type: 'workout' | 'achievement' | 'milestone' | 'challenge';
  content: string;
  workoutSummary?: WorkoutSummary;
  achievement?: Achievement;
  reactions: Reaction[];
  comments: Comment[];
  createdAt: string;
}

export interface WorkoutSummary {
  name: string;
  duration: number;
  exercises: number;
  volume: number;
  calories: number;
}

export interface Reaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface Comment {
  id: string;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
  text: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'steps' | 'workouts' | 'distance' | 'streak';
  startDate: string;
  endDate: string;
  participants: ChallengeParticipant[];
  myProgress: number;
  target: number;
}

export interface ChallengeParticipant {
  userId: string;
  name: string;
  avatar?: string;
  progress: number;
}

// Nutrition Types
export interface MealEntry {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: string;
}

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

export interface DailyNutrition {
  date: string;
  entries: MealEntry[];
  water: number;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  targets: NutritionTargets;
}

// Gamification Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'foundation' | 'consistency' | 'strength' | 'endurance' | 'social' | 'nutrition' | 'legendary';
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export interface DailyQuest {
  id: string;
  name: string;
  description: string;
  category: 'fitness' | 'social' | 'nutrition' | 'exploration';
  xpReward: number;
  completed: boolean;
  progress: number;
  target: number;
}

// Analytics Types
export interface ProgressChart {
  labels: string[];
  datasets: {
    data: number[];
    color: string;
  }[];
}

export interface BodyMeasurement {
  date: string;
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  arms?: number;
  thighs?: number;
}
