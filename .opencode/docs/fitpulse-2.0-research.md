# FitPulse 2.0 - AI Feature Research

**Date**: 2026-07-27
**Confidence**: HIGH (official documentation verified)
**Project Stack**: Expo SDK 57, React Native 0.86, TypeScript 6.0, Zustand

---

## 1. AI Meal Analysis (Photo/Text → Calories)

### RECOMMENDED: OpenAI GPT-4o Vision

**Why**: Best accuracy for food recognition, structured JSON output, mature API.

**API Endpoint**: `POST https://api.openai.com/v1/chat/completions`
**Model**: `gpt-4o` (vision-capable)
**Confidence**: HIGH (official docs at platform.openai.com/docs/guides/vision)

**How it works**:
1. User takes photo with `expo-image-picker` or types food description
2. Image converted to base64 data URL
3. Sent to GPT-4o with structured prompt
4. Returns JSON with calories, protein, carbs, fat

**Key Function Signature**:
```typescript
// Server-side (Node.js/Python microservice)
import OpenAI from "openai";
const openai = new OpenAI();

async function analyzeFood(base64Image: string): Promise<FoodAnalysis> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this food image. Return JSON only:
            {
              "foods": [{ "name": string, "portion": string, "calories": number, "protein": number, "carbs": number, "fat": number }],
              "totalCalories": number,
              "totalProtein": number,
              "totalCarbs": number,
              "totalFat": number,
              "confidence": "high" | "medium" | "low"
            }`
          },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${base64Image}` }
          }
        ]
      }
    ],
    response_format: { type: "json_object" },
    max_tokens: 1000
  });

  return JSON.parse(response.choices[0].message.content);
}
```

**Cost Estimates**:
- Input: ~765 tokens (image) + ~200 tokens (prompt) = ~965 tokens
- Output: ~200 tokens
- Price: ~$0.002-0.005 per analysis (at $2.50/1M input, $10/1M output)
- Monthly for 1000 analyses: ~$2-5

**Client-side Integration (Expo)**:
```typescript
// Using expo-image-picker
import * as ImagePicker from 'expo-image-picker';

const pickAndAnalyzeFood = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8, // Compress for API
    base64: true, // Get base64 directly
  });

  if (!result.canceled && result.assets[0].base64) {
    // Send to your backend API
    const analysis = await fetch('/api/nutrition/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ image: result.assets[0].base64 })
    });
    return analysis.json();
  }
};
```

**Implementation Complexity**: MEDIUM (need backend proxy to hide API key)

### Alternative: Text-based Natural Language (Nutritionix)

For text input ("I ate 2 eggs and toast"), use Nutritionix API:
- **Endpoint**: `POST https://trackapi.nutritionix.com/v2/natural/nutrients`
- **Body**: `{ "query": "2 eggs and toast" }`
- **Returns**: Structured nutrition data for each food item
- **Cost**: Free tier available, paid plans for production
- **Complexity**: LOW

### Alternative: Calorie Mama API
- Vision-based food recognition
- Less accurate than GPT-4o for complex meals
- Better for simple/standard foods
- **Complexity**: LOW

### RECOMMENDATION for MVP:
1. **Primary**: GPT-4o Vision via backend proxy (best accuracy)
2. **Text fallback**: Simple calorie database lookup (no API needed for common foods)
3. **Quick-add**: Predefined meals (already in app)

---

## 2. AI Workout Analysis (Patterns/Suggestions)

### A. AI Workout Plan Generation (Claude/GPT API)

**RECOMMENDED**: Use Claude API (Anthropic) for workout generation
**Confidence**: HIGH (docs.anthropic.com/en/api/messages)

**Why Claude**: Excellent at following instructions, structured JSON output, deep fitness knowledge.

**API Endpoint**: `POST https://api.anthropic.com/v1/messages`
**Model**: `claude-sonnet-4-20250514` (fast, cost-effective)

