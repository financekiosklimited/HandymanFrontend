import type { PaginatedArrayResponse, ApiResponse } from './common'

// Job status for homeowner view
export type HomeownerJobStatus = 'draft' | 'open' | 'assigned' | 'in_progress' | 'pending_completion' | 'completed' | 'cancelled'

// Homeowner's own job listing
export interface HomeownerJob {
  public_id: string
  title: string
  description: string
  address: string
  postal_code: string
  latitude: string
  longitude: string
  estimated_budget: number
  status: HomeownerJobStatus
  status_at: string
  created_at: string
  updated_at: string
  category: {
    public_id: string
    name: string
    icon?: string
  } | null
  city: {
    public_id: string
    name: string
  } | null
  hourly_rate_min?: number
  hourly_rate_max?: number
  assigned_handyman?: {
    public_id: string
    display_name: string
    avatar_url: string | null
  } | null
  images?: Array<{
    public_id: string
    image: string
  }>
  tasks?: Array<{
    public_id: string
    title: string
    description: string
    status: string
  }>
  applicant_count?: number
}

// Handyman visible to homeowner (nearby handymen)
export interface HomeownerHandyman {
  public_id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  rating: number
  total_reviews: number
  hourly_rate?: number | null
  distance_km: number | null
  categories: Array<{
    public_id: string
    name: string
  }>
}

export interface HomeownerProfile {
  display_name: string
  avatar_url: string | null
  email: string
  phone_number: string | null
  is_phone_verified: boolean
  address: string | null
  date_of_birth: string | null
}

export interface HomeownerProfileUpdateRequest {
  display_name: string
  address?: string
  date_of_birth?: string | null
}

// Application status type
export type HomeownerApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn'

// Simplified job reference for applications
export interface ApplicationJobReference {
  public_id: string
  title: string
}

// Handyman profile in application context
export interface ApplicationHandymanProfile {
  public_id: string
  display_name: string
  avatar_url: string | null
  rating: number
  hourly_rate: number | null
  bio?: string | null
  total_reviews?: number
  job_title?: string | null
  categories?: Array<{
    public_id: string
    name: string
  }>
}

// Application in list view
export interface HomeownerApplication {
  public_id: string
  job: ApplicationJobReference
  handyman_profile: ApplicationHandymanProfile
  status: HomeownerApplicationStatus
  created_at: string
}

// Detailed application view
export interface HomeownerApplicationDetail extends HomeownerApplication {
  updated_at?: string
  message?: string | null
  proposed_rate?: number | null
}

// Re-export for convenience
export type { PaginatedArrayResponse, ApiResponse, Notification } from './common'

