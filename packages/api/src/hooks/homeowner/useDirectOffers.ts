import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type { ApiResponse, PaginatedArrayResponse } from '../../types/common'
import type {
  HomeownerDirectOffer,
  HomeownerDirectOfferDetail,
  CreateDirectOfferRequest,
  DirectOfferStatus,
} from '../../types/direct-offer'

// ========== Query Params ==========

interface HomeownerDirectOffersParams {
  offer_status?: DirectOfferStatus
  page_size?: number
}

// ========== List Hooks ==========

/**
 * Hook to fetch homeowner's direct offers list.
 * Supports filtering by offer_status.
 */
export function useHomeownerDirectOffers(params?: HomeownerDirectOffersParams) {
  return useInfiniteQuery({
    queryKey: ['homeowner', 'direct-offers', params],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const searchParams = new URLSearchParams()
        if (params?.offer_status) searchParams.set('offer_status', params.offer_status)
        if (params?.page_size) searchParams.set('page_size', params.page_size.toString())
        searchParams.set('page', pageParam.toString())

        const url = `homeowner/direct-offers/?${searchParams.toString()}`
        const response = await apiClient
          .get(url)
          .json<PaginatedArrayResponse<HomeownerDirectOffer>>()

        return {
          results: response.data || [],
          page: response.meta?.pagination?.page || 1,
          hasNext: response.meta?.pagination?.has_next || false,
          totalCount: response.meta?.pagination?.total_count || 0,
        }
      } catch (error) {
        console.error('Error fetching homeowner direct offers:', error)
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
 * Hook to fetch a single direct offer detail for homeowner.
 */
export function useHomeownerDirectOffer(publicId: string) {
  return useQuery({
    queryKey: ['homeowner', 'direct-offers', publicId],
    queryFn: async () => {
      const response = await apiClient
        .get(`homeowner/direct-offers/${publicId}/`)
        .json<ApiResponse<HomeownerDirectOfferDetail>>()

      return response.data
    },
    enabled: !!publicId,
  })
}

// ========== Mutation Hooks ==========

/**
 * Hook to create a new direct offer.
 * Supports multipart/form-data for attachment uploads.
 */
export function useCreateDirectOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateDirectOfferRequest) => {
      const formData = new FormData()

      // Add basic fields
      formData.append('target_handyman_id', data.target_handyman_id)
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('estimated_budget', data.estimated_budget.toString())
      formData.append('category_id', data.category_id)
      formData.append('city_id', data.city_id)
      formData.append('address', data.address)

      if (data.postal_code) {
        formData.append('postal_code', data.postal_code)
      }

      if (data.latitude !== undefined) {
        formData.append('latitude', data.latitude.toString())
      }

      if (data.longitude !== undefined) {
        formData.append('longitude', data.longitude.toString())
      }

      if (data.offer_expires_in_days !== undefined) {
        formData.append('offer_expires_in_days', data.offer_expires_in_days.toString())
      }

      // Add tasks using indexed format
      if (data.tasks && data.tasks.length > 0) {
        data.tasks.forEach((task, index) => {
          formData.append(`tasks[${index}].title`, task.title)
          if (task.description) {
            formData.append(`tasks[${index}].description`, task.description)
          }
        })
      }

      // Add attachments using indexed format
      if (data.attachments && data.attachments.length > 0) {
        data.attachments.forEach((attachment, index) => {
          // Main file
          // @ts-ignore - React Native FormData accepts RNFile object
          formData.append(`attachments[${index}].file`, attachment.file)

          // Thumbnail for videos
          if (attachment.thumbnail) {
            // @ts-ignore - React Native FormData accepts RNFile object
            formData.append(`attachments[${index}].thumbnail`, attachment.thumbnail)
          }

          // Duration for videos
          if (attachment.duration_seconds !== undefined) {
            formData.append(
              `attachments[${index}].duration_seconds`,
              attachment.duration_seconds.toString()
            )
          }
        })
      }

      const response = await apiClient
        .post('homeowner/direct-offers/', {
          body: formData,
          headers: {
            'Content-Type': undefined,
          },
        })
        .json<ApiResponse<HomeownerDirectOfferDetail>>()

      return response.data
    },
    onSuccess: () => {
      // Invalidate direct offers cache to refetch
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'direct-offers'] })
    },
  })
}

/**
 * Hook to cancel a pending direct offer.
 */
export function useCancelDirectOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (publicId: string) => {
      await apiClient.delete(`homeowner/direct-offers/${publicId}/`)
      return { publicId }
    },
    onSuccess: (_, publicId) => {
      // Invalidate caches
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'direct-offers'] })
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'direct-offers', publicId] })
    },
  })
}

/**
 * Hook to convert a rejected/expired direct offer to a public job.
 */
export function useConvertToPublicJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (publicId: string) => {
      const response = await apiClient
        .post(`homeowner/direct-offers/${publicId}/convert-to-public/`)
        .json<ApiResponse<HomeownerDirectOfferDetail>>()

      return response.data
    },
    onSuccess: (_, publicId) => {
      // Invalidate both direct offers and jobs caches
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'direct-offers'] })
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'direct-offers', publicId] })
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'jobs'] })
    },
  })
}
