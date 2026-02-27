System.register(
  ['@tanstack/react-query', '../../client', './useDirectOffers'],
  (exports_1, context_1) => {
    let react_query_1
    let client_1
    const __moduleName = context_1 && context_1.id
    /**
     * Hook to fetch jobs for handymen to browse and apply to.
     * Jobs are sorted by distance (if coordinates provided) and recency.
     * Supports different page sizes for initial load vs subsequent loads.
     */
    function useHandymanJobsForYou(params) {
      const initialPageSize = params?.initialPageSize ?? 5
      const pageSize = params?.pageSize ?? 20
      return react_query_1.useInfiniteQuery({
        queryKey: ['handyman', 'jobs', 'for-you', params],
        queryFn: async ({ pageParam = 1 }) => {
          try {
            const searchParams = new URLSearchParams()
            if (params?.category) searchParams.set('category_id', params.category)
            if (params?.city) searchParams.set('city_id', params.city)
            if (params?.latitude) searchParams.set('latitude', params.latitude.toString())
            if (params?.longitude) searchParams.set('longitude', params.longitude.toString())
            if (params?.search) searchParams.set('search', params.search)
            searchParams.set('page', pageParam.toString())
            // Use initialPageSize for page 1, pageSize for subsequent pages
            const currentPageSize = pageParam === 1 ? initialPageSize : pageSize
            searchParams.set('page_size', currentPageSize.toString())
            const url = `handyman/jobs/for-you/?${searchParams.toString()}`
            const response = await client_1.apiClient.get(url).json()
            return {
              results: response.data || [],
              page: response.meta?.pagination?.page || 1,
              hasNext: response.meta?.pagination?.has_next || false,
              totalCount: response.meta?.pagination?.total_count || 0,
            }
          } catch (error) {
            console.error('Error fetching jobs for you:', error)
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
    exports_1('useHandymanJobsForYou', useHandymanJobsForYou)
    /**
     * Hook to fetch a single job detail for handyman.
     */
    function useHandymanJob(publicId) {
      return react_query_1.useQuery({
        queryKey: ['handyman', 'jobs', 'for-you', publicId],
        queryFn: async () => {
          const response = await client_1.apiClient.get(`handyman/jobs/for-you/${publicId}/`).json()
          return response.data
        },
        enabled: !!publicId,
      })
    }
    exports_1('useHandymanJob', useHandymanJob)
    /**
     * Hook to fetch job detail with application status for handyman.
     * Uses the /handyman/jobs/{public_id}/ endpoint which includes has_applied and my_application.
     */
    function useHandymanJobDetail(publicId) {
      return react_query_1.useQuery({
        queryKey: ['handyman', 'job-detail', publicId],
        queryFn: async () => {
          const response = await client_1.apiClient.get(`handyman/jobs/${publicId}/`).json()
          return response.data
        },
        enabled: !!publicId,
      })
    }
    exports_1('useHandymanJobDetail', useHandymanJobDetail)
    /**
     * Hook to fetch handyman's own applied/assigned jobs.
     */
    function useHandymanMyJobs(params) {
      return react_query_1.useInfiniteQuery({
        queryKey: ['handyman', 'my-jobs', params],
        queryFn: async ({ pageParam = 1 }) => {
          try {
            const searchParams = new URLSearchParams()
            if (params?.status) searchParams.set('status', params.status)
            if (params?.search) searchParams.set('search', params.search)
            searchParams.set('page', pageParam.toString())
            const url = `handyman/jobs/?${searchParams.toString()}`
            const response = await client_1.apiClient.get(url).json()
            return {
              results: response.data || [],
              page: response.meta?.pagination?.page || 1,
              hasNext: response.meta?.pagination?.has_next || false,
              totalCount: response.meta?.pagination?.total_count || 0,
            }
          } catch (error) {
            console.error('Error fetching my jobs:', error)
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
    exports_1('useHandymanMyJobs', useHandymanMyJobs)
    /**
     * Hook to fetch handyman's assigned jobs (approved applications + accepted direct offers).
     * Uses GET /handyman/jobs/ endpoint.
     */
    function useHandymanAssignedJobs(params, options) {
      return react_query_1.useInfiniteQuery({
        queryKey: ['handyman', 'assigned-jobs', params],
        queryFn: async ({ pageParam = 1 }) => {
          try {
            const searchParams = new URLSearchParams()
            if (params?.status) searchParams.set('status', params.status)
            if (params?.date_from) searchParams.set('date_from', params.date_from)
            if (params?.date_to) searchParams.set('date_to', params.date_to)
            if (params?.search) searchParams.set('search', params.search)
            if (params?.page_size) searchParams.set('page_size', params.page_size.toString())
            searchParams.set('page', pageParam.toString())
            const url = `handyman/jobs/?${searchParams.toString()}`
            const response = await client_1.apiClient.get(url).json()
            return {
              results: response.data || [],
              page: response.meta?.pagination?.page || 1,
              hasNext: response.meta?.pagination?.has_next || false,
              totalCount: response.meta?.pagination?.total_count || 0,
            }
          } catch (error) {
            console.error('Error fetching assigned jobs:', error)
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
    exports_1('useHandymanAssignedJobs', useHandymanAssignedJobs)
    /**
     * Hook to fetch current handyman's profile.
     */
    function useHandymanProfile() {
      return react_query_1.useQuery({
        queryKey: ['handyman', 'profile'],
        queryFn: async () => {
          const response = await client_1.apiClient.get('handyman/profile').json()
          return response.data
        },
      })
    }
    exports_1('useHandymanProfile', useHandymanProfile)
    /**
     * Hook to update handyman profile.
     */
    function useUpdateHandymanProfile() {
      const queryClient = react_query_1.useQueryClient()
      return react_query_1.useMutation({
        mutationFn: async (data) => {
          const response = await client_1.apiClient.put('handyman/profile', { json: data }).json()
          return response.data
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['handyman', 'profile'] })
        },
      })
    }
    exports_1('useUpdateHandymanProfile', useUpdateHandymanProfile)
    /**
     * Hook to fetch handyman's job applications.
     */
    function useHandymanApplications(params, options) {
      return react_query_1.useInfiniteQuery({
        queryKey: ['handyman', 'applications', params],
        queryFn: async ({ pageParam = 1 }) => {
          try {
            const searchParams = new URLSearchParams()
            if (params?.status) searchParams.set('status', params.status)
            searchParams.set('page', pageParam.toString())
            const url = `handyman/applications/?${searchParams.toString()}`
            const response = await client_1.apiClient.get(url).json()
            return {
              results: response.data || [],
              page: response.meta?.pagination?.page || 1,
              hasNext: response.meta?.pagination?.has_next || false,
              totalCount: response.meta?.pagination?.total_count || 0,
            }
          } catch (error) {
            console.error('Error fetching applications:', error)
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
    exports_1('useHandymanApplications', useHandymanApplications)
    /**
     * Hook to apply for a job with proposal data.
     * Uses indexed format: attachments[0].file, attachments[1].file, etc.
     */
    function useApplyForJob() {
      const queryClient = react_query_1.useQueryClient()
      return react_query_1.useMutation({
        mutationFn: async (data) => {
          const formData = new FormData()
          formData.append('job_id', data.job_id)
          formData.append('predicted_hours', data.predicted_hours.toString())
          formData.append('estimated_total_price', data.estimated_total_price.toString())
          if (data.negotiation_reasoning) {
            formData.append('negotiation_reasoning', data.negotiation_reasoning)
          }
          if (data.materials && data.materials.length > 0) {
            formData.append('materials', JSON.stringify(data.materials))
          }
          // Add attachments using indexed format
          if (data.attachments && data.attachments.length > 0) {
            data.attachments.forEach((attachment, index) => {
              // Main file
              formData.append(`attachments[${index}].file`, attachment.file)
              // Thumbnail for videos (required)
              if (attachment.thumbnail) {
                formData.append(`attachments[${index}].thumbnail`, attachment.thumbnail)
              }
              // Duration for videos (required)
              if (attachment.duration_seconds !== undefined) {
                formData.append(
                  `attachments[${index}].duration_seconds`,
                  attachment.duration_seconds.toString()
                )
              }
            })
          }
          const response = await client_1.apiClient
            .post('handyman/applications/', {
              body: formData,
              headers: { 'Content-Type': undefined },
            })
            .json()
          return response.data
        },
        onSuccess: (_, data) => {
          // Invalidate job detail to refresh has_applied status
          queryClient.invalidateQueries({ queryKey: ['handyman', 'job-detail', data.job_id] })
          queryClient.invalidateQueries({ queryKey: ['handyman', 'applications'] })
        },
      })
    }
    exports_1('useApplyForJob', useApplyForJob)
    /**
     * Hook to edit a pending job application.
     * Uses indexed format: attachments[0].file, attachments[1].file, etc.
     */
    function useEditApplication() {
      const queryClient = react_query_1.useQueryClient()
      return react_query_1.useMutation({
        mutationFn: async ({ applicationId, data }) => {
          const formData = new FormData()
          if (data.predicted_hours !== undefined) {
            formData.append('predicted_hours', data.predicted_hours.toString())
          }
          if (data.estimated_total_price !== undefined) {
            formData.append('estimated_total_price', data.estimated_total_price.toString())
          }
          if (data.negotiation_reasoning !== undefined) {
            formData.append('negotiation_reasoning', data.negotiation_reasoning)
          }
          if (data.materials !== undefined) {
            formData.append('materials', JSON.stringify(data.materials))
          }
          // Add attachments using indexed format
          if (data.attachments && data.attachments.length > 0) {
            data.attachments.forEach((attachment, index) => {
              // Main file
              formData.append(`attachments[${index}].file`, attachment.file)
              // Thumbnail for videos (required)
              if (attachment.thumbnail) {
                formData.append(`attachments[${index}].thumbnail`, attachment.thumbnail)
              }
              // Duration for videos (required)
              if (attachment.duration_seconds !== undefined) {
                formData.append(
                  `attachments[${index}].duration_seconds`,
                  attachment.duration_seconds.toString()
                )
              }
            })
          }
          // Add attachments to remove
          if (data.attachments_to_remove && data.attachments_to_remove.length > 0) {
            data.attachments_to_remove.forEach((attachmentId, index) => {
              formData.append(`attachments_to_remove[${index}]`, attachmentId)
            })
          }
          const response = await client_1.apiClient
            .put(`handyman/applications/${applicationId}/`, {
              body: formData,
              headers: { 'Content-Type': undefined },
            })
            .json()
          return response.data
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['handyman', 'applications'] })
          queryClient.invalidateQueries({ queryKey: ['handyman', 'job-detail'] })
        },
      })
    }
    exports_1('useEditApplication', useEditApplication)
    /**
     * Hook to withdraw a job application.
     */
    function useWithdrawApplication() {
      const queryClient = react_query_1.useQueryClient()
      return react_query_1.useMutation({
        mutationFn: async (applicationId) => {
          const response = await client_1.apiClient
            .post(`handyman/applications/${applicationId}/withdraw/`)
            .json()
          return response.data
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['handyman', 'applications'] })
          queryClient.invalidateQueries({ queryKey: ['handyman', 'job-detail'] })
        },
      })
    }
    exports_1('useWithdrawApplication', useWithdrawApplication)
    /**
     * Hook to fetch detailed application information for handyman.
     */
    function useHandymanApplicationDetail(applicationId) {
      return react_query_1.useQuery({
        queryKey: ['handyman', 'applications', applicationId],
        queryFn: async () => {
          const response = await client_1.apiClient
            .get(`handyman/applications/${applicationId}/`)
            .json()
          return response.data
        },
        enabled: !!applicationId,
      })
    }
    exports_1('useHandymanApplicationDetail', useHandymanApplicationDetail)
    /**
     * Hook to fetch notifications for handyman.
     */
    function useHandymanNotifications() {
      return react_query_1.useInfiniteQuery({
        queryKey: ['handyman', 'notifications'],
        queryFn: async ({ pageParam = 1 }) => {
          try {
            const searchParams = new URLSearchParams()
            searchParams.set('page', pageParam.toString())
            const url = `handyman/notifications/?${searchParams.toString()}`
            const response = await client_1.apiClient.get(url).json()
            return {
              results: response.data || [],
              page: response.meta?.pagination?.page || 1,
              hasNext: response.meta?.pagination?.has_next || false,
              totalCount: response.meta?.pagination?.total_count || 0,
            }
          } catch (error) {
            console.error('Error fetching notifications:', error)
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
    exports_1('useHandymanNotifications', useHandymanNotifications)
    /**
     * Hook to mark a notification as read.
     */
    function useMarkHandymanNotificationRead() {
      const queryClient = react_query_1.useQueryClient()
      return react_query_1.useMutation({
        mutationFn: async (publicId) => {
          const response = await client_1.apiClient
            .post(`handyman/notifications/${publicId}/read/`)
            .json()
          return response.data
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['handyman', 'notifications'] })
          queryClient.invalidateQueries({ queryKey: ['handyman', 'unread-count'] })
        },
      })
    }
    exports_1('useMarkHandymanNotificationRead', useMarkHandymanNotificationRead)
    /**
     * Hook to mark all notifications as read.
     * Uses the batch endpoint for efficiency.
     */
    function useMarkAllHandymanNotificationsRead() {
      const queryClient = react_query_1.useQueryClient()
      return react_query_1.useMutation({
        mutationFn: async () => {
          const response = await client_1.apiClient.post('handyman/notifications/read-all/').json()
          return response.data
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['handyman', 'notifications'] })
          queryClient.invalidateQueries({ queryKey: ['handyman', 'unread-count'] })
        },
      })
    }
    exports_1('useMarkAllHandymanNotificationsRead', useMarkAllHandymanNotificationsRead)
    /**
     * Hook to get the number of unread notifications for the handyman.
     * Uses the dedicated unread-count endpoint for efficiency.
     */
    function useHandymanUnreadCount(enabled = true) {
      return react_query_1.useQuery({
        queryKey: ['handyman', 'unread-count'],
        queryFn: async () => {
          try {
            const response = await client_1.apiClient
              .get('handyman/notifications/unread-count/')
              .json()
            return response.data?.unread_count || 0
          } catch (error) {
            console.error('Error fetching unread count:', error)
            return 0
          }
        },
        enabled, // Only fetch when enabled
        staleTime: 30000, // Consider data fresh for 30 seconds
        refetchInterval: enabled ? 60000 : false, // Refetch every minute only when enabled
      })
    }
    exports_1('useHandymanUnreadCount', useHandymanUnreadCount)
    // ========== Ongoing Job Hooks ==========
    /**
     * Hook to fetch work sessions for a job.
     */
    function useHandymanWorkSessions(jobId) {
      return react_query_1.useQuery({
        queryKey: ['handyman', 'jobs', jobId, 'sessions'],
        queryFn: async () => {
          const response = await client_1.apiClient.get(`handyman/jobs/${jobId}/sessions/`).json()
          return response.data || []
        },
        enabled: !!jobId,
      })
    }
    exports_1('useHandymanWorkSessions', useHandymanWorkSessions)
    /**
     * Hook to get active work session for a job.
     */
    function useActiveWorkSession(jobId) {
      const { data: sessions, ...rest } = useHandymanWorkSessions(jobId)
      const activeSession = sessions?.find((s) => s.status === 'active') || null
      return { data: activeSession, ...rest }
    }
    exports_1('useActiveWorkSession', useActiveWorkSession)
    /**
     * Hook to start a work session.
     */
    function useStartWorkSession() {
      const queryClient = react_query_1.useQueryClient()
      return react_query_1.useMutation({
        mutationFn: async ({ jobId, data }) => {
          const formData = new FormData()
          formData.append('started_at', data.started_at)
          formData.append('start_latitude', data.start_latitude.toFixed(6))
          formData.append('start_longitude', data.start_longitude.toFixed(6))
          if (data.start_accuracy) formData.append('start_accuracy', data.start_accuracy.toFixed(2))
          // React Native FormData requires this specific format for files
          formData.append('start_photo', data.start_photo)
          try {
            const response = await client_1.apiClient
              .post(`handyman/jobs/${jobId}/sessions/start/`, {
                body: formData,
                // Header must be undefined to let the browser/RN set it with boundary
                headers: { 'Content-Type': undefined },
              })
              .json()
            return response.data
          } catch (error) {
            if (error.response) {
              const errorData = await error.response.json()
              console.error('DEBUG: useStartWorkSession ERROR response:', errorData)
              throw new Error(errorData.message || 'Failed to start session')
            }
            console.error('DEBUG: useStartWorkSession ERROR:', error)
            throw error
          }
        },
        onSuccess: (_, { jobId }) => {
          queryClient.invalidateQueries({ queryKey: ['handyman', 'jobs', jobId, 'sessions'] })
          queryClient.invalidateQueries({ queryKey: ['handyman', 'job-dashboard', jobId] })
        },
      })
    }
    exports_1('useStartWorkSession', useStartWorkSession)
    /**
     * Hook to stop a work session.
     */
    function useStopWorkSession() {
      const queryClient = react_query_1.useQueryClient()
      return react_query_1.useMutation({
        mutationFn: async ({ jobId, sessionId, data }) => {
          const formData = new FormData()
          formData.append('ended_at', data.ended_at)
          formData.append('end_latitude', data.end_latitude.toFixed(6))
          formData.append('end_longitude', data.end_longitude.toFixed(6))
          if (data.end_accuracy) formData.append('end_accuracy', data.end_accuracy.toFixed(2))
          formData.append('end_photo', data.end_photo)
          const response = await client_1.apiClient
            .post(`handyman/jobs/${jobId}/sessions/${sessionId}/stop/`, {
              body: formData,
              headers: {
                'Content-Type': undefined, // Let browser set boundary
              },
            })
            .json()
          return response.data
        },
        onSuccess: (_, { jobId }) => {
          queryClient.invalidateQueries({ queryKey: ['handyman', 'jobs', jobId, 'sessions'] })
          queryClient.invalidateQueries({ queryKey: ['handyman', 'job-dashboard', jobId] })
        },
      })
    }
    exports_1('useStopWorkSession', useStopWorkSession)
    /**
     * Hook to upload media to a work session.
     */
    function useUploadSessionMedia() {
      const queryClient = react_query_1.useQueryClient()
      return react_query_1.useMutation({
        mutationFn: async ({ jobId, sessionId, data }) => {
          const formData = new FormData()
          formData.append('media_type', data.media_type)
          // React Native FormData requires this specific format for files
          formData.append('file', data.file)
          formData.append('file_size', data.file_size.toString())
          if (data.caption) formData.append('caption', data.caption)
          if (data.duration_seconds)
            formData.append('duration_seconds', data.duration_seconds.toString())
          try {
            const response = await client_1.apiClient
              .post(`handyman/jobs/${jobId}/sessions/${sessionId}/media/`, {
                body: formData,
                headers: { 'Content-Type': undefined },
              })
              .json()
            return response.data
          } catch (error) {
            if (error.response) {
              const errorData = await error.response.json()
              console.error('DEBUG: useUploadSessionMedia ERROR response:', errorData)
              throw new Error(errorData.message || 'Failed to upload media')
            }
            console.error('DEBUG: useUploadSessionMedia ERROR:', error)
            throw error
          }
        },
        onSuccess: (_, { jobId }) => {
          queryClient.invalidateQueries({ queryKey: ['handyman', 'jobs', jobId, 'sessions'] })
          queryClient.invalidateQueries({ queryKey: ['handyman', 'job-dashboard', jobId] })
        },
      })
    }
    exports_1('useUploadSessionMedia', useUploadSessionMedia)
    /**
     * Hook to fetch daily reports for a job.
     */
    function useHandymanDailyReports(jobId) {
      return react_query_1.useQuery({
        queryKey: ['handyman', 'jobs', jobId, 'reports'],
        queryFn: async () => {
          const response = await client_1.apiClient.get(`handyman/jobs/${jobId}/reports/`).json()
          return response.data || []
        },
        enabled: !!jobId,
      })
    }
    exports_1('useHandymanDailyReports', useHandymanDailyReports)
    /**
     * Hook to fetch a single daily report.
     */
    function useHandymanDailyReport(jobId, reportId) {
      return react_query_1.useQuery({
        queryKey: ['handyman', 'jobs', jobId, 'reports', reportId],
        queryFn: async () => {
          const response = await client_1.apiClient
            .get(`handyman/jobs/${jobId}/reports/${reportId}/`)
            .json()
          return response.data
        },
        enabled: !!jobId && !!reportId,
      })
    }
    exports_1('useHandymanDailyReport', useHandymanDailyReport)
    /**
     * Hook to create a daily report.
     */
    function useCreateDailyReport() {
      const queryClient = react_query_1.useQueryClient()
      return react_query_1.useMutation({
        mutationFn: async ({ jobId, data }) => {
          const response = await client_1.apiClient
            .post(`handyman/jobs/${jobId}/reports/create/`, { json: data })
            .json()
          return response.data
        },
        onSuccess: (_, { jobId }) => {
          queryClient.invalidateQueries({ queryKey: ['handyman', 'jobs', jobId, 'reports'] })
          queryClient.invalidateQueries({ queryKey: ['handyman', 'job-dashboard', jobId] })
        },
      })
    }
    exports_1('useCreateDailyReport', useCreateDailyReport)
    /**
     * Hook to update an existing daily report.
     */
    function useUpdateDailyReport() {
      const queryClient = react_query_1.useQueryClient()
      return react_query_1.useMutation({
        mutationFn: async ({ jobId, reportId, data }) => {
          const response = await client_1.apiClient
            .put(`handyman/jobs/${jobId}/reports/${reportId}/`, { json: data })
            .json()
          return response.data
        },
        onSuccess: (_, { jobId, reportId }) => {
          queryClient.invalidateQueries({ queryKey: ['handyman', 'jobs', jobId, 'reports'] })
          queryClient.invalidateQueries({
            queryKey: ['handyman', 'jobs', jobId, 'reports', reportId],
          })
          queryClient.invalidateQueries({ queryKey: ['handyman', 'job-dashboard', jobId] })
        },
      })
    }
    exports_1('useUpdateDailyReport', useUpdateDailyReport)
    /**
     * Hook to request job completion.
     */
    function useRequestJobCompletion() {
      const queryClient = react_query_1.useQueryClient()
      return react_query_1.useMutation({
        mutationFn: async (jobId) => {
          const response = await client_1.apiClient
            .post(`handyman/jobs/${jobId}/completion/request/`)
            .json()
          return response.data
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['handyman', 'job-detail'] })
          queryClient.invalidateQueries({ queryKey: ['handyman', 'applications'] })
          queryClient.invalidateQueries({ queryKey: ['handyman', 'job-dashboard'] })
        },
      })
    }
    exports_1('useRequestJobCompletion', useRequestJobCompletion)
    /**
     * Hook to fetch comprehensive job dashboard data.
     * Includes job details, task progress, time stats, session count, and report stats.
     */
    function useJobDashboard(jobId) {
      return react_query_1.useQuery({
        queryKey: ['handyman', 'job-dashboard', jobId],
        queryFn: async () => {
          try {
            const response = await client_1.apiClient
              .get(`handyman/jobs/${jobId}/dashboard/`)
              .json()
            return response.data
          } catch (error) {
            console.error('ERROR fetching job dashboard:', error)
            if (error.response) {
              const errorBody = await error.response.json().catch(() => ({}))
              console.error('ERROR body:', errorBody)
            }
            throw error
          }
        },
        enabled: !!jobId,
        staleTime: 5 * 1000, // 5 seconds
      })
    }
    exports_1('useJobDashboard', useJobDashboard)
    /**
     * Hook to create a review for a homeowner.
     */
    function useCreateHomeownerReview() {
      const queryClient = react_query_1.useQueryClient()
      return react_query_1.useMutation({
        mutationFn: async ({ jobId, data }) => {
          const response = await client_1.apiClient
            .post(`handyman/jobs/${jobId}/review/`, { json: data })
            .json()
          return response.data
        },
        onSuccess: (_, { jobId }) => {
          queryClient.invalidateQueries({ queryKey: ['handyman', 'job-dashboard', jobId] })
        },
      })
    }
    exports_1('useCreateHomeownerReview', useCreateHomeownerReview)
    /**
     * Hook to fetch reimbursements for a job.
     */
    function useHandymanReimbursements(jobId) {
      return react_query_1.useQuery({
        queryKey: ['handyman', 'jobs', jobId, 'reimbursements'],
        queryFn: async () => {
          const response = await client_1.apiClient
            .get(`handyman/jobs/${jobId}/reimbursements/`)
            .json()
          return response.data || []
        },
        enabled: !!jobId,
      })
    }
    exports_1('useHandymanReimbursements', useHandymanReimbursements)
    /**
     * Hook to fetch a single reimbursement.
     */
    function useHandymanReimbursement(jobId, reimbursementId) {
      return react_query_1.useQuery({
        queryKey: ['handyman', 'jobs', jobId, 'reimbursements', reimbursementId],
        queryFn: async () => {
          const response = await client_1.apiClient
            .get(`handyman/jobs/${jobId}/reimbursements/${reimbursementId}/`)
            .json()
          return response.data
        },
        enabled: !!jobId && !!reimbursementId,
      })
    }
    exports_1('useHandymanReimbursement', useHandymanReimbursement)
    /**
     * Hook to create a reimbursement request.
     * Uses indexed format: attachments[0].file, attachments[1].file, etc.
     */
    function useCreateReimbursement() {
      const queryClient = react_query_1.useQueryClient()
      return react_query_1.useMutation({
        mutationFn: async ({ jobId, data }) => {
          const formData = new FormData()
          formData.append('name', data.name)
          formData.append('category_id', data.category_id)
          formData.append('amount', data.amount.toString())
          if (data.notes) {
            formData.append('notes', data.notes)
          }
          // Add attachments using indexed format
          if (data.attachments && data.attachments.length > 0) {
            data.attachments.forEach((attachment, index) => {
              // Main file
              formData.append(`attachments[${index}].file`, attachment.file)
              // Thumbnail for videos (required)
              if (attachment.thumbnail) {
                formData.append(`attachments[${index}].thumbnail`, attachment.thumbnail)
              }
              // Duration for videos (required)
              if (attachment.duration_seconds !== undefined) {
                formData.append(
                  `attachments[${index}].duration_seconds`,
                  attachment.duration_seconds.toString()
                )
              }
            })
          }
          const response = await client_1.apiClient
            .post(`handyman/jobs/${jobId}/reimbursements/`, {
              body: formData,
              headers: { 'Content-Type': undefined },
            })
            .json()
          return response.data
        },
        onSuccess: (_, { jobId }) => {
          queryClient.invalidateQueries({ queryKey: ['handyman', 'jobs', jobId, 'reimbursements'] })
          queryClient.invalidateQueries({ queryKey: ['handyman', 'job-dashboard', jobId] })
        },
      })
    }
    exports_1('useCreateReimbursement', useCreateReimbursement)
    /**
     * Hook to update a reimbursement request.
     * Uses indexed format: attachments[0].file, attachments[1].file, etc.
     */
    function useUpdateReimbursement() {
      const queryClient = react_query_1.useQueryClient()
      return react_query_1.useMutation({
        mutationFn: async ({ jobId, reimbursementId, data }) => {
          const formData = new FormData()
          if (data.name) {
            formData.append('name', data.name)
          }
          if (data.category_id) {
            formData.append('category_id', data.category_id)
          }
          if (data.amount !== undefined) {
            formData.append('amount', data.amount.toString())
          }
          if (data.notes !== undefined) {
            formData.append('notes', data.notes)
          }
          // Add attachments using indexed format
          if (data.attachments && data.attachments.length > 0) {
            data.attachments.forEach((attachment, index) => {
              // Main file
              formData.append(`attachments[${index}].file`, attachment.file)
              // Thumbnail for videos (required)
              if (attachment.thumbnail) {
                formData.append(`attachments[${index}].thumbnail`, attachment.thumbnail)
              }
              // Duration for videos (required)
              if (attachment.duration_seconds !== undefined) {
                formData.append(
                  `attachments[${index}].duration_seconds`,
                  attachment.duration_seconds.toString()
                )
              }
            })
          }
          // Add attachments to remove
          if (data.attachments_to_remove && data.attachments_to_remove.length > 0) {
            data.attachments_to_remove.forEach((attachmentId, index) => {
              formData.append(`attachments_to_remove[${index}]`, attachmentId)
            })
          }
          const response = await client_1.apiClient
            .put(`handyman/jobs/${jobId}/reimbursements/${reimbursementId}/`, {
              body: formData,
              headers: { 'Content-Type': undefined },
            })
            .json()
          return response.data
        },
        onSuccess: (_, { jobId, reimbursementId }) => {
          queryClient.invalidateQueries({ queryKey: ['handyman', 'jobs', jobId, 'reimbursements'] })
          queryClient.invalidateQueries({
            queryKey: ['handyman', 'jobs', jobId, 'reimbursements', reimbursementId],
          })
          queryClient.invalidateQueries({ queryKey: ['handyman', 'job-dashboard', jobId] })
        },
      })
    }
    exports_1('useUpdateReimbursement', useUpdateReimbursement)
    return {
      setters: [
        (react_query_1_1) => {
          react_query_1 = react_query_1_1
        },
        (client_1_1) => {
          client_1 = client_1_1
        },
        (useDirectOffers_1_1) => {
          exports_1({
            useHandymanDirectOffers: useDirectOffers_1_1['useHandymanDirectOffers'],
            useHandymanDirectOffer: useDirectOffers_1_1['useHandymanDirectOffer'],
            useAcceptDirectOffer: useDirectOffers_1_1['useAcceptDirectOffer'],
            useRejectDirectOffer: useDirectOffers_1_1['useRejectDirectOffer'],
            useHandymanPendingOffersCount: useDirectOffers_1_1['useHandymanPendingOffersCount'],
          })
        },
      ],
      execute: () => {},
    }
  }
)
