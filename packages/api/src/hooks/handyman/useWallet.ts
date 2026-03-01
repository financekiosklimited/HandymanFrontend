import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type {
  ApiResponse,
  PaginatedArrayResponse,
  WalletBalance,
  Withdrawal,
  CreateWithdrawalRequest,
} from '../../types'

/**
 * Hook to fetch the handyman's wallet balance from Stripe Connect.
 * Returns available and pending amounts.
 */
export function useWalletBalance(enabled = true) {
  return useQuery({
    queryKey: ['handyman', 'wallet', 'balance'],
    queryFn: async () => {
      const response = await apiClient
        .get('handyman/wallet/balance/')
        .json<ApiResponse<WalletBalance>>()
      return response.data
    },
    enabled,
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook to fetch paginated withdrawal history.
 */
export function useWithdrawals() {
  return useInfiniteQuery({
    queryKey: ['handyman', 'wallet', 'withdrawals'],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const searchParams = new URLSearchParams()
        searchParams.set('page', pageParam.toString())

        const url = `handyman/wallet/withdrawals/?${searchParams.toString()}`
        const response = await apiClient.get(url).json<PaginatedArrayResponse<Withdrawal>>()

        return {
          results: response.data || [],
          page: response.meta?.pagination?.page || 1,
          hasNext: response.meta?.pagination?.has_next || false,
          totalCount: response.meta?.pagination?.total_count || 0,
        }
      } catch (error) {
        console.error('Error fetching withdrawals:', error)
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
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to create a withdrawal request (standard or instant payout).
 */
export function useCreateWithdrawal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateWithdrawalRequest) => {
      const response = await apiClient
        .post('handyman/wallet/withdrawals/', { json: data })
        .json<ApiResponse<Withdrawal>>()
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['handyman', 'wallet', 'balance'] })
      queryClient.invalidateQueries({ queryKey: ['handyman', 'wallet', 'withdrawals'] })
    },
  })
}
