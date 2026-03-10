# Add Job Two-Stage Wizard With Final Preview

## TL;DR
> **Summary**: Refactor the current single-screen Add Job form into a two-stage in-screen wizard while preserving the existing preview-and-submit architecture and API payload contract.
> **Deliverables**:
> - Stage 1 (administrative fields): job title, city, address, postal code
> - Stage 2 (job details): budget, category, description, task list, attachments
> - Existing preview remains final review + publish surface
> - Targeted automated tests for stage gating, data persistence, and submit payload parity
> **Effort**: Medium
> **Parallel**: YES - 2 waves
> **Critical Path**: Task 1 -> Task 2 -> Task 4 -> Task 7 -> Task 9

## Context
### Original Request
- Split Add Job into two stages because current page has too many inputs.
- Stage 1 fields: job title, city, address, postal code.
- Stage 2 fields: budget, category, description, task list, attachments.
- Keep final preview page where user can verify all input in one page, then submit.
- Deliver a scrutinized work plan and consult both Metis and Momus.

### Interview Summary
- Objective is a behavior-preserving flow refactor, not a new backend feature.
- Existing final preview UX remains in scope and should stay as the submit owner.
- Defaulted approach: two stages implemented inside existing `AddJobScreen` route (wizard-state in component), then existing preview route.
- Test strategy default: tests-after with focused flow tests and command verification.

### Metis Review (gaps addressed)
- Preserve submit payload contract in `useCreateJob` (`FormData` keys, task indexing, attachment metadata).
- Avoid scope creep into edit-flow refactor, save-draft backend work, CI redesign, or preview redesign.
- Add explicit deep-link/dead-state handling for preview and stage gating.
- Add executable acceptance criteria for progression gates, state persistence, payload parity, and publish failure recovery.

## Work Objectives
### Core Objective
Implement a two-stage Add Job wizard in the existing add route so users complete administrative details first, then job details, then the existing preview screen for final validation and submission.

### Deliverables
- Updated add screen with stage state machine and stage-specific validation.
- Stage 1 UI contains only: title, city, address, postal code.
- Stage 2 UI contains only: budget, category, description, tasks, attachments.
- Existing preview screen remains final review + publish and receives complete payload.
- Feature tests covering stage progression rules, back navigation persistence, and preview submit payload readiness.

### Definition of Done (verifiable conditions with commands)
- `rtk yarn lint` passes with zero errors.
- `rtk yarn type-check` passes with zero type errors.
- `rtk yarn test:expo` passes including new Add Job staged-flow tests.
- `rtk yarn build` succeeds.
- Agent-executed verification evidence captured under `.sisyphus/evidence/` for staged flow and preview submit behavior.

### Must Have
- Stage gating: user cannot move from Stage 1 to Stage 2 until required Stage 1 fields are valid.
- Stage gating: user cannot move from Stage 2 to Preview until required Stage 2 fields are valid.
- Existing attachment constraints preserved (`ATTACHMENT_LIMITS.job.maxCount = 10`, image/video only, RAW rejection).
- Preview data completeness preserved for all fields from both stages.
- Existing success path preserved (`router.replace('/(homeowner)/jobs', { toast: 'job-created' })`).

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- No backend API contract changes in `packages/api/src/hooks/homeowner/useCreateJob.ts`.
- No changes to edit-job flow or direct-offer flow behavior.
- No conversion to multi-route wizard unless explicitly required by implementation blocker.
- No CI workflow expansion beyond current scope.
- No preview redesign beyond wiring and flow correctness fixes.

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: tests-after using Vitest + React Native Testing Library in Expo config.
- QA policy: Every task includes executable happy and failure/edge scenarios.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: validation/model groundwork + stage framework + preview contract safety + test harness updates
Wave 2: stage UX completion + regression tests + command verification + docs for flow guardrails

### Dependency Matrix (full, all tasks)
- Task 1 blocks Tasks 2, 3, 4, 7.
- Task 2 blocks Tasks 5 and 6.
- Task 3 can run in parallel with Task 2 after Task 1.
- Task 4 blocks Task 6 and Task 7.
- Task 5 blocks Task 8.
- Task 6 blocks Task 8.
- Task 7 blocks Task 8.
- Task 8 blocks Task 9.
- Task 9 blocks Task 10.

