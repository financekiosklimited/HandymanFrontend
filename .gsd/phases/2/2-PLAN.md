---
phase: 2
plan: 1
wave: 1
depends_on: []
files_modified: 
  - packages/app/features/homeowner/home/screen.tsx
  - packages/app/features/guest/home/screen.tsx
  - packages/app/features/handyman/profile/view-screen.tsx
autonomous: true
must_haves:
  truths:
    - "No component passes `fill=\"$accent\"` to SVG elements anymore"
  artifacts: []
---

# Plan 2.1: Fix $accent SVG Color Warning

<objective>
Replace `fill="$accent"` with a valid imported color object to prevent React Native SVG parse warnings and severe frame drops during rendering and press events.

Purpose: SVG components inside Tamagui don't always interpret standard Tamagui theme string pseudo-tokens for the `fill` prop natively.
Output: Clean console logs and smooth interactions across the home screens and profile screens.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- packages/config/src/tokens.ts
</context>

<tasks>

<task type="auto">
  <name>Update Homeowner Home Screen</name>
  <files>packages/app/features/homeowner/home/screen.tsx</files>
  <action>
    Import `colors` from `@my/config` and replace `fill="$accent"` with `fill={colors.accent}` for all SVG components (e.g. `Star`).
  </action>
  <verify>npx biome check packages/app/features/homeowner/home/screen.tsx</verify>
  <done>Zero instances of `fill=\"$accent\"`.</done>
</task>

<task type="auto">
  <name>Update Guest Home Screen</name>
  <files>packages/app/features/guest/home/screen.tsx</files>
  <action>
    Import `colors` from `@my/config` and replace `fill="$accent"` with `fill={colors.accent}` for all SVG components.
  </action>
  <verify>npx biome check packages/app/features/guest/home/screen.tsx</verify>
  <done>Zero instances of `fill=\"$accent\"`.</done>
</task>

<task type="auto">
  <name>Update Handyman Profile Screen</name>
  <files>packages/app/features/handyman/profile/view-screen.tsx</files>
  <action>
    Import `colors` from `@my/config` and replace `fill="$accent"` with `fill={colors.accent}` for all SVG components.
  </action>
  <verify>npx biome check packages/app/features/handyman/profile/view-screen.tsx</verify>
  <done>Zero instances of `fill=\"$accent\"`.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Must-have: No component uses `fill="$accent"`. Check by grep or search.
</verification>

<success_criteria>
- [ ] All 3 files updated successfully
- [ ] Pre-commit biome check passes
</success_criteria>
