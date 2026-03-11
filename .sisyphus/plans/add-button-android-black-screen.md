# Homeowner Add Button Android Black Screen Remediation

## TL;DR
> **Summary**: Eliminate the homeowner Add-button black screen on Android APK builds and reduce the local 2-3s navigation delay by hardening navigation handoff, add-screen entry behavior, and release-sensitive configuration.
> **Deliverables**:
> - Stable Add-route navigation for homeowner role in debug and APK builds
> - Permanent lightweight route breadcrumbs for Add-flow diagnostics
> - Regression tests covering navigation-guard timing and Add-screen fallback behavior
> - Verified Android APK evidence showing non-black rendered Add screen
> **Effort**: Medium
> **Parallel**: YES - 2 waves
> **Critical Path**: Task 1 -> Task 3 -> Task 4 -> Task 7

## Context
### Original Request
Logged-in homeowner pressing the bottom toolbar Add button takes ~2-3s in local build; in exported APK installed on Android, pressing Add leads to black screen.

### Interview Summary
- Confirmed APK behavior is indefinite black screen (not delayed eventual render).
- Confirmed diagnostics should include permanent lightweight breadcrumbs.
- Confirmed test strategy is tests-after implementation.
- Scope constrained to homeowner Add navigation/render path; no unrelated navigation system rewrite.

### Metis Review (gaps addressed)
- Added explicit guardrails against scope creep (no auth overhaul, no global telemetry SDK, no broad nav refactor).
- Added acceptance criteria for release-sensitive config and deterministic back fallback.
- Added edge-case coverage for empty back stack, double-tap presses, and mount-time query failures.
- Added release smoke requirement with binary pass/fail evidence.

## Work Objectives
### Core Objective
Make Add-button navigation to `/(homeowner)/jobs/add` render reliably (no black screen) in APK builds and reduce transition latency in local builds without regressing role guards or wizard behavior.

### Deliverables
- Hardened Add navigation path from `BottomNav` through homeowner layout and navigation guard.
- Add-screen entry behavior with deterministic fallback when back stack is unavailable.
- Lightweight permanent in-app breadcrumbs for Add-flow navigation lifecycle.
- Test updates for navigation guard behavior and Add-screen routing edge cases.
- Release-smoke evidence for Android APK flow.

### Definition of Done (verifiable conditions with commands)
- `rtk vitest run packages/app/hooks/__tests__/useNavigationGuard.test.ts` passes.
- `rtk vitest run packages/app/features/homeowner/jobs/add/__tests__/addScreenNavigation.test.ts` passes.
- `rtk vitest run packages/app/features/homeowner/jobs/add/__tests__/wizardValidation.test.ts` passes.
- `rtk npx biome check .` passes.
- Agent-executed APK verification evidence confirms Add press reaches rendered Add UI (not black), with median transition <= 1.5s on baseline device and complete breadcrumb chain.

### Must Have
- Fix applies only to homeowner Add path and directly related shared guard/config where causally required.
- Add-button flow remains role-safe and auth-guard compliant.
- Add-screen cancel/back paths never strand user on black/blank surface.
- Breadcrumb diagnostics are bounded, low-overhead, and non-PII.

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- Must NOT add Sentry/Crashlytics/Bugsnag as part of this fix.
- Must NOT refactor unrelated guest/handyman navigation stacks.
- Must NOT change business rules for Add job wizard validation fields.
- Must NOT introduce unbounded logging or sensitive data in breadcrumbs.

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: tests-after with Vitest.
- QA policy: Every task includes agent-executed happy and failure/edge scenarios.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: Baseline evidence + release-config hardening + nav guard hardening + add-screen fallback + breadcrumb utility.
Wave 2: Integrate breadcrumbs + focused regression tests + APK/manual verification capture.

### Dependency Matrix (full, all tasks)
| Task | Depends On | Blocks |
|------|------------|--------|
| 1 | - | 3, 4, 8 |
| 2 | - | 8 |
| 3 | 1 | 7, 8 |
| 4 | 1 | 7, 8 |
| 5 | - | 6, 7, 8 |
| 6 | 5 | 7, 8 |
| 7 | 3, 4, 6 | 8 |
| 8 | 2, 3, 4, 6, 7 | Final verification wave |