### Agent Dispatch Summary (wave -> task count -> categories)
- Wave 1 -> 5 tasks -> `unspecified-high` (flow logic), `visual-engineering` (UI sectioning), `quick` (test-config adjustment)
- Wave 2 -> 5 tasks -> `unspecified-high` (tests and verification), `writing` (implementation guardrail notes)

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [ ] 1. Introduce Add Job wizard state model and stage-specific validation map

  **What to do**: In `packages/app/features/homeowner/jobs/add/screen.tsx`, define explicit `WizardStage` (`'administrative' | 'details'`) and split validation into `validateAdministrativeStage()` and `validateDetailsStage()` while preserving existing field rules. Keep one canonical `formData` object and ensure stage validation only checks stage-owned required fields.
  **Must NOT do**: Do not change API request types or add new backend fields; do not remove existing validation messages.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: State-machine and validation refactor with regression risk.
  - Skills: `[]` - No special skill needed beyond careful code reasoning.
  - Omitted: `playwright` - UI browser automation not required for this internal logic step.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2, 3, 4, 7 | Blocked By: none

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx:60` - canonical `FormData` shape to preserve.
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx:510` - current all-in-one validation flow to split.
  - Pattern: `packages/app/features/homeowner/direct-offers/create-screen.tsx:479` - similar gated validation style.
  - API/Type: `packages/api/src/hooks/homeowner/useCreateJob.ts:11` - submit request contract must remain unchanged.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Stage 1 validation blocks progression when title/city/address invalid and does not require stage-2 fields.
  - [ ] Stage 2 validation blocks preview navigation when budget/category/description invalid.
  - [ ] Existing error keying via `getFieldErrors`/`getNestedErrors` still resolves field messages correctly.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```text
  Scenario: Happy path stage validators
    Tool: Bash
    Steps: Run `rtk yarn test:expo -- --runInBand addJobWizard.validation.test.tsx -t "valid stage progression"` after adding validator tests.
    Expected: Vitest exits 0 and reports stage-1 + stage-2 validation tests passing.
    Evidence: .sisyphus/evidence/task-1-wizard-validation.txt

  Scenario: Failure path stage-1 gating
    Tool: Bash
    Steps: Run `rtk yarn test:expo -- --runInBand addJobWizard.validation.test.tsx -t "blocks stage 1 when city missing"`.
    Expected: Test asserts progression is blocked and city field error is visible.
    Evidence: .sisyphus/evidence/task-1-wizard-validation-error.txt
  ```

  **Commit**: YES | Message: `refactor(add-job): split validation by wizard stage` | Files: `packages/app/features/homeowner/jobs/add/screen.tsx`, `packages/app/features/homeowner/jobs/add/__tests__/addJobWizard.validation.test.tsx`

- [ ] 2. Implement Stage 1 administrative UI section and CTA transition

  **What to do**: Refactor `AddJobScreen` render path so Stage 1 displays only title, city selector, address, postal code, plus a `Continue to Job Details` CTA. Reuse existing field components and city-sheet behavior; keep layout/animations aligned with current visual patterns.
  **Must NOT do**: Do not render budget/category/description/tasks/attachments in Stage 1; do not alter city picker data source.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: High-confidence UI restructuring while preserving existing design language.
  - Skills: [`frontend-ui-ux`] - Keep split flow intentional and not cluttered.
  - Omitted: `dev-browser` - No remote browser automation needed for component-level UI refactor.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 5, 6 | Blocked By: 1

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx:726` - title field section.
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx:825` - city selector trigger + selected-city rendering.
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx:862` - address field section.
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx:886` - postal code optional field.
  - Pattern: `packages/app/hooks/useFormEntrance.ts` - preserve staged reveal pattern behavior.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Stage 1 shows only administrative fields and the stage-advance CTA.
  - [ ] City sheet search/select flow still works and writes `city_id`.
  - [ ] Stage 1 CTA triggers stage-1 validation before transition.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```text
  Scenario: Happy path Stage 1 UI
    Tool: Bash
    Steps: Run `rtk yarn test:expo -- --runInBand addJobWizard.stage1.test.tsx -t "renders only administrative fields"`.
    Expected: Tests confirm budget/category/description controls are absent on stage 1 and CTA is present.
    Evidence: .sisyphus/evidence/task-2-stage1-ui.txt

  Scenario: Failure path Stage 1 empty title
    Tool: Bash
    Steps: Run `rtk yarn test:expo -- --runInBand addJobWizard.stage1.test.tsx -t "shows title error before stage advance"`.
    Expected: Stage remains administrative and title error text appears.
    Evidence: .sisyphus/evidence/task-2-stage1-ui-error.txt
  ```

  **Commit**: YES | Message: `refactor(add-job): add administrative first stage UI` | Files: `packages/app/features/homeowner/jobs/add/screen.tsx`, `packages/app/features/homeowner/jobs/add/__tests__/addJobWizard.stage1.test.tsx`

