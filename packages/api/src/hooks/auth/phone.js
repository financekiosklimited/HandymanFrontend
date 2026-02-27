System.register(
  ['@tanstack/react-query', '../../client', '../../store/auth'],
  (exports_1, context_1) => {
    let react_query_1
    let client_1
    let auth_1
    const __moduleName = context_1 && context_1.id
    /**
     * Hook to fetch country phone codes for phone number input.
     * No authentication required.
     */
    function useCountryCodes() {
      return react_query_1.useQuery({
        queryKey: ['country-codes'],
        queryFn: async () => {
          const response = await client_1.apiClient.get('country-codes/').json()
          return response.data || []
        },
        staleTime: 1000 * 60 * 60 * 24, // 24 hours - country codes rarely change
      })
    }
    exports_1('useCountryCodes', useCountryCodes)
    /**
     * Hook to send OTP to phone number for verification.
     * Requires authentication.
     */
    function useSendPhoneOtp() {
      const { setPhoneNumber } = auth_1.getAuthStore.getState()
      return react_query_1.useMutation({
        mutationFn: async (data) => {
          const response = await client_1.apiClient.post('auth/phone/send', { json: data }).json()
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
    exports_1('useSendPhoneOtp', useSendPhoneOtp)
    /**
     * Hook to verify phone OTP and update auth state.
     * After successful verification, refreshes auth tokens.
     */
    function useVerifyPhoneOtp() {
      const { setIsPhoneVerified, setTokens, refreshToken } = auth_1.getAuthStore.getState()
      return react_query_1.useMutation({
        mutationFn: async (data) => {
          const response = await client_1.apiClient.post('auth/phone/verify', { json: data }).json()
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
              const refreshResponse = await client_1.apiClient
                .post('auth/refresh', { json: { refresh_token: refreshToken } })
                .json()
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
    exports_1('useVerifyPhoneOtp', useVerifyPhoneOtp)
    return {
      setters: [
        (react_query_1_1) => {
          react_query_1 = react_query_1_1
        },
        (client_1_1) => {
          client_1 = client_1_1
        },
        (auth_1_1) => {
          auth_1 = auth_1_1
        },
      ],
      execute: () => {},
    }
  }
)
