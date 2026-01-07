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
        const response = await apiClient
          .get(url)
          .json<PaginatedArrayResponse<HandymanJobForYou>>()

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
        const response = await apiClient
          .get(url)
          .json<PaginatedArrayResponse<HandymanJob>>()

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
      const response = await apiClient
        .get('handyman/profile')
        .json<ApiResponse<HandymanProfile>>()

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
        const response = await apiClient
          .get(url)
          .json<PaginatedArrayResponse<JobApplication>>()

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
        const response = await apiClient
          .get(url)
          .json<PaginatedArrayResponse<Notification>>()

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
export function useHandymanUnreadCount(enabled: boolean = true) {
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

