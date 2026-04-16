import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type {
  HandymanLocationRefreshEnvelope,
  HandymanLocationRefreshRequest,
} from '../../types/handyman'

export function useRefreshHandymanLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: HandymanLocationRefreshRequest) => {
      const response = await apiClient
        .post('handyman/profile/location/refresh/', { json: data })
        .json<HandymanLocationRefreshEnvelope>()

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['handyman', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['handyman', 'jobs', 'for-you'] })
    },
  })
}
