'use client'

import { useEffect } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { useToastController } from '@tamagui/toast'
import {
  showApplicationSubmittedToast,
  showApplicationWithdrawnToast,
  showApplicationApprovedToast,
  showApplicationRejectedToast,
  showApplicationApprovedHomeownerToast,
  showApplicationRejectedHomeownerToast,
  showDirectOfferSentToast,
  showDirectOfferAcceptedToast,
  showDirectOfferDeclinedToast,
  showDirectOfferCancelledToast,
  showJobConvertedToast,
  showReportSubmittedToast,
  showReportApprovedToast,
  showReportRejectedToast,
  showReimbursementSubmittedToast,
  showReimbursementApprovedToast,
  showReimbursementRejectedToast,
  showJobCompletedToast,
  showCompletionRejectedToast,
  showReviewSubmittedToast,
  showPasswordUpdatedToast,
  showPhoneVerifiedToast,
  showProfileUpdatedToast,
  showMessageSentToast,
  showJobCreatedToast,
  showJobUpdatedToast,
  showJobDeletedToast,
  showDisputeCreatedToast,
} from 'app/utils/toast-messages'

export type ToastType =
  | 'application-submitted'
  | 'application-withdrawn'
  | 'application-approved'
  | 'application-rejected'
  | 'application-approved-homeowner'
  | 'application-rejected-homeowner'
  | 'direct-offer-sent'
  | 'direct-offer-accepted'
  | 'direct-offer-declined'
  | 'direct-offer-cancelled'
  | 'job-converted'
  | 'report-submitted'
  | 'report-approved'
  | 'report-rejected'
  | 'reimbursement-submitted'
  | 'reimbursement-approved'
  | 'reimbursement-rejected'
  | 'job-completed'
  | 'completion-rejected'
  | 'review-submitted'
  | 'password-updated'
  | 'phone-verified'
  | 'profile-updated'
  | 'message-sent'
  | 'job-created'
  | 'job-updated'
  | 'job-deleted'
  | 'dispute-created'

/**
 * Hook to show toast based on URL params
 * Use this in destination screens to show toast after navigation
 *
 * Example usage:
 * // In source screen:
 * router.replace({
 *   pathname: '/(handyman)/my-jobs',
 *   params: { toast: 'application-submitted' }
 * })
 *
 * // In destination screen:
 * useToastFromParams()
 */
export function useToastFromParams() {
  const params = useLocalSearchParams<{ toast?: ToastType }>()
  const toast = useToastController()

  useEffect(() => {
    if (!params.toast) return

    // Show toast based on type
    switch (params.toast) {
      case 'application-submitted':
        showApplicationSubmittedToast(toast)
        break
      case 'application-withdrawn':
        showApplicationWithdrawnToast(toast)
        break
      case 'application-approved':
        showApplicationApprovedToast(toast)
        break
      case 'application-rejected':
        showApplicationRejectedToast(toast)
        break
      case 'application-approved-homeowner':
        showApplicationApprovedHomeownerToast(toast)
        break
      case 'application-rejected-homeowner':
        showApplicationRejectedHomeownerToast(toast)
        break
      case 'direct-offer-sent':
        showDirectOfferSentToast(toast)
        break
      case 'direct-offer-accepted':
        showDirectOfferAcceptedToast(toast)
        break
      case 'direct-offer-declined':
        showDirectOfferDeclinedToast(toast)
        break
      case 'direct-offer-cancelled':
        showDirectOfferCancelledToast(toast)
        break
      case 'job-converted':
        showJobConvertedToast(toast)
        break
      case 'report-submitted':
        showReportSubmittedToast(toast)
        break
      case 'report-approved':
        showReportApprovedToast(toast)
        break
      case 'report-rejected':
        showReportRejectedToast(toast)
        break
      case 'reimbursement-submitted':
        showReimbursementSubmittedToast(toast)
        break
      case 'reimbursement-approved':
        showReimbursementApprovedToast(toast)
        break
      case 'reimbursement-rejected':
        showReimbursementRejectedToast(toast)
        break
      case 'job-completed':
        showJobCompletedToast(toast)
        break
      case 'completion-rejected':
        showCompletionRejectedToast(toast)
        break
      case 'review-submitted':
        showReviewSubmittedToast(toast)
        break
      case 'password-updated':
        showPasswordUpdatedToast(toast)
        break
      case 'phone-verified':
        showPhoneVerifiedToast(toast)
        break
      case 'profile-updated':
        showProfileUpdatedToast(toast)
        break
      case 'message-sent':
        showMessageSentToast(toast)
        break
      case 'job-created':
        showJobCreatedToast(toast)
        break
      case 'job-updated':
        showJobUpdatedToast(toast)
        break
      case 'job-deleted':
        showJobDeletedToast(toast)
        break
      case 'dispute-created':
        showDisputeCreatedToast(toast)
        break
    }
  }, [params.toast, toast])
}
