# Mission: FitPulse 2.0 - AI Features & Premium System

## File Manifest

| Action | File Path | Description | Dependencies |
|--------|-----------|-------------|--------------|
| CREATE | src/types/subscription.ts | Subscription types | - |
| CREATE | src/types/activity.ts | Activity/tracking types | - |
| CREATE | src/services/aiMealAnalysis.ts | OpenAI Vision food analysis | expo-image-picker |
| CREATE | src/services/aiWorkoutAnalysis.ts | Claude workout generation | - |
| CREATE | src/services/nutritionLookup.ts | Simple calorie database | - |
| CREATE | src/services/subscription.ts | RevenueCat wrapper | react-native-purchases |
| CREATE | src/store/useActivityStore.ts | Step tracking state | expo-sensors |
| CREATE | src/store/useSubscriptionStore.ts | Premium state | subscription.ts |
| CREATE | src/components/FoodPhotoCapture.tsx | Camera/gallery food picker | expo-image-picker |
| CREATE | src/components/PremiumGate.tsx | Feature gating wrapper | useSubscriptionStore |
| CREATE | src/components/StepCounter.tsx | Daily steps widget | expo-sensors |
| CREATE | src/components/AIWorkoutSuggestion.tsx | AI workout card | aiWorkoutAnalysis.ts |
| MODIFY | src/types/index.ts | Add new types | - |
| MODIFY | src/store/useAppStore.ts | Add activity subscription state | - |
| MODIFY | app/(tabs)/nutrition.tsx | Add photo analysis button | FoodPhotoCapture |
| MODIFY | app/(tabs)/workouts.tsx | Add AI suggestions | AIWorkoutSuggestion |
| MODIFY | app/(tabs)/index.tsx | Add step counter | StepCounter |
| MODIFY | app/(tabs)/progress.tsx | Add activity charts | useActivityStore |
| MODIFY | app/_layout.tsx | Initialize RevenueCat | subscription.ts |
| MODIFY | app.json | Add plugins (sensors, image-picker, camera) | - |
| MODIFY | package.json | Add new dependencies | - |

## Work Assignments

### G1: Foundation - Types & Services (parallel-group:1)
No dependencies. Can all be created simultaneously.

- [ ] T1.1: CREATE `src/types/subscription.ts` | agent:Worker | file:src/types/subscription.ts | size:XS
- [ ] T1.2: CREATE `src/types/activity.ts` | agent:Worker | file:src/types/activity.ts | size:XS
- [ ] T1.3: CREATE `src/services/nutritionLookup.ts` | agent:Worker | file:src/services/nutritionLookup.ts | size:S
- [ ] T1.4: CREATE `src/services/aiMealAnalysis.ts` | agent:Worker | file:src/services/aiMealAnalysis.ts | size:M
- [ ] T1.5: CREATE `src/services/aiWorkoutAnalysis.ts` | agent:Worker | file:src/services/aiWorkoutAnalysis.ts | size:M
- [ ] T1.6: CREATE `src/services/subscription.ts` | agent:Worker | file:src/services/subscription.ts | size:M

### G2: State Management (parallel-group:2) | depends:G1
Depends on types being created.

- [ ] T2.1: CREATE `src/store/useActivityStore.ts` | agent:Worker | file:src/store/useActivityStore.ts | size:S | depends:T1.2
- [ ] T2.2: CREATE `src/store/useSubscriptionStore.ts` | agent:Worker | file:src/store/useSubscriptionStore.ts | size:S | depends:T1.1
- [ ] T2.3: MODIFY `src/types/index.ts` | agent:Worker | file:src/types/index.ts | size:XS | depends:T1.1,T1.2
- [ ] T2.4: MODIFY `src/store/useAppStore.ts` | agent:Worker | file:src/store/useAppStore.ts | size:S | depends:T2.1,T2.2

### G3: UI Components (parallel-group:3) | depends:G1
Can be built once types/services exist.

- [ ] T3.1: CREATE `src/components/FoodPhotoCapture.tsx` | agent:Worker | file:src/components/FoodPhotoCapture.tsx | size:M | depends:T1.4
- [ ] T3.2: CREATE `src/components/PremiumGate.tsx` | agent:Worker | file:src/components/PremiumGate.tsx | size:S | depends:T2.2
- [ ] T3.3: CREATE `src/components/StepCounter.tsx` | agent:Worker | file:src/components/StepCounter.tsx | size:M | depends:T2.1
- [ ] T3.4: CREATE `src/components/AIWorkoutSuggestion.tsx` | agent:Worker | file:src/components/AIWorkoutSuggestion.tsx | size:M | depends:T1.5

### G4: Screen Integration (parallel-group:4) | depends:G2,G3
Modify existing screens to use new features.

- [ ] T4.1: MODIFY `app/(tabs)/nutrition.tsx` | agent:Worker | file:app/(tabs)/nutrition.tsx | size:M | depends:T3.1
- [ ] T4.2: MODIFY `app/(tabs)/workouts.tsx` | agent:Worker | file:app/(tabs)/workouts.tsx | size:M | depends:T3.4
- [ ] T4.3: MODIFY `app/(tabs)/index.tsx` | agent:Worker | file:app/(tabs)/index.tsx | size:M | depends:T3.3
- [ ] T4.4: MODIFY `app/(tabs)/progress.tsx` | agent:Worker | file:app/(tabs)/progress.tsx | size:S | depends:T2.1

### G5: App Configuration (parallel-group:5) | depends:G1
Config changes needed for new native modules.

- [ ] T5.1: MODIFY `app.json` | agent:Worker | file:app.json | size:XS
- [ ] T5.2: MODIFY `package.json` | agent:Worker | file:package.json | size:XS
- [ ] T5.3: MODIFY `app/_layout.tsx` | agent:Worker | file:app/_layout.tsx | size:S | depends:T2.2

### G6: Friend System (parallel-group:6) | depends:G2
Social features build on existing social screen.

- [ ] T6.1: CREATE `src/types/social.ts` | agent:Worker | file:src/types/social.ts | size:XS
- [ ] T6.2: CREATE `src/store/useSocialStore.ts` | agent:Worker | file:src/store/useSocialStore.ts | size:M | depends:T6.1
- [ ] T6.3: MODIFY `app/(tabs)/social.tsx` | agent:Worker | file:app/(tabs)/social.tsx | size:L | depends:T6.2

### G7: Workout Plan Calories (parallel-group:7) | depends:G1
Add calorie estimates to workout plans.

- [ ] T7.1: CREATE `src/services/workoutCalories.ts` | agent:Worker | file:src/services/workoutCalories.ts | size:S
- [ ] T7.2: MODIFY `src/data/mockData.ts` | agent:Worker | file:src/data/mockData.ts | size:S | depends:T7.1

### G8: Final Verification | depends:G4,G5,G6,G7
- [ ] T8.1: TypeScript compilation check | agent:Reviewer | size:S
- [ ] T8.2: Full integration test | agent:Reviewer | size:M
