import AsyncStorage from '@react-native-async-storage/async-storage'

// Keys for tracking which notification toasts have been shown
const NOTIFICATION_TOAST_KEYS = {
  report: (jobId: string, reportId: string) => `toast_shown_report_${jobId}_${reportId}`,
  reimbursement: (jobId: string, reimbursementId: string) =>
    `toast_shown_reimbursement_${jobId}_${reimbursementId}`,
  completion: (jobId: string) => `toast_shown_completion_${jobId}`,
  offerAccepted: (offerId: string) => `toast_shown_offer_accepted_${offerId}`,
  offerDeclined: (offerId: string) => `toast_shown_offer_declined_${offerId}`,
  noApplicants: (jobId: string) => `toast_shown_no_applicants_${jobId}`,
  newDirectOffer: () => `toast_shown_new_direct_offer`,
  handymanReportApproved: (reportId: string) => `toast_shown_handyman_report_approved_${reportId}`,
  handymanReportRejected: (reportId: string) => `toast_shown_handyman_report_rejected_${reportId}`,
  handymanReimbursementApproved: (reimbursementId: string) =>
    `toast_shown_handyman_reimbursement_approved_${reimbursementId}`,
  handymanReimbursementRejected: (reimbursementId: string) =>
    `toast_shown_handyman_reimbursement_rejected_${reimbursementId}`,
}

type NotificationType =
  | 'report'
  | 'reimbursement'
  | 'completion'
  | 'offerAccepted'
  | 'offerDeclined'
  | 'noApplicants'
  | 'newDirectOffer'
  | 'handymanReportApproved'
  | 'handymanReportRejected'
  | 'handymanReimbursementApproved'
  | 'handymanReimbursementRejected'

export interface PendingNotification {
  type: NotificationType
  jobId?: string
  offerId?: string
  reportId?: string
  reimbursementId?: string
  timestamp: number
}

/**
 * Check if a notification toast has been shown
 */
export async function hasNotificationToastBeenShown(
  type: NotificationType,
  ids: { jobId?: string; offerId?: string; reportId?: string; reimbursementId?: string }
): Promise<boolean> {
  try {
    let key: string

    switch (type) {
      case 'report':
        if (!ids.jobId || !ids.reportId) return false
        key = NOTIFICATION_TOAST_KEYS.report(ids.jobId, ids.reportId)
        break
      case 'reimbursement':
        if (!ids.jobId || !ids.reimbursementId) return false
        key = NOTIFICATION_TOAST_KEYS.reimbursement(ids.jobId, ids.reimbursementId)
        break
      case 'completion':
        if (!ids.jobId) return false
        key = NOTIFICATION_TOAST_KEYS.completion(ids.jobId)
        break
      case 'offerAccepted':
      case 'offerDeclined':
        if (!ids.offerId) return false
        key =
          type === 'offerAccepted'
            ? NOTIFICATION_TOAST_KEYS.offerAccepted(ids.offerId)
            : NOTIFICATION_TOAST_KEYS.offerDeclined(ids.offerId)
        break
      case 'noApplicants':
        if (!ids.jobId) return false
        key = NOTIFICATION_TOAST_KEYS.noApplicants(ids.jobId)
        break
      case 'newDirectOffer':
        key = NOTIFICATION_TOAST_KEYS.newDirectOffer()
        break
      case 'handymanReportApproved':
        if (!ids.reportId) return false
        key = NOTIFICATION_TOAST_KEYS.handymanReportApproved(ids.reportId)
        break
      case 'handymanReportRejected':
        if (!ids.reportId) return false
        key = NOTIFICATION_TOAST_KEYS.handymanReportRejected(ids.reportId)
        break
      case 'handymanReimbursementApproved':
        if (!ids.reimbursementId) return false
        key = NOTIFICATION_TOAST_KEYS.handymanReimbursementApproved(ids.reimbursementId)
        break
      case 'handymanReimbursementRejected':
        if (!ids.reimbursementId) return false
        key = NOTIFICATION_TOAST_KEYS.handymanReimbursementRejected(ids.reimbursementId)
        break
      default:
        return false
    }

    const value = await AsyncStorage.getItem(key)
    return value === 'true'
  } catch {
    return false
  }
}

/**
 * Mark a notification toast as shown
 */
export async function markNotificationToastAsShown(
  type: NotificationType,
  ids: { jobId?: string; offerId?: string; reportId?: string; reimbursementId?: string }
): Promise<void> {
  try {
    let key: string

    switch (type) {
      case 'report':
        if (!ids.jobId || !ids.reportId) return
        key = NOTIFICATION_TOAST_KEYS.report(ids.jobId, ids.reportId)
        break
      case 'reimbursement':
        if (!ids.jobId || !ids.reimbursementId) return
        key = NOTIFICATION_TOAST_KEYS.reimbursement(ids.jobId, ids.reimbursementId)
        break
      case 'completion':
        if (!ids.jobId) return
        key = NOTIFICATION_TOAST_KEYS.completion(ids.jobId)
        break
      case 'offerAccepted':
      case 'offerDeclined':
        if (!ids.offerId) return
        key =
          type === 'offerAccepted'
            ? NOTIFICATION_TOAST_KEYS.offerAccepted(ids.offerId)
            : NOTIFICATION_TOAST_KEYS.offerDeclined(ids.offerId)
        break
      case 'noApplicants':
        if (!ids.jobId) return
        key = NOTIFICATION_TOAST_KEYS.noApplicants(ids.jobId)
        break
      case 'newDirectOffer':
        key = NOTIFICATION_TOAST_KEYS.newDirectOffer()
        break
      case 'handymanReportApproved':
        if (!ids.reportId) return
        key = NOTIFICATION_TOAST_KEYS.handymanReportApproved(ids.reportId)
        break
      case 'handymanReportRejected':
        if (!ids.reportId) return
        key = NOTIFICATION_TOAST_KEYS.handymanReportRejected(ids.reportId)
        break
      case 'handymanReimbursementApproved':
        if (!ids.reimbursementId) return
        key = NOTIFICATION_TOAST_KEYS.handymanReimbursementApproved(ids.reimbursementId)
        break
      case 'handymanReimbursementRejected':
        if (!ids.reimbursementId) return
        key = NOTIFICATION_TOAST_KEYS.handymanReimbursementRejected(ids.reimbursementId)
        break
      default:
        return
    }

    await AsyncStorage.setItem(key, 'true')
  } catch {
    // Silently fail
  }
}

