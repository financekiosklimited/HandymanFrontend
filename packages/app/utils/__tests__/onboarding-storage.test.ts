import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  hasSeenOnboarding,
  shouldShowOnboarding,
  markOnboardingSeen,
  resetAllOnboarding,
  resetOnboarding,
} from '../onboarding-storage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { isDevFlagEnabled } from '../dev-flags'

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    getAllKeys: vi.fn(),
    multiRemove: vi.fn(),
  },
}))

// Mock dev-flags
vi.mock('../dev-flags', () => ({
  isDevFlagEnabled: vi.fn(),
  DEV_FLAGS: {
    FORCE_ONBOARDING: 'dev_force_onboarding',
  },
}))

describe('hasSeenOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return false when onboarding not in storage', async () => {
    AsyncStorage.getItem.mockResolvedValue(null)

    const result = await hasSeenOnboarding('welcome')

    expect(result).toBe(false)
    expect(AsyncStorage.getItem).toHaveBeenCalled()
  })

  it('should return true when onboarding is in storage', async () => {
    AsyncStorage.getItem.mockResolvedValue('true')

    const result = await hasSeenOnboarding('createJob')

    expect(result).toBe(true)
  })

  it('should return false on storage error', async () => {
    AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'))

    const result = await hasSeenOnboarding('applications')

    expect(result).toBe(false)
  })
})

describe('shouldShowOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return true when onboarding not seen', async () => {
    AsyncStorage.getItem.mockResolvedValue(null)
    isDevFlagEnabled.mockResolvedValue(false)

    const result = await shouldShowOnboarding('welcome')

    expect(result).toBe(true)
  })

  it('should return false when onboarding already seen', async () => {
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key && key.includes('create_job')) return Promise.resolve('true')
      return Promise.resolve(null)
    })
    isDevFlagEnabled.mockResolvedValue(false)

    const result = await shouldShowOnboarding('createJob')

    expect(result).toBe(false)
  })

  it('should return true when FORCE_ONBOARDING flag is set', async () => {
    AsyncStorage.getItem.mockResolvedValue('true')
    isDevFlagEnabled.mockResolvedValue(true)

    const result = await shouldShowOnboarding('applications')

    expect(result).toBe(true)
  })

  it('should check dev flag first', async () => {
    isDevFlagEnabled.mockResolvedValue(true)

    await shouldShowOnboarding('ongoing')

    expect(isDevFlagEnabled).toHaveBeenCalledWith('FORCE_ONBOARDING')
  })
})

describe('markOnboardingSeen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should set item in storage', async () => {
    AsyncStorage.setItem.mockResolvedValue(undefined)

    await markOnboardingSeen('directOffer')

    expect(AsyncStorage.setItem).toHaveBeenCalled()
  })

  it('should handle storage errors silently', async () => {
    AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'))

    await expect(markOnboardingSeen('welcome')).resolves.not.toThrow()
  })
})

describe('resetAllOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call multiRemove with onboarding keys', async () => {
    AsyncStorage.multiRemove.mockResolvedValue(undefined)

    await resetAllOnboarding()

    expect(AsyncStorage.multiRemove).toHaveBeenCalled()
  })

  it('should handle storage errors silently', async () => {
    AsyncStorage.multiRemove.mockRejectedValue(new Error('Storage error'))

    await expect(resetAllOnboarding()).resolves.not.toThrow()
  })
})

describe('resetOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should remove specific onboarding key', async () => {
    AsyncStorage.removeItem.mockResolvedValue(undefined)

    await resetOnboarding('handymanReport')

    expect(AsyncStorage.removeItem).toHaveBeenCalled()
  })

  it('should handle storage errors silently', async () => {
    AsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'))

    await expect(resetOnboarding('handymanReimbursement')).resolves.not.toThrow()
  })
})
