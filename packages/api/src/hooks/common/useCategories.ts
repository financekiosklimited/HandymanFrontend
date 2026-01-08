import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type { ApiResponse, Category } from '../../types/common'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('job-categories/').json<ApiResponse<Category[]>>()

      return response.data
    },
  })
}
