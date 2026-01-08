import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type {
  PaginatedArrayResponse,
  ApiResponse,
  HandymanJobForYou,
  HandymanJob,
  HandymanProfile,
  HandymanProfileUpdateRequest,
  HandymanJobDetail,
  JobApplication,
  Notification,
  WorkSession,
  DailyReport,
  StartWorkSessionRequest,
  StopWorkSessionRequest,
  UploadSessionMediaRequest,
  CreateDailyReportRequest,
  UpdateDailyReportRequest,
  JobDashboardData,
  CreateReviewRequest,
} from '../../types/handyman'

interface HandymanJobsForYouParams {
  category?: string
  city?: string
  latitude?: number
  longitude?: number
  search?: string
}

/**
 * Hook to fetch jobs for handymen to browse and apply to.
 * Jobs are sorted by distance (if coordinates provided) and recency.
 */
export function useHandymanJobsForYou(params?: HandymanJobsForYouParams) {
  return useInfiniteQuery({
    queryKey: ['handyman', 'jobs', 'for-you', params],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const searchParams = new URLSearchParams()
        if (params?.category) searchParams.set('category', params.category)
        if (params?.city) searchParams.set('city', params.city)
        if (params?.latitude) searchParams.set('latitude', params.latitude.toString())
        if (params?.longitude) searchParams.set('longitude', params.longitude.toString())
        if (params?.search) searchParams.set('search', params.search)
        searchParams.set('page', pageParam.toString())

        const url = `handyman/jobs/for-you/?${searchParams.toString()}`
        const response = await apiClient.get(url).json<PaginatedArrayResponse<HandymanJobForYou>>()

        return {
          results: response.data || [],
          page: response.meta?.pagination?.page || 1,
          hasNext: response.meta?.pagination?.has_next || false,
          totalCount: response.meta?.pagination?.total_count || 0,
        }
      } catch (error) {
        console.error('Error fetching jobs for you:', error)
        throw error
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNext) {
        return lastPage.page + 1
      }
      return undefined
    },
    retry: 1,
  })
}

/**
 * Hook to fetch a single job detail for handyman.
 */
export function useHandymanJob(publicId: string) {
  return useQuery({
    queryKey: ['handyman', 'jobs', 'for-you', publicId],
    queryFn: async () => {
      const response = await apiClient
        .get(`handyman/jobs/for-you/${publicId}/`)
        .json<ApiResponse<HandymanJobForYou>>()

      return response.data
    },
    enabled: !!publicId,
  })
}

/**
 * Hook to fetch job detail with application status for handyman.
 * Uses the /handyman/jobs/{public_id}/ endpoint which includes has_applied and my_application.
 */
export function useHandymanJobDetail(publicId: string) {
  return useQuery({
    queryKey: ['handyman', 'job-detail', publicId],
    queryFn: async () => {
      const response = await apiClient
        .get(`handyman/jobs/${publicId}/`)
        .json<ApiResponse<HandymanJobDetail>>()

      return response.data
    },
    enabled: !!publicId,
  })
}

interface HandymanMyJobsParams {
  status?: string
  search?: string
}

/**
 * Hook to fetch handyman's own applied/assigned jobs.
 */
export function useHandymanMyJobs(params?: HandymanMyJobsParams) {
  return useInfiniteQuery({
    queryKey: ['handyman', 'my-jobs', params],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const searchParams = new URLSearchParams()
        if (params?.status) searchParams.set('status', params.status)
        if (params?.search) searchParams.set('search', params.search)
        searchParams.set('page', pageParam.toString())

        const url = `handyman/jobs/?${searchParams.toString()}`
        const response = await apiClient.get(url).json<PaginatedArrayResponse<HandymanJob>>()

        return {
          results: response.data || [],
          page: response.meta?.pagination?.page || 1,
          hasNext: response.meta?.pagination?.has_next || false,
          totalCount: response.meta?.pagination?.total_count || 0,
        }
      } catch (error) {
        console.error('Error fetching my jobs:', error)
        throw error
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNext) {
        return lastPage.page + 1
      }
      return undefined
    },
    retry: 1,
  })
}

/**
 * Hook to fetch current handyman's profile.
 */
