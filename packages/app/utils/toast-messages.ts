/**
 * Toast message utilities with helpful navigation hints and Lucide icons
 * These messages guide users on what to do next after completing an action
 */

// Toast variant types
export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

// Toast icon types (Lucide icon names)
export type ToastIcon =
  | 'CheckCircle2'
  | 'Pencil'
  | 'Trash2'
  | 'Send'
  | 'XCircle'
  | 'Globe'
  | 'UserCheck'
  | 'UserX'
  | 'FileCheck'
  | 'FileX'
  | 'DollarSign'
  | 'X'
  | 'Award'
  | 'AlertTriangle'
  | 'User'
  | 'WifiOff'
  | 'AlertCircle'
  | 'FormInput'
  | 'Upload'
  | 'Loader'
  | 'Lock'
  | 'Timer'
  | 'RefreshCw'
  | 'Briefcase'
  | 'MessageCircle'
  | 'Info'
  | 'Sparkles'
  | 'Paperclip'
  | 'BarChart'
  | 'Target'
  | 'Users'
  | 'Play'
  | 'Square'
  | 'MapPin'
  | 'FileText'
  | 'Clock'
  | 'Trophy'
  | 'Receipt'

// Toast controller interface (returned by useToastController)
interface ToastController {
  show: (
    title: string,
    options?: {
      message?: string
      duration?: number
      native?: boolean
      customData?: { variant?: ToastVariant; icon?: ToastIcon }
    }
  ) => void
}

// Toast options interface
interface ToastOptions {
  duration?: number
  native?: boolean
  variant?: ToastVariant
  icon?: ToastIcon
}

// Default toast durations
const DURATIONS = {
  short: 3000,
  medium: 4000,
  long: 5000, // 5 seconds - enough time to read helpful messages
  extraLong: 6000, // 6 seconds for errors with details
} as const

/**
 * Show a success toast with helpful next steps and icon
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
    customData: {
      variant: options.variant || 'success',
      icon: options.icon,
    },
  })
}

/**
 * Show an error toast with guidance and icon
 */
export function showErrorToast(
  toast: ToastController,
  title: string,
  message: string,
  options: ToastOptions = {}
) {
  toast.show(title, {
    message,
    duration: options.duration || DURATIONS.extraLong,
    native: options.native ?? false,
    customData: {
      variant: options.variant || 'error',
      icon: options.icon,
    },
  })
}

// ============================================
// JOB MANAGEMENT TOASTS (Homeowner)
// ============================================

/**
 * Job created successfully
 * Icon: CheckCircle2
 */
export function showJobCreatedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Job published!',
    'Your job is now live and visible to handymen. Check Job Management to review applications.',
    { icon: 'CheckCircle2', duration: DURATIONS.long }
  )
}

/**
 * Job updated successfully
 * Icon: Pencil
 */
export function showJobUpdatedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Changes saved!',
    'Your job has been updated. Handymen will see the latest information.',
    { icon: 'Pencil' }
  )
}

/**
 * Job deleted successfully
 * Icon: Trash2
 */
export function showJobDeletedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Job removed',
    'The job has been deleted. Create a new one anytime from your workspace.',
    { icon: 'Trash2' }
  )
}

// ============================================
// APPLICATION TOASTS (Handyman)
// ============================================

/**
 * Application submitted successfully
 * Icon: Send
 */
export function showApplicationSubmittedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Application submitted',
    'Your proposal has been sent to the homeowner. You can track its status in the "Applied Jobs" tab of your workspace.',
    { icon: 'Send' }
  )
}

/**
 * Application withdrawn successfully
 * Icon: XCircle
 */
export function showApplicationWithdrawnToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Application withdrawn',
    'Your application has been cancelled. You can apply to other jobs from the Find Jobs section.',
    { icon: 'XCircle' }
  )
}

/**
 * Application approved (handyman perspective)
 * Icon: UserCheck
 */
