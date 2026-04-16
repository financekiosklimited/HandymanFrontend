import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type { GuestLocationRefreshEnvelope, GuestLocationRefreshRequest } from '../../types/guest'

export function useRefreshGuestLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: GuestLocationRefreshRequest) => {
      const response = await apiClient
        .post('guest/location/refresh/', { json: data })
        .json<GuestLocationRefreshEnvelope>()

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guest', 'handymen'] })
    },
  })
}
