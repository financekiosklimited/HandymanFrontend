import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type { ApiResponse, ReimbursementCategory } from '../../types'

/**
 * Hook to fetch reimbursement categories (public endpoint).
 */
export function useReimbursementCategories() {
  return useQuery({
    queryKey: ['reimbursement-categories'],
    queryFn: async () => {
      const response = await apiClient
        .get('reimbursement-categories/')
        .json<ApiResponse<ReimbursementCategory[]>>()
      return response.data || []
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes since categories rarely change
  })
}
