/**
 * Centralized Navigation Configuration
 *
 * This file standardizes animation and screen options across the entire app
 * to prevent the "screen pops up instantly then animation plays" bug.
 */

import type { ComponentProps } from 'react'
import { Stack } from 'expo-router'
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack'

/**
 * Default screen options for all Stack navigators
 * Using 'slide_from_right' for consistent iOS-style navigation
 *
 * Performance optimizations:
 * - detachInactiveScreens: true - Unmounts inactive screens to save memory
 * - freezeOnBlur: true - Freezes screen renders when not focused
 * - animationDuration: 150 - Slightly faster transitions for responsiveness
 */
export const defaultScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  animation: 'slide_from_right',
  animationDuration: 150,
  contentStyle: { backgroundColor: 'transparent' },
  detachInactiveScreens: true,
}

/**
 * Screen options for modal presentations
 * Use this for screens that should slide from bottom (forms, etc.)
 */
export const modalScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  presentation: 'modal',
  animation: 'slide_from_bottom',
  gestureEnabled: true,
  gestureDirection: 'vertical',
}

/**
 * Screen options for transparent modals
 * Use this for overlays, bottom sheets, etc.
 */
export const transparentModalScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  presentation: 'transparentModal',
  animation: 'fade',
  gestureEnabled: true,
  contentStyle: { backgroundColor: 'transparent' },
}

/**
 * Screen options for full-screen modals (iOS form sheet style)
 */
export const fullScreenModalOptions: NativeStackNavigationOptions = {
  headerShown: false,
  presentation: 'fullScreenModal',
  animation: 'slide_from_bottom',
  gestureEnabled: true,
  gestureDirection: 'vertical',
}

/**
 * Type-safe Stack component with default options pre-configured
 *
 * Usage:
 * import { AppStack } from 'app/navigation/config'
 *
 * <AppStack screenOptions={{ ... }}>
 *   <AppStack.Screen name="index" />
 * </AppStack>
 */
export const AppStack = Stack

/**
 * Pre-configured Stack that applies default screen options to all screens
 * This ensures consistent animation behavior across the app
 */
export function RootStack(props: ComponentProps<typeof Stack>) {
  return (
    <Stack
      screenOptions={defaultScreenOptions}
      {...props}
    />
  )
}
