// Direct Job Offer types

import type { Attachment, AttachmentUpload } from './attachment'

// ========== Status Types ==========

export type DirectOfferStatus = 'pending' | 'accepted' | 'rejected' | 'expired' | 'converted'

// ========== Common Types ==========

export interface DirectOfferCategory {
  public_id: string
  name: string
  slug: string
}

export interface DirectOfferCity {
  public_id: string
  name: string
  province: string
  province_code: string
}

export interface DirectOfferTask {
  public_id: string
  title: string
  description: string
  status: string
}

// ========== Homeowner View Types ==========

// Target handyman info for homeowner view
export interface DirectOfferTargetHandyman {
  public_id: string
  display_name: string
  avatar_url: string | null
  rating: number
  review_count: number
  job_title: string | null
}

// Direct offer as seen by homeowner (list view)
export interface HomeownerDirectOffer {
  public_id: string
  title: string
  description: string
  estimated_budget: number
  category: DirectOfferCategory | null
  city: DirectOfferCity | null
  address: string
  offer_status: DirectOfferStatus
  offer_expires_at: string
  offer_responded_at: string | null
  time_remaining: number | null // seconds, null if not pending
  target_handyman: DirectOfferTargetHandyman
  created_at: string
  updated_at: string
}

// Direct offer detail as seen by homeowner
export interface HomeownerDirectOfferDetail extends HomeownerDirectOffer {
  postal_code: string | null
  latitude: number | null
  longitude: number | null
  offer_rejection_reason: string | null
  tasks: DirectOfferTask[]
  attachments: Attachment[]
}

// ========== Handyman View Types ==========

// Homeowner info for handyman view
export interface DirectOfferHomeowner {
  public_id: string
  display_name: string
  avatar_url: string | null
  rating: number
  review_count: number
}

// Direct offer as seen by handyman (list view)
export interface HandymanDirectOffer {
  public_id: string
  title: string
  description: string
  estimated_budget: number
  category: DirectOfferCategory | null
  city: DirectOfferCity | null
  address: string
  offer_status: DirectOfferStatus
  offer_expires_at: string
  time_remaining: number | null
  homeowner: DirectOfferHomeowner
  created_at: string
}

// Direct offer detail as seen by handyman
export interface HandymanDirectOfferDetail extends HandymanDirectOffer {
  postal_code: string | null
  latitude: number | null
  longitude: number | null
  offer_responded_at: string | null
  tasks: DirectOfferTask[]
  attachments: Attachment[]
}

// ========== Request Types ==========

export interface DirectOfferTaskInput {
  title: string
  description?: string
}

// Create direct offer request
export interface CreateDirectOfferRequest {
  target_handyman_id: string
  title: string
  description: string
  estimated_budget: number
  category_id: string
  city_id: string
  address: string
  postal_code?: string
  latitude?: number
  longitude?: number
  offer_expires_in_days?: number // 1-30, default: 7
  tasks?: DirectOfferTaskInput[]
  attachments?: AttachmentUpload[]
}

// Reject direct offer request
export interface RejectDirectOfferRequest {
  rejection_reason?: string
}

// ========== Validation Error Types ==========

export interface CreateDirectOfferValidationError {
  message: string
  data: null
  errors: {
    [key: string]: string[] | { [index: string]: string[] | { non_field_errors?: string[] } }
  }
  meta: null
}

// ========== Quick Rejection Reasons ==========

export const QUICK_REJECTION_REASONS = [
  { id: 'busy', label: 'Too busy', value: "I'm fully booked at the moment." },
  { id: 'far', label: 'Too far away', value: 'The location is too far from my service area.' },
  {
    id: 'budget',
    label: 'Low budget',
    value: 'The budget is below my minimum rate for this type of work.',
  },
  { id: 'skill', label: 'Not my skill', value: 'This job requires skills outside my expertise.' },
] as const

// ========== Offer Expiry Options ==========

export const OFFER_EXPIRY_OPTIONS = [
  { value: 1, label: '1 day' },
  { value: 3, label: '3 days' },
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
] as const

export const DEFAULT_OFFER_EXPIRY_DAYS = 7
