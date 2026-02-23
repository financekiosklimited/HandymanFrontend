# Research: Bottom Navigation Responsiveness

## Problem
The user reports a 1s delay when tapping Profile, Jobs, or Updates tabs in the Bottom Navigation before any visual response occurs, and no noticeable press animation on the buttons themselves.

## Findings
1. **Synchronous Navigation Blocking**: When a tab is pressed, `BottomNav` immediately calls `onNavigate`, which triggers `push(route)` or `replace(route)` via `useNavigationGuard`. These Expo Router calls are synchronous and synchronous React Native screen renders block the JS thread. This prevents the press feedback from rendering until *after* the heavy next screen has already mounted and delayed things by up to 1 second.
2. **Missing Animation Props**: The `Button` components in `BottomNav.tsx` have `pressStyle={{ scale: 0.9 }}` but no `animation` prop, meaning Tamagui may not animate the scale property smoothly.

## Solution
1. **Defer Navigation**: Add a small `setTimeout` (e.g. 50ms) to the `handleNavPress` in `BottomNav.tsx`. This allows the React render cycle to complete and Native animations to begin *before* `expo-router` blocks the JS thread to mount the new screen.
2. **Add Pressing Animations**: Add `animation="quick"` and a more pronounced `pressStyle={{ scale: 0.9, opacity: 0.7 }}` to the buttons in `BottomNav.tsx` to ensure there is smooth and visible pressing feedback.
