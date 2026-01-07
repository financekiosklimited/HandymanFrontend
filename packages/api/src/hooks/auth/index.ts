import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../../client'
import { getAuthStore } from '../../store/auth'
import type {
  LoginRequest,
  ActivateRoleRequest,
  TokenRefreshRequest,
  LogoutRequest,
  AuthResponseEnvelope,
  Role,
  RegisterRequest,
  ForgotPasswordRequest,
  VerifyPasswordResetRequest,
  ResetPasswordRequest,
  EmailResendRequest,
  EmailVerificationRequest,
  PasswordResetTokenResponseEnvelope,
  SuccessMessageResponseEnvelope,
} from '../../types/auth'

export function useLogin() {
  const { setTokens, setActiveRole, setNextAction, setEmailVerified } = getAuthStore.getState()

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiClient
        .post('auth/login', { json: data })
        .json<AuthResponseEnvelope>()

      if (!response.data) {
        throw new Error(response.message || 'Login failed')
      }

      return response.data
    },
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token)
      setActiveRole(data.active_role)
      setNextAction(data.next_action)
      setEmailVerified(data.email_verified)
    },
  })
}

export function useActivateRole() {
  const { setTokens, setActiveRole, setNextAction, setEmailVerified } = getAuthStore.getState()

  return useMutation({
    mutationFn: async (data: ActivateRoleRequest) => {
      const response = await apiClient
        .post('auth/activate-role', { json: data })
        .json<AuthResponseEnvelope>()

      if (!response.data) {
        throw new Error(response.message || 'Role activation failed')
      }

      return response.data
    },
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token)
      setActiveRole(data.active_role)
      setNextAction(data.next_action)
      setEmailVerified(data.email_verified)
    },
  })
}

export function useRefreshToken() {
  const { setTokens, setActiveRole, setNextAction, setEmailVerified } = getAuthStore.getState()

  return useMutation({
    mutationFn: async (data: TokenRefreshRequest) => {
      const response = await apiClient
        .post('auth/refresh', { json: data })
        .json<AuthResponseEnvelope>()

      if (!response.data) {
        throw new Error(response.message || 'Token refresh failed')
      }

      return response.data
    },
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token)
      setActiveRole(data.active_role)
      setNextAction(data.next_action)
      setEmailVerified(data.email_verified)
    },
  })
}

export function useLogout() {
  const { refreshToken, logout } = getAuthStore.getState()

  return useMutation({
    mutationFn: async () => {
      if (!refreshToken) {
        logout()
        return
      }

      try {
        await apiClient.post('auth/logout', {
          json: { refresh_token: refreshToken } as LogoutRequest,
        })
      } catch {
        // Ignore logout errors - still clear local state
      }
    },
    onSettled: () => {
      logout()
    },
  })
}

// Registration hook
export function useRegister() {
  const { setTokens, setActiveRole, setNextAction, setEmailVerified, setEmail } =
    getAuthStore.getState()

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await apiClient
        .post('auth/register', { json: data })
        .json<AuthResponseEnvelope>()

      if (!response.data) {
        throw new Error(response.message || 'Registration failed')
      }

      return { ...response.data, email: data.email }
    },
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token)
      setActiveRole(data.active_role)
      setNextAction(data.next_action)
      setEmailVerified(data.email_verified)
      setEmail(data.email)
    },
  })
}

// Forgot password hook - sends reset code to email
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordRequest) => {
      const response = await apiClient
        .post('auth/password/forgot', { json: data })
        .json<SuccessMessageResponseEnvelope>()

      return response
    },
  })
}

// Verify reset code hook - returns reset token
export function useVerifyResetCode() {
  return useMutation({
    mutationFn: async (data: VerifyPasswordResetRequest) => {
      const response = await apiClient
        .post('auth/password/verify', { json: data })
        .json<PasswordResetTokenResponseEnvelope>()

      if (!response.data) {
        throw new Error(response.message || 'Verification failed')
      }

      return response.data
    },
  })
}

// Reset password hook - sets new password
export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
      const response = await apiClient
        .post('auth/password/reset', { json: data })
        .json<SuccessMessageResponseEnvelope>()

      return response
    },
  })
}

// Verify email OTP hook - returns refreshed tokens
export function useVerifyEmail() {
  const { setTokens, setActiveRole, setNextAction, setEmailVerified } = getAuthStore.getState()

  return useMutation({
    mutationFn: async (data: EmailVerificationRequest) => {
      const response = await apiClient
        .post('auth/email/verify', { json: data })
        .json<AuthResponseEnvelope>()

      if (!response.data) {
        throw new Error(response.message || 'Email verification failed')
      }

      return response.data
    },
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token)
      setActiveRole(data.active_role)
      setNextAction(data.next_action)
      setEmailVerified(data.email_verified)
    },
  })
}

// Resend verification email hook
export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: async (data: EmailResendRequest) => {
      const response = await apiClient
        .post('auth/email/resend', { json: data })
        .json<SuccessMessageResponseEnvelope>()

      return response
    },
  })
}

// Helper hook to get current auth role
export function useAuthRole(): Role | null {
  return getAuthStore((state) => state.activeRole)
}

// Export phone verification hooks
export * from './phone'
