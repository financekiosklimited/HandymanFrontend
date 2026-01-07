import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type { ApiResponse, HandymanCategory } from '../../types/common'

export function useHandymanCategories() {
  return useQuery({
    queryKey: ['handyman-categories'],
    queryFn: async () => {
      const response = await apiClient
        .get('handyman-categories/')
        .json<ApiResponse<HandymanCategory[]>>()

      return response.data
    },
  })
}
