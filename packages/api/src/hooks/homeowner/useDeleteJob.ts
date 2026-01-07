import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../client'

/**
 * Hook to delete (soft delete) a job listing for homeowner.
 * Sets job status to 'deleted'.
 */
export function useDeleteJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (publicId: string) => {
      await apiClient.delete(`homeowner/jobs/${publicId}/`)
      return { publicId }
    },
    onSuccess: (_, publicId) => {
      // Invalidate homeowner jobs cache to refetch
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'jobs'] })
      // Remove specific job from cache
      queryClient.removeQueries({ queryKey: ['homeowner', 'jobs', publicId] })
    },
  })
}
