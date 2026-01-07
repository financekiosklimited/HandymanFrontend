import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type { PaginatedArrayResponse, ApiResponse, HomeownerJob, HomeownerHandyman, HomeownerProfile, HomeownerProfileUpdateRequest, Notification, HomeownerApplication, HomeownerApplicationDetail } from '../../types/homeowner'


interface HomeownerJobsParams {
  status?: string
  category?: string
  search?: string
}

/**
 * Hook to fetch homeowner's own job listings.
 */
export function useHomeownerJobs(params?: HomeownerJobsParams) {
  return useInfiniteQuery({
    queryKey: ['homeowner', 'jobs', params],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const searchParams = new URLSearchParams()
        if (params?.status) searchParams.set('status', params.status)
        if (params?.category) searchParams.set('category', params.category)
        if (params?.search) searchParams.set('search', params.search)
        searchParams.set('page', pageParam.toString())

        const url = `homeowner/jobs/?${searchParams.toString()}`
        const response = await apiClient
          .get(url)
          .json<PaginatedArrayResponse<HomeownerJob>>()

        return {
          results: response.data || [],
          page: response.meta?.pagination?.page || 1,
          hasNext: response.meta?.pagination?.has_next || false,
          totalCount: response.meta?.pagination?.total_count || 0,
        }
      } catch (error) {
        console.error('Error fetching homeowner jobs:', error)
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
 * Hook to fetch a single job detail for homeowner.
 */
export function useHomeownerJob(publicId: string) {
  return useQuery({
    queryKey: ['homeowner', 'jobs', publicId],
    queryFn: async () => {
      const response = await apiClient
        .get(`homeowner/jobs/${publicId}/`)
        .json<ApiResponse<HomeownerJob>>()

      return response.data
    },
    enabled: !!publicId,
  })
}

interface NearbyHandymenParams {
  latitude?: number
  longitude?: number
  radius_km?: number
  category?: string
  search?: string
  enabled?: boolean
}

/**
 * Hook to fetch nearby handymen for homeowners.
 * Requires latitude and longitude to be provided.
 */
export function useNearbyHandymen(params?: NearbyHandymenParams) {
  // Only fetch when latitude and longitude are available
  const hasLocation = !!(params?.latitude && params?.longitude)
  const isEnabled = params?.enabled !== false && hasLocation

  return useInfiniteQuery({
    queryKey: ['homeowner', 'handymen', 'nearby', params],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const searchParams = new URLSearchParams()
        if (params?.latitude) searchParams.set('latitude', params.latitude.toString())
        if (params?.longitude) searchParams.set('longitude', params.longitude.toString())
        if (params?.radius_km) searchParams.set('radius_km', params.radius_km.toString())
        if (params?.category) searchParams.set('category', params.category)
        if (params?.search) searchParams.set('search', params.search)
        searchParams.set('page', pageParam.toString())

        const url = `homeowner/handymen/nearby/?${searchParams.toString()}`
        const response = await apiClient
          .get(url)
          .json<PaginatedArrayResponse<HomeownerHandyman>>()

        return {
          results: response.data || [],
          page: response.meta?.pagination?.page || 1,
          hasNext: response.meta?.pagination?.has_next || false,
          totalCount: response.meta?.pagination?.total_count || 0,
        }
      } catch (error) {
        console.error('Error fetching nearby handymen:', error)
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
    enabled: isEnabled,
  })
}

/**
 * Hook to fetch a single handyman detail for homeowner.
 */
export function useHomeownerHandyman(publicId: string) {
  return useQuery({
    queryKey: ['homeowner', 'handymen', publicId],
    queryFn: async () => {
      const response = await apiClient
        .get(`homeowner/handymen/${publicId}/`)
        .json<ApiResponse<HomeownerHandyman>>()

      return response.data
    },
    enabled: !!publicId,
  })
}

/**
 * Hook to fetch current homeowner's profile.
 */
export function useHomeownerProfile() {
  return useQuery({
    queryKey: ['homeowner', 'profile'],
    queryFn: async () => {
      const response = await apiClient
        .get('homeowner/profile')
        .json<ApiResponse<HomeownerProfile>>()

      return response.data
    },
  })
}

/**
 * Hook to update homeowner profile.
 */
export function useUpdateHomeownerProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: HomeownerProfileUpdateRequest) => {
      const response = await apiClient
        .put('homeowner/profile', { json: data })
        .json<ApiResponse<HomeownerProfile>>()

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'profile'] })
    },
  })
}

