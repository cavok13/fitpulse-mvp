// AI Service for Meal Analysis and Workout Suggestions
// Uses OpenAI-compatible API for food recognition and fitness coaching

const AI_API_URL = 'https://api.openai.com/v1/chat/completions';
const AI_API_KEY = ''; // User sets this in settings

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
  score: number; // 0-100
  suggestions: WorkoutSuggestion[];
  insights: string[];
  patterns: {
    consistency: number;
    intensity: number;
    variety: number;
    recovery: number;
  };
}

// Analyze meal from text description
export async function analyzeMealFromText(description: string): Promise<MealAnalysis> {
  if (!AI_API_KEY) {
    return getLocalMealEstimate(description);
  }

  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a nutrition expert. Analyze the meal description and return JSON with:
{
  "name": "meal name",
  "calories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "confidence": 0.0-1.0,
  "suggestions": ["nutrition tip 1", "tip 2"],
  "tags": ["healthy", "high-protein", etc]
}
Be accurate but conservative with estimates. If uncertain, say so in confidence.`
          },
          {
            role: 'user',
            content: `Analyze this meal: ${description}`
          }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      return JSON.parse(content);
    }
  } catch (error) {
    console.log('AI API error, using local estimate');
  }

  return getLocalMealEstimate(description);
}

// Analyze meal from image (base64)
export async function analyzeMealFromImage(base64Image: string): Promise<MealAnalysis> {
  if (!AI_API_KEY) {
    return {
      name: 'Photo meal',
      calories: 400,
      protein: 25,
      carbs: 40,
      fat: 15,
      confidence: 0.3,
      suggestions: ['Add API key for better analysis'],
      tags: ['photo'],
    };
  }

  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a nutrition expert. Analyze food photos and return JSON with name, calories, protein, carbs, fat, confidence (0-1), suggestions array, and tags array.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this meal photo. What food is this? Estimate calories and macros.' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      return JSON.parse(content);
    }
  } catch (error) {
    console.log('AI Vision API error');
  }

  return {
    name: 'Photo meal',
    calories: 400,
    protein: 25,
    carbs: 40,
    fat: 15,
    confidence: 0.3,
    suggestions: ['Could not analyze photo'],
    tags: ['photo'],
  };
}

// Analyze workout patterns and give suggestions
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
  if (!AI_API_KEY) {
    return getLocalWorkoutAnalysis(workoutHistory, userProfile);
  }

  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a fitness coach AI. Analyze workout history and provide insights as JSON:
{
  "analysis": "overall assessment",
  "score": 0-100,
  "suggestions": [{"type": "exercise|rest|increase|decrease|alternate", "title": "...", "description": "...", "priority": "low|medium|high"}],
  "insights": ["insight 1", "insight 2"],
  "patterns": {"consistency": 0-100, "intensity": 0-100, "variety": 0-100, "recovery": 0-100}
}`
          },
          {
            role: 'user',
            content: `Analyze this workout history for a ${userProfile.experience || 'beginner'} level user with goals: ${userProfile.goals.join(', ')}.

Workout history (${workoutHistory.length} workouts):
${workoutHistory.slice(0, 20).map(w => `- ${w.name}: ${w.duration}min, ${w.calories}cal, ${w.exercises} exercises on ${w.date}`).join('\n')}`
          }
        ],
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      return JSON.parse(content);
    }
  } catch (error) {
    console.log('AI API error, using local analysis');
  }

  return getLocalWorkoutAnalysis(workoutHistory, userProfile);
}

// Local fallback meal estimation
function getLocalMealEstimate(description: string): MealAnalysis {
  const desc = description.toLowerCase();

  // Common food calorie database (local estimation)
  const foodDB: Record<string, { cal: number; p: number; c: number; f: number }> = {
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
  };

  let totalCal = 0, totalP = 0, totalC = 0, totalF = 0;
  let matches = 0;

  for (const [food, nutrition] of Object.entries(foodDB)) {
    if (desc.includes(food)) {
      totalCal += nutrition.cal;
      totalP += nutrition.p;
      totalC += nutrition.c;
      totalF += nutrition.f;
      matches++;
    }
  }

  if (matches === 0) {
    // Generic estimate based on description length/complexity
    const words = desc.split(' ').length;
    totalCal = Math.round(words * 80 + 100);
    totalP = Math.round(totalCal * 0.2 / 4);
    totalC = Math.round(totalCal * 0.5 / 4);
    totalF = Math.round(totalCal * 0.3 / 9);
  }

  return {
    name: description.slice(0, 50),
    calories: totalCal || 350,
    protein: totalP || 20,
    carbs: totalC || 35,
    fat: totalF || 12,
    confidence: matches > 0 ? 0.7 : 0.4,
    suggestions: matches === 0 ? ['Could not identify specific foods. Try listing individual items.'] : [],
    tags: matches > 0 ? ['identified'] : ['estimated'],
  };
}

// Local workout analysis fallback
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

// Estimate calories for a workout based on exercises
export function estimateWorkoutCalories(
  exercises: Array<{ sets: number; reps: number | string; exercise: { caloriesPerMinute: number } }>,
  estimatedDurationMinutes: number
): number {
  let totalCalories = 0;

  for (const ex of exercises) {
    const reps = typeof ex.reps === 'string' ? parseInt(ex.reps) || 10 : ex.reps;
    const timePerSet = (reps * 3) / 60; // ~3 seconds per rep
    const totalTime = timePerSet * ex.sets;
    totalCalories += totalTime * ex.exercise.caloriesPerMinute;
  }

  // If calculated calories are too low, use duration-based estimate
  if (totalCalories < estimatedDurationMinutes * 5) {
    totalCalories = estimatedDurationMinutes * 8; // ~8 cal/min average
  }

  return Math.round(totalCalories);
}
