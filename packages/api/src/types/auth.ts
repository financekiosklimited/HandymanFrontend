// Auth types for SolutionBank API

export type Role = 'homeowner' | 'handyman'
export type NextAction = 'none' | 'verify_email' | 'fill_profile' | 'activate_role'

// Request types
export interface LoginRequest {
  email: string
  password: string
}

export interface ActivateRoleRequest {
  role: Role
}

export interface TokenRefreshRequest {
  refresh_token: string
}

export interface LogoutRequest {
  refresh_token: string
}

// Response types
export interface AuthToken {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface AuthResponse extends AuthToken {
  active_role: Role | null
  next_action: NextAction
  email_verified: boolean
}

// API Response envelope
export interface AuthResponseEnvelope {
  message: string
  data: AuthResponse | null
  errors: Record<string, string[]> | null
  meta: Record<string, unknown> | null
}

// User state from token/auth
export interface AuthUser {
  id: string
  email: string
  phoneNumber: string | null
  roles: Role[]
  activeRole: Role | null
}

// Phone verification types
export interface CountryPhoneCode {
  country_code: string
  country_name: string
  dial_code: string
  flag_emoji?: string
}

export interface PhoneSendRequest {
  phone_number: string
}

export interface PhoneSendResponse {
  masked_phone: string
  expires_in: number
}

export interface PhoneVerifyRequest {
  phone_number: string
  otp: string
}

export interface PhoneVerifyResponse {
  phone_verified: boolean
  phone_number: string
}

// Country codes API response
export interface CountryPhoneCodeListResponse {
  message: string
  data: CountryPhoneCode[]
  errors: Record<string, string[]> | null
  meta: Record<string, unknown> | null
}

// Phone send/verify API response envelope
export interface PhoneSendResponseEnvelope {
  message: string
  data: PhoneSendResponse | null
  errors: Record<string, string[]> | null
  meta: Record<string, unknown> | null
}

export interface PhoneVerifyResponseEnvelope {
  message: string
  data: PhoneVerifyResponse | null
  errors: Record<string, string[]> | null
  meta: Record<string, unknown> | null
}

// Registration types
export interface RegisterRequest {
  email: string
  password: string
  initial_role?: Role
}

// Forgot password types
export interface ForgotPasswordRequest {
  email: string
}

export interface VerifyPasswordResetRequest {
  email: string
  otp: string
}

export interface PasswordResetTokenResponse {
  reset_token: string
  expires_in: number
}

export interface PasswordResetTokenResponseEnvelope {
  message: string
  data: PasswordResetTokenResponse | null
  errors: Record<string, string[]> | null
  meta: Record<string, unknown> | null
}

export interface ResetPasswordRequest {
  reset_token: string
  new_password: string
}

// Email verification types
export interface EmailResendRequest {
  email: string
}

export interface EmailVerificationRequest {
  email: string
  otp: string
}

// Generic success message response envelope
export interface SuccessMessageResponseEnvelope {
  message: string
  data: null
  errors: Record<string, string[]> | null
  meta: Record<string, unknown> | null
}


// Registration types
export interface RegisterRequest {
  email: string
  password: string
  initial_role?: Role
}

// Forgot password types
export interface ForgotPasswordRequest {
  email: string
}

export interface VerifyPasswordResetRequest {
  email: string
  otp: string
}

export interface PasswordResetTokenResponse {
  reset_token: string
  expires_in: number
}

export interface PasswordResetTokenResponseEnvelope {
  message: string
  data: PasswordResetTokenResponse | null
  errors: Record<string, string[]> | null
  meta: Record<string, unknown> | null
}

export interface ResetPasswordRequest {
  reset_token: string
  new_password: string
}

// Email verification types
export interface EmailResendRequest {
  email: string
}

export interface EmailVerificationRequest {
  email: string
  otp: string
}

// Generic success message response envelope
export interface SuccessMessageResponseEnvelope {
  message: string
  data: null
  errors: Record<string, string[]> | null
  meta: Record<string, unknown> | null
}
