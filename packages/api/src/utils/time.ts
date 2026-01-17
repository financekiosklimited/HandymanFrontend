/**
 * Time formatting utilities for direct offers and other time-sensitive features.
 */

export interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  totalMinutes: number
  isExpired: boolean
}

/**
 * Calculate time remaining from an expiry date.
 */
export function getTimeRemaining(expiresAt: string | Date): TimeRemaining {
  const now = new Date()
  const expiry = new Date(expiresAt)
  const diffMs = expiry.getTime() - now.getTime()

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      totalMinutes: 0,
      isExpired: true,
    }
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60))
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  return {
    days,
    hours,
    minutes,
    totalMinutes,
    isExpired: false,
  }
}

/**
 * Format time remaining as a human-readable string.
 * Examples: "6d 12h", "2h 30m", "45m", "Expired"
 */
export function formatTimeRemaining(expiresAt: string | Date): string {
  const remaining = getTimeRemaining(expiresAt)

  if (remaining.isExpired) {
    return 'Expired'
  }

  if (remaining.days > 0) {
    return `${remaining.days}d ${remaining.hours}h`
  }

  if (remaining.hours > 0) {
    return `${remaining.hours}h ${remaining.minutes}m`
  }

  return `${remaining.minutes}m`
}

/**
 * Get urgency level based on time remaining.
 * Useful for determining badge color.
 */
export function getTimeUrgency(
  expiresAt: string | Date
): 'expired' | 'urgent' | 'warning' | 'normal' {
  const remaining = getTimeRemaining(expiresAt)

  if (remaining.isExpired) {
    return 'expired'
  }

  // Less than 2 hours = urgent
  if (remaining.totalMinutes < 120) {
    return 'urgent'
  }

  // Less than 24 hours = warning
  if (remaining.totalMinutes < 1440) {
    return 'warning'
  }

  return 'normal'
}

/**
 * Format a date for display in offer cards/details.
 * Returns relative time for recent dates, formatted date for older ones.
 */
export function formatOfferDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      if (diffMinutes < 1) return 'Just now'
      return `${diffMinutes}m ago`
    }
    return `${diffHours}h ago`
  }

  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`

  // Format as date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

/**
 * Format preferred start date for display.
 */
export function formatPreferredStartDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Check if it's today
  if (d.toDateString() === now.toDateString()) {
    return 'Today'
  }

  // Check if it's tomorrow
  if (d.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow'
  }

  // Check if it's within the next week
  const daysAway = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysAway <= 7 && daysAway > 0) {
    return d.toLocaleDateString('en-US', { weekday: 'long' })
  }

  // Format as full date
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}
