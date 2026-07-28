# Sync Issues (Unresolved Only)

## SYNC-1
- Severity: HIGH
- Files: `src/services/nutritionApi.ts`
- Problem: Worker `task_c26b7c8a` (ses_055828c02ffef4uiwFMTWkRogQ) completed in 10s with no output. `localFoodDB` was NOT expanded from 20 to 100+ entries. File timestamp and git tree unchanged.
- Fix: Re-dispatch Worker to expand `localFoodDB` in `src/services/nutritionApi.ts` to 100+ athlete-focused foods across all macro categories, then verify with `npx tsc --noEmit` and file inspection.
- Status: pending
