'use client'

import { useEffect } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { useToastController } from '@tamagui/toast'
import {
  showApplicationSubmittedToast,
  showApplicationWithdrawnToast,
  showApplicationApprovedToast,
  showApplicationRejectedToast,
  showDirectOfferSentToast,
  showDirectOfferAcceptedToast,
  showDirectOfferDeclinedToast,
  showReportSubmittedToast,
  showReimbursementSubmittedToast,
  showReimbursementApprovedToast,
  showJobCompletedToast,
  showReviewSubmittedToast,
  showPasswordUpdatedToast,
  showPhoneVerifiedToast,
  showProfileUpdatedToast,
  showMessageSentToast,
  showJobCreatedToast,
  showJobUpdatedToast,
  showJobDeletedToast,
} from 'app/utils/toast-messages'

export type ToastType =
  | 'application-submitted'
  | 'application-withdrawn'
  | 'application-approved'
  | 'application-rejected'
  | 'direct-offer-sent'
  | 'direct-offer-accepted'
  | 'direct-offer-declined'
  | 'report-submitted'
  | 'reimbursement-submitted'
  | 'reimbursement-approved'
  | 'job-completed'
  | 'review-submitted'
  | 'password-updated'
  | 'phone-verified'
  | 'profile-updated'
  | 'message-sent'
  | 'job-created'
  | 'job-updated'
  | 'job-deleted'

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
      case 'direct-offer-sent':
        showDirectOfferSentToast(toast)
        break
      case 'direct-offer-accepted':
        showDirectOfferAcceptedToast(toast)
        break
      case 'direct-offer-declined':
        showDirectOfferDeclinedToast(toast)
        break
      case 'report-submitted':
        showReportSubmittedToast(toast)
        break
      case 'reimbursement-submitted':
        showReimbursementSubmittedToast(toast)
        break
      case 'reimbursement-approved':
        showReimbursementApprovedToast(toast)
        break
      case 'job-completed':
        showJobCompletedToast(toast)
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
    }
  }, [params.toast, toast])
}