**Key Function Signature**:
```typescript
// Server-side
import Anthropic from '@anthropic-ai/sdk';
const anthropic = new Anthropic();

async function generateWorkoutPlan(userProfile: UserProfile): Promise<WorkoutPlan> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Generate a personalized workout plan. Return JSON only:
        {
          "planName": string,
          "description": string,
          "sessions": [{
            "name": string,
            "dayOfWeek": number,
            "exercises": [{
              "name": string,
              "muscleGroup": string,
              "sets": number,
              "reps": string,
              "restSeconds": number,
              "notes": string
            }]
          }]
        }

        User Profile:
        - Goals: ${userProfile.goals}
        - Experience: ${userProfile.experience}
        - Available equipment: ${userProfile.equipment}
        - Days per week: ${userProfile.daysPerWeek}
        - Injuries/limitations: ${userProfile.limitations}

        Previous workout history:
        ${JSON.stringify(userProfile.recentWorkouts, null, 2)}`
      }
    ]
  });

  return JSON.parse(response.content[0].text);
}
```

**Cost**: ~$0.003-0.01 per plan generation
**Complexity**: MEDIUM

### B. Pattern Analysis (Client-side - NO API needed)

These can be implemented entirely client-side using existing `workoutHistory` data:

```typescript
// Progressive Overload Detection
function detectProgressiveOverload(history: CompletedSet[]): TrendAnalysis {
  // Group by exercise, compare recent vs previous sessions
  // Alert if weight/reps not increasing over 2+ weeks
}

// Plateau Detection
function detectPlateau(history: WorkoutHistory[], exerciseId: string, weeks: number = 3): boolean {
  const recentSessions = history.filter(h => h.exercises.some(e => e.id === exerciseId)).slice(0, weeks * 2);
  if (recentSessions.length < 4) return false;

  const recentMax = Math.max(...recentSessions.slice(0, weeks).map(s => s.maxWeight));
  const olderMax = Math.max(...recentSessions.slice(weeks).map(s => s.maxWeight));

  return recentMax <= olderMax; // No improvement
}

// Volume Tracking per Muscle Group
function calculateWeeklyVolume(history: WorkoutHistory[], muscleGroup: string): number {
  return history
    .filter(h => h.date >= oneWeekAgo)
    .reduce((total, session) =>
      total + session.exercises
        .filter(e => e.muscleGroup === muscleGroup)
        .reduce((vol, e) => vol + e.sets * e.reps, 0)
    , 0);
}
```

**Complexity**: LOW (pure logic, no API)

### C. Exercise Form Tips (AI Vision - Advanced)

- Use GPT-4o Vision to analyze exercise form from photos/video frames
- Send video frame → AI analyzes posture, alignment, technique
- Returns specific corrections and tips
- **Complexity**: HIGH (video processing, real-time feedback)
- **Recommendation**: Defer to v2.1, focus on text-based tips first

---

## 3. Activity/Movement Tracking

### RECOMMENDED: expo-sensors Pedometer (SDK 57)

**Confidence**: HIGH (official docs at docs.expo.dev/versions/latest/sdk/sensors/)
**Already compatible with Expo Go** - no native build needed for development

**Installation**:
```bash
npx expo install expo-sensors
```

**Key API**:
```typescript
import { Pedometer } from 'expo-sensors';

// Check availability
const isAvailable = await Pedometer.isAvailableAsync();

// Get historical steps (past 24 hours)
const end = new Date();
const start = new Date();
start.setDate(end.getDate() - 1);
const pastSteps = await Pedometer.getStepCountAsync(start, end);

// Real-time step watching
const subscription = Pedometer.watchStepCount(result => {
  console.log(`Steps: ${result.steps}`);
  updateDailySteps(result.steps);
});

