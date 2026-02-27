import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type { ApiResponse } from '../../types/common'
import type { Discount } from '../../types/discount'

export interface UseDiscountsOptions {
  role?: 'homeowner' | 'handyman'
  enabled?: boolean
}

/**
 * Hook to fetch active discounts
 * @param options - Optional configuration including role filter
 * @returns Query result with discounts array
 */
export function useDiscounts(options: UseDiscountsOptions = {}) {
  const { role, enabled = true } = options

  return useQuery({
    queryKey: ['discounts', role, 'v1'],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (role) {
        searchParams.append('role', role)
      }

      const url = `discounts/?${searchParams.toString()}`

      try {
        const response = await apiClient.get(url).json<ApiResponse<Discount[]>>()
        return response.data
      } catch (error) {
        console.error('[useDiscounts] Error fetching discounts:', error)
        throw error
      }
    },
    enabled,
    staleTime: 0, // Disable stale time for debugging
    refetchOnMount: 'always',
  })
}

/**
 * Hook to fetch a single discount by code
 * @param code - The discount code
 * @param enabled - Whether to enable the query
 * @returns Query result with discount details
 */
export function useDiscount(code: string, enabled = true) {
  return useQuery({
    queryKey: ['discounts', 'detail', code],
    queryFn: async () => {
      const response = await apiClient.get(`discounts/${code}/`).json<ApiResponse<Discount>>()
      return response.data
    },
    enabled: enabled && !!code,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
