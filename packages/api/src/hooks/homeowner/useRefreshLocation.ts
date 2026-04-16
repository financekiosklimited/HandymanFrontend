import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type {
  HomeownerLocationRefreshEnvelope,
  HomeownerLocationRefreshRequest,
} from '../../types/homeowner'

export function useRefreshHomeownerLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: HomeownerLocationRefreshRequest) => {
      const response = await apiClient
        .post('homeowner/profile/location/refresh/', { json: data })
        .json<HomeownerLocationRefreshEnvelope>()

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'handymen', 'nearby'] })
    },
  })
}
