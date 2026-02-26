System.register(['@tanstack/react-query', '../../client'], (exports_1, context_1) => {
  var react_query_1, client_1
  var __moduleName = context_1 && context_1.id
  // ========== List Hooks ==========
  /**
   * Hook to fetch homeowner's direct offers list.
   * Supports filtering by offer_status.
   */
  function useHomeownerDirectOffers(params) {
    return react_query_1.useInfiniteQuery({
      queryKey: ['homeowner', 'direct-offers', params],
      queryFn: async ({ pageParam = 1 }) => {
        try {
          const searchParams = new URLSearchParams()
          if (params?.offer_status) searchParams.set('offer_status', params.offer_status)
          if (params?.page_size) searchParams.set('page_size', params.page_size.toString())
          searchParams.set('page', pageParam.toString())
          const url = `homeowner/direct-offers/?${searchParams.toString()}`
          const response = await client_1.apiClient.get(url).json()
          return {
            results: response.data || [],
            page: response.meta?.pagination?.page || 1,
            hasNext: response.meta?.pagination?.has_next || false,
            totalCount: response.meta?.pagination?.total_count || 0,
          }
        } catch (error) {
          console.error('Error fetching homeowner direct offers:', error)
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
  exports_1('useHomeownerDirectOffers', useHomeownerDirectOffers)
  /**
   * Hook to fetch a single direct offer detail for homeowner.
   */
  function useHomeownerDirectOffer(publicId) {
    return react_query_1.useQuery({
      queryKey: ['homeowner', 'direct-offers', publicId],
      queryFn: async () => {
        const response = await client_1.apiClient.get(`homeowner/direct-offers/${publicId}/`).json()
        return response.data
      },
      enabled: !!publicId,
    })
  }
  exports_1('useHomeownerDirectOffer', useHomeownerDirectOffer)
  // ========== Mutation Hooks ==========
  /**
   * Hook to create a new direct offer.
   * Supports multipart/form-data for attachment uploads.
   */
  function useCreateDirectOffer() {
    const queryClient = react_query_1.useQueryClient()
    return react_query_1.useMutation({
      mutationFn: async (data) => {
        const formData = new FormData()
        // Add basic fields
        formData.append('target_handyman_id', data.target_handyman_id)
        formData.append('title', data.title)
        formData.append('description', data.description)
        formData.append('estimated_budget', data.estimated_budget.toString())
        formData.append('category_id', data.category_id)
        formData.append('city_id', data.city_id)
        formData.append('address', data.address)
        if (data.postal_code) {
          formData.append('postal_code', data.postal_code)
        }
        if (data.latitude !== undefined) {
          formData.append('latitude', data.latitude.toString())
        }
        if (data.longitude !== undefined) {
          formData.append('longitude', data.longitude.toString())
        }
        if (data.offer_expires_in_days !== undefined) {
          formData.append('offer_expires_in_days', data.offer_expires_in_days.toString())
        }
        // Add tasks using indexed format (consistent with useCreateJob/useUpdateJob)
        if (data.tasks && data.tasks.length > 0) {
          data.tasks.forEach((task, index) => {
            formData.append(`tasks[${index}]title`, task.title)
            if (task.description) {
              formData.append(`tasks[${index}]description`, task.description)
            }
          })
        }
        // Add attachments using indexed format
        if (data.attachments && data.attachments.length > 0) {
          data.attachments.forEach((attachment, index) => {
            // Main file
            // @ts-ignore - React Native FormData accepts RNFile object
            formData.append(`attachments[${index}].file`, attachment.file)
            // Thumbnail for videos
            if (attachment.thumbnail) {
              // @ts-ignore - React Native FormData accepts RNFile object
              formData.append(`attachments[${index}].thumbnail`, attachment.thumbnail)
            }
            // Duration for videos
            if (attachment.duration_seconds !== undefined) {
              formData.append(
                `attachments[${index}].duration_seconds`,
                attachment.duration_seconds.toString()
              )
            }
          })
        }
        const response = await client_1.apiClient
          .post('homeowner/direct-offers/', {
            body: formData,
            headers: {
              'Content-Type': undefined,
            },
          })
          .json()
        return response.data
      },
      onSuccess: () => {
        // Invalidate direct offers cache to refetch
        queryClient.invalidateQueries({ queryKey: ['homeowner', 'direct-offers'] })
      },
    })
  }
  exports_1('useCreateDirectOffer', useCreateDirectOffer)
  /**
   * Hook to cancel a pending direct offer.
   */
  function useCancelDirectOffer() {
    const queryClient = react_query_1.useQueryClient()
    return react_query_1.useMutation({
      mutationFn: async (publicId) => {
        await client_1.apiClient.delete(`homeowner/direct-offers/${publicId}/`)
        return { publicId }
      },
      onSuccess: (_, publicId) => {
        // Invalidate caches
        queryClient.invalidateQueries({ queryKey: ['homeowner', 'direct-offers'] })
        queryClient.invalidateQueries({ queryKey: ['homeowner', 'direct-offers', publicId] })
      },
    })
  }
  exports_1('useCancelDirectOffer', useCancelDirectOffer)
  /**
   * Hook to convert a rejected/expired direct offer to a public job.
   */
  function useConvertToPublicJob() {
    const queryClient = react_query_1.useQueryClient()
    return react_query_1.useMutation({
      mutationFn: async (publicId) => {
        const response = await client_1.apiClient
          .post(`homeowner/direct-offers/${publicId}/convert-to-public/`)
          .json()
        return response.data
      },
      onSuccess: (_, publicId) => {
        // Invalidate both direct offers and jobs caches
        queryClient.invalidateQueries({ queryKey: ['homeowner', 'direct-offers'] })
        queryClient.invalidateQueries({ queryKey: ['homeowner', 'direct-offers', publicId] })
        queryClient.invalidateQueries({ queryKey: ['homeowner', 'jobs'] })
      },
    })
  }
  exports_1('useConvertToPublicJob', useConvertToPublicJob)
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
