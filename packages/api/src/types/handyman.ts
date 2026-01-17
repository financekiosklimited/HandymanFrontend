import type { PaginatedArrayResponse, ApiResponse } from './common'
import type { Attachment, AttachmentUpload } from './attachment'

// Job status for handyman view
export type HandymanJobStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'pending_completion'
  | 'completed'
  | 'cancelled'

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
  attachments?: Attachment[]
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

// Material in application
export interface JobApplicationMaterial {
  public_id: string
  name: string
  price: number
  description?: string
  created_at?: string
}

// Attachment in application - now uses unified Attachment type
export type JobApplicationAttachment = Attachment

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
    attachments?: Attachment[]
  }
  status: ApplicationStatus
  status_at: string
  predicted_hours?: number
  estimated_total_price?: number
  negotiation_reasoning?: string
  materials?: JobApplicationMaterial[]
  attachments?: JobApplicationAttachment[]
  created_at: string
  updated_at: string
}

// Request type for creating application
export interface CreateJobApplicationRequest {
  job_id: string
  predicted_hours: number
  estimated_total_price: number
  negotiation_reasoning?: string
  materials?: Array<{
    name: string
    price: number
    description?: string
  }>
  attachments?: AttachmentUpload[]
}

// Request type for editing application
export interface EditJobApplicationRequest {
  predicted_hours?: number
  estimated_total_price?: number
  negotiation_reasoning?: string
  materials?: Array<{
    name: string
    price: number
    description?: string
  }>
  attachments?: AttachmentUpload[]
  attachments_to_remove?: string[]
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
  attachments?: Attachment[]
  has_applied: boolean
  my_application: MyApplicationInfo | null
}

// ========== Ongoing Job Types ==========

// Work Session
export interface WorkSession {
  public_id: string
  started_at: string
  ended_at: string | null
  start_latitude: number
  start_longitude: number
  start_accuracy: number | null
  start_photo: string | null
  end_latitude: number | null
  end_longitude: number | null
  end_accuracy: number | null
  end_photo: string | null
  duration_seconds: number | null
  status: 'active' | 'completed'
  media: WorkSessionMedia[]
}

export interface WorkSessionMedia {
  public_id: string
  media_type: 'photo' | 'video'
  file: string
  thumbnail?: string | null
  caption: string | null
  created_at: string
}

// Daily Report
export type DailyReportStatus = 'pending' | 'approved' | 'rejected'

export interface DailyReportTask {
  public_id: string
  task: {
    public_id: string
    title: string
    description: string
    is_completed: boolean
  }
  notes: string | null
  marked_complete: boolean
}

export interface DailyReport {
  public_id: string
  report_date: string
  summary: string
  total_work_duration_seconds: number
  status: DailyReportStatus
  homeowner_comment: string | null
  reviewed_at: string | null
  review_deadline: string | null
  tasks_worked: DailyReportTask[]
  created_at: string
}

// Request types
// React Native FormData file type
export interface RNFile {
  uri: string
  type: string
  name: string
}

export interface StartWorkSessionRequest {
  started_at: string
  start_latitude: number
  start_longitude: number
  start_accuracy?: number
  start_photo: RNFile // React Native file format for FormData
}

export interface StopWorkSessionRequest {
  ended_at: string // Required for API
  end_latitude: number
  end_longitude: number
  end_accuracy?: number
  end_photo: RNFile
}

export interface UploadSessionMediaRequest {
  media_type: 'photo' | 'video'
  file: RNFile
  file_size: number
  caption?: string
  duration_seconds?: number
}

export interface CreateDailyReportRequest {
  report_date: string
  summary: string
  total_work_duration_seconds: number
  tasks: Array<{
    task_id: string
    notes?: string
    marked_complete: boolean
  }>
}

export interface UpdateDailyReportRequest {
  summary?: string
  total_work_duration_seconds?: number
  tasks?: Array<{
    task_id: string
    notes?: string
    marked_complete: boolean
  }>
}

// Dashboard types
export interface DashboardJobInfo {
  public_id: string
  title: string
  description: string
  status: HandymanJobStatus
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
  homeowner: {
    public_id: string
    display_name: string
    avatar_url: string | null
    rating: number | null
  }
  created_at: string
}

export interface DashboardTask {
  public_id: string
  title: string
  description: string
  order: number
  is_completed: boolean
  completed_at: string | null
}

export interface DashboardTasksProgress {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  completion_percentage: number
  tasks: DashboardTask[]
}

export interface DashboardTimeStats {
  total_time_seconds: number
  total_time_formatted: string
  average_session_duration_seconds: number
  average_session_duration_formatted: string
  longest_session_seconds: number
  longest_session_formatted: string
}

export interface DashboardSessionStats {
  total_sessions: number
  completed_sessions: number
  in_progress_sessions: number
  has_active_session: boolean
  active_session_id: string | null
}

export interface DashboardReportStats {
  total_reports: number
  pending_reports: number
  approved_reports: number
  rejected_reports: number
  latest_report_date: string | null
}

export interface SessionMediaItem {
  public_id: string
  media_type: 'photo' | 'video'
  file: string
  thumbnail: string | null
  description: string | null
  created_at: string
}

export interface DashboardActiveSession {
  public_id: string
  started_at: string
  start_latitude: number
  start_longitude: number
  start_photo: string | null
  start_accuracy: number | null
  current_duration_seconds: number
  current_duration_formatted: string
  media_count: number
  media: SessionMediaItem[]
}

export interface HomeownerReview {
  public_id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
}

export interface CreateReviewRequest {
  rating: number
  comment?: string
}

export interface JobDashboardData {
  job: DashboardJobInfo
  tasks_progress: DashboardTasksProgress
  time_stats: DashboardTimeStats
  session_stats: DashboardSessionStats
  active_session: DashboardActiveSession | null
  report_stats: DashboardReportStats
  homeowner_review: HomeownerReview | null
  my_review: HomeownerReview | null
}

// Reimbursement types
export type ReimbursementStatus = 'pending' | 'approved' | 'rejected'

export interface ReimbursementCategory {
  public_id: string
  name: string
  slug: string
  description: string
  icon: string
  is_active: boolean
}

// Reimbursement attachment - now uses unified Attachment type
export type ReimbursementAttachment = Attachment

export interface JobReimbursement {
  public_id: string
  name: string
  category: ReimbursementCategory
  amount: number
  notes: string | null
  status: ReimbursementStatus
  homeowner_comment: string | null
  reviewed_at: string | null
  attachments: ReimbursementAttachment[]
  created_at: string
  updated_at: string
}

export interface CreateReimbursementRequest {
  name: string
  category_id: string
  amount: number
  notes?: string
  attachments: AttachmentUpload[]
}

export interface UpdateReimbursementRequest {
  name?: string
  category_id?: string
  amount?: number
  notes?: string
  attachments?: AttachmentUpload[]
  attachments_to_remove?: string[]
}

export interface ReviewReimbursementRequest {
  decision: 'approved' | 'rejected'
  comment?: string
}

// Re-export for convenience
export type { PaginatedArrayResponse, ApiResponse, Notification } from './common'
