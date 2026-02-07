import AsyncStorage from '@react-native-async-storage/async-storage'
import { isDevFlagEnabled } from './dev-flags'

// Keys for tracking which onboarding toasts have been seen
const ONBOARDING_KEYS = {
  welcome: 'onboarding_welcome_seen',
  createJob: 'onboarding_create_job_seen',
  applications: 'onboarding_applications_seen',
  ongoing: 'onboarding_ongoing_seen',
  directOffer: 'onboarding_direct_offer_seen',
} as const

type OnboardingKey = keyof typeof ONBOARDING_KEYS

/**
 * Check if a specific onboarding toast has been shown
 */
export async function hasSeenOnboarding(key: OnboardingKey): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEYS[key])
    return value === 'true'
  } catch {
    return false
  }
}

/**
 * Check if onboarding should be shown (respects dev flags)
 * Returns true if dev flag is enabled OR if not seen
 */
export async function shouldShowOnboarding(key: OnboardingKey): Promise<boolean> {
  // Check dev mode first
  const forceEnabled = await isDevFlagEnabled('FORCE_ONBOARDING')
  if (forceEnabled) return true

  // Normal check
  return !(await hasSeenOnboarding(key))
}

/**
 * Mark an onboarding toast as seen
 */
export async function markOnboardingSeen(key: OnboardingKey): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEYS[key], 'true')
  } catch {
    // Silently fail - not critical
  }
}

/**
 * Reset all onboarding toasts (useful for testing or user requests)
 */
export async function resetAllOnboarding(): Promise<void> {
  try {
    const keys = Object.values(ONBOARDING_KEYS)
    await AsyncStorage.multiRemove(keys)
  } catch {
    // Silently fail
  }
}

/**
 * Reset a specific onboarding toast
 */
export async function resetOnboarding(key: OnboardingKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEYS[key])
  } catch {
    // Silently fail
  }
}
