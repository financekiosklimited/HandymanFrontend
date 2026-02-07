import AsyncStorage from '@react-native-async-storage/async-storage'

export const DEV_FLAGS = {
  FORCE_ONBOARDING: 'dev_force_onboarding',
} as const

type DevFlagKey = keyof typeof DEV_FLAGS

/**
 * Check if a dev flag is enabled
 */
export async function isDevFlagEnabled(key: DevFlagKey): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(DEV_FLAGS[key])
    return value === 'true'
  } catch {
    return false
  }
}

/**
 * Enable/disable a dev flag
 */
export async function setDevFlag(key: DevFlagKey, enabled: boolean): Promise<void> {
  try {
    if (enabled) {
      await AsyncStorage.setItem(DEV_FLAGS[key], 'true')
    } else {
      await AsyncStorage.removeItem(DEV_FLAGS[key])
    }
  } catch {
    // Silently fail
  }
}