- [ ] 3. Prepare Expo Vitest include pattern for feature-level add-job tests

  **What to do**: Update `apps/expo/vitest.config.ts` include paths so tests under `packages/app/features/homeowner/jobs/add/__tests__` are discovered. Keep existing include entries intact.
  **Must NOT do**: Do not remove existing include globs or alter setup file path.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: Small, isolated config change.
  - Skills: `[]` - Straightforward config update.
  - Omitted: `frontend-ui-ux` - Not a UI task.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 8 | Blocked By: 1

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `apps/expo/vitest.config.ts:24` - current include list and missing `features/**` coverage.
  - Test: `packages/app/hooks/__tests__/hooks-imports.test.ts` - existing naming/discovery style.
  - Test: `apps/expo/test/setup.ts:20` - available router/image-picker mocks used by feature tests.

  **Acceptance Criteria** (agent-executable only):
  - [ ] New add-job feature tests are picked up by Expo Vitest without manual file path execution.
  - [ ] Existing test suites remain discoverable.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```text
  Scenario: Happy path config discovery
    Tool: Bash
    Steps: Run `cd apps/expo && rtk yarn test -- --listTests` and verify new add-job test file appears.
    Expected: Output includes `packages/app/features/homeowner/jobs/add/__tests__/...` entries.
    Evidence: .sisyphus/evidence/task-3-vitest-discovery.txt

  Scenario: Failure/edge discovery regression check
    Tool: Bash
    Steps: Run `cd apps/expo && rtk yarn test -- --listTests` and verify existing hook/util test paths still appear.
    Expected: Existing `packages/app/hooks/__tests__` and `packages/app/utils/__tests__` files remain listed.
    Evidence: .sisyphus/evidence/task-3-vitest-discovery-regression.txt
  ```

  **Commit**: YES | Message: `test(expo): include add-job feature tests in vitest config` | Files: `apps/expo/vitest.config.ts`