/**
 * Clear notification toast tracking when notification is marked as read
 * This should be called when user views/acknowledges the notification
 */
export async function clearNotificationToastTracking(
  type: NotificationType,
  ids: { jobId?: string; offerId?: string; reportId?: string; reimbursementId?: string }
): Promise<void> {
  try {
    let key: string

    switch (type) {
      case 'report':
        if (!ids.jobId || !ids.reportId) return
        key = NOTIFICATION_TOAST_KEYS.report(ids.jobId, ids.reportId)
        break
      case 'reimbursement':
        if (!ids.jobId || !ids.reimbursementId) return
        key = NOTIFICATION_TOAST_KEYS.reimbursement(ids.jobId, ids.reimbursementId)
        break
      case 'completion':
        if (!ids.jobId) return
        key = NOTIFICATION_TOAST_KEYS.completion(ids.jobId)
        break
      case 'offerAccepted':
      case 'offerDeclined':
        if (!ids.offerId) return
        key =
          type === 'offerAccepted'
            ? NOTIFICATION_TOAST_KEYS.offerAccepted(ids.offerId)
            : NOTIFICATION_TOAST_KEYS.offerDeclined(ids.offerId)
        break
      case 'noApplicants':
        if (!ids.jobId) return
        key = NOTIFICATION_TOAST_KEYS.noApplicants(ids.jobId)
        break
      default:
        return
    }

    await AsyncStorage.removeItem(key)
  } catch {
    // Silently fail
  }
}

/**
 * Get pending notifications for a job
 * This is a helper to check what notifications are available
 * Returns array of pending notification types
 */
export async function getPendingNotificationsForJob(
  jobId: string,
  options: {
    hasPendingReport?: boolean
    hasPendingReimbursement?: boolean
    hasPendingCompletion?: boolean
    reportId?: string
    reimbursementId?: string
  }
): Promise<PendingNotification[]> {
  const pending: PendingNotification[] = []

  // Check each notification type
  if (options.hasPendingReport && options.reportId) {
    const shown = await hasNotificationToastBeenShown('report', {
      jobId,
      reportId: options.reportId,
    })
    if (!shown) {
      pending.push({
        type: 'report',
        jobId,
        reportId: options.reportId,
        timestamp: Date.now(),
      })
    }
  }

  if (options.hasPendingReimbursement && options.reimbursementId) {
    const shown = await hasNotificationToastBeenShown('reimbursement', {
      jobId,
      reimbursementId: options.reimbursementId,
    })
    if (!shown) {
      pending.push({
        type: 'reimbursement',
        jobId,
        reimbursementId: options.reimbursementId,
        timestamp: Date.now(),
      })
    }
  }

  if (options.hasPendingCompletion) {
    const shown = await hasNotificationToastBeenShown('completion', { jobId })
    if (!shown) {
      pending.push({
        type: 'completion',
        jobId,
        timestamp: Date.now(),
      })
    }
  }

  return pending
}

/**
 * Pick one random notification from a list
 * Returns null if list is empty
 */
export function pickRandomNotification(
  notifications: PendingNotification[]
): PendingNotification | null {
  if (notifications.length === 0) return null
  const randomIndex = Math.floor(Math.random() * notifications.length)
  return notifications[randomIndex] ?? null
}

/**
 * Mark all pending notifications for a job as shown
 * Use this after showing a toast to prevent barrage
 */
export async function markAllJobNotificationsAsShown(
  jobId: string,
  notifications: PendingNotification[]
): Promise<void> {
  for (const notification of notifications) {
    if (notification.jobId === jobId) {
      await markNotificationToastAsShown(notification.type, {
        jobId,
        reportId: notification.reportId,
        reimbursementId: notification.reimbursementId,
      })
    }
  }
}

/**
 * Check if no-applicants toast should be shown for a job
 * Returns true if job is older than 48h and has 0 applicants
 */
export async function shouldShowNoApplicantsToast(
  jobId: string,
  createdAt: string,
  applicantCount: number
): Promise<boolean> {
  if (applicantCount > 0) return false

  // Check if 48 hours have passed
  const jobCreated = new Date(createdAt).getTime()
  const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000
  if (jobCreated > fortyEightHoursAgo) return false

  // Check if already shown
  const shown = await hasNotificationToastBeenShown('noApplicants', { jobId })
  return !shown
}
