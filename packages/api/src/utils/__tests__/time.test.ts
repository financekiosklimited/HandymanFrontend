import { describe, it, expect } from 'vitest'
import {
  getTimeRemaining,
  formatTimeRemaining,
  getTimeUrgency,
  formatOfferDate,
  formatPreferredStartDate,
} from '../time'

describe('getTimeRemaining', () => {
  it('should calculate time remaining for future date', () => {
    const future = new Date(Date.now() + 90066000) // 1 day, 1 hour, 1 minute
    const result = getTimeRemaining(future)

    expect(result.days).toBe(1)
    expect(result.hours).toBe(1)
    expect(result.minutes).toBe(1)
    expect(result.isExpired).toBe(false)
    expect(result.totalMinutes).toBeGreaterThan(0)
  })

  it('should return expired for past date', () => {
    const past = new Date(Date.now() - 1000)
    const result = getTimeRemaining(past)

    expect(result.days).toBe(0)
    expect(result.hours).toBe(0)
    expect(result.minutes).toBe(0)
    expect(result.isExpired).toBe(true)
    expect(result.totalMinutes).toBe(0)
  })

  it('should handle string dates', () => {
    const future = new Date(Date.now() + 90000000).toISOString() // 1 day + 1 hour
    const result = getTimeRemaining(future)

    expect(result.days).toBeGreaterThanOrEqual(1)
    expect(result.isExpired).toBe(false)
  })

  it('should handle Date objects', () => {
    const future = new Date(Date.now() + 3600000) // 1 hour
    const result = getTimeRemaining(future)

    expect(result.hours).toBe(1)
    expect(result.isExpired).toBe(false)
  })

  it('should return zero values at exact expiry', () => {
    const now = new Date()
    const result = getTimeRemaining(now)

    expect(result.days).toBe(0)
    expect(result.hours).toBe(0)
    expect(result.minutes).toBe(0)
    expect(result.isExpired).toBe(true)
  })

  it('should calculate multiple days correctly', () => {
    const future = new Date(Date.now() + 172800000) // 2 days
    const result = getTimeRemaining(future)

    expect(result.days).toBe(2)
    expect(result.hours).toBe(0)
    expect(result.isExpired).toBe(false)
  })
})

describe('formatTimeRemaining', () => {
  it('should format days and hours', () => {
    const future = new Date(Date.now() + 90000000) // 1 day + 1 hour
    const result = formatTimeRemaining(future)

    expect(result).toMatch(/1d/)
    expect(result).toMatch(/1h/)
  })

  it('should format minutes only when less than an hour', () => {
    const future = new Date(Date.now() + 1800000) // 30 minutes
    const result = formatTimeRemaining(future)

    expect(result).toMatch(/30m/)
    expect(result).not.toMatch(/d/)
    expect(result).not.toMatch(/h/)
  })

  it('should return Expired for past dates', () => {
    const past = new Date(Date.now() - 1000)
    const result = formatTimeRemaining(past)

    expect(result).toBe('Expired')
  })

  it('should format just days when exact day', () => {
    const future = new Date(Date.now() + 172800000) // 2 days
    const result = formatTimeRemaining(future)

    expect(result).toMatch(/2d/)
  })
})

describe('getTimeUrgency', () => {
  it('should return expired for past dates', () => {
    const past = new Date(Date.now() - 1000)
    expect(getTimeUrgency(past)).toBe('expired')
  })

  it('should return urgent for less than 2 hours', () => {
    const urgent = new Date(Date.now() + 3600000) // 1 hour
    expect(getTimeUrgency(urgent)).toBe('urgent')
  })

  it('should return warning for less than 24 hours', () => {
    const warning = new Date(Date.now() + 43200000) // 12 hours
    expect(getTimeUrgency(warning)).toBe('warning')
  })

  it('should return normal for more than 24 hours', () => {
    const normal = new Date(Date.now() + 172800000) // 2 days
    expect(getTimeUrgency(normal)).toBe('normal')
  })

  it('should handle boundary between warning and normal', () => {
    const justUnder24h = new Date(Date.now() + 86399000) // Just under 24 hours
    expect(getTimeUrgency(justUnder24h)).toBe('warning')

    const justOver24h = new Date(Date.now() + 86401000) // Just over 24 hours
    expect(getTimeUrgency(justOver24h)).toBe('normal')
  })
})

describe('formatOfferDate', () => {
  it('should return Just now for recent dates', () => {
    const recent = new Date(Date.now() - 30000) // 30 seconds ago
    expect(formatOfferDate(recent)).toBe('Just now')
  })

  it('should return hours ago format', () => {
    const hoursAgo = new Date(Date.now() - 7200000) // 2 hours ago
    expect(formatOfferDate(hoursAgo)).toMatch(/2h ago/)
  })

  it('should return Yesterday for yesterday', () => {
    const yesterday = new Date(Date.now() - 86400000)
    expect(formatOfferDate(yesterday)).toBe('Yesterday')
  })

  it('should return formatted date for older dates', () => {
    const old = new Date(Date.now() - 172800000) // 2 days ago
    const result = formatOfferDate(old)

    expect(result).not.toBe('Just now')
    expect(result).not.toBe('Yesterday')
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('formatPreferredStartDate', () => {
  it('should return Today for today', () => {
    const today = new Date()
    expect(formatPreferredStartDate(today)).toBe('Today')
  })

  it('should return Tomorrow for tomorrow', () => {
    const tomorrow = new Date(Date.now() + 86400000)
    expect(formatPreferredStartDate(tomorrow)).toBe('Tomorrow')
  })

  it('should return weekday for this week', () => {
    const nextWeek = new Date(Date.now() + 172800000) // 2 days from now
    const result = formatPreferredStartDate(nextWeek)

    expect(result).not.toBe('Today')
    expect(result).not.toBe('Tomorrow')
    expect([
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ]).toContain(result)
  })

  it('should return full date for far future', () => {
    const farFuture = new Date(Date.now() + 2592000000) // 30 days
    const result = formatPreferredStartDate(farFuture)

    expect(result).not.toBe('Today')
    expect(result).not.toBe('Tomorrow')
    expect(result.length).toBeGreaterThan(5)
  })
})