- [ ] 4. Implement Stage 2 details UI and keep existing interaction behaviors

  **What to do**: Render Stage 2 with budget, category selector sheet, description, task list add/remove, and attachment picker/grid; retain existing helper handlers and limits. Add explicit `Back to Administrative Details` and `Continue to Preview` controls.
  **Must NOT do**: Do not change attachment limit/type rules or remove task list animation behavior.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: Complex UI block migration with media/task behavior coupling.
  - Skills: [`frontend-ui-ux`] - Maintain coherent stage-specific layout and clear progression.
  - Omitted: `playwright` - Unit/integration tests are the primary QA path.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 6, 7 | Blocked By: 1

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx:748` - budget input behavior and numeric keyboard.
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx:790` - category sheet trigger.
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx:902` - description input section.
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx:939` - task list add/remove with `AnimatedTaskItem`.
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx:1063` - attachment grid/add/remove flow.
  - API/Type: `packages/api/src/types/attachment.ts:239` - maxCount/type constraints to preserve.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Stage 2 contains only required second-stage fields and controls.
  - [ ] Task add/remove behavior is unchanged from current implementation.
  - [ ] Attachment add/remove and max-count enforcement remain intact.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```text
  Scenario: Happy path Stage 2 interactions
    Tool: Bash
    Steps: Run `rtk yarn test:expo -- --runInBand addJobWizard.stage2.test.tsx -t "supports task and attachment interactions"`.
    Expected: Tests pass for adding/removing tasks and attachment-limit handling.
    Evidence: .sisyphus/evidence/task-4-stage2-interactions.txt

  Scenario: Failure path budget validation
    Tool: Bash
    Steps: Run `rtk yarn test:expo -- --runInBand addJobWizard.stage2.test.tsx -t "blocks preview when budget invalid"`.
    Expected: Stage remains details and budget error message is shown.
    Evidence: .sisyphus/evidence/task-4-stage2-interactions-error.txt
  ```

  **Commit**: YES | Message: `refactor(add-job): move details fields into second stage` | Files: `packages/app/features/homeowner/jobs/add/screen.tsx`, `packages/app/features/homeowner/jobs/add/__tests__/addJobWizard.stage2.test.tsx`

- [ ] 5. Ensure deterministic stage navigation and back behavior with preserved in-memory draft state

  **What to do**: Implement deterministic transitions: Stage 1 -> Stage 2 -> Preview. Ensure Stage 2 back action returns to Stage 1 without data loss. Ensure preview `Edit`/back returns to Stage 2 with existing state intact.
  **Must NOT do**: Do not add new add-job routes or external state store unless required by blocker.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: Navigation-state correctness across stack transitions.
  - Skills: `[]` - Repo-native expo-router patterns are sufficient.
  - Omitted: `librarian` - No external docs dependency required.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 8 | Blocked By: 2

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx:549` - current preview navigation push.
  - Pattern: `packages/app/features/homeowner/jobs/add/preview-screen.tsx:985` - current `Edit` button back behavior.
  - Pattern: `apps/expo/app/(homeowner)/jobs/add/_layout.tsx:5` - add-flow stack host.
  - Pattern: `apps/expo/app/(homeowner)/_layout.tsx:74` - `/jobs/add*` nav visibility logic already compatible.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Stage transitions are linear and gated.
  - [ ] Back from Stage 2 to Stage 1 preserves entered administrative values.
  - [ ] Back from Preview returns to Stage 2 with full draft intact.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```text
  Scenario: Happy path navigation persistence
    Tool: Bash
    Steps: Run `rtk yarn test:expo -- --runInBand addJobWizard.navigation.test.tsx -t "preserves values across stage and preview back navigation"`.
    Expected: Test confirms values persist after Stage1->Stage2->Preview->Edit/back.
    Evidence: .sisyphus/evidence/task-5-navigation-persistence.txt

  Scenario: Failure/edge deep-link guard
    Tool: Bash
    Steps: Run `rtk yarn test:expo -- --runInBand addJobWizard.navigation.test.tsx -t "handles preview with invalid formData param"`.
    Expected: Invalid preview params render fallback and no crash occurs.
    Evidence: .sisyphus/evidence/task-5-navigation-persistence-error.txt
  ```

  **Commit**: YES | Message: `fix(add-job): harden staged navigation and back-state persistence` | Files: `packages/app/features/homeowner/jobs/add/screen.tsx`, `packages/app/features/homeowner/jobs/add/preview-screen.tsx`, `packages/app/features/homeowner/jobs/add/__tests__/addJobWizard.navigation.test.tsx`

- [ ] 6. Preserve preview payload mapping parity and publish-path error recovery

  **What to do**: Keep preview `handlePublish` payload mapping equivalent to current behavior for tasks and attachments; add explicit regression assertions/tests for video thumbnail/duration, optional postal code, and discount code pass-through. Ensure publish failure keeps user on preview with retriable state.
  **Must NOT do**: Do not alter success redirect destination or toast behavior.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: Submission contract and error-path correctness are high risk.
  - Skills: `[]` - Existing contract is internal and well defined.
  - Omitted: `frontend-ui-ux` - Logic-first task.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 8 | Blocked By: 2, 4

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `packages/app/features/homeowner/jobs/add/preview-screen.tsx:150` - `handlePublish` attachment-to-upload mapping.
  - Pattern: `packages/app/features/homeowner/jobs/add/preview-screen.tsx:176` - request payload builder.
  - API/Type: `packages/api/src/hooks/homeowner/useCreateJob.ts:77` - task indexing and attachment form-data encoding.
  - API/Type: `packages/api/src/types/attachment.ts:119` - `AttachmentUpload` required/optional keys.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Preview payload includes all stage data with unchanged key names and types.
  - [ ] Video attachment metadata (`thumbnail`, `duration_seconds`) behavior is unchanged.
  - [ ] On publish error, screen remains usable with user inputs preserved for retry.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```text
  Scenario: Happy path payload parity
    Tool: Bash
    Steps: Run `rtk yarn test:expo -- --runInBand addJobPreview.payload.test.tsx -t "builds create-job request payload with unchanged shape"`.
    Expected: Test snapshot/assertion confirms payload parity against previous contract.
    Evidence: .sisyphus/evidence/task-6-preview-payload.txt

  Scenario: Failure path publish error recovery
    Tool: Bash
    Steps: Run `rtk yarn test:expo -- --runInBand addJobPreview.payload.test.tsx -t "retains preview state when create mutation rejects"`.
    Expected: Error path renders message and keeps Publish action available for retry.
    Evidence: .sisyphus/evidence/task-6-preview-payload-error.txt
  ```

  **Commit**: YES | Message: `test(add-job): lock preview payload parity and publish recovery` | Files: `packages/app/features/homeowner/jobs/add/preview-screen.tsx`, `packages/app/features/homeowner/jobs/add/__tests__/addJobPreview.payload.test.tsx`