// Cleanup
subscription.remove();
```

**Key Methods**:
| Method | Returns | Notes |
|--------|---------|-------|
| `isAvailableAsync()` | `boolean` | Check if pedometer hardware exists |
| `getStepCountAsync(start, end)` | `{ steps: number }` | Historical query (max 7 days) |
| `watchStepCount(callback)` | `Subscription` | Real-time updates (foreground only) |
| `requestPermissionsAsync()` | `PermissionResponse` | Request permission |

**Limitations**:
- No background updates on Android (use Health Connect API for that)
- Max 7 days history on iOS
- Only step count (no distance/calories from sensor)

**Integration with Store**:
```typescript
// In useAppStore.ts - add new state
interface ActivityState {
  dailySteps: number;
  stepGoal: number;
  weeklySteps: number[];
  updateSteps: (steps: number) => void;
  setStepGoal: (goal: number) => void;
}

// In Dashboard screen
useEffect(() => {
  const subscription = Pedometer.watchStepCount(result => {
    useAppStore.getState().updateSteps(result.steps);
  });
  return () => subscription?.remove();
}, []);
```

**Complexity**: LOW

### Alternative: react-native-health (Apple HealthKit)
- More data: steps, distance, calories, heart rate, sleep, workouts
- iOS only, requires native module (not Expo Go compatible)
- **Complexity**: MEDIUM
- **Recommendation**: Add later for comprehensive iOS health data

### Alternative: react-native-google-fit (Google Fit)
- Android equivalent: steps, distance, activity recognition
- Not Expo Go compatible
- **Complexity**: MEDIUM
- **Recommendation**: Add later for comprehensive Android health data

### RECOMMENDATION for MVP:
1. **Phase 1**: expo-sensors Pedometer (works in Expo Go, basic steps)
2. **Phase 2**: Add HealthKit/Google Fit for richer data (requires dev build)
3. **Phase 3**: Background step tracking with Health Connect API (Android)

---

## 4. Freemium/Premium Subscription System

### RECOMMENDED: RevenueCat

**Confidence**: HIGH (official docs at revenuecat.com/docs/getting-started/installation/expo)
**Free tier**: Up to $2,500 monthly revenue

**Installation**:
```bash
npx expo install react-native-purchases react-native-purchases-ui expo-dev-client
```

**Configuration** (in app entry point):
```typescript
import { Platform } from 'react-native';
import { useEffect } from 'react';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

export default function App() {
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: 'your_apple_api_key' });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: 'your_google_api_key' });
    }
  }, []);
}
```

**Check Subscription Status**:
```typescript
import Purchases from 'react-native-purchases';

// Check if user is premium
const checkPremium = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return typeof customerInfo.entitlements.active['pro'] !== 'undefined';
  } catch (e) {
    return false;
  }
};

// Present paywall
import { Paywall } from 'react-native-purchases-ui';

const showPaywall = () => {
  return <Paywall onRestoreCompleted={(customerInfo) => {
    if (typeof customerInfo.entitlements.active['pro'] !== 'undefined') {
      // User is now premium
    }
  }} />;
};
```

**RevenueCat Dashboard Setup**:
1. Create project at app.revenuecat.com
2. Connect App Store + Google Play
3. Create products: `fitpulse_monthly`, `fitpulse_yearly`
4. Create entitlement: `pro`
5. Attach products to entitlement
6. Create offering with paywall

**Pricing Recommendation**:
- Monthly: $9.99/month
- Yearly: $59.99/year (save 50%)
- Lifetime: $149.99 (optional)

**Feature Gating Pattern**:
```typescript
// src/store/useSubscription.ts
import { create } from 'zustand';
import Purchases from 'react-native-purchases';

interface SubscriptionState {
  isPremium: boolean;
  isLoading: boolean;
  checkPremium: () => Promise<void>;
  restorePurchases: () => Promise<boolean>;
}

export const useSubscription = create<SubscriptionState>((set) => ({
  isPremium: false,
  isLoading: true,

  checkPremium: async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      set({
        isPremium: typeof customerInfo.entitlements.active['pro'] !== 'undefined',
        isLoading: false,
      });
    } catch (e) {
      set({ isPremium: false, isLoading: false });
    }
  },

  restorePurchases: async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isPremium = typeof customerInfo.entitlements.active['pro'] !== 'undefined';
      set({ isPremium });
      return isPremium;
    } catch (e) {
      return false;
    }
  },
}));