export function showApplicationApprovedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Application accepted!',
    'The homeowner has accepted your proposal. Check your workspace to start working on this job.',
    { icon: 'UserCheck', duration: DURATIONS.long }
  )
}

/**
 * Application rejected (handyman perspective)
 * Icon: UserX
 */
export function showApplicationRejectedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Application not accepted',
    "The homeowner chose another handyman. Don't worry - there are more jobs available in the Find Jobs section.",
    { icon: 'UserX' }
  )
}

// ============================================
// APPLICATION MANAGEMENT TOASTS (Homeowner)
// ============================================

/**
 * Application approved (homeowner perspective)
 * Icon: UserCheck
 */
export function showApplicationApprovedHomeownerToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Handyman assigned',
    "You've successfully hired a handyman. Track progress and communicate with them in your workspace.",
    { icon: 'UserCheck', duration: DURATIONS.long }
  )
}

/**
 * Application rejected (homeowner perspective)
 * Icon: UserX
 */
export function showApplicationRejectedHomeownerToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Application declined',
    "You've declined this proposal. You can review other applications or wait for more handymen to apply.",
    { icon: 'UserX' }
  )
}

// ============================================
// DIRECT OFFER TOASTS
// ============================================

/**
 * Direct offer sent successfully
 * Icon: Send
 */
export function showDirectOfferSentToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Offer sent!',
    'The handyman has been notified. Check Direct Offers tab to see their response.',
    { icon: 'Send', duration: DURATIONS.long }
  )
}

/**
 * Direct offer accepted (handyman perspective)
 * Icon: UserCheck
 */
export function showDirectOfferAcceptedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Offer accepted!',
    "You've accepted the direct offer. The job is now in your workspace - check it to get started.",
    { icon: 'UserCheck', duration: DURATIONS.long }
  )
}

/**
 * Direct offer declined (handyman perspective)
 * Icon: XCircle
 */
export function showDirectOfferDeclinedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Offer declined',
    "You've declined this direct offer. You can continue browsing other available jobs.",
    { icon: 'XCircle' }
  )
}

/**
 * Direct offer cancelled (homeowner perspective)
 * Icon: XCircle
 */
export function showDirectOfferCancelledToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Offer cancelled',
    'The direct offer has been cancelled. You can send a new offer or post a public job.',
    { icon: 'XCircle' }
  )
}

/**
 * Job converted to public (homeowner perspective)
 * Icon: Globe
 */
export function showJobConvertedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Converted to public job',
    'Your job is now visible to all handymen. Check your Job Management to see applications.',
    { icon: 'Globe', duration: DURATIONS.long }
  )
}

// ============================================
// ONGOING WORK TOASTS
// ============================================

/**
 * Daily report submitted
 * Icon: FileCheck
 */
export function showReportSubmittedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Report submitted',
    'Your daily report has been sent to the homeowner. They can review your progress in the job dashboard.',
    { icon: 'FileCheck' }
  )
}

/**
 * Daily report approved
 * Icon: FileCheck
 */
export function showReportApprovedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Report approved',
    "The handyman's work progress has been confirmed. They can continue with the next tasks.",
    { icon: 'FileCheck' }
  )
}

/**
 * Daily report rejected
 * Icon: FileX
 */
export function showReportRejectedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Report rejected',
    "You've requested changes to the report. The handyman will be notified to update it.",
    { icon: 'FileX' }
  )
}

/**
 * Reimbursement submitted
 * Icon: DollarSign
 */
export function showReimbursementSubmittedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Reimbursement requested',
    'Your expense request has been submitted. The homeowner will review and approve it soon.',
    { icon: 'DollarSign' }
  )
}

/**
 * Reimbursement approved
 * Icon: DollarSign
 */
export function showReimbursementApprovedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Reimbursement approved',
    'Your expense request has been approved. The amount will be included in your final payment.',
    { icon: 'DollarSign' }
  )
}