export function useHandymanProfile() {
  return useQuery({
    queryKey: ['handyman', 'profile'],
    queryFn: async () => {
      const response = await apiClient.get('handyman/profile').json<ApiResponse<HandymanProfile>>()

      return response.data
    },
  })
}

/**
 * Hook to update handyman profile.
 */
export function useUpdateHandymanProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: HandymanProfileUpdateRequest) => {
      const response = await apiClient
        .put('handyman/profile', { json: data })
        .json<ApiResponse<HandymanProfile>>()

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['handyman', 'profile'] })
    },
  })
}

interface HandymanApplicationsParams {
  status?: string
}

/**
 * Hook to fetch handyman's job applications.
 */
export function useHandymanApplications(params?: HandymanApplicationsParams) {
  return useInfiniteQuery({
    queryKey: ['handyman', 'applications', params],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const searchParams = new URLSearchParams()
        if (params?.status) searchParams.set('status', params.status)
        searchParams.set('page', pageParam.toString())

        const url = `handyman/applications/?${searchParams.toString()}`
        const response = await apiClient.get(url).json<PaginatedArrayResponse<JobApplication>>()

        return {
          results: response.data || [],
          page: response.meta?.pagination?.page || 1,
          hasNext: response.meta?.pagination?.has_next || false,
          totalCount: response.meta?.pagination?.total_count || 0,
        }
      } catch (error) {
        console.error('Error fetching applications:', error)
        throw error
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNext) {
        return lastPage.page + 1
      }
      return undefined
    },
    retry: 1,
  })
}

/**
 * Hook to apply for a job.
 */
export function useApplyForJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await apiClient
        .post('handyman/applications/', { json: { job_id: jobId } })
        .json<ApiResponse<JobApplication>>()

      return response.data
    },
    onSuccess: (_, jobId) => {
      // Invalidate job detail to refresh has_applied status
      queryClient.invalidateQueries({ queryKey: ['handyman', 'job-detail', jobId] })
      queryClient.invalidateQueries({ queryKey: ['handyman', 'applications'] })
    },
  })
}

/**
 * Hook to withdraw a job application.
 */
export function useWithdrawApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (applicationId: string) => {
      const response = await apiClient
        .post(`handyman/applications/${applicationId}/withdraw/`)
        .json<ApiResponse<JobApplication>>()

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['handyman', 'applications'] })
      queryClient.invalidateQueries({ queryKey: ['handyman', 'job-detail'] })
    },
  })
}

/**
 * Hook to fetch notifications for handyman.
 */
export function useHandymanNotifications() {
  return useInfiniteQuery({
    queryKey: ['handyman', 'notifications'],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const searchParams = new URLSearchParams()
        searchParams.set('page', pageParam.toString())

        const url = `handyman/notifications/?${searchParams.toString()}`
        const response = await apiClient.get(url).json<PaginatedArrayResponse<Notification>>()

        return {
          results: response.data || [],
          page: response.meta?.pagination?.page || 1,
          hasNext: response.meta?.pagination?.has_next || false,
          totalCount: response.meta?.pagination?.total_count || 0,
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
        throw error
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNext) {
        return lastPage.page + 1
      }
      return undefined
    },
    retry: 1,
  })
}

/**
 * Hook to mark a notification as read.
 */
export function useMarkHandymanNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (publicId: string) => {
      const response = await apiClient
        .post(`handyman/notifications/${publicId}/read/`)
        .json<ApiResponse<{ public_id: string; is_read: boolean; read_at: string }>>()

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['handyman', 'notifications'] })
      queryClient.invalidateQueries({ queryKey: ['handyman', 'unread-count'] })
    },
  })
}

/**
 * Hook to get the number of unread notifications for the handyman.
 * Uses the dedicated unread-count endpoint for efficiency.
 */
export function useHandymanUnreadCount(enabled = true) {
  return useQuery({
    queryKey: ['handyman', 'unread-count'],
    queryFn: async () => {
      try {
        const response = await apiClient
          .get('handyman/notifications/unread-count/')
          .json<ApiResponse<{ unread_count: number }>>()

        return response.data?.unread_count || 0
      } catch (error) {
        console.error('Error fetching unread count:', error)
        return 0
      }
    },
    enabled, // Only fetch when enabled
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: enabled ? 60000 : false, // Refetch every minute only when enabled
  })
}

