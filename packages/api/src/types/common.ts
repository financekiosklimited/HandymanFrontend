// Common API response types
export interface ApiResponse<T> {
  message: string
  data: T
  errors?: any
  meta?: {
    pagination: {
      page: number
      page_size: number
      total_count: number
      total_pages: number
      has_next: boolean
      has_previous: boolean
    }
  }
}

// For paginated responses where data is directly an array
export interface PaginatedArrayResponse<T> {
  data: T[]
  errors: any
  message: string
  meta: {
    pagination: {
      page: number
      page_size: number
      total_count: number
      total_pages: number
      has_next: boolean
      has_previous: boolean
    }
  }
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface City {
  public_id: string
  name: string
  province: string
  country: string
  slug: string
}

export interface Category {
  public_id: string
  name: string
  slug: string
  description: string
  icon: string
}

export interface HandymanCategory {
  public_id: string
  name: string
}

// Notification types
export type NotificationType =
  | 'job_application_received'
  | 'application_approved'
  | 'application_rejected'
  | 'application_withdrawn'
  | 'admin_broadcast'
  | 'work_session_started'
  | 'work_session_ended'
  | 'work_session_media_uploaded'
  | 'daily_report_submitted'
  | 'daily_report_approved'
  | 'daily_report_rejected'
  | 'daily_report_updated'
  | 'job_completion_requested'
  | 'job_completion_approved'
  | 'job_completion_rejected'
  | 'job_dispute_opened'
  | 'job_dispute_resolved'
  | 'direct_offer_received'
  | 'direct_offer_accepted'
  | 'direct_offer_rejected'
  | 'direct_offer_cancelled'
  | 'direct_offer_expired'
  | 'chat_message_received'

export interface Notification {
  public_id: string
  notification_type: NotificationType
  title: string
  body: string
  thumbnail: string
  data: Record<string, any> | null
  target_role: 'handyman' | 'homeowner'
  is_read: boolean
  read_at: string | null
  created_at: string
  updated_at: string
}
