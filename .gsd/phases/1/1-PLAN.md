---
phase: 1
plan: 1
wave: 1
depends_on: []
files_modified: ["packages/app/features/homeowner/home/screen.tsx"]
autonomous: true

must_haves:
  truths:
    - "Homeowner homepage visual design matches guest homepage"
    - "No new components were added to the homeowner homepage"
    - "Homeowner homepage data fetching and business logic remains unchanged"
  artifacts:
    - "packages/app/features/homeowner/home/screen.tsx is modified"
---

# Plan 1.1: Apply Guest Homepage Design to Homeowner Homepage

<objective>
Update the homeowner homepage to match the visual design and layout of the guest homepage.

Purpose: Maintain visual consistency across different user roles in the application while preserving role-specific functionality.
Output: Modified `packages/app/features/homeowner/home/screen.tsx` file.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- packages/app/features/guest/home/screen.tsx
- packages/app/features/homeowner/home/screen.tsx
</context>

<tasks>

<task type="auto">
  <name>Apply design to homeowner screen</name>
  <files>packages/app/features/homeowner/home/screen.tsx</files>
  <action>
    Analyze `packages/app/features/guest/home/screen.tsx` to understand the layout and styling (e.g., margins, paddings, colors, typography, layout structures).
    Update `packages/app/features/homeowner/home/screen.tsx` to use the same Tamagui/styled components styling and layout patterns.
    AVOID: Adding new functional components or altering existing react-query/API hooks because the non-goal explicitly states "dont add new components".
  </action>
  <verify>npx biome check packages/app/features/homeowner/home/screen.tsx</verify>
  <done>Styling updated to match guest screen, no logic changed, linter passes.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Homeowner homepage visual design matches guest homepage
- [ ] No new components were added to the homeowner homepage
- [ ] Homeowner homepage data fetching and business logic remains unchanged
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
