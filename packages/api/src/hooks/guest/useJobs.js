System.register(['@tanstack/react-query', '../../client'], (exports_1, context_1) => {
  let react_query_1
  let client_1
  const __moduleName = context_1 && context_1.id
  function useGuestJobs(params) {
    return react_query_1.useInfiniteQuery({
      queryKey: ['guest', 'jobs', params],
      queryFn: async ({ pageParam = 1 }) => {
        try {
          const searchParams = new URLSearchParams()
          if (params?.category) searchParams.set('category_id', params.category)
          if (params?.city) searchParams.set('city_id', params.city)
          if (params?.latitude) searchParams.set('latitude', params.latitude.toString())
          if (params?.longitude) searchParams.set('longitude', params.longitude.toString())
          if (params?.search) searchParams.set('search', params.search)
          searchParams.set('page', pageParam.toString())
          const url = `guest/jobs/?${searchParams.toString()}`
          const response = await client_1.apiClient.get(url).json()
          return {
            results: response.data || [],
            page: response.meta?.pagination?.page || 1,
            hasNext: response.meta?.pagination?.has_next || false,
            totalCount: response.meta?.pagination?.total_count || 0,
          }
        } catch (error) {
          console.error('Error fetching jobs:', error)
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
    })
  }
  exports_1('useGuestJobs', useGuestJobs)
  function useGuestJob(publicId) {
    return react_query_1.useQuery({
      queryKey: ['guest', 'jobs', publicId],
      queryFn: async () => {
        const response = await client_1.apiClient.get(`guest/jobs/${publicId}/`).json()
        return response.data
      },
      enabled: !!publicId,
    })
  }
  exports_1('useGuestJob', useGuestJob)
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
