/**
 * Toast message utilities with helpful navigation hints
 * These messages guide users on what to do next after completing an action
 */

// Toast variant types
export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

// Toast controller interface (returned by useToastController)
interface ToastController {
  show: (
    title: string,
    options?: {
      message?: string
      duration?: number
      native?: boolean
      customData?: { variant?: ToastVariant }
    }
  ) => void
}

// Toast options interface
interface ToastOptions {
  duration?: number
  native?: boolean
  variant?: ToastVariant
}

// Default toast durations
const DURATIONS = {
  short: 3000,
  medium: 4000,
  long: 5000, // 5 seconds - enough time to read helpful messages
} as const

/**
 * Show a success toast with helpful next steps
 */
export function showSuccessToast(
  toast: ToastController,
  title: string,
  message: string,
  options: ToastOptions = {}
) {
  toast.show(title, {
    message,
    duration: options.duration || DURATIONS.medium,
    native: options.native ?? false,
    customData: { variant: options.variant || 'success' },
  })
}

/**
 * Show an error toast with guidance
 */
export function showErrorToast(
  toast: ToastController,
  title: string,
  message: string,
  options: ToastOptions = {}
) {
  toast.show(title, {
    message,
    duration: options.duration || DURATIONS.long,
    native: options.native ?? false,
    customData: { variant: options.variant || 'error' },
  })
}

// ============================================
// JOB MANAGEMENT TOASTS (Homeowner)
// ============================================

/**
 * Job created successfully
 */
export function showJobCreatedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Job list created',
    'You can check your job list in the workspace bottom navigation tab'
  )
}

/**
 * Job updated successfully
 */
export function showJobUpdatedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Job updated',
    'Your changes have been saved. Check the job details to see the updates.'
  )
}

/**
 * Job deleted successfully
 */
export function showJobDeletedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Job deleted',
    'The job listing has been removed. You can create a new one anytime from the workspace.'
  )
}

// ============================================
// APPLICATION TOASTS (Handyman)
// ============================================

/**
 * Application submitted successfully
 */
export function showApplicationSubmittedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Application submitted',
    'Your proposal has been sent to the homeowner. You can track its status in the "Applied Jobs" tab of your workspace.'
  )
}

/**
 * Application withdrawn successfully
 */
export function showApplicationWithdrawnToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Application withdrawn',
    'Your application has been cancelled. You can apply to other jobs from the Find Jobs section.'
  )
}

/**
 * Application approved (handyman perspective)
 */
export function showApplicationApprovedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Application accepted!',
    'The homeowner has accepted your proposal. Check your workspace to start working on this job.'
  )
}

/**
 * Application rejected (handyman perspective)
 */
export function showApplicationRejectedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Application not accepted',
    "The homeowner chose another handyman. Don't worry - there are more jobs available in the Find Jobs section."
  )
}

// ============================================
// APPLICATION MANAGEMENT TOASTS (Homeowner)
// ============================================

/**
 * Application approved (homeowner perspective)
 */
export function showApplicationApprovedHomeownerToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Handyman assigned',
    "You've successfully hired a handyman. Track progress and communicate with them in your workspace."
  )
}

/**
 * Application rejected (homeowner perspective)
 */
export function showApplicationRejectedHomeownerToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Application declined',
    "You've declined this proposal. You can review other applications or wait for more handymen to apply."
  )
}

// ============================================
// DIRECT OFFER TOASTS
// ============================================

/**
 * Direct offer sent successfully
 */
export function showDirectOfferSentToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Direct offer sent',
    "The handyman will be notified of your offer. You'll receive a notification when they respond."
  )
}

/**
 * Direct offer accepted (handyman perspective)
 */
export function showDirectOfferAcceptedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Offer accepted!',
    "You've accepted the direct offer. The job is now in your workspace - check it to get started."
  )
}

/**
 * Direct offer declined (handyman perspective)
 */
export function showDirectOfferDeclinedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Offer declined',
    "You've declined this direct offer. You can continue browsing other available jobs."
  )
}

// ============================================
// ONGOING WORK TOASTS
// ============================================

/**
 * Daily report submitted
 */
export function showReportSubmittedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Report submitted',
    'Your daily report has been sent to the homeowner. They can review your progress in the job dashboard.'
  )
}

/**
 * Reimbursement submitted
 */
export function showReimbursementSubmittedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Reimbursement requested',
    'Your expense request has been submitted. The homeowner will review and approve it soon.'
  )
}

/**
 * Reimbursement approved
 */
export function showReimbursementApprovedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Reimbursement approved',
    'Your expense request has been approved. The amount will be included in your final payment.'
  )
}

/**
 * Work session started
 */
export function showSessionStartedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Work session started',
    "Your work timer is now running. Don't forget to submit a daily report when you finish for the day."
  )
}

/**
 * Work session ended
 */
export function showSessionEndedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Work session ended',
    'Your work timer has stopped. Remember to submit your daily report to update the homeowner.'
  )
}

/**
 * Completion requested
 */
export function showCompletionRequestedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Completion requested',
    "You've marked this job as complete. The homeowner will review your work and confirm completion."
  )
}

/**
 * Job completed
 */
export function showJobCompletedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Job completed!',
    'Great work! The job has been marked as complete. Payment will be processed according to your agreement.'
  )
}

// ============================================
// REVIEW TOASTS
// ============================================

/**
 * Review submitted
 */
export function showReviewSubmittedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Review submitted',
    'Thank you for your feedback! Your review helps others make informed decisions.'
  )
}

// ============================================
// AUTH TOASTS
// ============================================

/**
 * Password reset email sent
 */
export function showPasswordResetSentToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Reset email sent',
    'Check your email for password reset instructions. The link will expire in 24 hours.'
  )
}

/**
 * Password updated
 */
export function showPasswordUpdatedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Password updated',
    'Your password has been changed successfully. Use your new password to log in next time.'
  )
}

/**
 * Phone verified
 */
export function showPhoneVerifiedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Phone verified',
    "Your phone number has been verified. You'll now receive important notifications via SMS."
  )
}

// ============================================
// PROFILE TOASTS
// ============================================

/**
 * Profile updated
 */
export function showProfileUpdatedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Profile updated',
    'Your profile changes have been saved. Other users will see your updated information.'
  )
}

// ============================================
// CHAT TOASTS
// ============================================

/**
 * Message sent
 */
export function showMessageSentToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Message sent',
    "Your message has been delivered. You'll be notified when they respond."
  )
}

// ============================================
// ERROR TOASTS
// ============================================

/**
 * Generic submission error
 */
export function showSubmissionErrorToast(toast: ToastController, details?: string) {
  showErrorToast(
    toast,
    'Submission failed',
    details || 'Something went wrong. Please check your connection and try again.'
  )
}

/**
 * Network error
 */
export function showNetworkErrorToast(toast: ToastController) {
  showErrorToast(
    toast,
    'Connection error',
    'Unable to connect to the server. Please check your internet connection and try again.'
  )
}

/**
 * Validation error
 */
export function showValidationErrorToast(toast: ToastController, field?: string) {
  showErrorToast(
    toast,
    'Validation error',
    field
      ? `Please check the ${field} field and try again.`
      : 'Please check all required fields and try again.'
  )
}
