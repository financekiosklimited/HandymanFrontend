---
phase: fix-nav-lag
plan: 2
wave: 1
depends_on: []
files_modified:
  - packages/app/hooks/useNavigationGuard.ts
  - packages/ui/src/BottomNav.tsx
autonomous: false

must_haves:
  truths:
    - "The exact source of the navigation lag is identified (e.g., router.push blocking, destination screen render time, or layout thrashing)"
  artifacts: []
---

# Plan fix-nav-lag.2: Instrument and Isolate Navigation Lag

<objective>
Find out why navigating anywhere using BottomNav is extremely laggy, even with animations disabled.

Purpose: The previous attempt (disabling animations) proved the lag is not caused by the continuous Tamagui animations. We must determine if the lag is from `expo-router` synchronous blocking, heavy target screen mounts, or React context thrashing.
Output: Instrumented navigation guard that logs execution times, and a test to defer navigation using `InteractionManager`.
</objective>

<context>
Load for context:
- packages/app/hooks/useNavigationGuard.ts
- packages/ui/src/BottomNav.tsx
</context>

<tasks>

<task type="auto">
  <name>Instrument useNavigationGuard</name>
  <files>packages/app/hooks/useNavigationGuard.ts</files>
  <action>
    Add `console.time('router.navigate')` and `console.timeEnd('router.navigate')` around the `router.navigate`, `router.push`, and `router.replace` calls.
    Add logging before and after `setNavigating(true)` to measure if state updates are slow.
    AVOID: Leaving this in production indefinitely. We need it purely to measure the synchronous JS thread blocking duration of `expo-router`.
  </action>
  <verify>Tap a BottomNav button and check console output for `router.push` timing.</verify>
  <done>Console accurately prints the millisecond duration of the router navigation calls.</done>
</task>

<task type="auto">
  <name>Use InteractionManager in BottomNav</name>
  <files>packages/ui/src/BottomNav.tsx</files>
  <action>
    Replace the double `requestAnimationFrame` in `handleNavPress` with `InteractionManager.runAfterInteractions(...)`.
    This guarantees that native press animations and gesture responders fully complete before Expo Router is allowed to block the JS thread with the route push.
    AVOID: Keeping the `requestAnimationFrame` fallback, as `InteractionManager` is the React Native standard for this exact "defer heavy work until UI is idle" scenario.
  </action>
  <verify>Tap a button on the app.</verify>
  <done>InteractionManager replaces requestAnimationFrame.</done>
</task>

<task type="checkpoint:human-verify">
  <name>Analyze lag source and verify</name>
  <files></files>
  <action>
    Ask the user to test navigation and report the console timings and the visual feel of the button press.
  </action>
  <verify>User provides feedback on lag and terminal logs.</verify>
  <done>Root cause of lag is isolated based on user's terminal output.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Console logs show exactly how long `router.push` takes.
- [ ] Button press UI feels instantly responsive due to InteractionManager, even if the destination screen is slow to load.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