### Agent Dispatch Summary (wave -> task count -> categories)
- Wave 1 -> 5 tasks -> `deep`, `quick`, `unspecified-high`
- Wave 2 -> 3 tasks -> `quick`, `deep`, `unspecified-high`
- Final verification -> 4 tasks -> `oracle`, `unspecified-high`, `unspecified-high`, `deep`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [ ] 1. Capture Repro Baseline and Failure Evidence

  **What to do**: Reproduce homeowner Add-button behavior in local Expo run and Android APK build; capture timing, black-screen state, and raw logs before code changes. Record exact reproduction matrix (device, Android version, build profile, auth state, phone-verified state).
  **Must NOT do**: Do not modify application code or config in this task; do not broaden into unrelated flows.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: Requires careful isolation of release-only behavior and reproducibility constraints.
  - Skills: [] - no special skill required.
  - Omitted: [`playwright`] - mobile-native flow is not browser-based.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 3, 4, 8 | Blocked By: []

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `packages/ui/src/BottomNav.tsx` - Add button press dispatch path.
  - Pattern: `apps/expo/app/(homeowner)/_layout.tsx` - `handleAddJobPress` guarded push and nav visibility.
  - Pattern: `packages/app/hooks/useNavigationGuard.ts` - current lock/timing behavior.
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx` - mount-time side effects and redirect/back paths.
  - External: `https://docs.expo.dev/build-reference/apk/` - APK profile validation guidance.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Baseline report saved at `.sisyphus/evidence/task-1-repro-baseline.md` with both local and APK observations.
  - [ ] Log capture saved at `.sisyphus/evidence/task-1-logcat.txt` (or equivalent shell output file).
  - [ ] Baseline explicitly confirms whether black screen is indefinite and whether app process remains alive.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```text
  Scenario: Happy path baseline capture (local)
    Tool: Bash
    Steps: Run `rtk yarn native`; log in as homeowner with verified phone profile; tap bottom Add once; measure time-to-first-rendered Add UI.
    Expected: Measured timing and rendered state are documented in `.sisyphus/evidence/task-1-repro-baseline.md`.
    Evidence: .sisyphus/evidence/task-1-repro-baseline.md

  Scenario: Failure path baseline capture (APK)
    Tool: Bash
    Steps: Install APK build profile on Android test device; run `rtk adb logcat` while tapping Add; observe screen state for >=15s.
    Expected: If black screen reproduces, logs and timestamped observation are captured in evidence files.
    Evidence: .sisyphus/evidence/task-1-logcat.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: [`.sisyphus/evidence/task-1-repro-baseline.md`, `.sisyphus/evidence/task-1-logcat.txt`]

- [ ] 2. Correct Babel Plugin Order for Release Stability

  **What to do**: Update `apps/expo/babel.config.js` so `'react-native-reanimated/plugin'` is the final plugin entry. Keep module-resolver aliases and Tamagui plugin config unchanged.
  **Must NOT do**: Do not alter plugin options, aliases, or preset selection beyond ordering required for Reanimated correctness.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: Single-file deterministic config correction with high impact.
  - Skills: [] - no special skill required.
  - Omitted: [`frontend-ui-ux`] - no UI design work.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 8 | Blocked By: []

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `apps/expo/babel.config.js` - current plugin order (Reanimated currently not last).
  - Pattern: `apps/expo/app/_layout.tsx` - root stack using transparent content style; release paint issues become visible here.
  - Pattern: `packages/app/navigation/config.tsx` - transparent `contentStyle` increases sensitivity to route paint failures.
  - External: `https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation` - plugin-last requirement.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Static check confirms Reanimated plugin is last in `apps/expo/babel.config.js`.
  - [ ] `rtk npx biome check apps/expo/babel.config.js` passes.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```text
  Scenario: Happy path plugin-order verification
    Tool: Bash
    Steps: Inspect Babel config and run `rtk npx biome check apps/expo/babel.config.js`.
    Expected: Reanimated plugin is final entry and file passes Biome checks.
    Evidence: .sisyphus/evidence/task-2-babel-order.txt

  Scenario: Failure/edge guard against accidental config drift
    Tool: Bash
    Steps: Run a scripted assertion that fails if any plugin follows Reanimated in Babel config.
    Expected: Assertion exits non-zero when order is invalid; exits zero after fix.
    Evidence: .sisyphus/evidence/task-2-babel-order-assert.txt
  ```

  **Commit**: YES | Message: `fix(expo-config): place reanimated babel plugin last` | Files: [`apps/expo/babel.config.js`]

- [ ] 3. Harden Navigation Guard Timing and Push Safety

  **What to do**: Refactor `packages/app/hooks/useNavigationGuard.ts` to remove unnecessary deferred router execution (`setTimeout(..., 50)`) for `push`/`replace`/`navigate`, add path dedupe to `push` where route equals current pathname, and keep lock lifecycle deterministic (set once, clear once via configured delay).
  **Must NOT do**: Do not change exported hook signature; do not alter `back`/`dismiss` behavior beyond lock consistency; do not touch unrelated hooks.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: Shared navigation primitive with race/lock risk.
  - Skills: [] - no special skill required.
  - Omitted: [`frontend-ui-ux`] - logic-level fix only.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 7, 8 | Blocked By: [1]

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `packages/app/hooks/useNavigationGuard.ts` - lock refs/state, delay handling, and current deferred router calls.
  - Pattern: `apps/expo/app/(homeowner)/_layout.tsx` - `useNavigationGuard({ delay: 300 })` call site for Add flow.
  - Pattern: `packages/ui/src/BottomNav.tsx` - Add trigger can be pressed while navigation in progress.
  - Test: `packages/app/hooks/__tests__/hooks-imports.test.ts` - existing minimal hook test location.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Guarded `push` no longer performs fixed 50ms defer before router invocation.
  - [ ] Guarded `push` returns early when target route matches current pathname.
  - [ ] Lock state still prevents rapid duplicate navigation during active transition window.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```text
  Scenario: Happy path guarded push executes immediately
    Tool: Bash
    Steps: Run targeted hook tests validating `push()` invokes router synchronously and lock remains active through delay window.
    Expected: Test assertions pass for immediate invocation and delayed unlock semantics.
    Evidence: .sisyphus/evidence/task-3-guard-happy.txt

  Scenario: Failure/edge rapid double-press protection
    Tool: Bash
    Steps: Run test case that calls guarded `push` twice in same tick with identical route.
    Expected: Exactly one router invocation occurs; second call is ignored while lock is active.
    Evidence: .sisyphus/evidence/task-3-guard-double-tap.txt
  ```

  **Commit**: YES | Message: `fix(navigation): remove deferred push and dedupe guarded routes` | Files: [`packages/app/hooks/useNavigationGuard.ts`]

- [ ] 4. Stabilize Add Screen Entry and Back Fallback

  **What to do**: In `packages/app/features/homeowner/jobs/add/screen.tsx`, replace unconditional `router.back()` paths with `navigation.canGoBack()` checks and fallback `router.replace('/(homeowner)/')`; add explicit initial loading/error-safe render state for critical Add-screen bootstrap data (profile/categories/cities) to avoid blank/black transitional surfaces.
  **Must NOT do**: Do not change wizard validation business logic (`wizardValidation.ts`); do not modify Add preview route contract.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: Large screen with intertwined state, side effects, and navigation.
  - Skills: [] - no special skill required.
  - Omitted: [`playwright`] - native route behavior is not browser automation.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 7, 8 | Blocked By: [1]

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx` - phone verification alert cancel path and header back logic.
  - Pattern: `packages/app/features/homeowner/profile/view-screen.tsx` - established `navigation.canGoBack()` with replace fallback pattern.
  - Pattern: `apps/expo/app/(homeowner)/jobs/add/index.tsx` - Add route entry wrapper.
  - Pattern: `apps/expo/app/(homeowner)/jobs/add/_layout.tsx` - Add nested stack options.
  - Test: `packages/app/features/homeowner/jobs/add/__tests__/wizardValidation.test.ts` - existing Add feature test location.

  **Acceptance Criteria** (agent-executable only):
  - [ ] No `router.back()` call remains in Add-screen flows without a `navigation.canGoBack()` guard and fallback route.
  - [ ] Add screen renders deterministic non-black loading or content state while critical bootstrap queries resolve.
  - [ ] Unverified-phone cancel path never leaves user on blank/black screen when back stack is empty.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```text
  Scenario: Happy path verified homeowner enters Add screen
    Tool: Bash
    Steps: Run component/navigation test with verified profile mock and successful categories/cities responses.
    Expected: Add screen content renders and no fallback redirect is triggered.
    Evidence: .sisyphus/evidence/task-4-add-entry-happy.txt

  Scenario: Failure/edge unverified cancel with empty back stack
    Tool: Bash
    Steps: Run test with unverified profile and mocked `navigation.canGoBack() = false`; trigger Cancel in verification alert path.
    Expected: Route fallback uses `router.replace('/(homeowner)/')` and avoids blank/black state.
    Evidence: .sisyphus/evidence/task-4-add-entry-fallback.txt
  ```

  **Commit**: YES | Message: `fix(add-screen): guard back navigation and add deterministic entry state` | Files: [`packages/app/features/homeowner/jobs/add/screen.tsx`]