/**
 * Reimbursement rejected
 * Icon: X
 */
export function showReimbursementRejectedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Reimbursement declined',
    'The expense request has been declined. The handyman will be notified.',
    { icon: 'X' }
  )
}

/**
 * Work session started
 * Icon: Timer
 */
export function showSessionStartedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Work session started',
    "Your work timer is now running. Don't forget to submit a daily report when you finish for the day.",
    { icon: 'Timer' }
  )
}

/**
 * Work session ended
 * Icon: Timer
 */
export function showSessionEndedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Work session ended',
    'Your work timer has stopped. Remember to submit your daily report to update the homeowner.',
    { icon: 'Timer' }
  )
}

/**
 * Completion requested
 * Icon: CheckCircle2
 */
export function showCompletionRequestedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Completion requested',
    "You've marked this job as complete. The homeowner will review your work and confirm completion.",
    { icon: 'CheckCircle2' }
  )
}

/**
 * Job completed
 * Icon: Award
 */
export function showJobCompletedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Job completed!',
    'Great work! The job has been marked as complete. Payment will be processed according to your agreement.',
    { icon: 'Award', duration: DURATIONS.long }
  )
}

/**
 * Job completion rejected
 * Icon: X
 */
export function showCompletionRejectedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Completion rejected',
    "You've requested additional work. The handyman will be notified to continue.",
    { icon: 'X' }
  )
}

// ============================================
// DISPUTE TOASTS
// ============================================

/**
 * Dispute created
 * Icon: AlertTriangle
 */
export function showDisputeCreatedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Dispute submitted',
    'Our support team will review your case and contact you within 24 hours.',
    { icon: 'AlertTriangle', duration: DURATIONS.long }
  )
}

// ============================================
// REVIEW TOASTS
// ============================================

/**
 * Review submitted
 * Icon: Award
 */
export function showReviewSubmittedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Review submitted',
    'Thank you for your feedback! Your review helps others make informed decisions.',
    { icon: 'Award' }
  )
}

// ============================================
// AUTH TOASTS
// ============================================

/**
 * Password reset email sent
 * Icon: Send
 */
export function showPasswordResetSentToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Reset email sent',
    'Check your email for password reset instructions. The link will expire in 24 hours.',
    { icon: 'Send', duration: DURATIONS.long }
  )
}

/**
 * Password updated
 * Icon: CheckCircle2
 */
export function showPasswordUpdatedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Password updated',
    'Your password has been changed successfully. Use your new password to log in next time.',
    { icon: 'CheckCircle2' }
  )
}

/**
 * Phone verified
 * Icon: CheckCircle2
 */
export function showPhoneVerifiedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Phone verified',
    "Your phone number has been verified. You'll now receive important notifications via SMS.",
    { icon: 'CheckCircle2' }
  )
}

/**
 * Session expired
 * Icon: Lock
 */
export function showSessionExpiredToast(toast: ToastController) {
  showErrorToast(
    toast,
    'Session expired',
    'Your session has expired. Please log in again to continue.',
    { icon: 'Lock', duration: DURATIONS.long }
  )
}

// ============================================
// PROFILE TOASTS
// ============================================

/**
 * Profile updated
 * Icon: User
 */
export function showProfileUpdatedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Profile updated',
    'Your profile changes have been saved. Other users will see your updated information.',
    { icon: 'User' }
  )
}

// ============================================
// CHAT TOASTS
// ============================================

/**
 * Message sent
 * Icon: MessageCircle
 */
export function showMessageSentToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Message sent',
    "Your message has been delivered. You'll be notified when they respond.",
    { icon: 'MessageCircle' }
  )
}

// ============================================
// UPLOAD TOASTS
// ============================================

/**
 * Upload in progress
 * Icon: Upload or Loader
 */
