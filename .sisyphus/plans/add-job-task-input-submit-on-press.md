# Add Job Task Input Submit-on-Press Fix

## TL;DR
> **Summary**: Fix task-entry lag in Add Job by removing controlled keystroke-to-state updates for the task draft and only committing task text into `formData.tasks` during explicit add actions.
> **Deliverables**:
> - Stable task add behavior under fast typing + immediate plus press
> - No stale/partial task title submissions
> - Regression tests for task add timing and empty-input guard
> **Effort**: Quick
> **Parallel**: NO
> **Critical Path**: Task 1 -> Task 2 -> Task 3 -> Task 4

## Context
### Original Request
- Fix Add Job task list input where fast typing then pressing `+` loses trailing characters.
- Remove `onChange`-driven state behavior for task draft input.
- Commit task text only when `+` is pressed.

### Interview Summary
- Scope is this bug fix in Add Job creation flow.
- Desired result is functional correctness under rapid typing; no stale value on add.
- No backend or preview contract changes required.

### Metis Review (gaps addressed)
- Guardrail: avoid widening scope into Edit Job / Direct Offer flows.
- Guardrail: define explicit button behavior if live `newTaskTitle` state is removed.
- Guardrail: add deterministic race-focused test (fast type + immediate add).
- Guardrail: preserve trim/ignore-empty and clear-after-add semantics.

## Work Objectives
### Core Objective
Ensure Add Job task creation always adds the latest typed text when user taps `+`, without relying on controlled keystroke state.

### Deliverables
- Refactored task draft input handling in `packages/app/features/homeowner/jobs/add/screen.tsx`.
- Updated `addTask` path to consume latest text at add-time.
- Regression test coverage for stale-text race and empty-value rejection.

### Definition of Done (verifiable conditions with commands)
- `rtk npx biome check packages/app/features/homeowner/jobs/add/screen.tsx` exits 0.
- `rtk npx vitest run ../../packages/app/features/homeowner/jobs/add/__tests__/wizardValidation.test.ts` exits 0 from `apps/expo`.
- New task-input timing test exits 0 from `apps/expo` via `rtk npx vitest run ../../packages/app/features/homeowner/jobs/add/__tests__/taskInputSubmitOnPress.test.tsx`.

### Must Have
- No `setState` updates on each task-input keystroke for draft text.
- `+` action adds latest typed text (trimmed) exactly once.
- Empty/whitespace-only draft still does not create a task.
- Draft input clears after successful add.

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- No changes to preview payload or `useCreateJob` contract.
- No refactor of add-job wizard stages beyond task-entry path.
- No changes to edit/direct-offer task input in this scope.

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: tests-after using Expo Vitest + React Native Testing Library.
- QA policy: every task includes executable happy + failure scenario.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
Wave 1: Implementation + focused tests
Wave 2: Quality verification + scope audit

### Dependency Matrix (full, all tasks)
- Task 1 blocks Task 2.
- Task 2 blocks Task 3.
- Task 3 blocks Task 4.

### Agent Dispatch Summary (wave -> task count -> categories)
- Wave 1 -> 2 tasks -> `unspecified-high`
- Wave 2 -> 2 tasks -> `quick`, `deep`

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [ ] 1. Refactor Add Job task draft input from controlled state to submit-time buffer

  **What to do**: In `packages/app/features/homeowner/jobs/add/screen.tsx`, remove `newTaskTitle` React state usage from the task input control path (`value` + `onChangeText={setNewTaskTitle}`). Replace with an uncontrolled input strategy using refs so typed draft text is not committed to React state on every keystroke.
  **Must NOT do**: Do not modify `formData.tasks` shape or non-task fields.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: event-order-sensitive UI bug fix.
  - Skills: `[]` — no external library knowledge required.
  - Omitted: `frontend-ui-ux` — visual redesign is out of scope.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2 | Blocked By: none

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx:216` — current `newTaskTitle` state.
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx:260` — current `addTask` closure reading `newTaskTitle`.
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx:1061` — controlled input binding currently causing stale reads.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Task draft input no longer writes every keystroke to React component state.
  - [ ] Add flow still supports task creation with explicit user action.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Happy path refactor integrity
    Tool: Bash
    Steps: Run `rtk grep "onChangeText={setNewTaskTitle}|value={newTaskTitle}" "packages/app/features/homeowner/jobs/add/screen.tsx"`.
    Expected: No matches found.
    Evidence: .sisyphus/evidence/task-1-uncontrolled-task-input.txt

  Scenario: Failure/edge accidental regression check
    Tool: Bash
    Steps: Run `rtk grep "updateField\('tasks'" "packages/app/features/homeowner/jobs/add/screen.tsx"`.
    Expected: Task append path still exists and is reachable from add handler.
    Evidence: .sisyphus/evidence/task-1-uncontrolled-task-input-error.txt
  ```

  **Commit**: YES | Message: `fix(add-job): decouple task draft from per-keystroke state` | Files: `packages/app/features/homeowner/jobs/add/screen.tsx`