// ========== Ongoing Job Hooks ==========

/**
 * Hook to fetch work sessions for a job.
 */
export function useHandymanWorkSessions(jobId: string) {
  return useQuery({
    queryKey: ['handyman', 'jobs', jobId, 'sessions'],
    queryFn: async () => {
      const response = await apiClient
        .get(`handyman/jobs/${jobId}/sessions/`)
        .json<ApiResponse<WorkSession[]>>()
      return response.data || []
    },
    enabled: !!jobId,
  })
}

/**
 * Hook to get active work session for a job.
 */
export function useActiveWorkSession(jobId: string) {
  const { data: sessions, ...rest } = useHandymanWorkSessions(jobId)
  const activeSession = sessions?.find((s) => s.status === 'active') || null
  return { data: activeSession, ...rest }
}

/**
 * Hook to start a work session.
 */
export function useStartWorkSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ jobId, data }: { jobId: string; data: StartWorkSessionRequest }) => {
      const formData = new FormData()
      formData.append('started_at', data.started_at)
      formData.append('start_latitude', data.start_latitude.toFixed(6))
      formData.append('start_longitude', data.start_longitude.toFixed(6))
      if (data.start_accuracy) formData.append('start_accuracy', data.start_accuracy.toString())
      // React Native FormData requires this specific format for files
      formData.append('start_photo', data.start_photo as any)

      try {
        const response = await apiClient
          .post(`handyman/jobs/${jobId}/sessions/start/`, {
            body: formData,
            // Header must be undefined to let the browser/RN set it with boundary
            headers: { 'Content-Type': undefined },
          })
          .json<ApiResponse<WorkSession>>()

        return response.data
      } catch (error: any) {
        if (error.response) {
          const errorData = await error.response.json()
          console.error('DEBUG: useStartWorkSession ERROR response:', errorData)
          throw new Error(errorData.message || 'Failed to start session')
        }
        console.error('DEBUG: useStartWorkSession ERROR:', error)
        throw error
      }
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ['handyman', 'jobs', jobId, 'sessions'] })
      queryClient.invalidateQueries({ queryKey: ['handyman', 'job-dashboard', jobId] })
    },
  })
}

/**
 * Hook to stop a work session.
 */
export function useStopWorkSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      jobId,
      sessionId,
      data,
    }: { jobId: string; sessionId: string; data: StopWorkSessionRequest }) => {
      const formData = new FormData()
      formData.append('ended_at', data.ended_at)
      formData.append('end_latitude', data.end_latitude.toFixed(6))
      formData.append('end_longitude', data.end_longitude.toFixed(6))
      if (data.end_accuracy) formData.append('end_accuracy', data.end_accuracy.toString())
      formData.append('end_photo', data.end_photo as any)

      const response = await apiClient
        .post(`handyman/jobs/${jobId}/sessions/${sessionId}/stop/`, {
          body: formData,
          headers: {
            'Content-Type': undefined as any, // Let browser set boundary
          },
        })
        .json<ApiResponse<WorkSession>>()

      return response.data
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ['handyman', 'jobs', jobId, 'sessions'] })
      queryClient.invalidateQueries({ queryKey: ['handyman', 'job-dashboard', jobId] })
    },
  })
}

/**
 * Hook to upload media to a work session.
 */
export function useUploadSessionMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      jobId,
      sessionId,
      data,
    }: { jobId: string; sessionId: string; data: UploadSessionMediaRequest }) => {
      const formData = new FormData()
      formData.append('media_type', data.media_type)
      // React Native FormData requires this specific format for files
      formData.append('file', data.file as any)
      formData.append('file_size', data.file_size.toString())
      if (data.caption) formData.append('caption', data.caption)
      if (data.duration_seconds)
        formData.append('duration_seconds', data.duration_seconds.toString())

      try {
        const response = await apiClient
          .post(`handyman/jobs/${jobId}/sessions/${sessionId}/media/`, {
            body: formData,
            headers: { 'Content-Type': undefined },
          })
          .json<ApiResponse<{ public_id: string }>>()

        return response.data
      } catch (error: any) {
        if (error.response) {
          const errorData = await error.response.json()
          console.error('DEBUG: useUploadSessionMedia ERROR response:', errorData)
          throw new Error(errorData.message || 'Failed to upload media')
        }
        console.error('DEBUG: useUploadSessionMedia ERROR:', error)
        throw error
      }
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ['handyman', 'jobs', jobId, 'sessions'] })
      queryClient.invalidateQueries({ queryKey: ['handyman', 'job-dashboard', jobId] })
    },
  })
}

