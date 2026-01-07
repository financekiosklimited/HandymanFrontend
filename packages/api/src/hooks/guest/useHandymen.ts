import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type { PaginatedArrayResponse, ApiResponse, GuestHandyman } from '../../types/guest'

interface GuestHandymenParams {
  latitude?: number
  longitude?: number
  radius_km?: number
  enabled?: boolean
}

export function useGuestHandymen(params?: GuestHandymenParams) {
  // Only fetch when latitude and longitude are available
  const hasLocation = !!(params?.latitude && params?.longitude)
  const isEnabled = params?.enabled !== false && hasLocation

  return useInfiniteQuery({
    queryKey: ['guest', 'handymen', params],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const searchParams = new URLSearchParams()
        if (params?.latitude) searchParams.set('latitude', params.latitude.toString())
        if (params?.longitude) searchParams.set('longitude', params.longitude.toString())
        if (params?.radius_km) searchParams.set('radius_km', params.radius_km.toString())
        searchParams.set('page', pageParam.toString())

        const url = `guest/handymen/?${searchParams.toString()}`
        console.log('Fetching handymen from:', url)

        const response = await apiClient
          .get(url)
          .json<PaginatedArrayResponse<GuestHandyman>>()

        console.log('Handymen response:', response)
        
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
