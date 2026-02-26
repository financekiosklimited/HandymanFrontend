/**
 * Discount types for the SolutionBank discount system
 */

export interface Discount {
  public_id: string
  name: string
  code: string
  description: string
  terms_and_conditions: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  discount_display: string
  target_role: 'homeowner' | 'handyman' | 'both'
  color: string
  icon: string
  badge_text?: string
  expiry_text: string
  ends_in_days: number
}

export interface DiscountValidationResponse {
  valid: boolean
  discount?: Discount
  message?: string
  remaining_uses?: number
}

export interface DiscountValidationRequest {
  code: string
  target_role: 'homeowner' | 'handyman'
}
