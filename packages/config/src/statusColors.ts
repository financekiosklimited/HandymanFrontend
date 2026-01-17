import { colors } from './tokens'

// Job status colors - centralized for reuse across the app
export type JobStatus =
  | 'draft'
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'pending_completion'
  | 'completed'
  | 'cancelled'

export type StatusColorConfig = {
  bg: string
  text: string
}

export const jobStatusColors: Record<JobStatus, StatusColorConfig> = {
  draft: { bg: '$backgroundMuted', text: '$colorMuted' },
  open: { bg: '$successBackground', text: '$success' },
  assigned: { bg: '$infoBackground', text: '$info' },
  in_progress: { bg: '$warningBackground', text: '$warning' },
  pending_completion: { bg: '$warningBackground', text: '$warning' },
  completed: { bg: '$successBackground', text: '$success' },
  cancelled: { bg: '$errorBackground', text: '$error' },
}

// Application status colors
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn'

export type ApplicationStatusColorConfig = {
  bg: string
  text: string
  label: string
}

export const applicationStatusColors: Record<ApplicationStatus, ApplicationStatusColorConfig> = {
  pending: {
    bg: '$warningBackground',
    text: '$warning',
    label: 'Pending Review',
  },
  approved: {
    bg: '$successBackground',
    text: '$success',
    label: 'Approved',
  },
  rejected: {
    bg: '$errorBackground',
    text: '$error',
    label: 'Rejected',
  },
  withdrawn: {
    bg: '$backgroundMuted',
    text: '$colorMuted',
    label: 'Withdrawn',
  },
}

// Helper function to get job status color
export const getJobStatusColor = (status: JobStatus): StatusColorConfig => {
  return jobStatusColors[status] || jobStatusColors.draft
}

// Helper function to get application status color
export const getApplicationStatusColor = (
  status: ApplicationStatus
): ApplicationStatusColorConfig => {
  return applicationStatusColors[status] || applicationStatusColors.pending
}

// ========== Direct Offer Status Colors ==========

export type DirectOfferStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'cancelled'
  | 'converted'

export type DirectOfferStatusColorConfig = {
  bg: string
  text: string
  label: string
}

export const directOfferStatusColors: Record<DirectOfferStatus, DirectOfferStatusColorConfig> = {
  pending: {
    bg: '$warningBackground',
    text: '$warning',
    label: 'Pending',
  },
  accepted: {
    bg: '$successBackground',
    text: '$success',
    label: 'Accepted',
  },
  rejected: {
    bg: '$errorBackground',
    text: '$error',
    label: 'Rejected',
  },
  expired: {
    bg: '$backgroundMuted',
    text: '$colorMuted',
    label: 'Expired',
  },
  cancelled: {
    bg: '$backgroundMuted',
    text: '$colorMuted',
    label: 'Cancelled',
  },
  converted: {
    bg: '$infoBackground',
    text: '$info',
    label: 'Converted to Job',
  },
}

// Helper function to get direct offer status color
export const getDirectOfferStatusColor = (
  status: DirectOfferStatus
): DirectOfferStatusColorConfig => {
  return directOfferStatusColors[status] || directOfferStatusColors.pending
}

// ========== Time Urgency Colors ==========

export type TimeUrgency = 'expired' | 'urgent' | 'warning' | 'normal'

export type TimeUrgencyColorConfig = {
  bg: string
  text: string
}

export const timeUrgencyColors: Record<TimeUrgency, TimeUrgencyColorConfig> = {
  expired: {
    bg: '$backgroundMuted',
    text: '$colorMuted',
  },
  urgent: {
    bg: '$errorBackground',
    text: '$error',
  },
  warning: {
    bg: '$warningBackground',
    text: '$warning',
  },
  normal: {
    bg: '$successBackground',
    text: '$success',
  },
}

// Helper function to get time urgency color
export const getTimeUrgencyColor = (urgency: TimeUrgency): TimeUrgencyColorConfig => {
  return timeUrgencyColors[urgency] || timeUrgencyColors.normal
}