- [ ] 7. Add staged-flow integration tests that cover full user progression

  **What to do**: Create integration tests for end-to-end form progression (within test renderer): fill Stage 1, advance to Stage 2, fill required fields, navigate to preview, and assert rendered preview data matches inputs.
  **Must NOT do**: Do not mock away stage validation logic being tested.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: Multi-step integration tests with route mocks and assertions.
  - Skills: `[]` - Existing Expo test setup already mocks router dependencies.
  - Omitted: `playwright` - RN integration tests are primary and lower flake for this repo.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 8 | Blocked By: 1, 4

  **References** (executor has NO interview context - be exhaustive):
  - Test: `apps/expo/test/setup.ts:20` - existing router and native module mocks.
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx:618` - create screen composition.
  - Pattern: `packages/app/features/homeowner/jobs/add/preview-screen.tsx:547` - preview field rendering sections to assert.
  - Pattern: `packages/app/features/homeowner/direct-offers/preview-screen.tsx:184` - attachment upload mapping behavior for parity reference.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Integration test proves full stage progression with valid data reaches preview.
  - [ ] Integration test asserts preview displays title/location/budget/description/tasks from staged input.
  - [ ] Integration test covers at least one stage-specific validation failure before success.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```text
  Scenario: Happy path full staged flow
    Tool: Bash
    Steps: Run `rtk yarn test:expo -- --runInBand addJobWizard.integration.test.tsx -t "completes stage1 stage2 and reaches preview"`.
    Expected: Test passes and preview assertions match entered values.
    Evidence: .sisyphus/evidence/task-7-staged-integration.txt

  Scenario: Failure/edge staged flow gate
    Tool: Bash
    Steps: Run `rtk yarn test:expo -- --runInBand addJobWizard.integration.test.tsx -t "cannot advance to stage2 when address missing"`.
    Expected: Stage remains administrative and required error is displayed.
    Evidence: .sisyphus/evidence/task-7-staged-integration-error.txt
  ```

  **Commit**: YES | Message: `test(add-job): add staged-flow integration coverage` | Files: `packages/app/features/homeowner/jobs/add/__tests__/addJobWizard.integration.test.tsx`

- [ ] 8. Run full quality gate and flow-focused test matrix with captured evidence

  **What to do**: Execute lint, type-check, expo tests (including new staged-flow tests), and build. Capture command outputs into evidence artifacts and resolve failures before completion.
  **Must NOT do**: Do not skip failing checks or bypass hooks.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: Cross-checking multiple gates and triaging failures.
  - Skills: `[]` - Pure command execution/verification.
  - Omitted: `git-master` - No history surgery required.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 9 | Blocked By: 3, 5, 6, 7

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `AGENTS.md` - required lint after edits and standard repo command set.
  - Pattern: `package.json:24` - `type-check` command.
  - Pattern: `package.json:25` - `test` orchestration.
  - Pattern: `package.json:29` - lint command.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `rtk yarn lint` exits 0.
  - [ ] `rtk yarn type-check` exits 0.
  - [ ] `rtk yarn test:expo` exits 0 with staged-flow tests included.
  - [ ] `rtk yarn build` exits 0.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```text
  Scenario: Happy path full gate pass
    Tool: Bash
    Steps: Run `rtk yarn lint && rtk yarn type-check && rtk yarn test:expo && rtk yarn build`.
    Expected: All commands exit successfully.
    Evidence: .sisyphus/evidence/task-8-quality-gates.txt

  Scenario: Failure path regression triage
    Tool: Bash
    Steps: If any command fails, rerun only failing command with verbose output and record root cause + fix verification.
    Expected: Failure reproduced, fixed, and rerun passes; evidence updated.
    Evidence: .sisyphus/evidence/task-8-quality-gates-error.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: `n/a`

