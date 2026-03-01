import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type { ApiResponse, PaymentAuthorization, PaymentStatus } from '../../types'

/**
 * Hook to authorize payment for a job application.
 * Returns a client_secret for the Stripe PaymentSheet.
 */
export function useAuthorizeApplicationPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (applicationPublicId: string) => {
      const response = await apiClient
        .post(`homeowner/applications/${applicationPublicId}/payment-authorization/`)
        .json<ApiResponse<PaymentAuthorization>>()
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'applications'] })
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'jobs'] })
    },
  })
}

/**
 * Hook to authorize payment for a direct offer.
 * Returns a client_secret for the Stripe PaymentSheet.
 */
export function useAuthorizeDirectOfferPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (directOfferPublicId: string) => {
      const response = await apiClient
        .post(`homeowner/direct-offers/${directOfferPublicId}/payment-authorization/`)
        .json<ApiResponse<PaymentAuthorization>>()
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'direct-offers'] })
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'jobs'] })
    },
  })
}

/**
 * Hook to fetch the payment status for a specific job.
 */
export function useJobPaymentStatus(jobPublicId: string, enabled = true) {
  return useQuery({
    queryKey: ['homeowner', 'jobs', jobPublicId, 'payment-status'],
    queryFn: async () => {
      const response = await apiClient
        .get(`homeowner/jobs/${jobPublicId}/payment-status/`)
        .json<ApiResponse<PaymentStatus>>()
      return response.data
    },
    enabled: !!jobPublicId && enabled,
    staleTime: 30000,
  })
}