export function showUploadProgressToast(toast: ToastController, progress: number) {
  toast.show('Uploading...', {
    message: `Uploading attachment... ${progress}%`,
    duration: DURATIONS.short,
    native: false,
    customData: { variant: 'info', icon: progress < 100 ? 'Upload' : 'Loader' },
  })
}

/**
 * Upload complete
 * Icon: CheckCircle2
 */
export function showUploadCompleteToast(toast: ToastController) {
  showSuccessToast(toast, 'Upload complete', 'Your file has been uploaded successfully.', {
    icon: 'CheckCircle2',
  })
}

// ============================================
// NETWORK TOASTS
// ============================================

/**
 * Network error
 * Icon: WifiOff
 */
export function showNetworkErrorToast(toast: ToastController) {
  showErrorToast(
    toast,
    'Connection error',
    'Unable to connect to the server. Please check your internet connection and try again.',
    { icon: 'WifiOff', duration: DURATIONS.long }
  )
}

/**
 * Rate limit error
 * Icon: Timer
 */
export function showRateLimitToast(toast: ToastController, seconds?: number) {
  showErrorToast(
    toast,
    'Please wait',
    seconds
      ? `Please wait ${seconds} seconds before trying again.`
      : 'Please wait a moment before trying again.',
    { icon: 'Timer' }
  )
}

/**
 * Back online
 * Icon: RefreshCw
 */
export function showBackOnlineToast(toast: ToastController, changesCount?: number) {
  showSuccessToast(
    toast,
    'Back online',
    changesCount
      ? `Connected! Synced ${changesCount} changes.`
      : 'Back online! Your changes have been synced.',
    { icon: 'RefreshCw' }
  )
}

/**
 * Offline mode
 * Icon: WifiOff
 */
export function showOfflineToast(toast: ToastController) {
  showErrorToast(
    toast,
    "You're offline",
    "Changes will be saved locally and synced when you're back online.",
    { icon: 'WifiOff', duration: DURATIONS.long }
  )
}

// ============================================
// ERROR TOASTS
// ============================================

/**
 * Generic submission error
 * Icon: AlertCircle
 */
export function showSubmissionErrorToast(toast: ToastController, details?: string) {
  showErrorToast(
    toast,
    'Submission failed',
    details || 'Something went wrong. Please check your connection and try again.',
    { icon: 'AlertCircle' }
  )
}

/**
 * Validation error
 * Icon: FormInput
 */
export function showValidationErrorToast(toast: ToastController, field?: string) {
  showErrorToast(
    toast,
    'Validation error',
    field
      ? `Please check the ${field} field and try again.`
      : 'Please check all required fields and try again.',
    { icon: 'FormInput' }
  )
}

/**
 * Job status changed
 * Icon: Briefcase
 */
export function showJobStatusChangedToast(toast: ToastController) {
  showSuccessToast(
    toast,
    'Job updated',
    "This job's status has changed. Refreshing to show the latest information.",
    { icon: 'Briefcase' }
  )
}

/**
 * Already applied
 * Icon: Info
 */
export function showAlreadyAppliedToast(toast: ToastController) {
  showErrorToast(
    toast,
    'Already applied',
    "You've already submitted an application for this job. Check your workspace for status updates.",
    { icon: 'Info' }
  )
}

/**
 * Offer expired
 * Icon: Timer
 */
export function showOfferExpiredToast(toast: ToastController) {
  showErrorToast(
    toast,
    'Offer expired',
    'This offer has expired and can no longer be modified. You can create a new offer or post a public job.',
    { icon: 'Timer', duration: DURATIONS.long }
  )
}

/**
 * Partial upload success
 * Icon: AlertCircle
 */
export function showPartialUploadToast(toast: ToastController, failedCount: number) {
  showErrorToast(
    toast,
    'Partial upload',
    `Job created, but ${failedCount} attachment${failedCount > 1 ? 's' : ''} failed to upload. You can try uploading again from the job details.`,
    { icon: 'AlertCircle', duration: DURATIONS.long }
  )
}

