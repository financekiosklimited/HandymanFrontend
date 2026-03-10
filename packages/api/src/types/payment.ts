// ── KYC Types ──

export interface ConnectOnboardingLink {
  url: string
  expires_at: number
  account_id: string
}

export interface IdentitySession {
  verification_session_id: string
  status: string
  url: string | null
}

export type IdentityVerificationStatus =
  | 'not_started'
  | 'pending'
  | 'verified'
  | 'requires_input'
  | 'failed'

export interface KycStatus {
  identity_status: IdentityVerificationStatus
  charges_enabled: boolean
  payouts_enabled: boolean
  details_submitted: boolean
  requirements_due: string[]
  is_eligible: boolean
}

// ── Wallet Types ──

export interface WalletBalance {
  currency: string
  available_amount: string
  pending_amount: string
}

export type WithdrawalMethod = 'standard' | 'instant'

export type WithdrawalStatus = 'requested' | 'processing' | 'paid' | 'failed' | 'canceled'

export interface Withdrawal {
  public_id: string
  amount: string
  currency: string
  method: WithdrawalMethod
  instant_fee: string
  status: WithdrawalStatus
  failure_code: string
  failure_message: string
  requested_at: string
  processed_at: string | null
  created_at: string
}

export interface CreateWithdrawalRequest {
  amount: number
  method: WithdrawalMethod
}

// ── Payment Types ──

export type JobPaymentStatus =
  | 'not_started'
  | 'draft'
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'authorized'
  | 'captured'
  | 'canceled'
  | 'failed'
  | 'partially_refunded'
  | 'refunded'
  | 'disputed'

export interface PaymentAuthorization {
  job_payment_public_id: string
  payment_intent_id: string
  client_secret: string
  status: JobPaymentStatus
  authorized_amount: string
  currency: string
}

export interface PaymentStatus {
  status: JobPaymentStatus
  payment_intent_id: string
  authorized_amount: string
  captured_amount: string
  capturable_amount: string
  platform_fee: string
  currency: string
  last_failure_code: string
  last_failure_message: string
}