// Feature gate component
const PremiumGate = ({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) => {
  const isPremium = useSubscription(s => s.isPremium);
  const isLoading = useSubscription(s => s.isLoading);

  if (isLoading) return <ActivityIndicator />;
  if (!isPremium) return fallback ?? <Paywall />;
  return <>{children}</>;
};
```

**Cost**: Free up to $2,500/month revenue, then 5-10% of revenue
**Complexity**: MEDIUM

### Alternative: expo-in-app-purchases
- Expo's built-in IAP solution
- Less mature, no paywall UI
- More manual setup required
- **Recommendation**: Use RevenueCat instead

### Alternative: Stripe (Web only)
- For web subscriptions
- Not for mobile app stores (Apple/Google require their own IAP)
- **Recommendation**: Use if adding web version later

---

## 5. Additional Dependencies Needed

| Package | Purpose | Install Command |
|---------|---------|----------------|
| `expo-image-picker` | Camera/gallery access for food photos | `npx expo install expo-image-picker` |
| `expo-camera` | Camera component for food scanning | `npx expo install expo-camera` |
| `expo-sensors` | Pedometer for step tracking | `npx expo install expo-sensors` |
| `react-native-purchases` | RevenueCat subscriptions | `npx expo install react-native-purchases` |
| `react-native-purchases-ui` | RevenueCat paywall UI | `npx expo install react-native-purchases-ui` |
| `expo-dev-client` | Required for RevenueCat | `npx expo install expo-dev-client` |

---

## 6. Architecture Recommendations

### Backend Required for AI Features
Since AI API keys cannot be exposed in client-side code, a backend proxy is needed:

```
Client (Expo App)
  ↓ (image/base64)
Backend API (Node.js/Express)
  ↓ (forwards to AI)
OpenAI / Anthropic API
  ↓ (structured response)
Backend processes & returns
  ↓
Client displays results
```

### MVP Scope (No Backend Required)
For initial MVP without backend:
1. **Meal logging**: Manual input + quick-add (already done)
2. **Step tracking**: expo-sensors pedometer (no API key needed)
3. **Workout analysis**: Client-side pattern detection (no API)
4. **Subscriptions**: RevenueCat handles its own backend

### v2.0 Scope (With Backend)
1. AI meal photo analysis (OpenAI Vision API)
2. AI workout plan generation (Claude API)
3. AI exercise form tips (GPT-4o Vision)
4. Social features (friend sync, real-time feed)
5. Cross-device data sync

---

## 7. Cost Summary (Monthly Estimates)

| Feature | API | Cost per Use | Monthly (1000 users) |
|---------|-----|-------------|---------------------|
| Food photo analysis | OpenAI GPT-4o | $0.003-0.005 | $3-5 |
| Text food lookup | Nutritionix | Free tier / $0.001 | $0-1 |
| Workout plan generation | Claude Sonnet | $0.003-0.01 | $3-10 |
| Step tracking | expo-sensors | Free | $0 |
| Subscriptions | RevenueCat | Free under $2.5K rev | $0 |
| **Total** | | | **$6-16/month** |

---

## Sources

1. OpenAI Vision Guide: https://platform.openai.com/docs/guides/vision (cached)
2. Expo Sensors (Pedometer): https://docs.expo.dev/versions/latest/sdk/sensors/ (cached)
3. Expo ImagePicker: https://docs.expo.dev/versions/latest/sdk/imagepicker/ (cached)
4. RevenueCat Expo Installation: https://www.revenuecat.com/docs/getting-started/installation/expo (cached)
5. RevenueCat Entitlements: https://www.revenuecat.com/docs/getting-started/entitlements (cached)
6. Anthropic Messages API: https://docs.anthropic.com/en/api/messages (cached)
7. Expo Camera: https://docs.expo.dev/versions/latest/sdk/bar-code-scanner/ (cached)
8. Expo Notifications: https://docs.expo.dev/versions/latest/sdk/notifications/ (cached)