- [ ] 2. Rework add handler to commit latest text on `+` press and submit key

  **What to do**: Update `addTask` to read current draft text at action-time and append to `formData.tasks` only when non-empty after trim. Ensure both `+` button and keyboard submit use the same source-of-truth add function. Clear input after successful add.
  **Must NOT do**: Do not auto-add draft text on stage navigation or preview continue.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: precise event handling and data consistency.
  - Skills: `[]` — internal code-level change.
  - Omitted: `deep` — no architecture redesign needed.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 3 | Blocked By: 1

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx:260` — current add semantics (trim + append + clear).
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx:1071` — keyboard submit callback.
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx:1076` — plus-button submit callback.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Immediate `+` press after rapid typing adds full latest text.
  - [ ] Whitespace-only text still does not create a task.
  - [ ] Draft input clears only after successful add.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Happy path fast typing + immediate add
    Tool: Bash
    Steps: Run `rtk npx vitest run "../../packages/app/features/homeowner/jobs/add/__tests__/taskInputSubmitOnPress.test.tsx" -t "adds latest text on immediate plus press"` from `apps/expo`.
    Expected: Test passes and asserts full typed task string exists in rendered task list.
    Evidence: .sisyphus/evidence/task-2-submit-time-add.txt

  Scenario: Failure path empty input guard
    Tool: Bash
    Steps: Run `rtk npx vitest run "../../packages/app/features/homeowner/jobs/add/__tests__/taskInputSubmitOnPress.test.tsx" -t "does not add whitespace-only task"` from `apps/expo`.
    Expected: Test passes and task count remains unchanged.
    Evidence: .sisyphus/evidence/task-2-submit-time-add-error.txt
  ```

  **Commit**: YES | Message: `fix(add-job): commit task text only on explicit add action` | Files: `packages/app/features/homeowner/jobs/add/screen.tsx`

- [ ] 3. Add deterministic regression tests for task-entry race behavior

  **What to do**: Add `packages/app/features/homeowner/jobs/add/__tests__/taskInputSubmitOnPress.test.tsx` covering (a) rapid input + immediate plus press and (b) whitespace rejection. Use existing Expo test setup mocks and keep tests isolated to task-entry behavior.
  **Must NOT do**: Do not rely on manual QA-only validation.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: interaction timing regression test design.
  - Skills: `[]` — existing test harness already available.
  - Omitted: `playwright` — RN unit/integration tests are sufficient here.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 4 | Blocked By: 2

  **References** (executor has NO interview context — be exhaustive):
  - Test setup: `apps/expo/test/setup.ts` — router/native mocks.
  - Test config: `apps/expo/vitest.config.ts` — feature test discovery includes `packages/app/features/**/__tests__`.
  - Pattern: `packages/app/features/homeowner/jobs/add/__tests__/wizardValidation.test.ts` — current test style in this feature.

  **Acceptance Criteria** (agent-executable only):
  - [ ] New task-entry race test file exists and passes.
  - [ ] Test explicitly proves no stale trailing-character loss on immediate add.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Happy path regression suite
    Tool: Bash
    Steps: Run `rtk npx vitest run "../../packages/app/features/homeowner/jobs/add/__tests__/taskInputSubmitOnPress.test.tsx"` from `apps/expo`.
    Expected: All tests pass.
    Evidence: .sisyphus/evidence/task-3-race-tests.txt

  Scenario: Failure/edge regression proof
    Tool: Bash
    Steps: Temporarily mutate expected full string in test to a truncated value (local dry check), run suite, then restore.
    Expected: Suite fails on mutation, then passes after restore, proving test sensitivity.
    Evidence: .sisyphus/evidence/task-3-race-tests-error.txt
  ```

  **Commit**: YES | Message: `test(add-job): lock task input fast-submit race behavior` | Files: `packages/app/features/homeowner/jobs/add/__tests__/taskInputSubmitOnPress.test.tsx`

- [ ] 4. Run targeted quality gates and scope-fidelity audit

  **What to do**: Run targeted lint and test commands for changed files, then validate touched-file scope remains limited to add-job task-entry fix + tests.
  **Must NOT do**: Do not expand into unrelated form sections.

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: command execution and verification.
  - Skills: `[]` — straightforward verification step.
  - Omitted: `git-master` — no advanced git operations needed.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: none | Blocked By: 3

  **References** (executor has NO interview context — be exhaustive):
  - Target file: `packages/app/features/homeowner/jobs/add/screen.tsx`.
  - Test file: `packages/app/features/homeowner/jobs/add/__tests__/taskInputSubmitOnPress.test.tsx`.
  - Existing test baseline: `packages/app/features/homeowner/jobs/add/__tests__/wizardValidation.test.ts`.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `rtk npx biome check packages/app/features/homeowner/jobs/add/screen.tsx` exits 0.
  - [ ] New task-input test suite exits 0.
  - [ ] Existing wizard validation tests still exit 0.
  - [ ] File diff scope matches requested bug-fix boundaries.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```text
  Scenario: Happy path targeted verification
    Tool: Bash
    Steps: Run `rtk npx biome check "packages/app/features/homeowner/jobs/add/screen.tsx" && cd apps/expo && rtk npx vitest run "../../packages/app/features/homeowner/jobs/add/__tests__/taskInputSubmitOnPress.test.tsx" "../../packages/app/features/homeowner/jobs/add/__tests__/wizardValidation.test.ts"`.
    Expected: Commands exit 0.
    Evidence: .sisyphus/evidence/task-4-targeted-gates.txt

  Scenario: Failure path scope drift check
    Tool: Bash
    Steps: Run `rtk git diff --name-only` and compare against planned file list.
    Expected: No unrelated files are changed.
    Evidence: .sisyphus/evidence/task-4-targeted-gates-error.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: `n/a`

## Final Verification Wave (4 parallel agents, ALL must APPROVE)
- [ ] F1. Plan Compliance Audit — oracle
- [ ] F2. Code Quality Review — unspecified-high
- [ ] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [ ] F4. Scope Fidelity Check — deep

## Commit Strategy
- Commit 1: `fix(add-job): capture task text at submit time`
- Commit 2: `test(add-job): cover fast-type plus-submit task race`

## Success Criteria
- Rapid typing followed by immediate `+` always adds full latest text.
- No stale/partial task text appears in created tasks.
- Regression tests lock this behavior.
