# Navigation Improvements

This document explains the navigation improvements made to fix the "screen pops up instantly then animation plays" bug and improve overall navigation consistency.

## The Problem

When navigating between screens, users experienced:
1. A new screen pops up instantly (no animation)
2. Then the navigation animation plays
3. The same screen appears again with animation

This created a jarring, flickering effect.

## Root Causes

1. **Inconsistent animation configuration** - Root Stack had no animation settings, while some individual screens set `animation: 'slide_from_right'`
2. **Nested Stacks without proper coordination** - Each route group `(homeowner)`, `(handyman)`, `(guest)` had its own Stack without explicit animation config
3. **Double navigation triggers** - Rapid button presses or state changes could trigger navigation multiple times before the first animation completed

## Solutions Applied

### 1. Centralized Navigation Configuration (`config.ts`)

Created a single source of truth for all animation settings:

```typescript
// app/navigation/config.ts
export const defaultScreenOptions = {
  headerShown: false,
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  animation: 'slide_from_right',
  animationDuration: 200,
}
```

All Stack navigators now use these defaults for consistent behavior.

### 2. Navigation Guard Hook (`useNavigationGuard.ts`)

Prevents duplicate navigation with:
- Navigation state tracking (isNavigating ref)
- Configurable delay between navigations (default: 500ms)
- Same-screen detection (won't navigate to current screen)
- Optional loading state for UI feedback

```typescript
const { navigate, push, replace, isNavigating } = useNavigationGuard()

// This won't trigger if already navigating
<Button onPress={() => navigate('/(homeowner)/jobs')} disabled={isNavigating}>
  Go to Jobs
</Button>
```

### 3. Updated Layout Files

All layout files now:
- Import and use `defaultScreenOptions` from config
- Use `useNavigationGuard` instead of raw `useRouter`
- Have consistent Stack configuration

### 4. Updated BottomNav Component

Added local tap protection:
- Tracks navigation state locally
- Prevents rapid button presses
- Respects parent's `isAddLoading` prop

## How to Use

### In Layout Files

```typescript
import { Stack } from 'expo-router'
import { defaultScreenOptions } from 'app/navigation/config'
import { useNavigationGuard } from 'app/hooks/useNavigationGuard'

export default function MyLayout() {
  const { push, replace } = useNavigationGuard()
  
  return (
    <Stack screenOptions={defaultScreenOptions}>
      {/* Screens */}
    </Stack>
  )
}
```

### In Screen Components

```typescript
import { useNavigationGuard } from 'app/hooks/useNavigationGuard'

export function MyScreen() {
  const { push, isNavigating } = useNavigationGuard()
  
  return (
    <Button 
      onPress={() => push('/(homeowner)/jobs/123')}
      disabled={isNavigating}
    >
      View Job
    </Button>
  )
}
```

### Screen Options for Modals

For modal screens, use the pre-defined options:

```typescript
import { modalScreenOptions, fullScreenModalOptions } from 'app/navigation/config'

// In your route file:
<Stack.Screen options={modalScreenOptions} />
```

## Migration Guide

If you have existing navigation code:

1. **Replace `useRouter` with `useNavigationGuard`** in components that trigger navigation
2. **Add `disabled={isNavigating}`** to navigation buttons
3. **Update Stack screenOptions** to use `defaultScreenOptions`
4. **Remove individual `Stack.Screen` animation props** from route files (now handled centrally)

## Testing

After applying these changes:
1. Rapidly tap navigation buttons - should only navigate once
2. Navigate between tabs - animation should be smooth and consistent
3. Check modal presentations - should slide from bottom as expected
4. Verify no duplicate screens in stack (check with `router.canGoBack()`)

## Troubleshooting

If you still see animation issues:
- Check that all layout files use `defaultScreenOptions`
- Ensure you're using the guarded navigation methods
- Verify no raw `router.push()` calls remain in components
- Try increasing the delay in `useNavigationGuard({ delay: 600 })`
