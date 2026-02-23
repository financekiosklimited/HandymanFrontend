# Phase 5 Plan: Static Background Optimization

## Objective
The `GradientBackground.tsx` file inside `packages/ui/src` currently uses `Animated.loop` accompanied by `Animated.View` and a 20-second duration `interpolate` sequence on every individual blob rendering the Home / Pages component background. Because `useNativeDriver: false` must be set for color interpolation, this animation is calculating JS thread hex shifts continuously 60 times a second, creating massive UI freeze/lag during navigation or press interactions.

The objective is to flatten `GradientBackground` by removing the Animated logic entirely, leaving only static SVG-like blurs and colors.

## Solution Outline
1. Open `packages/ui/src/GradientBackground.tsx`.
2. Delete the `Animated.loop` and `useRef(new Animated.Value(0))` initialization inside the `ColorShiftingBlob` component.
3. Change the `Animated.View` inside `ColorShiftingBlob` to a standard Tamagui `View`.
4. Supply a single fixed `backgroundColor` to each blob instead of the massive interpolated `COLOR_PALETTE` array.
5. Remove all `delay` implementations and React `useEffect` loops.

## Checklist
- [ ] Refactor `packages/ui/src/GradientBackground.tsx` to use static blobs.
- [ ] Run Typescript check (`tsc`).
- [ ] Test on local build to verify static rendering.
- [ ] Update GSD documents and Walkthrough.
