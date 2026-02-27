System.register(['@tanstack/react-query', '../../client'], (exports_1, context_1) => {
  var react_query_1, client_1
  var __moduleName = context_1 && context_1.id
  /**
   * Hook to delete (soft delete) a job listing for homeowner.
   * Sets job status to 'deleted'.
   */
  function useDeleteJob() {
    const queryClient = react_query_1.useQueryClient()
    return react_query_1.useMutation({
      mutationFn: async (publicId) => {
        await client_1.apiClient.delete(`homeowner/jobs/${publicId}/`)
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
  exports_1('useDeleteJob', useDeleteJob)
  return {
    setters: [
      (react_query_1_1) => {
        react_query_1 = react_query_1_1
      },
      (client_1_1) => {
        client_1 = client_1_1
      },
    ],
    execute: () => {},
  }
})
