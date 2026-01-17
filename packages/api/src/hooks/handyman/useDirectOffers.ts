import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type { ApiResponse, PaginatedArrayResponse } from '../../types/common'
import type {
  HandymanDirectOffer,
  HandymanDirectOfferDetail,
  RejectDirectOfferRequest,
  DirectOfferStatus,
} from '../../types/direct-offer'

// ========== Query Params ==========

interface HandymanDirectOffersParams {
  offer_status?: DirectOfferStatus
  page_size?: number
}

// ========== List Hooks ==========

/**
 * Hook to fetch handyman's received direct offers list.
 * Supports filtering by offer_status.
 */
export function useHandymanDirectOffers(params?: HandymanDirectOffersParams) {
  return useInfiniteQuery({
    queryKey: ['handyman', 'direct-offers', params],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const searchParams = new URLSearchParams()
        if (params?.offer_status) searchParams.set('offer_status', params.offer_status)
        if (params?.page_size) searchParams.set('page_size', params.page_size.toString())
        searchParams.set('page', pageParam.toString())

        const url = `handyman/direct-offers/?${searchParams.toString()}`
        const response = await apiClient
          .get(url)
          .json<PaginatedArrayResponse<HandymanDirectOffer>>()

        return {
          results: response.data || [],
          page: response.meta?.pagination?.page || 1,
          hasNext: response.meta?.pagination?.has_next || false,
          totalCount: response.meta?.pagination?.total_count || 0,
        }
      } catch (error) {
        console.error('Error fetching handyman direct offers:', error)
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
 * Hook to fetch a single direct offer detail for handyman.
 */
export function useHandymanDirectOffer(publicId: string) {
  return useQuery({
    queryKey: ['handyman', 'direct-offers', publicId],
    queryFn: async () => {
      const response = await apiClient
        .get(`handyman/direct-offers/${publicId}/`)
        .json<ApiResponse<HandymanDirectOfferDetail>>()

      return response.data
    },
    enabled: !!publicId,
  })
}

// ========== Mutation Hooks ==========

/**
 * Hook to accept a direct offer.
 * The job will immediately start (status: in_progress).
 */
export function useAcceptDirectOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (publicId: string) => {
      const response = await apiClient
        .post(`handyman/direct-offers/${publicId}/accept/`)
        .json<ApiResponse<HandymanDirectOfferDetail>>()

      return response.data
    },
    onSuccess: (_, publicId) => {
      // Invalidate caches
      queryClient.invalidateQueries({ queryKey: ['handyman', 'direct-offers'] })
      queryClient.invalidateQueries({ queryKey: ['handyman', 'direct-offers', publicId] })
      // Also invalidate jobs since accepted offer becomes a job
      queryClient.invalidateQueries({ queryKey: ['handyman', 'my-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['handyman', 'assigned-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['handyman', 'job-detail'] })
    },
  })
}

/**
 * Hook to reject a direct offer with optional reason.
 */
export function useRejectDirectOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      publicId,
      data,
    }: { publicId: string; data?: RejectDirectOfferRequest }) => {
      const response = await apiClient
        .post(`handyman/direct-offers/${publicId}/reject/`, {
          json: data || {},
        })
        .json<ApiResponse<HandymanDirectOfferDetail>>()

      return response.data
    },
    onSuccess: (_, { publicId }) => {
      // Invalidate caches
      queryClient.invalidateQueries({ queryKey: ['handyman', 'direct-offers'] })
      queryClient.invalidateQueries({ queryKey: ['handyman', 'direct-offers', publicId] })
    },
  })
}

/**
 * Hook to get the count of pending direct offers.
 * Useful for showing badge on navigation.
 */
export function useHandymanPendingOffersCount(enabled = true) {
  return useQuery({
    queryKey: ['handyman', 'direct-offers', 'pending-count'],
    queryFn: async () => {
      try {
        const response = await apiClient
          .get('handyman/direct-offers/?offer_status=pending&page_size=1')
          .json<PaginatedArrayResponse<HandymanDirectOffer>>()

        return response.meta?.pagination?.total_count || 0
      } catch (error) {
        console.error('Error fetching pending offers count:', error)
        return 0
      }
    },
    enabled,
    staleTime: 30000, // 30 seconds
    refetchInterval: enabled ? 60000 : false, // Refetch every minute when enabled
  })
}
