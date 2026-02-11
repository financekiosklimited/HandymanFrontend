import { describe, it, expect } from 'vitest'
import {
  getTimeRemaining,
  formatTimeRemaining,
  getTimeUrgency,
  formatOfferDate,
  formatPreferredStartDate,
} from '../time'

describe('getTimeRemaining - Edge Cases', () => {
  it('should handle exact millisecond boundary', () => {
    const future = new Date(Date.now() + 1)
    const result = getTimeRemaining(future)

    expect(result.isExpired).toBe(false)
    expect(result.totalMinutes).toBe(0)
  })

  it('should handle negative time (past dates)', () => {
    const past = new Date(Date.now() - 1000)
    const result = getTimeRemaining(past)

    expect(result.isExpired).toBe(true)
    expect(result.days).toBe(0)
    expect(result.hours).toBe(0)
    expect(result.minutes).toBe(0)
  })

  it('should handle exactly 24 hours', () => {
    const future = new Date(Date.now() + 86400000)
    const result = getTimeRemaining(future)

    expect(result.days).toBe(1)
    expect(result.hours).toBe(0)
    expect(result.isExpired).toBe(false)
  })

  it('should handle just under 24 hours', () => {
    const future = new Date(Date.now() + 86399000)
    const result = getTimeRemaining(future)

    expect(result.days).toBe(0)
    expect(result.hours).toBe(23)
  })

  it('should handle just over 24 hours', () => {
    const future = new Date(Date.now() + 86401000)
    const result = getTimeRemaining(future)

    expect(result.days).toBe(1)
  })

  it('should handle far future dates', () => {
    const farFuture = new Date(Date.now() + 31536000000) // 1 year
    const result = getTimeRemaining(farFuture)

    // Due to timing, might be exactly 365 days
    expect(result.days).toBeGreaterThanOrEqual(365)
    expect(result.isExpired).toBe(false)
  })

  it('should handle very recent dates', () => {
    const recent = new Date(Date.now() + 1000) // 1 second
    const result = getTimeRemaining(recent)

    expect(result.isExpired).toBe(false)
    expect(result.minutes).toBe(0)
  })

  it('should handle zero input (same time)', () => {
    const now = new Date()
    const result = getTimeRemaining(now)

    expect(result.isExpired).toBe(true)
    expect(result.totalMinutes).toBe(0)
  })

  it('should handle Date object input', () => {
    const future = new Date(Date.now() + 3600000)
    const result = getTimeRemaining(future)

    expect(result.hours).toBe(1)
  })

  it('should handle string date input (ISO)', () => {
    const future = new Date(Date.now() + 7200000).toISOString()
    const result = getTimeRemaining(future)

    // Due to timing, might be slightly less than 2 hours
    expect(result.hours).toBeGreaterThanOrEqual(1)
    expect(result.hours).toBeLessThanOrEqual(2)
  })

  it('should calculate totalMinutes correctly', () => {
    const future = new Date(Date.now() + 90060000) // 1 day + 1 hour + 1 minute
    const result = getTimeRemaining(future)

    expect(result.totalMinutes).toBe(1501) // 1440 + 60 + 1
  })
})

describe('formatTimeRemaining - Edge Cases', () => {
  it('should format zero time', () => {
    const now = new Date()
    const result = formatTimeRemaining(now)

    expect(result).toBe('Expired')
  })

  it('should format less than a minute', () => {
    const future = new Date(Date.now() + 30000)
    const result = formatTimeRemaining(future)

    expect(result).toMatch(/\d+m/)
  })

  it('should format exactly 1 hour', () => {
    const future = new Date(Date.now() + 3600000)
    const result = formatTimeRemaining(future)

    expect(result).toMatch(/1h/)
  })

  it('should format exactly 1 day', () => {
    const future = new Date(Date.now() + 86400000)
    const result = formatTimeRemaining(future)

    expect(result).toMatch(/1d/)
  })

  it('should format days and hours', () => {
    const future = new Date(Date.now() + 90000000) // 1d 1h
    const result = formatTimeRemaining(future)

    expect(result).toMatch(/1d/)
    expect(result).toMatch(/1h/)
  })

  it('should format hours and minutes', () => {
    const future = new Date(Date.now() + 3660000) // 1h 1m
    const result = formatTimeRemaining(future)

    expect(result).toMatch(/1h/)
    expect(result).toMatch(/\d+m/)
  })

  it('should handle past dates', () => {
    const past = new Date(Date.now() - 1000)
    const result = formatTimeRemaining(past)

    expect(result).toBe('Expired')
  })
})

