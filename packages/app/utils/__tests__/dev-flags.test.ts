import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isDevFlagEnabled, setDevFlag, DEV_FLAGS } from '../dev-flags'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}))

describe('isDevFlagEnabled', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return false when flag not set', async () => {
    AsyncStorage.getItem.mockResolvedValue(null)

    const result = await isDevFlagEnabled('FORCE_ONBOARDING')

    expect(result).toBe(false)
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(DEV_FLAGS.FORCE_ONBOARDING)
  })

  it('should return true when flag is "true"', async () => {
    AsyncStorage.getItem.mockResolvedValue('true')

    const result = await isDevFlagEnabled('FORCE_ONBOARDING')

    expect(result).toBe(true)
  })

  it('should return false when flag is "false"', async () => {
    AsyncStorage.getItem.mockResolvedValue('false')

    const result = await isDevFlagEnabled('FORCE_ONBOARDING')

    expect(result).toBe(false)
  })

  it('should return false on storage error', async () => {
    AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'))

    const result = await isDevFlagEnabled('FORCE_ONBOARDING')

    expect(result).toBe(false)
  })
})

describe('setDevFlag', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should set flag to "true"', async () => {
    AsyncStorage.setItem.mockResolvedValue(undefined)

    await setDevFlag('FORCE_ONBOARDING', true)

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(DEV_FLAGS.FORCE_ONBOARDING, 'true')
  })

  it('should remove flag when set to false', async () => {
    AsyncStorage.removeItem.mockResolvedValue(undefined)

    await setDevFlag('FORCE_ONBOARDING', false)

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(DEV_FLAGS.FORCE_ONBOARDING)
    expect(AsyncStorage.setItem).not.toHaveBeenCalled()
  })

  it('should handle storage errors', async () => {
    AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'))

    await expect(setDevFlag('FORCE_ONBOARDING', true)).resolves.not.toThrow()
  })
})

describe('DEV_FLAGS', () => {
  it('should have correct flag keys', () => {
    expect(DEV_FLAGS.FORCE_ONBOARDING).toBe('dev_force_onboarding')
  })
})