// ============================================
// ONBOARDING TOASTS (First-time user guidance)
// ============================================

/**
 * Welcome onboarding toast
 * Icon: Sparkles
 */
export function showWelcomeOnboardingToast(toast: ToastController) {
  toast.show('Welcome!', {
    message: 'Post a job to connect with skilled handymen',
    duration: 3500,
    native: false,
    customData: { variant: 'info', icon: 'Sparkles' },
  })
}

/**
 * Create job onboarding toast
 * Icon: Paperclip
 */
export function showCreateJobOnboardingToast(toast: ToastController) {
  toast.show('Pro tip', {
    message: 'Add photos and tasks for accurate quotes',
    duration: 3500,
    native: false,
    customData: { variant: 'info', icon: 'Paperclip' },
  })
}

/**
 * Applications onboarding toast
 * Icon: MessageCircle
 */
export function showApplicationsOnboardingToast(toast: ToastController) {
  toast.show('Compare applicants', {
    message: 'Check ratings and chat before hiring',
    duration: 3500,
    native: false,
    customData: { variant: 'info', icon: 'MessageCircle' },
  })
}

/**
 * Ongoing job onboarding toast
 * Icon: BarChart
 */
export function showOngoingJobOnboardingToast(toast: ToastController) {
  toast.show('Track progress', {
    message: 'Review daily reports and approve completed work',
    duration: 3500,
    native: false,
    customData: { variant: 'info', icon: 'BarChart' },
  })
}

/**
 * Direct offer onboarding toast
 * Icon: Target
 */
export function showDirectOfferOnboardingToast(toast: ToastController) {
  toast.show('Found a pro?', {
    message: 'Send direct offers to pros you like',
    duration: 3500,
    native: false,
    customData: { variant: 'info', icon: 'Target' },
  })
}

// ============================================
// NOTIFICATION TOASTS (Real-time updates)
// ============================================

/**
 * New daily report submitted notification
 * Icon: FileText
 */
export function showNewReportToast(toast: ToastController) {
  toast.show('New report submitted', {
    message: 'Handyman submitted a daily report - tap to review',
    duration: 4000,
    native: false,
    customData: { variant: 'info', icon: 'FileText' },
  })
}

/**
 * New reimbursement request notification
 * Icon: DollarSign
 */
export function showNewReimbursementToast(toast: ToastController) {
  toast.show('New expense request', {
    message: 'Handyman submitted a reimbursement request',
    duration: 4000,
    native: false,
    customData: { variant: 'info', icon: 'DollarSign' },
  })
}

/**
 * Job completion requested notification
 * Icon: CheckCircle2
 */
export function showCompletionRequestedNotificationToast(toast: ToastController) {
  toast.show('Job completion requested', {
    message: 'Handyman marked job as complete - review their work',
    duration: 4000,
    native: false,
    customData: { variant: 'info', icon: 'CheckCircle2' },
  })
}

/**
 * Direct offer accepted notification
 * Icon: UserCheck
 */
export function showOfferAcceptedToast(toast: ToastController, handymanName: string) {
  toast.show('Offer accepted!', {
    message: `Great news! ${handymanName} accepted your offer`,
    duration: 5000,
    native: false,
    customData: { variant: 'success', icon: 'UserCheck' },
  })
}

/**
 * Direct offer declined notification
 * Icon: XCircle
 */
export function showOfferDeclinedToast(toast: ToastController, handymanName: string) {
  toast.show('Offer declined', {
    message: `${handymanName} declined your offer - try posting publicly`,
    duration: 5000,
    native: false,
    customData: { variant: 'warning', icon: 'XCircle' },
  })
}

/**
 * No applicants after 48h notification
 * Icon: Users
 */
