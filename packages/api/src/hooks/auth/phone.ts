import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '../../client'
import { getAuthStore } from '../../store/auth'
import type {
  CountryPhoneCodeListResponse,
  PhoneSendRequest,
  PhoneSendResponseEnvelope,
  PhoneVerifyRequest,
  PhoneVerifyResponseEnvelope,
  CountryPhoneCode,
} from '../../types/auth'

/**
 * Hook to fetch country phone codes for phone number input.
 * No authentication required.
 */
export function useCountryCodes() {
  return useQuery({
    queryKey: ['country-codes'],
    queryFn: async (): Promise<CountryPhoneCode[]> => {
      const response = await apiClient.get('country-codes/').json<CountryPhoneCodeListResponse>()

      return response.data || []
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - country codes rarely change
  })
}

/**
 * Hook to send OTP to phone number for verification.
 * Requires authentication.
 */
export function useSendPhoneOtp() {
  const { setPhoneNumber } = getAuthStore.getState()

  return useMutation({
    mutationFn: async (data: PhoneSendRequest) => {
      const response = await apiClient
        .post('auth/phone/send', { json: data })
        .json<PhoneSendResponseEnvelope>()

      if (!response.data) {
        throw new Error(response.message || 'Failed to send verification code')
      }

      return response.data
    },
    onSuccess: (_, variables) => {
      // Store phone number in state for verify screen
      setPhoneNumber(variables.phone_number)
    },
  })
}

/**
 * Hook to verify phone OTP and update auth state.
 * After successful verification, refreshes auth tokens.
 */
export function useVerifyPhoneOtp() {
  const { setIsPhoneVerified, setTokens, refreshToken } = getAuthStore.getState()

  return useMutation({
    mutationFn: async (data: PhoneVerifyRequest) => {
      const response = await apiClient
        .post('auth/phone/verify', { json: data })
        .json<PhoneVerifyResponseEnvelope>()

      if (!response.data) {
        throw new Error(response.message || 'Invalid verification code')
      }

      return response.data
    },
    onSuccess: async (data) => {
      // Update phone verified status
      setIsPhoneVerified(data.phone_verified)

      // Refresh auth tokens to get updated claims
      if (refreshToken) {
        try {
          const refreshResponse = await apiClient
            .post('auth/refresh', { json: { refresh_token: refreshToken } })
            .json<{
              message: string
              data: {
                access_token: string
                refresh_token: string
              } | null
            }>()

          if (refreshResponse.data) {
            setTokens(refreshResponse.data.access_token, refreshResponse.data.refresh_token)
          }
        } catch (error) {
          console.error('Failed to refresh tokens after phone verification:', error)
        }
      }
    },
  })
}
