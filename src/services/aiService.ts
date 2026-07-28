// AI Service for Meal Analysis and Workout Suggestions
// Supports: Groq (free, open-source Llama/Mixtral), OpenAI, or local fallback

import { useSettingsStore } from '../store/useSettingsStore';

export interface MealAnalysis {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
  suggestions: string[];
  tags: string[];
}

export interface WorkoutSuggestion {
  type: 'exercise' | 'rest' | 'increase' | 'decrease' | 'alternate';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  exerciseId?: string;
}

export interface AIAnalysisResult {
  analysis: string;
  score: number;
  suggestions: WorkoutSuggestion[];
  insights: string[];
  patterns: {
    consistency: number;
    intensity: number;
    variety: number;
    recovery: number;
  };
}

// Check if any AI provider is configured
function hasActiveAiKey(): boolean {
  const store = useSettingsStore.getState();
  if (store.aiProvider === 'groq') return store.hasGroqKey();
  if (store.aiProvider === 'openai') return store.hasOpenAiKey();
  return false;
}

// System prompts for each task
const SYSTEM_PROMPTS = {
  meal: `You are a nutrition expert. Analyze meal descriptions and return ONLY valid JSON with:
{
  "name": "meal name",
  "calories": number (estimated total calories),
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "confidence": 0.0-1.0 (how confident you are in the estimate),
  "suggestions": ["nutrition tip", "another tip"],
  "tags": ["high-protein", "healthy", etc]
}
Be accurate but conservative. If uncertain, lower confidence. Return ONLY the JSON object.`,

  workout: `You are a fitness coach AI. Analyze workout history and return ONLY valid JSON with:
{
  "analysis": "overall assessment of progress",
  "score": 0-100 (overall fitness score),
  "suggestions": [
    {"type": "exercise|rest|increase|decrease|alternate", "title": "...", "description": "...", "priority": "low|medium|high"}
  ],
  "insights": ["key insight 1", "key insight 2"],
  "patterns": {"consistency": 0-100, "intensity": 0-100, "variety": 0-100, "recovery": 0-100}
}
Return ONLY the JSON object.`,

  photo: `You are a nutrition expert analyzing food photos. Return ONLY valid JSON with:
{
  "name": "food name",
  "calories": number (estimated),
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "confidence": 0.0-1.0,
  "suggestions": ["tip"],
  "tags": ["tag"]
}
Return ONLY the JSON object.`,
};

// Make API call to configured AI provider
async function callAiApi(
  messages: Array<{ role: string; content: any }>,
  task: 'meal' | 'workout' | 'photo',
  systemPrompt: string
): Promise<string | null> {
  const store = useSettingsStore.getState();
  const apiKey = store.getActiveAiKey();
  const apiUrl = store.getActiveAiUrl();
  const model = store.getActiveAiModel(task === 'meal' || task === 'photo' ? 'meal' : 'workout');

  if (!apiKey || !apiUrl) return null;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.3,
        max_tokens: task === 'photo' ? 500 : 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.log(`AI API error (${response.status}): ${errorText}`);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.log('AI API call failed:', error);
    return null;
  }
}

// ============================================
// AI MEAL ANALYSIS FROM TEXT
// ============================================
export async function analyzeMealFromText(description: string): Promise<MealAnalysis> {
  if (!hasActiveAiKey()) {
    return getLocalMealEstimate(description);
  }

  const content = await callAiApi(
    [{ role: 'user', content: `Analyze this meal: ${description}` }],
    'meal',
    SYSTEM_PROMPTS.meal
  );

  if (content) {
    try {
      return JSON.parse(content);
    } catch {
      console.log('Failed to parse AI response as JSON');
    }
  }

  return getLocalMealEstimate(description);
}

