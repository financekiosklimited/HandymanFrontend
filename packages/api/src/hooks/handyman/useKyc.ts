import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type { ApiResponse, ConnectOnboardingLink, IdentitySession, KycStatus } from '../../types'

/**
 * Hook to fetch the handyman's consolidated KYC status.
 * Includes identity verification, Connect account status, and overall eligibility.
 */
export function useKycStatus(enabled = true) {
  return useQuery({
    queryKey: ['handyman', 'kyc', 'status'],
    queryFn: async () => {
      const response = await apiClient.get('handyman/kyc/status/').json<ApiResponse<KycStatus>>()
      return response.data
    },
    enabled,
    staleTime: 30000, // 30 seconds — status can change via webhooks
    refetchInterval: enabled ? 30000 : false,
  })
}

/**
 * Hook to create a Stripe Connect onboarding link.
 * Returns a URL the handyman should open in a browser to complete account setup.
 */
export function useCreateConnectOnboardingLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient
        .post('handyman/kyc/connect/onboarding-link/')
        .json<ApiResponse<ConnectOnboardingLink>>()
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['handyman', 'kyc'] })
    },
  })
}

/**
 * Hook to create a Stripe Identity verification session.
 * Returns a URL for document/ID verification.
 */
export function useCreateIdentitySession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient
        .post('handyman/kyc/identity/session/')
        .json<ApiResponse<IdentitySession>>()
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['handyman', 'kyc'] })
    },
  })
}
