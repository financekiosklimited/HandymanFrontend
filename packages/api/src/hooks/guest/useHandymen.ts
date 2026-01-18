import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type { PaginatedArrayResponse, ApiResponse, GuestHandyman } from '../../types/guest'

interface GuestHandymenParams {
  latitude?: number
  longitude?: number
  search?: string
  enabled?: boolean
}

export function useGuestHandymen(params?: GuestHandymenParams) {
  const isEnabled = params?.enabled !== false

  return useInfiniteQuery({
    queryKey: ['guest', 'handymen', params],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const searchParams = new URLSearchParams()
        if (params?.latitude) searchParams.set('latitude', params.latitude.toString())
        if (params?.longitude) searchParams.set('longitude', params.longitude.toString())
        if (params?.search) searchParams.set('search', params.search)
        searchParams.set('page', pageParam.toString())

        const url = `guest/handymen/?${searchParams.toString()}`

        const response = await apiClient.get(url).json<PaginatedArrayResponse<GuestHandyman>>()

        return {
          results: response.data || [],
          page: response.meta?.pagination?.page || 1,
          hasNext: response.meta?.pagination?.has_next || false,
          totalCount: response.meta?.pagination?.total_count || 0,
        }
      } catch (error) {
        console.error('Error fetching handymen:', error)
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

export function useGuestHandyman(publicId: string) {
  return useQuery({
    queryKey: ['guest', 'handymen', publicId],
    queryFn: async () => {
      const response = await apiClient
        .get(`guest/handymen/${publicId}/`)
        .json<ApiResponse<GuestHandyman>>()

      return response.data
    },
    enabled: !!publicId,
  })
}
