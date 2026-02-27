System.register(['@tanstack/react-query', '../../client'], (exports_1, context_1) => {
  var react_query_1, client_1
  var __moduleName = context_1 && context_1.id
  // ========== List Hooks ==========
  /**
   * Hook to fetch handyman's received direct offers list.
   * Supports filtering by offer_status.
   */
  function useHandymanDirectOffers(params, options) {
    return react_query_1.useInfiniteQuery({
      queryKey: ['handyman', 'direct-offers', params],
      queryFn: async ({ pageParam = 1 }) => {
        try {
          const searchParams = new URLSearchParams()
          if (params?.offer_status) searchParams.set('offer_status', params.offer_status)
          if (params?.page_size) searchParams.set('page_size', params.page_size.toString())
          searchParams.set('page', pageParam.toString())
          const url = `handyman/direct-offers/?${searchParams.toString()}`
          const response = await client_1.apiClient.get(url).json()
          return {
            results: response.data || [],
            page: response.meta?.pagination?.page || 1,
            hasNext: response.meta?.pagination?.has_next || false,
            totalCount: response.meta?.pagination?.total_count || 0,
          }
        } catch (error) {
          console.error('Error fetching handyman direct offers:', error)
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
      enabled: options?.enabled ?? true,
    })
  }
  exports_1('useHandymanDirectOffers', useHandymanDirectOffers)
  /**
   * Hook to fetch a single direct offer detail for handyman.
   */
  function useHandymanDirectOffer(publicId) {
    return react_query_1.useQuery({
      queryKey: ['handyman', 'direct-offers', publicId],
      queryFn: async () => {
        const response = await client_1.apiClient.get(`handyman/direct-offers/${publicId}/`).json()
        return response.data
      },
      enabled: !!publicId,
    })
  }
  exports_1('useHandymanDirectOffer', useHandymanDirectOffer)
  // ========== Mutation Hooks ==========
  /**
   * Hook to accept a direct offer.
   * The job will immediately start (status: in_progress).
   */
  function useAcceptDirectOffer() {
    const queryClient = react_query_1.useQueryClient()
    return react_query_1.useMutation({
      mutationFn: async (publicId) => {
        const response = await client_1.apiClient
          .post(`handyman/direct-offers/${publicId}/accept/`)
          .json()
        return response.data
      },
      onSuccess: (_, publicId) => {
        // Invalidate direct offers caches
        queryClient.invalidateQueries({ queryKey: ['handyman', 'direct-offers'], exact: true })
        queryClient.invalidateQueries({
          queryKey: ['handyman', 'direct-offers', publicId],
          exact: true,
        })
        // Invalidate my-jobs list since accepted offer becomes a job
        queryClient.invalidateQueries({ queryKey: ['handyman', 'my-jobs'], exact: true })
        // Note: Removed broad 'assigned-jobs' and 'job-detail' invalidations
        // as they match too many queries and cause unnecessary refetches
      },
    })
  }
  exports_1('useAcceptDirectOffer', useAcceptDirectOffer)
  /**
   * Hook to reject a direct offer with optional reason.
   */
  function useRejectDirectOffer() {
    const queryClient = react_query_1.useQueryClient()
    return react_query_1.useMutation({
      mutationFn: async ({ publicId, data }) => {
        const response = await client_1.apiClient
          .post(`handyman/direct-offers/${publicId}/reject/`, {
            json: data || {},
          })
          .json()
        return response.data
      },
      onSuccess: (_, { publicId }) => {
        // Invalidate caches
        queryClient.invalidateQueries({ queryKey: ['handyman', 'direct-offers'] })
        queryClient.invalidateQueries({ queryKey: ['handyman', 'direct-offers', publicId] })
      },
    })
  }
  exports_1('useRejectDirectOffer', useRejectDirectOffer)
  /**
   * Hook to get the count of pending direct offers.
   * Useful for showing badge on navigation.
   */
  function useHandymanPendingOffersCount(enabled = true) {
    return react_query_1.useQuery({
      queryKey: ['handyman', 'direct-offers', 'pending-count'],
      queryFn: async () => {
        try {
          const response = await client_1.apiClient
            .get('handyman/direct-offers/?offer_status=pending&page_size=1')
            .json()
          return response.meta?.pagination?.total_count || 0
        } catch (error) {
          console.error('Error fetching pending offers count:', error)
          return 0
        }
      },
      enabled,
      staleTime: 30000, // 30 seconds
      refetchInterval: enabled ? 60000 : false, // Refetch every minute when enabled
    })
  }
  exports_1('useHandymanPendingOffersCount', useHandymanPendingOffersCount)
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