describe('getTimeUrgency - Boundary Testing', () => {
  it('should return expired for past dates', () => {
    const past = new Date(Date.now() - 1)
    expect(getTimeUrgency(past)).toBe('expired')
  })

  it('should return urgent for 1 minute', () => {
    const urgent = new Date(Date.now() + 60000)
    expect(getTimeUrgency(urgent)).toBe('urgent')
  })

  it('should return urgent for 1 hour 59 minutes', () => {
    const urgent = new Date(Date.now() + 7140000)
    expect(getTimeUrgency(urgent)).toBe('urgent')
  })

  it('should return warning at exactly 2 hours boundary', () => {
    // Implementation uses < 120 minutes for urgent, so exactly 120 is warning
    const warning = new Date(Date.now() + 7200000)
    expect(getTimeUrgency(warning)).toBe('warning')
  })

  it('should return warning for just over 2 hours', () => {
    const warning = new Date(Date.now() + 7200001)
    expect(getTimeUrgency(warning)).toBe('warning')
  })

  it('should return warning for 12 hours', () => {
    const warning = new Date(Date.now() + 43200000)
    expect(getTimeUrgency(warning)).toBe('warning')
  })

  it('should return warning for 23 hours 59 minutes', () => {
    const warning = new Date(Date.now() + 86340000)
    expect(getTimeUrgency(warning)).toBe('warning')
  })

  it('should return normal for exactly 24 hours', () => {
    // Implementation uses < 1440 minutes for warning, so exactly 1440 is normal
    const normal = new Date(Date.now() + 86400000)
    expect(getTimeUrgency(normal)).toBe('normal')
  })

  it('should return normal for over 24 hours', () => {
    const normal = new Date(Date.now() + 90000000)
    expect(getTimeUrgency(normal)).toBe('normal')
  })

  it('should return normal for weeks ahead', () => {
    const normal = new Date(Date.now() + 604800000)
    expect(getTimeUrgency(normal)).toBe('normal')
  })
})

describe('formatOfferDate - Time Formatting', () => {
  it('should return Just now for 0 seconds', () => {
    const now = new Date()
    expect(formatOfferDate(now)).toBe('Just now')
  })

  it('should return Just now for 30 seconds', () => {
    const recent = new Date(Date.now() - 30000)
    expect(formatOfferDate(recent)).toBe('Just now')
  })

  it('should return Just now for 59 seconds', () => {
    const recent = new Date(Date.now() - 59000)
    expect(formatOfferDate(recent)).toBe('Just now')
  })

  it('should return minutes for 1 minute ago', () => {
    const ago = new Date(Date.now() - 60000)
    expect(formatOfferDate(ago)).toMatch(/1m/)
  })

  it('should return minutes for 59 minutes ago', () => {
    const ago = new Date(Date.now() - 3540000)
    expect(formatOfferDate(ago)).toMatch(/59m/)
  })

  it('should return hours for 1 hour ago', () => {
    const ago = new Date(Date.now() - 3600000)
    expect(formatOfferDate(ago)).toMatch(/1h/)
  })

  it('should return hours for 23 hours ago', () => {
    const ago = new Date(Date.now() - 82800000)
    expect(formatOfferDate(ago)).toMatch(/23h/)
  })

  it('should return Yesterday for 24 hours ago', () => {
    const yesterday = new Date(Date.now() - 86400000)
    expect(formatOfferDate(yesterday)).toBe('Yesterday')
  })

  it('should return Yesterday for 47 hours ago', () => {
    const yesterday = new Date(Date.now() - 169200000)
    expect(formatOfferDate(yesterday)).toBe('Yesterday')
  })

  it('should return date for 2 days ago', () => {
    const ago = new Date(Date.now() - 172800000)
    const result = formatOfferDate(ago)

    expect(result).not.toBe('Just now')
    expect(result).not.toBe('Yesterday')
    expect(result.length).toBeGreaterThan(0)
  })

  it('should return date for 1 week ago', () => {
    const ago = new Date(Date.now() - 604800000)
    const result = formatOfferDate(ago)

    expect(result.length).toBeGreaterThan(0)
  })

  it('should include year for dates from different year', () => {
    const lastYear = new Date()
    lastYear.setFullYear(lastYear.getFullYear() - 1)
    const result = formatOfferDate(lastYear)

    // Should contain a 4-digit year
    expect(result).toMatch(/\d{4}/)
  })
})