- [ ] 9. Perform scope fidelity audit and acceptance-criteria traceability check

  **What to do**: Validate implemented changes against request scope and guardrails. Produce a traceability checklist mapping each user requirement to concrete code/test evidence paths.
  **Must NOT do**: Do not introduce new functionality during audit.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: High-discipline scope and requirement compliance audit.
  - Skills: `[]` - Internal review task.
  - Omitted: `frontend-ui-ux` - No new UI work.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 10 | Blocked By: 8

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `.sisyphus/plans/add-job-two-stage-preview.md` - source-of-truth requirement list.
  - Pattern: `packages/app/features/homeowner/jobs/add/screen.tsx` - staged form implementation.
  - Pattern: `packages/app/features/homeowner/jobs/add/preview-screen.tsx` - final preview/submit behavior.
  - Test: `packages/app/features/homeowner/jobs/add/__tests__/` - staged flow and payload tests.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Every user-requested field is mapped to correct stage with test evidence.
  - [ ] Final preview still contains all required fields and submit action.
  - [ ] No out-of-scope changes are present.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```text
  Scenario: Happy path requirement traceability
    Tool: Bash
    Steps: Generate a markdown checklist mapping request items to file paths and evidence files.
    Expected: Checklist has 1:1 mapping for all requested stage assignments and preview submit behavior.
    Evidence: .sisyphus/evidence/task-9-scope-traceability.md

  Scenario: Failure path scope drift detection
    Tool: Bash
    Steps: Run `rtk git diff --name-only` and flag any touched files outside add-job flow, tests, and config updates in plan scope.
    Expected: No unexpected files; if found, annotate and remove from final execution scope.
    Evidence: .sisyphus/evidence/task-9-scope-traceability-error.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: `n/a`

- [ ] 10. Finalize handoff package for execution agent and release-ready notes

  **What to do**: Assemble concise execution handoff note including changed files, commands run, evidence manifest, and known non-goals. Confirm this plan remains single-source and decision-complete for `/start-work` execution.
  **Must NOT do**: Do not add implementation changes in this handoff step.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: Clear, high-signal handoff artifact construction.
  - Skills: `[]` - Internal documentation quality task.
  - Omitted: `oracle` - Architecture decisions already locked.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: none | Blocked By: 9

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `.sisyphus/plans/add-job-two-stage-preview.md` - execution contract.
  - Pattern: `.sisyphus/evidence/` - required artifact location.
  - Pattern: `AGENTS.md` - lint/test/build expectations after edits.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Handoff note lists exact modified paths and evidence paths.
  - [ ] Handoff note states explicit non-goals to prevent scope creep.
  - [ ] Execution agent can proceed without new design decisions.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```text
  Scenario: Happy path handoff completeness
    Tool: Bash
    Steps: Validate all referenced evidence files exist and all required commands have recorded outputs.
    Expected: No missing artifact paths.
    Evidence: .sisyphus/evidence/task-10-handoff-checklist.txt

  Scenario: Failure path missing evidence detection
    Tool: Bash
    Steps: Run artifact existence check script and verify it fails when a required evidence file is removed, then restore.
    Expected: Script detects missing file and returns non-zero; passes after restore.
    Evidence: .sisyphus/evidence/task-10-handoff-checklist-error.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: `n/a`

## Final Verification Wave (4 parallel agents, ALL must APPROVE)
- [ ] F1. Plan Compliance Audit - oracle
- [ ] F2. Code Quality Review - unspecified-high
- [ ] F3. Real Manual QA - unspecified-high (+ playwright if UI)
- [ ] F4. Scope Fidelity Check - deep

## Commit Strategy
- Commit 1: `refactor(add-job): split form into stage-1 admin and stage-2 details`
- Commit 2: `test(add-job): cover stage gating persistence and preview payload parity`
- Commit 3: `chore(add-job): finalize flow verification and guardrail notes`

## Success Criteria
- Users experience a clear two-stage input experience before preview, reducing first-screen cognitive load.
- Final preview still displays complete job data from both stages and publishes successfully.
- No regressions in attachment handling, task list behavior, or create-job API request shape.
- Automated tests and quality gates pass with reproducible evidence artifacts.
