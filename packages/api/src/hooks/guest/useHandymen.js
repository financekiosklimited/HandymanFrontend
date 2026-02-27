System.register(['@tanstack/react-query', '../../client'], (exports_1, context_1) => {
  let react_query_1
  let client_1
  const __moduleName = context_1 && context_1.id
  function useGuestHandymen(params) {
    const isEnabled = params?.enabled !== false
    return react_query_1.useInfiniteQuery({
      queryKey: ['guest', 'handymen', params],
      queryFn: async ({ pageParam = 1 }) => {
        try {
          const searchParams = new URLSearchParams()
          if (params?.latitude) searchParams.set('latitude', params.latitude.toString())
          if (params?.longitude) searchParams.set('longitude', params.longitude.toString())
          if (params?.search) searchParams.set('search', params.search)
          if (params?.category) searchParams.set('category', params.category)
          searchParams.set('page', pageParam.toString())
          const url = `guest/handymen/?${searchParams.toString()}`
          const response = await client_1.apiClient.get(url).json()
          return {
            results: response.data || [],
            page: response.meta?.pagination?.page || 1,
            hasNext: response.meta?.pagination?.has_next || false,
            totalCount: response.meta?.pagination?.total_count || 0,
          }
        } catch (error) {
          console.error('Error fetching handymen:', error)
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
      enabled: isEnabled,
    })
  }
  exports_1('useGuestHandymen', useGuestHandymen)
  function useGuestHandyman(publicId) {
    return react_query_1.useQuery({
      queryKey: ['guest', 'handymen', publicId],
      queryFn: async () => {
        const response = await client_1.apiClient.get(`guest/handymen/${publicId}/`).json()
        return response.data
      },
      enabled: !!publicId,
    })
  }
  exports_1('useGuestHandyman', useGuestHandyman)
  /**
   * Hook to fetch reviews for a specific handyman (guest/public endpoint).
   * Returns paginated list of reviews with censored reviewer names.
   */
  function useGuestHandymanReviews(publicId, options) {
    const isEnabled = options?.enabled !== false && !!publicId
    return react_query_1.useInfiniteQuery({
      queryKey: ['guest', 'handymen', publicId, 'reviews'],
      queryFn: async ({ pageParam = 1 }) => {
        try {
          const searchParams = new URLSearchParams()
          searchParams.set('page', pageParam.toString())
          const url = `guest/handymen/${publicId}/reviews/?${searchParams.toString()}`
          const response = await client_1.apiClient.get(url).json()
          return {
            results: response.data || [],
            page: response.meta?.pagination?.page || 1,
            hasNext: response.meta?.pagination?.has_next || false,
            totalCount: response.meta?.pagination?.total_count || 0,
            ratingStats: response.meta?.rating_stats,
          }
        } catch (error) {
          console.error('Error fetching guest handyman reviews:', error)
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
      enabled: isEnabled,
    })
  }
  exports_1('useGuestHandymanReviews', useGuestHandymanReviews)
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