/**
 * Hook to fetch daily reports for a job.
 */
export function useHandymanDailyReports(jobId: string) {
  return useQuery({
    queryKey: ['handyman', 'jobs', jobId, 'reports'],
    queryFn: async () => {
      const response = await apiClient
        .get(`handyman/jobs/${jobId}/reports/`)
        .json<ApiResponse<DailyReport[]>>()
      return response.data || []
    },
    enabled: !!jobId,
  })
}

/**
 * Hook to fetch a single daily report.
 */
export function useHandymanDailyReport(jobId: string, reportId: string) {
  return useQuery({
    queryKey: ['handyman', 'jobs', jobId, 'reports', reportId],
    queryFn: async () => {
      const response = await apiClient
        .get(`handyman/jobs/${jobId}/reports/${reportId}/`)
        .json<ApiResponse<DailyReport>>()
      return response.data
    },
    enabled: !!jobId && !!reportId,
  })
}

/**
 * Hook to create a daily report.
 */
export function useCreateDailyReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ jobId, data }: { jobId: string; data: CreateDailyReportRequest }) => {
      const response = await apiClient
        .post(`handyman/jobs/${jobId}/reports/create/`, { json: data })
        .json<ApiResponse<DailyReport>>()
      return response.data
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ['handyman', 'jobs', jobId, 'reports'] })
      queryClient.invalidateQueries({ queryKey: ['handyman', 'job-dashboard', jobId] })
    },
  })
}

/**
 * Hook to update an existing daily report.
 */
export function useUpdateDailyReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      jobId,
      reportId,
      data,
    }: { jobId: string; reportId: string; data: UpdateDailyReportRequest }) => {
      const response = await apiClient
        .put(`handyman/jobs/${jobId}/reports/${reportId}/edit/`, { json: data })
        .json<ApiResponse<DailyReport>>()
      return response.data
    },
    onSuccess: (_, { jobId, reportId }) => {
      queryClient.invalidateQueries({ queryKey: ['handyman', 'jobs', jobId, 'reports'] })
      queryClient.invalidateQueries({ queryKey: ['handyman', 'jobs', jobId, 'reports', reportId] })
      queryClient.invalidateQueries({ queryKey: ['handyman', 'job-dashboard', jobId] })
    },
  })
}

/**
 * Hook to request job completion.
 */
export function useRequestJobCompletion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await apiClient
        .post(`handyman/jobs/${jobId}/completion/request/`)
        .json<ApiResponse<{ status: string }>>()
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['handyman', 'job-detail'] })
      queryClient.invalidateQueries({ queryKey: ['handyman', 'applications'] })
      queryClient.invalidateQueries({ queryKey: ['handyman', 'job-dashboard'] })
    },
  })
}

/**
 * Hook to fetch comprehensive job dashboard data.
 * Includes job details, task progress, time stats, session count, and report stats.
 */
export function useJobDashboard(jobId: string) {
  return useQuery({
    queryKey: ['handyman', 'job-dashboard', jobId],
    queryFn: async () => {
      try {
        const response = await apiClient
          .get(`handyman/jobs/${jobId}/dashboard/`)
          .json<ApiResponse<JobDashboardData>>()
        return response.data
      } catch (error: any) {
        console.error('ERROR fetching job dashboard:', error)
        if (error.response) {
          const errorBody = await error.response.json().catch(() => ({}))
          console.error('ERROR body:', errorBody)
        }
        throw error
      }
    },
    enabled: !!jobId,
    staleTime: 5 * 1000, // 5 seconds
  })
}

/**
 * Hook to create a review for a homeowner.
 */
export function useCreateHomeownerReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ jobId, data }: { jobId: string; data: CreateReviewRequest }) => {
      const response = await apiClient
        .post(`handyman/jobs/${jobId}/review/`, { json: data })
        .json<ApiResponse<any>>()
      return response.data
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ['handyman', 'job-dashboard', jobId] })
    },
  })
}
