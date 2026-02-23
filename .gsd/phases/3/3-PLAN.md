---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Responsive Bottom Navigation

## Objective
Improve bottom navigation responsiveness by eliminating the 1-second delay when tapping Profile, Jobs, or Updates tabs. Add pressing animations to the bottom navigation buttons.

## Context
- e:\work\solutionbank\frontend\.gsd\SPEC.md
- e:\work\solutionbank\frontend\.gsd\ROADMAP.md
- e:\work\solutionbank\frontend\packages\ui\src\BottomNav.tsx

## Tasks

<task type="auto">
  <name>Add Press Animation & Defer Navigation</name>
  <files>e:\work\solutionbank\frontend\packages\ui\src\BottomNav.tsx</files>
  <action>
    - In `BottomNav.tsx`, add `animation="quick"` to the `<Button>` components representing the tabs.
    - Enhance the `pressStyle` to include `scale: 0.9` and `opacity: 0.7` for better visual feedback.
    - Wrap the `onNavigate` calls inside `handleNavPress` with `setTimeout(..., 50)` so the press animation can render before the React Native JS thread is blocked by the heavy Expo Router screen transitions.
  </action>
  <verify>Check manual testing in the application or visually inspect code</verify>
  <done>Navigation buttons instantly respond to presses with a smooth scale and opacity animation, and only navigate after the animation starts.</done>
</task>

## Success Criteria
- [ ] Tapping bottom navigation tabs provides instant visual feedback.
- [ ] Smooth pressing animations (`scale`, `opacity`) are applied to all bottom navigation tabs.
- [ ] No perceived lag between pressing the tab and seeing the visual press feedback.