export function showNoApplicantsToast(toast: ToastController) {
  toast.show('No applicants yet?', {
    message: 'Try increasing your budget or adding more details',
    duration: 5000,
    native: false,
    customData: { variant: 'info', icon: 'Users' },
  })
}

// ============================================
// HANDYMAN WORK SESSION TOASTS
// ============================================

export function showWorkSessionStartedToast(toast: ToastController) {
  toast.show('Work session started', {
    message: 'Timer is running. Submit a daily report when done.',
    duration: 4000,
    native: false,
    customData: { variant: 'success', icon: 'Play' },
  })
}

export function showWorkSessionStoppedToast(toast: ToastController, hours: number) {
  toast.show('Work session stopped', {
    message: `Total today: ${hours} hours. Submit your daily report now.`,
    duration: 5000,
    native: false,
    customData: { variant: 'info', icon: 'Square' },
  })
}

export function showLocationPermissionDeniedToast(toast: ToastController) {
  toast.show('Location access required', {
    message: 'Enable location to track work sessions in Settings > Privacy > Location.',
    duration: 6000,
    native: false,
    customData: { variant: 'warning', icon: 'MapPin' },
  })
}

// ============================================
// HANDYMAN REPORT TOASTS
// ============================================

export function showHandymanReportSubmittedToast(toast: ToastController) {
  toast.show('Report submitted', {
    message: 'Status: Pending approval. You will be notified when reviewed.',
    duration: 4000,
    native: false,
    customData: { variant: 'success', icon: 'FileText' },
  })
}

export function showHandymanReportRejectedToast(toast: ToastController) {
  toast.show('Report needs revision', {
    message: 'Tap to view feedback and update your report.',
    duration: 6000,
    native: false,
    customData: { variant: 'error', icon: 'AlertCircle' },
  })
}

export function showHandymanReportApprovedToast(toast: ToastController) {
  toast.show('Report approved', {
    message: 'Great! Your work is confirmed. Continue with remaining tasks.',
    duration: 4000,
    native: false,
    customData: { variant: 'success', icon: 'CheckCircle2' },
  })
}

export function showEndOfDayReminderToast(toast: ToastController, hours: number) {
  toast.show("Don't forget your report", {
    message: `You worked ${hours} hours today but haven't submitted a report yet.`,
    duration: 5000,
    native: false,
    customData: { variant: 'warning', icon: 'Clock' },
  })
}

// ============================================
// HANDYMAN REIMBURSEMENT TOASTS
// ============================================

export function showHandymanReimbursementSubmittedToast(toast: ToastController) {
  toast.show('Expense request submitted', {
    message: 'Status: Pending approval',
    duration: 4000,
    native: false,
    customData: { variant: 'success', icon: 'DollarSign' },
  })
}

export function showHandymanReimbursementApprovedToast(toast: ToastController) {
  toast.show('Expense approved', {
    message: 'This amount will be added to your final payment.',
    duration: 5000,
    native: false,
    customData: { variant: 'success', icon: 'DollarSign' },
  })
}

export function showHandymanReimbursementRejectedToast(toast: ToastController) {
  toast.show('Expense declined', {
    message: 'Tap to view reason and resubmit if needed.',
    duration: 5000,
    native: false,
    customData: { variant: 'error', icon: 'XCircle' },
  })
}

// ============================================
// HANDYMAN JOB COMPLETION TOASTS
// ============================================

export function showHandymanCompletionRequestedToast(toast: ToastController) {
  toast.show('Completion requested', {
    message: 'Homeowner will review your work. Check Active Jobs for status.',
    duration: 5000,
    native: false,
    customData: { variant: 'info', icon: 'Award' },
  })
}

export function showHandymanJobCompletedToast(toast: ToastController) {
  toast.show('Job completed successfully!', {
    message: 'Payment will be processed within 3-5 business days.',
    duration: 6000,
    native: false,
    customData: { variant: 'success', icon: 'Trophy' },
  })
}

