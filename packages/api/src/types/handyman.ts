import type { PaginatedArrayResponse, ApiResponse } from './common'

// Job status for handyman view
export type HandymanJobStatus = 'open' | 'assigned' | 'in_progress' | 'pending_completion' | 'completed' | 'cancelled'

// Job from "for-you" endpoint for handyman to browse
export interface HandymanJobForYou {
  public_id: string
  title: string
  description: string
  address: string
  postal_code: string
  latitude: string
  longitude: string
  estimated_budget: number
  status: HandymanJobStatus
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
  homeowner?: {
    public_id: string
    display_name: string
    avatar_url: string | null
  } | null
  distance_km: number | null
  images?: Array<{
    public_id: string
    image: string
  }>
}

// Handyman's own applied/assigned jobs
export interface HandymanJob {
  public_id: string
  title: string
  description: string
  address: string
  status: HandymanJobStatus
  status_at: string
  created_at: string
  updated_at: string
  category: {
    public_id: string
    name: string
  } | null
  city: {
    public_id: string
    name: string
  } | null
  hourly_rate_min?: number
  hourly_rate_max?: number
  homeowner?: {
    public_id: string
    display_name: string
    avatar_url: string | null
  } | null
  images?: Array<{
    public_id: string
    image: string
  }>
}

export interface HandymanProfile {
  display_name: string
  avatar_url: string | null
  email: string
  rating: number | null
  hourly_rate: number | null
  job_title: string | null
  category: {
    public_id: string
    name: string
  } | null
  id_number: string | null
  date_of_birth: string | null
  is_active: boolean
  is_available: boolean
  phone_number: string | null
  is_phone_verified: boolean
  address: string | null
}

export interface HandymanProfileUpdateRequest {
  display_name: string
  hourly_rate?: number | null
  job_title?: string
  category_id?: string | null
  date_of_birth?: string | null
  latitude?: number | null
  longitude?: number | null
  is_active?: boolean
  is_available?: boolean
  address?: string
}

// Application status
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn'

// Job application
export interface JobApplication {
  public_id: string
  job: {
    public_id: string
    title: string
    description: string
    estimated_budget: number
    category: {
      public_id: string
      name: string
      slug: string
    } | null
    city: {
      public_id: string
      name: string
      province: string
      province_code: string
    } | null
    status: HandymanJobStatus
  }
  status: ApplicationStatus
  status_at: string
  created_at: string
  updated_at: string
}

// My application info embedded in job detail
export interface MyApplicationInfo {
  public_id: string
  status: ApplicationStatus
  created_at: string
  status_at: string
}

// Extended job detail for handyman with application status
export interface HandymanJobDetail extends HandymanJobForYou {
  tasks?: Array<{
    public_id: string
    title: string
    description: string
    order: number
    is_completed: boolean
    completed_at: string | null
  }>
  has_applied: boolean
  my_application: MyApplicationInfo | null
}

// Re-export for convenience
export type { PaginatedArrayResponse, ApiResponse, Notification } from './common'