/**
 * Hook to fetch notifications for homeowner.
 */
export function useHomeownerNotifications() {
  return useInfiniteQuery({
    queryKey: ['homeowner', 'notifications'],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const searchParams = new URLSearchParams()
        searchParams.set('page', pageParam.toString())

        const url = `homeowner/notifications/?${searchParams.toString()}`
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
export function useMarkHomeownerNotificationRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (publicId: string) => {
      const response = await apiClient
        .post(`homeowner/notifications/${publicId}/read/`)
        .json<ApiResponse<{ public_id: string; is_read: boolean; read_at: string }>>()

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'notifications'] })
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'unread-count'] })
    },
  })
}

/**
 * Hook to get the number of unread notifications for the homeowner.
 * Uses the dedicated unread-count endpoint for efficiency.
 */
export function useHomeownerUnreadCount(enabled = true) {
  return useQuery({
    queryKey: ['homeowner', 'unread-count'],
    queryFn: async () => {
      try {
        const response = await apiClient
          .get('homeowner/notifications/unread-count/')
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

// ========== Application Hooks ==========

interface HomeownerApplicationsParams {
  job_id?: string
  status?: string
}

/**
 * Hook to fetch applications for homeowner's jobs.
 * Supports filtering by job_id and status.
 */
export function useHomeownerApplications(params?: HomeownerApplicationsParams) {
  return useInfiniteQuery({
    queryKey: ['homeowner', 'applications', params],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const searchParams = new URLSearchParams()
        if (params?.job_id) searchParams.set('job_id', params.job_id)
        if (params?.status) searchParams.set('status', params.status)
        searchParams.set('page', pageParam.toString())

        const url = `homeowner/applications/?${searchParams.toString()}`
        const response = await apiClient
          .get(url)
          .json<PaginatedArrayResponse<HomeownerApplication>>()

        return {
          results: response.data || [],
          page: response.meta?.pagination?.page || 1,
          hasNext: response.meta?.pagination?.has_next || false,
          totalCount: response.meta?.pagination?.total_count || 0,
        }
      } catch (error) {
        console.error('Error fetching homeowner applications:', error)
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
 * Hook to fetch a single application detail for homeowner.
 */
export function useHomeownerApplicationDetail(publicId: string) {
  return useQuery({
    queryKey: ['homeowner', 'applications', publicId],
    queryFn: async () => {
      const response = await apiClient
        .get(`homeowner/applications/${publicId}/`)
        .json<ApiResponse<HomeownerApplicationDetail>>()

      return response.data
    },
    enabled: !!publicId,
  })
}

/**
 * Hook to approve an application.
 * This will set the job status to 'in_progress' and reject all other pending applications.
 */
export function useApproveApplication() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (publicId: string) => {
      const response = await apiClient
        .post(`homeowner/applications/${publicId}/approve/`)
        .json<ApiResponse<HomeownerApplicationDetail>>()

      return response.data
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'applications'] })
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'jobs'] })
    },
  })
}

/**
 * Hook to reject an application.
 */
export function useRejectApplication() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (publicId: string) => {
      const response = await apiClient
        .post(`homeowner/applications/${publicId}/reject/`)
        .json<ApiResponse<HomeownerApplicationDetail>>()

      return response.data
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'applications'] })
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'jobs'] })
    },
  })
}

export * from './useCreateJob'
export * from './useUpdateJob'
export * from './useDeleteJob'

