import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  hasNotificationToastBeenShown,
  markNotificationToastAsShown,
  clearNotificationToastTracking,
  pickRandomNotification,
  shouldShowNoApplicantsToast,
} from '../notification-toast-storage'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}))

describe('hasNotificationToastBeenShown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return false when not shown', async () => {
    AsyncStorage.getItem.mockResolvedValue(null)

    const result = await hasNotificationToastBeenShown('report', { jobId: '123', reportId: '456' })

    expect(result).toBe(false)
  })

  it('should return true when shown', async () => {
    AsyncStorage.getItem.mockResolvedValue('true')

    const result = await hasNotificationToastBeenShown('completion', { jobId: '789' })

    expect(result).toBe(true)
  })

  it('should return false when missing required IDs', async () => {
    const result = await hasNotificationToastBeenShown('report', { jobId: '123' })

    expect(result).toBe(false)
    expect(AsyncStorage.getItem).not.toHaveBeenCalled()
  })

  it('should return false on storage error', async () => {
    AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'))

    const result = await hasNotificationToastBeenShown('offerAccepted', { offerId: '999' })

    expect(result).toBe(false)
  })
})

describe('markNotificationToastAsShown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should mark toast as shown', async () => {
    AsyncStorage.setItem.mockResolvedValue(undefined)

    await markNotificationToastAsShown('completion', { jobId: '123' })

    expect(AsyncStorage.setItem).toHaveBeenCalled()
  })

  it('should early return when missing IDs', async () => {
    await markNotificationToastAsShown('report', {})

    expect(AsyncStorage.setItem).not.toHaveBeenCalled()
  })
})

describe('clearNotificationToastTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should remove from storage', async () => {
    AsyncStorage.removeItem.mockResolvedValue(undefined)

    await clearNotificationToastTracking('completion', { jobId: '123' })

    expect(AsyncStorage.removeItem).toHaveBeenCalled()
  })
})

describe('pickRandomNotification', () => {
  it('should return random item from array', () => {
    const notifications = [
      { type: 'a', message: 'Message A' },
      { type: 'b', message: 'Message B' },
      { type: 'c', message: 'Message C' },
    ]

    const result = pickRandomNotification(notifications)

    expect(notifications).toContain(result)
  })

  it('should return null for empty array', () => {
    const result = pickRandomNotification([])

    expect(result).toBeNull()
  })

  it('should return only item when array has 1 element', () => {
    const notifications = [{ type: 'a', message: 'Only message' }]

    const result = pickRandomNotification(notifications)

    expect(result).toEqual(notifications[0])
  })
})

describe('shouldShowNoApplicantsToast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return true when 48h passed and 0 applicants', async () => {
    const fortyNineHoursAgo = new Date(Date.now() - 176400000).toISOString()
    AsyncStorage.getItem.mockResolvedValue(null)

    const result = await shouldShowNoApplicantsToast('123', fortyNineHoursAgo, 0)

    expect(result).toBe(true)
  })

  it('should return false when less than 48h', async () => {
    const twentyFourHoursAgo = new Date(Date.now() - 86400000).toISOString()

    const result = await shouldShowNoApplicantsToast('123', twentyFourHoursAgo, 0)

    expect(result).toBe(false)
  })

  it('should return false when has applicants', async () => {
    const fortyNineHoursAgo = new Date(Date.now() - 176400000).toISOString()

    const result = await shouldShowNoApplicantsToast('123', fortyNineHoursAgo, 5)

    expect(result).toBe(false)
  })

  it('should return false when already shown', async () => {
    const fortyNineHoursAgo = new Date(Date.now() - 176400000).toISOString()
    AsyncStorage.getItem.mockResolvedValue('true')

    const result = await shouldShowNoApplicantsToast('123', fortyNineHoursAgo, 0)

    expect(result).toBe(false)
  })

  it('should return false for invalid date', async () => {
    const result = await shouldShowNoApplicantsToast('123', 'invalid-date', 0)

    expect(result).toBe(false)
  })
})
