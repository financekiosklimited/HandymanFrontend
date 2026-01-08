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

// ========== Ongoing Job Types ==========

// Import shared types from handyman
export type { 
  WorkSession, 
  WorkSessionMedia, 
  DailyReport, 
  DailyReportTask,
  DailyReportStatus 
} from './handyman'

// Dispute types
export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'closed'

export interface JobDispute {
  public_id: string
  reason: string
  status: DisputeStatus
  disputed_report_ids: string[]
  created_at: string
  resolved_at: string | null
  resolution_notes: string | null
}

// Request types for homeowner actions
export interface ReviewDailyReportRequest {
  decision: 'approved' | 'rejected'
  comment?: string
}

export interface RejectCompletionRequest {
  reason?: string
}

export interface CreateDisputeRequest {
  reason: string
  disputed_report_ids?: string[]
}

// Re-export for convenience
export type { PaginatedArrayResponse, ApiResponse, Notification } from './common'

// Import more shared types from handyman for dashboard
export type { 
  DashboardTask,
  DashboardTasksProgress,
  DashboardTimeStats,
  DashboardSessionStats,
  DashboardReportStats,
  DashboardActiveSession,
  SessionMediaItem,
} from './handyman'



// Homeowner Dashboard Job Info (different from handyman - has handyman info instead of homeowner)
export interface HomeownerDashboardJobInfo {
  public_id: string
  title: string
  description: string
  status: HomeownerJobStatus
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
  address: string | null
  postal_code: string | null
  handyman_display_name: string
  handyman_avatar_url: string | null
  created_at: string
}

// Review type for handyman
export interface HandymanReview {
  public_id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
}

export interface CreateHandymanReviewRequest {
  rating: number
  comment?: string
}

// Homeowner Job Dashboard Data
export interface HomeownerJobDashboardData {
  job: HomeownerDashboardJobInfo
  tasks_progress: import('./handyman').DashboardTasksProgress
  time_stats: import('./handyman').DashboardTimeStats
  session_stats: import('./handyman').DashboardSessionStats
  active_session: import('./handyman').DashboardActiveSession | null
  report_stats: import('./handyman').DashboardReportStats
  my_review: HandymanReview | null
}