describe('formatPreferredStartDate - Date Formatting', () => {
  it('should return Today for now', () => {
    const today = new Date()
    expect(formatPreferredStartDate(today)).toBe('Today')
  })

  it('should return Today for end of today', () => {
    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)
    expect(formatPreferredStartDate(endOfToday)).toBe('Today')
  })

  it('should return Tomorrow for tomorrow', () => {
    const tomorrow = new Date(Date.now() + 86400000)
    expect(formatPreferredStartDate(tomorrow)).toBe('Tomorrow')
  })

  it('should return Tomorrow for just over 24 hours', () => {
    const tomorrow = new Date(Date.now() + 90000000)
    expect(formatPreferredStartDate(tomorrow)).toBe('Tomorrow')
  })

  it('should return weekday for this week', () => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const future = new Date(Date.now() + 172800000) // 2 days
    const result = formatPreferredStartDate(future)

    expect(dayNames).toContain(result)
  })

  it('should return formatted date for next week', () => {
    const nextWeek = new Date(Date.now() + 604800000)
    const result = formatPreferredStartDate(nextWeek)

    expect(result).not.toBe('Today')
    expect(result).not.toBe('Tomorrow')
    expect(result.length).toBeGreaterThan(5)
  })

  it('should return formatted date for next month', () => {
    const nextMonth = new Date(Date.now() + 2592000000)
    const result = formatPreferredStartDate(nextMonth)

    expect(result.length).toBeGreaterThan(5)
  })

  it('should return formatted date for next year', () => {
    const nextYear = new Date(Date.now() + 31536000000)
    const result = formatPreferredStartDate(nextYear)

    expect(result.length).toBeGreaterThan(5)
    expect(result).toMatch(/\d{4}/) // Should contain year
  })
})

describe('Time Utilities - Invalid Input Handling', () => {
  it('should handle invalid date strings by producing NaN dates', () => {
    const invalid = 'not-a-date'
    const result = getTimeRemaining(invalid)

    // Invalid dates result in NaN diff, which is NOT <= 0, so isExpired is false
    // This is the actual implementation behavior
    expect(result.days).toBeNaN()
    expect(result.isExpired).toBe(false)
  })

  it('should handle empty string by producing NaN dates', () => {
    const empty = ''
    const result = getTimeRemaining(empty)

    // Empty string creates invalid date (NaN)
    expect(result.days).toBeNaN()
    expect(result.isExpired).toBe(false)
  })

  it('should handle null as epoch start (1970)', () => {
    // null becomes 0 timestamp (1970), which is in the past
    const result = getTimeRemaining(null as any)

    expect(result.isExpired).toBe(true)
  })

  it('should handle undefined by producing NaN dates', () => {
    // undefined creates invalid date
    const result = getTimeRemaining(undefined as any)

    // NaN diff means isExpired is false (NaN <= 0 is false)
    expect(result.days).toBeNaN()
    expect(result.isExpired).toBe(false)
  })

  it('should handle very large future dates', () => {
    const farFuture = Date.now() + 100 * 365 * 24 * 60 * 60 * 1000 // 100 years
    const result = getTimeRemaining(farFuture)

    expect(result.isExpired).toBe(false)
    // Use >= to account for timing precision
    expect(result.days).toBeGreaterThanOrEqual(36500)
  })
})

describe('Time Utilities - Consistency', () => {
  it('getTimeRemaining should return consistent structure', () => {
    const future = new Date(Date.now() + 3600000)
    const result = getTimeRemaining(future)

    expect(result).toHaveProperty('days')
    expect(result).toHaveProperty('hours')
    expect(result).toHaveProperty('minutes')
    expect(result).toHaveProperty('totalMinutes')
    expect(result).toHaveProperty('isExpired')
  })

  it('formatTimeRemaining should be consistent with getTimeRemaining', () => {
    const future = new Date(Date.now() + 3600000)
    const remaining = getTimeRemaining(future)
    const formatted = formatTimeRemaining(future)

    if (remaining.isExpired) {
      expect(formatted).toBe('Expired')
    } else if (remaining.days > 0) {
      expect(formatted).toContain(`${remaining.days}d`)
    } else if (remaining.hours > 0) {
      expect(formatted).toContain(`${remaining.hours}h`)
    } else {
      expect(formatted).toContain(`${remaining.minutes}m`)
    }
  })

  it('getTimeUrgency should be consistent with getTimeRemaining', () => {
    const testCases = [
      { time: Date.now() - 1000, expected: 'expired' },
      { time: Date.now() + 60000, expected: 'urgent' },
      { time: Date.now() + 43200000, expected: 'warning' },
      { time: Date.now() + 172800000, expected: 'normal' },
    ]

    testCases.forEach(({ time, expected }) => {
      const date = new Date(time)
      expect(getTimeUrgency(date)).toBe(expected)
    })
  })
})
