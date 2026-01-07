import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type { PaginatedArrayResponse, ApiResponse, GuestJob } from '../../types/guest'

interface GuestJobsParams {
  category?: string
  city?: string
  latitude?: number
  longitude?: number
  search?: string
}

export function useGuestJobs(params?: GuestJobsParams) {
  return useInfiniteQuery({
    queryKey: ['guest', 'jobs', params],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const searchParams = new URLSearchParams()
        if (params?.category) searchParams.set('category', params.category)
        if (params?.city) searchParams.set('city', params.city)
        if (params?.latitude) searchParams.set('latitude', params.latitude.toString())
        if (params?.longitude) searchParams.set('longitude', params.longitude.toString())
        if (params?.search) searchParams.set('search', params.search)
        searchParams.set('page', pageParam.toString())

        const url = `guest/jobs/?${searchParams.toString()}`
        console.log('Fetching jobs from:', url)

        const response = await apiClient
          .get(url)
          .json<PaginatedArrayResponse<GuestJob>>()

        console.log('Jobs response:', response)
        
        return {
          results: response.data || [],
          page: response.meta?.pagination?.page || 1,
          hasNext: response.meta?.pagination?.has_next || false,
          totalCount: response.meta?.pagination?.total_count || 0,
        }
      } catch (error) {
        console.error('Error fetching jobs:', error)
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

export function useGuestJob(publicId: string) {
  return useQuery({
    queryKey: ['guest', 'jobs', publicId],
    queryFn: async () => {
      const response = await apiClient
        .get(`guest/jobs/${publicId}/`)
        .json<ApiResponse<GuestJob>>()

      return response.data
    },
    enabled: !!publicId,
  })
}