- [ ] 5. Create Bounded Add-Flow Breadcrumb Utility

  **What to do**: Add a lightweight breadcrumb module under `packages/app/utils/` that records Add-flow navigation events in a bounded in-memory ring buffer (event name, route, timestamp, optional non-PII metadata). Export `record`, `read`, and `clear` helpers for test/diagnostic usage.
  **Must NOT do**: Do not store PII, request payloads, or auth tokens; do not add external telemetry dependency.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: New isolated utility with deterministic behavior.
  - Skills: [] - no special skill required.
  - Omitted: [`frontend-ui-ux`] - utility logic only.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 6, 7, 8 | Blocked By: []

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `packages/app/utils/__tests__/notification-toast-storage.test.ts` - utility + test colocation pattern.
  - Pattern: `packages/app/utils/__tests__/asyncstorage-advanced.test.ts` - utility test style and expectations.
  - Pattern: `packages/app/hooks/useNavigationGuard.ts` - existing navigation timing logs to align event naming.
  - Pattern: `packages/api/src/errors.ts` - existing error formatting approach (non-PII discipline).

  **Acceptance Criteria** (agent-executable only):
  - [ ] Utility exposes typed `record`, `read`, and `clear` APIs.
  - [ ] Buffer is bounded (max size explicitly enforced) and evicts oldest entries.
  - [ ] Unit tests verify ordering, eviction, and clear behavior.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```text
  Scenario: Happy path breadcrumb recording and retrieval
    Tool: Bash
    Steps: Run unit test adding multiple events and reading them back in order.
    Expected: Returned breadcrumbs preserve chronological order with expected fields.
    Evidence: .sisyphus/evidence/task-5-breadcrumbs-happy.txt

  Scenario: Failure/edge bounded buffer eviction
    Tool: Bash
    Steps: Run unit test inserting max+N events and asserting oldest events are evicted.
    Expected: Buffer length never exceeds max; newest entries retained.
    Evidence: .sisyphus/evidence/task-5-breadcrumbs-eviction.txt
  ```

  **Commit**: YES | Message: `feat(diagnostics): add bounded navigation breadcrumb utility` | Files: [`packages/app/utils/navigationBreadcrumbs.ts`, `packages/app/utils/__tests__/navigationBreadcrumbs.test.ts`]

