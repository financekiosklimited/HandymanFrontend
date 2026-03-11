# Draft: Homeowner Add Button Android Black Screen

## Requirements (confirmed)
- local-build behavior: pressing bottom toolbar add button as logged-in homeowner takes ~2-3s before screen appears
- apk-installed Android behavior: pressing the same add button shows black screen

## Technical Decisions
- scope focus: investigate and fix homeowner add-button navigation/render path in Expo Android and release mode
- investigation-first approach: validate route, guard, and mount-time side effects before selecting minimal vs robust fix
- apk behavior classification: black screen remains indefinitely after add press
- diagnostics policy: include permanent lightweight route breadcrumbs for future release debugging
- test strategy: tests-after implementation (plus mandatory agent-executed QA scenarios)

## Research Findings
- `packages/ui/src/BottomNav.tsx`: add action route maps to `/(homeowner)/jobs/add`
- `apps/expo/app/(homeowner)/_layout.tsx`: `handleAddJobPress` uses guarded `push('/(homeowner)/jobs/add')`
- `packages/app/hooks/useNavigationGuard.ts`: adds lock/deferred navigation behavior that can affect transition timing
- `apps/expo/app/(homeowner)/jobs/add/index.tsx` -> `packages/app/features/homeowner/jobs/add/screen.tsx`: add screen mount includes phone-verification side effects and conditional redirects/back
- release pipeline exists (`apps/expo/eas.json`, `android/app/build.gradle`) but no crash telemetry integration found

## Open Questions
- none currently blocking; timing target and exact telemetry sink will be defaulted in plan unless contradicted by existing patterns

## Scope Boundaries
- INCLUDE: homeowner add-button press path, route transition, add screen mount lifecycle, Android release parity checks
- EXCLUDE: unrelated homeowner flows and broad navigation refactors beyond this route unless directly required to remove black screen