export function showHandymanCompletionRejectedToast(toast: ToastController) {
  toast.show('Additional work requested', {
    message: 'Tap to view details and continue with the job.',
    duration: 5000,
    native: false,
    customData: { variant: 'warning', icon: 'AlertTriangle' },
  })
}

// ============================================
// HANDYMAN DIRECT OFFER TOASTS
// ============================================

export function showNewDirectOfferToast(toast: ToastController, homeownerName: string) {
  toast.show('New direct offer!', {
    message: `${homeownerName} wants to hire you. Check your offers.`,
    duration: 5000,
    native: false,
    customData: { variant: 'info', icon: 'Target' },
  })
}

export function showDirectOfferAcceptedByYouToast(toast: ToastController) {
  toast.show('Offer accepted - Job started!', {
    message: "You've accepted the offer. The job is now active in your dashboard.",
    duration: 5000,
    native: false,
    customData: { variant: 'success', icon: 'CheckCircle2' },
  })
}

export function showDirectOfferDeclinedByYouToast(toast: ToastController) {
  toast.show('Offer declined', {
    message: 'You declined the offer. Browse other available jobs.',
    duration: 4000,
    native: false,
    customData: { variant: 'info', icon: 'XCircle' },
  })
}

export function showDirectOfferExpiringSoonToast(toast: ToastController, homeownerName: string) {
  toast.show('Offer expires tomorrow', {
    message: `Your offer from ${homeownerName} expires in 24 hours.`,
    duration: 5000,
    native: false,
    customData: { variant: 'warning', icon: 'Timer' },
  })
}

// ============================================
// HANDYMAN TASK PROGRESS TOASTS
// ============================================

export function showTaskCompletedToast(
  toast: ToastController,
  taskNumber: number,
  totalTasks: number
) {
  toast.show(`Task completed`, {
    message: `${taskNumber} of ${totalTasks} tasks done. Keep up the good work!`,
    duration: 3500,
    native: false,
    customData: { variant: 'success', icon: 'CheckCircle2' },
  })
}

export function showAllTasksCompleteToast(toast: ToastController) {
  toast.show('All tasks completed!', {
    message: "You've finished all tasks. Ready to request job completion?",
    duration: 5000,
    native: false,
    customData: { variant: 'success', icon: 'Trophy' },
  })
}

// ============================================
// HANDYMAN ERROR & RECOVERY TOASTS
// ============================================

export function showSessionTooShortToast(toast: ToastController) {
  toast.show('Session too short', {
    message: 'Minimum session is 15 minutes. Your session was not recorded.',
    duration: 4000,
    native: false,
    customData: { variant: 'warning', icon: 'Timer' },
  })
}

// ============================================
// HANDYMAN ONBOARDING TOASTS (Essential)
// ============================================

export function showHandymanActiveJobOnboardingToast(toast: ToastController) {
  toast.show('Your work hub', {
    message: 'Track sessions, submit reports, and request reimbursements here',
    duration: 4500,
    native: false,
    customData: { variant: 'info', icon: 'Briefcase' },
  })
}

export function showHandymanSessionOnboardingToast(toast: ToastController) {
  toast.show('Starting your work session', {
    message: 'Allow location access and take a photo to track your time',
    duration: 5000,
    native: false,
    customData: { variant: 'info', icon: 'Play' },
  })
}

export function showHandymanReportOnboardingToast(toast: ToastController) {
  toast.show('Submitting your daily report', {
    message: 'Include work summary and completed tasks. Auto-approved after 3 days',
    duration: 5000,
    native: false,
    customData: { variant: 'info', icon: 'FileText' },
  })
}

export function showHandymanReimbursementOnboardingToast(toast: ToastController) {
  toast.show('Requesting expense reimbursement', {
    message: 'Receipts or proof of purchase are required. Upload at least one document',
    duration: 5000,
    native: false,
    customData: { variant: 'info', icon: 'Receipt' },
  })
}