- [ ] 6. Instrument Homeowner Add Route Lifecycle with Breadcrumbs

  **What to do**: Wire breadcrumb events into Add-flow touchpoints: Add button press (`BottomNav`), homeowner layout `handleAddJobPress`, navigation-guard push start/success/error, Add-screen mount, phone-verification branch actions, and fallback redirect path. Use stable event names (`add_press`, `add_push_start`, `add_push_success`, `add_mount`, `add_verify_cancel_fallback`, etc.).
  **Must NOT do**: Do not emit breadcrumbs on every render; do not include user-entered form content; do not instrument unrelated routes.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: Cross-cutting updates across shared nav, UI, and feature screen.
  - Skills: [] - no special skill required.
  - Omitted: [`playwright`] - instrumentation is code-level, not browser UI automation.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 7, 8 | Blocked By: [5]

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `packages/ui/src/BottomNav.tsx` - Add press dispatch point.
  - Pattern: `apps/expo/app/(homeowner)/_layout.tsx` - Add push call site and active route handling.
  - Pattern: `packages/app/hooks/useNavigationGuard.ts` - push/navigate execution path.
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx` - mount and verification-flow branching.
  - Pattern: `packages/app/utils/navigationBreadcrumbs.ts` - utility contract from Task 5.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Breadcrumb trail includes complete Add-flow chain from press to mount (or explicit failure event).
  - [ ] Error/fallback branches emit distinct event names for diagnosis.
  - [ ] No breadcrumb payload includes PII or job form field values.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```text
  Scenario: Happy path full breadcrumb chain
    Tool: Bash
    Steps: Execute Add-flow test/mock run and read breadcrumb buffer after successful mount.
    Expected: Sequence includes `add_press -> add_push_start -> add_push_success -> add_mount`.
    Evidence: .sisyphus/evidence/task-6-breadcrumb-chain.txt

  Scenario: Failure/edge branch breadcrumb visibility
    Tool: Bash
    Steps: Trigger verification-cancel fallback and read breadcrumb buffer.
    Expected: Sequence includes explicit fallback event (`add_verify_cancel_fallback`) and terminal route marker.
    Evidence: .sisyphus/evidence/task-6-breadcrumb-fallback.txt
  ```

  **Commit**: YES | Message: `feat(add-flow): instrument homeowner add navigation breadcrumbs` | Files: [`packages/ui/src/BottomNav.tsx`, `apps/expo/app/(homeowner)/_layout.tsx`, `packages/app/hooks/useNavigationGuard.ts`, `packages/app/features/homeowner/jobs/add/screen.tsx`]

- [ ] 7. Add Regression Tests for Navigation Guard and Add-Screen Routing Edges

  **What to do**: Add focused Vitest suites for (a) `useNavigationGuard` behavior and (b) Add-screen navigation edge handling. Cover immediate push invocation, duplicate press suppression, same-route dedupe, and unverified cancel fallback when `navigation.canGoBack()` is false.
  **Must NOT do**: Do not create snapshot-heavy or brittle UI-layout assertions; keep tests behavioral and deterministic.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: New behavioral tests require robust mocking of router/navigation/query states.
  - Skills: [] - no special skill required.
  - Omitted: [`frontend-ui-ux`] - tests target logic and navigation behavior.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 8 | Blocked By: [3, 4, 6]

  **References** (executor has NO interview context - be exhaustive):
  - Test: `packages/app/features/homeowner/jobs/add/__tests__/wizardValidation.test.ts` - Vitest style baseline for Add feature.
  - Test: `packages/app/hooks/__tests__/hooks-imports.test.ts` - hook test location.
  - Pattern: `apps/expo/test/setup.ts` - Expo-router and RN test mocks.
  - Pattern: `packages/app/features/homeowner/profile/view-screen.tsx` - expected `canGoBack()` fallback behavior.
  - Pattern: `packages/app/hooks/useNavigationGuard.ts` and `packages/app/features/homeowner/jobs/add/screen.tsx` - target logic.

  **Acceptance Criteria** (agent-executable only):
  - [ ] New `useNavigationGuard` test file validates immediate push, dedupe, and lock behavior.
  - [ ] New Add-screen navigation test file validates unverified cancel fallback and verified-user happy path.
  - [ ] `rtk vitest run` on both new suites passes consistently.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```text
  Scenario: Happy path tests validate fixed navigation behavior
    Tool: Bash
    Steps: Run `rtk vitest run packages/app/hooks/__tests__/useNavigationGuard.test.ts packages/app/features/homeowner/jobs/add/__tests__/addScreenNavigation.test.ts`.
    Expected: All tests pass; output confirms immediate push and successful Add-screen mount behavior.
    Evidence: .sisyphus/evidence/task-7-tests-happy.txt

  Scenario: Failure/edge tests validate fallback and duplicate suppression
    Tool: Bash
    Steps: Execute targeted cases for duplicate add presses and empty-back-stack cancel flow.
    Expected: Duplicate pushes are suppressed; cancel path routes to `/(homeowner)/` fallback.
    Evidence: .sisyphus/evidence/task-7-tests-edge.txt
  ```

  **Commit**: YES | Message: `test(add-flow): cover guarded navigation and fallback routing` | Files: [`packages/app/hooks/__tests__/useNavigationGuard.test.ts`, `packages/app/features/homeowner/jobs/add/__tests__/addScreenNavigation.test.ts`]

- [ ] 8. Run Verification Matrix and Capture Post-Fix APK Evidence

  **What to do**: Execute lint + targeted tests + Add-flow smoke matrix (local and APK) and compare against Task-1 baseline. Capture final evidence proving black screen is resolved and transition is materially improved.
  **Must NOT do**: Do not claim resolution without evidence artifacts; do not skip failing checks.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: Multi-signal verification requiring disciplined evidence capture.
  - Skills: [] - no special skill required.
  - Omitted: [`playwright`] - this validation is Expo Android native, not web E2E.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: Final verification wave | Blocked By: [2, 3, 4, 6, 7]

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `.sisyphus/evidence/task-1-repro-baseline.md` - baseline comparison source.
  - Pattern: `apps/expo/eas.json` - apk profile target.
  - Pattern: `apps/expo/android/app/build.gradle` - release behavior context.
  - Pattern: `packages/app/navigation/config.tsx` - transparent content style risk surface to re-check.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `rtk npx biome check .` passes.
  - [ ] Targeted test commands from Definition of Done pass.
  - [ ] Post-fix evidence saved to `.sisyphus/evidence/task-8-postfix-apk.md` and includes breadcrumb sequence + screenshot/log excerpt.
  - [ ] Evidence demonstrates Add press reaches non-black rendered screen in APK.
  - [ ] Evidence includes measured Add transition median <= 1.5s on the same baseline device/profile used in Task 1.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```text
  Scenario: Happy path post-fix APK flow
    Tool: Bash
    Steps: Build/install APK profile, sign in as homeowner, tap Add once, capture breadcrumb dump + screenshot/log excerpt.
    Expected: Add screen renders; breadcrumb chain reaches mount without terminal error event.
    Evidence: .sisyphus/evidence/task-8-postfix-apk.md

  Scenario: Failure/edge rapid Add taps after fix
    Tool: Bash
    Steps: Rapidly tap Add 3x and inspect logs/breadcrumbs.
    Expected: Single guarded navigation sequence is recorded; app does not black-screen or hang.
    Evidence: .sisyphus/evidence/task-8-postfix-rapid-tap.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: [`.sisyphus/evidence/task-8-postfix-apk.md`, `.sisyphus/evidence/task-8-postfix-rapid-tap.txt`]

## Final Verification Wave (4 parallel agents, ALL must APPROVE)
- [ ] F1. Plan Compliance Audit - oracle
- [ ] F2. Code Quality Review - unspecified-high
- [ ] F3. Real Manual QA - unspecified-high (+ playwright if UI)
- [ ] F4. Scope Fidelity Check - deep

## Commit Strategy
- Commit in small atomic units per task group:
  - config/navigation internals
  - add-screen behavior + breadcrumbs
  - tests + verification artifacts
- Conventional format: `fix(expo-navigation): ...` / `test(add-flow): ...`.
- Never mix unrelated refactors into this bugfix sequence.

## Success Criteria
- Homeowner Add press in local build transitions to rendered Add screen with median <= 1.5s on baseline device.
- Homeowner Add press in APK no longer yields indefinite black screen.
- Edge cases (double-tap add, empty back stack, profile/query failure) produce graceful, deterministic UX.
- Evidence artifacts exist for all tasks and final verification approvals.
