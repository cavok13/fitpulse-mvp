# Project Context - FitPulse MVP

## Environment
- **Language**: TypeScript 6.0
- **Runtime**: React Native 0.86 + Expo SDK 57
- **Build**: `npx expo start` / `eas build`
- **Test**: TypeScript compiler (`npx tsc --noEmit`)
- **Package Manager**: npm

## Project Type
- [x] Application (Mobile - iOS/Android/Web)
- [ ] Library/Package
- [ ] Microservice

## Infrastructure
- Container: None
- Orchestration: None
- CI/CD: None (manual)
- Cloud: None (local development)

## Structure
- **Source**: `app/` (screens), `src/` (components, store, types, theme, data)
- **Tests**: None yet
- **Docs**: `docs/` (backend-api-plan.md, database-schema.md), `.opencode/docs/` (cached research)
- **Entry**: `app/_layout.tsx` → `app/(tabs)/_layout.tsx`

## Current Tech Stack
- **Navigation**: Expo Router (file-based, 5 tabs)
- **State**: Zustand 5.0 (single store)
- **Theme**: Custom dark theme (Colors, Spacing, Typography)
- **Components**: Card, Button, ProgressBar, StatCard, Avatar, Badge, NutritionMacroBar, QuestCard
- **Data**: 100 exercises, 10 workout plans, achievements, daily quests (all mock/client-side)

## Current Features
- Dashboard with stats, streak, XP, quests
- Workouts with 10 plans, active workout tracking
- Social feed (empty state, basic posting)
- Nutrition with meal logging, water tracking, quick-add
- Progress with achievements, body measurements
- Onboarding flow (name, goals, experience)

## Design System
- **Primary**: #6C63FF (purple)
- **Accent**: #FF6B6B (red)
- **Background**: #0D0D1A (dark)
- **Surface**: #1A1A2E
- **Dark mode default**

## Planned Features (FitPulse 2.0)
1. AI Meal Analysis (photo → calories) - OpenAI GPT-4o Vision
2. AI Workout Analysis (patterns/suggestions) - Claude API + client-side
3. Activity/Step Tracking - expo-sensors Pedometer
4. Freemium/Premium Subscriptions - RevenueCat
5. Friend System (add/search/activity)
6. Calories in Workout Plans

## Backend Plan (exists but not implemented)
- Node.js + Express
- PostgreSQL + Redis
- JWT Auth + OAuth
- Python AI microservice
- See: docs/backend-api-plan.md, docs/database-schema.md

## Conventions
- **Naming**: camelCase (variables/functions), PascalCase (components/types)
- **Imports**: Relative paths (../../src/...)
- **Error handling**: Alert.alert() for user-facing
- **Styling**: StyleSheet.create(), theme constants
- **State**: Zustand with slices pattern
