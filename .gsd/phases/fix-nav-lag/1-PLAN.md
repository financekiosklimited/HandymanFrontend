---
phase: fix-nav-lag
plan: 1
wave: 1
depends_on: []
files_modified:
  - packages/ui/src/BottomNav.tsx
autonomous: true
must_haves:
  truths:
    - "Bottom navigation buttons respond immediately to presses without waiting 1-5 seconds"
    - "Continuous animations (shimmer/bell) do not interfere with interaction performance"
  artifacts:
    - "Updated BottomNav.tsx with optimized press handling"
---

# Plan 1: Optimize Bottom Navigation Performance

<objective>
Fix the 1-5 second lag when pressing bottom navigation buttons.

Purpose: The user experiences severe lag on button presses. This is likely caused by the Tamagui JS-driven press animations competing with synchronously heavy `router.push` routing on the JS thread, combined with infinite Reanimated loops (`shimmerProgress`) that might prevent `InteractionManager` from settling. 
Output: Modified `BottomNav.tsx` with optimized navigation deferral and animation handling.
</objective>

<context>
Load for context:
- packages/ui/src/BottomNav.tsx
</context>

<tasks>

<task type="auto">
  <name>Optimize Navigation Deferral</name>
  <files>packages/ui/src/BottomNav.tsx</files>
  <action>
    Modify `handleNavPress` to use a more robust deferral mechanism instead of `setTimeout(..., 50)`. 
    Use `requestAnimationFrame` nested calls to guarantee the press animation's frame has painted before `onNavigate` synchronously blocks the JS thread, or increase the `setTimeout` to ~150ms to allow Tamagui's `quick` animation to fully complete.
    AVOID: Using `InteractionManager.runAfterInteractions` because the continuous shimmer and bell animations (`withRepeat(..., -1)`) may prevent `InteractionManager` from ever firing, which would break navigation entirely.
  </action>
  <verify>Check that navigation still works and file compiles.</verify>
  <done>Navigation is successfully deferred allowing the press state layout/paint to complete.</done>
</task>

<task type="auto">
  <name>Disable Expensive GLimmers On Press</name>
  <files>packages/ui/src/BottomNav.tsx</files>
  <action>
    Add an `opacity` or conditional unmounting for the shimmer gradient and bell shake conditionally when `isNavigating` is true. When a user presses a button, the system sets `isNavigating` to true (via `useNavigationGuard` if it's passed down, or a local state). Currently `isNavigating` disables the buttons but doesn't pause the heavy Reanimated loops. 
    Wrap the `withRepeat` initialization in a `useEffect` that clears or pauses when `isNavigating` is true, or simpler: just reduce layout complexity of the `shimmerAnimatedStyle` by removing the `pointerEvents="none"` view if navigation starts.
  </action>
  <verify>Observe bottom nav code structure allows suspending animations.</verify>
  <done>Animations do not consume JS/UI thread bandwidth while navigating.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Bottom navigation button press animations trigger visibly before the screen freezes for navigation.
- [ ] Navigation correctly completes.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
