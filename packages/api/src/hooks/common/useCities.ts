import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type { ApiResponse, City } from '../../types/common'

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const response = await apiClient.get('cities/').json<ApiResponse<City[]>>()

      return response.data
    },
  })
}