// ============================================
// AI MEAL ANALYSIS FROM PHOTO (Vision)
// ============================================
export async function analyzeMealFromImage(base64Image: string): Promise<MealAnalysis> {
  const store = useSettingsStore.getState();

  // Groq vision models: llama-3.2-11b-vision-preview, llama-3.2-90b-vision-preview
  const visionModel = store.aiProvider === 'groq'
    ? 'llama-3.2-11b-vision-preview'
    : 'gpt-4o';

  if (!hasActiveAiKey()) {
    return {
      name: 'Photo meal',
      calories: 400,
      protein: 25,
      carbs: 40,
      fat: 15,
      confidence: 0.3,
      suggestions: ['Configure AI provider in Settings for better analysis'],
      tags: ['photo'],
    };
  }

  try {
    const apiKey = store.getActiveAiKey();
    const apiUrl = store.aiProvider === 'groq'
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : store.getActiveAiUrl();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: visionModel,
        messages: [
          { role: 'system', content: SYSTEM_PROMPTS.photo },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this meal photo. What food is this? Estimate calories and macros.' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) return getDefaultPhotoResult();
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (content) return JSON.parse(content);
  } catch (error) {
    console.log('AI Vision API error');
  }

  return getDefaultPhotoResult();
}

function getDefaultPhotoResult(): MealAnalysis {
  return {
    name: 'Photo meal',
    calories: 400,
    protein: 25,
    carbs: 40,
    fat: 15,
    confidence: 0.3,
    suggestions: ['Could not analyze photo. Try describing the meal instead.'],
    tags: ['photo'],
  };
}

// ============================================
// WORKOUT PATTERN ANALYSIS
// ============================================
export async function analyzeWorkoutPatterns(
  workoutHistory: Array<{
    name: string;
    date: string;
    duration: number;
    calories: number;
    exercises: number;
  }>,
  userProfile: {
    level: number;
    goals: string[];
    experience?: string;
  }
): Promise<AIAnalysisResult> {
  if (!hasActiveAiKey()) {
    return getLocalWorkoutAnalysis(workoutHistory, userProfile);
  }

  const content = await callAiApi(
    [
      {
        role: 'user',
        content: `Analyze this workout history for a ${userProfile.experience || 'beginner'} level user with goals: ${userProfile.goals.join(', ')}.

Workout history (${workoutHistory.length} workouts):
${workoutHistory.slice(0, 20).map(w =>
  `- ${w.name}: ${w.duration}min, ${w.calories}cal, ${w.exercises} exercises on ${w.date}`
).join('\n')}`,
      },
    ],
    'workout',
    SYSTEM_PROMPTS.workout
  );

  if (content) {
    try {
      return JSON.parse(content);
    } catch {
      console.log('Failed to parse workout analysis as JSON');
    }
  }

  return getLocalWorkoutAnalysis(workoutHistory, userProfile);
}

// ============================================
// LOCAL FALLBACK - MEAL ESTIMATION
// ============================================
const localFoodDB: Record<string, { cal: number; p: number; c: number; f: number }> = {
  'chicken': { cal: 165, p: 31, c: 0, f: 4 },
  'rice': { cal: 206, p: 4, c: 45, f: 0 },
  'egg': { cal: 78, p: 6, c: 1, f: 5 },
  'banana': { cal: 105, p: 1, c: 27, f: 0 },
  'bread': { cal: 79, p: 3, c: 15, f: 1 },
  'milk': { cal: 103, p: 8, c: 12, f: 2 },
  'salad': { cal: 20, p: 1, c: 3, f: 0 },
  'steak': { cal: 271, p: 26, c: 0, f: 18 },
  'pasta': { cal: 220, p: 8, c: 43, f: 1 },
  'fish': { cal: 206, p: 22, c: 0, f: 12 },
  'protein shake': { cal: 120, p: 25, c: 3, f: 1 },
  'oatmeal': { cal: 154, p: 5, c: 27, f: 3 },
  'yogurt': { cal: 100, p: 17, c: 6, f: 1 },
  'apple': { cal: 95, p: 0, c: 25, f: 0 },
  'avocado': { cal: 240, p: 3, c: 12, f: 22 },
  'cheese': { cal: 113, p: 7, c: 0, f: 9 },
  'broccoli': { cal: 55, p: 4, c: 11, f: 1 },
  'salmon': { cal: 208, p: 20, c: 0, f: 13 },
  'tofu': { cal: 76, p: 8, c: 2, f: 5 },
  'quinoa': { cal: 222, p: 8, c: 39, f: 4 },
  'beef': { cal: 250, p: 26, c: 0, f: 16 },
  'turkey': { cal: 135, p: 30, c: 0, f: 0.7 },
  'shrimp': { cal: 99, p: 24, c: 0.2, f: 0.3 },
  'tuna': { cal: 116, p: 26, c: 0, f: 0.8 },
  'potato': { cal: 93, p: 2.5, c: 21, f: 0.1 },
  'sweet potato': { cal: 86, p: 1.6, c: 20, f: 0.1 },
  'spinach': { cal: 23, p: 2.9, c: 3.6, f: 0.4 },
  'lentils': { cal: 116, p: 9, c: 20, f: 0.4 },
  'almonds': { cal: 579, p: 21, c: 22, f: 50 },
  'peanut butter': { cal: 588, p: 25, c: 20, f: 50 },
  'whey': { cal: 120, p: 25, c: 3, f: 1 },
  'protein bar': { cal: 250, p: 20, c: 30, f: 8 },
  'hummus': { cal: 166, p: 8, c: 14, f: 10 },
  'cottage cheese': { cal: 72, p: 12, c: 3, f: 1 },
  'edamame': { cal: 121, p: 12, c: 8.9, f: 5.2 },
  'chickpeas': { cal: 164, p: 9, c: 27, f: 2.6 },
  'brown rice': { cal: 111, p: 2.6, c: 23, f: 0.9 },
  'oats': { cal: 389, p: 17, c: 66, f: 7 },
};

function getLocalMealEstimate(description: string): MealAnalysis {
  const desc = description.toLowerCase();

  let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;
  let matches = 0;
  const matchedFoods: string[] = [];

  for (const [food, nutrition] of Object.entries(localFoodDB)) {
    if (desc.includes(food)) {
      totalCal += nutrition.cal;
      totalP += nutrition.p;
      totalC += nutrition.c;
      totalF += nutrition.f;
      matches++;
      matchedFoods.push(food);
    }
  }

  if (matches === 0) {
    const words = desc.split(' ').length;
    totalCal = Math.round(words * 80 + 100);
    totalP = Math.round(totalCal * 0.2 / 4);
    totalC = Math.round(totalCal * 0.5 / 4);
    totalF = Math.round(totalCal * 0.3 / 9);
  }

  return {
    name: description.slice(0, 50),
    calories: totalCal || 350,
    protein: Math.round(totalP * 10) / 10 || 20,
    carbs: Math.round(totalC * 10) / 10 || 35,
    fat: Math.round(totalF * 10) / 10 || 12,
    confidence: matches > 0 ? 0.7 : 0.4,
    suggestions: matches === 0
      ? ['Could not identify specific foods. Try listing individual items.']
      : ['Identified ' + matchedFoods.join(', ') + '. For more accurate results, add an AI API key in Settings.'],
    tags: matches > 0 ? ['identified'] : ['estimated'],
  };
}

// ============================================
// LOCAL FALLBACK - WORKOUT ANALYSIS
// ============================================
function getLocalWorkoutAnalysis(
  history: Array<{ name: string; date: string; duration: number; calories: number; exercises: number }>,
  profile: { level: number; goals: string[] }
): AIAnalysisResult {
  const count = history.length;
  const avgDuration = count > 0 ? history.reduce((a, w) => a + w.duration, 0) / count : 0;
  const avgCalories = count > 0 ? history.reduce((a, w) => a + w.calories, 0) / count : 0;

  const consistency = Math.min(100, count * 10);
  const intensity = Math.min(100, avgCalories > 0 ? (avgCalories / 500) * 100 : 20);
  const variety = Math.min(100, new Set(history.map(w => w.name)).size * 20);
  const recovery = count < 3 ? 80 : Math.min(100, 100 - (count > 7 ? (count - 7) * 10 : 0));

  const score = Math.round((consistency + intensity + variety + recovery) / 4);

  const suggestions: WorkoutSuggestion[] = [];
  if (count < 3) {
    suggestions.push({ type: 'exercise', title: 'Start Small', description: 'Aim for 3 workouts per week to build consistency', priority: 'high' });
  }
  if (avgDuration < 30) {
    suggestions.push({ type: 'increase', title: 'Increase Duration', description: 'Try to work out for 30-45 minutes per session', priority: 'medium' });
  }
  if (variety < 40) {
    suggestions.push({ type: 'alternate', title: 'Add Variety', description: 'Try different workout types to prevent plateaus', priority: 'medium' });
  }

  const insights: string[] = [];
  if (count > 0) insights.push(`You've completed ${count} workout${count !== 1 ? 's' : ''}`);
  if (avgDuration > 0) insights.push(`Average session: ${Math.round(avgDuration)} minutes`);
  if (avgCalories > 0) insights.push(`Average burn: ${Math.round(avgCalories)} calories`);

  return {
    analysis: count === 0
      ? "You haven't logged any workouts yet. Start with a beginner plan!"
      : `You've been ${count >= 5 ? 'very active' : 'getting started'} with ${count} workouts. ${score >= 70 ? 'Great progress!' : 'Keep building your routine!'}`,
    score,
    suggestions,
    insights,
    patterns: { consistency, intensity, variety, recovery },
  };
}

// ============================================
// CALORIE ESTIMATION
// ============================================
export function estimateWorkoutCalories(
  exercises: Array<{ sets: number; reps: number | string; exercise: { caloriesPerMinute: number } }>,
  estimatedDurationMinutes: number
): number {
  let totalCalories = 0;

  for (const ex of exercises) {
    const reps = typeof ex.reps === 'string' ? parseInt(ex.reps) || 10 : ex.reps;
    const timePerSet = (reps * 3) / 60;
    const totalTime = timePerSet * ex.sets;
    totalCalories += totalTime * ex.exercise.caloriesPerMinute;
  }

  if (totalCalories < estimatedDurationMinutes * 5) {
    totalCalories = estimatedDurationMinutes * 8;
  }

  return Math.round(totalCalories);
}
