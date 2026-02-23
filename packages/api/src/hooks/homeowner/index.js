System.register(["@tanstack/react-query", "../../client", "./useCreateJob", "./useUpdateJob", "./useDeleteJob", "./useDirectOffers"], function (exports_1, context_1) {
    "use strict";
    var react_query_1, client_1;
    var __moduleName = context_1 && context_1.id;
    /**
     * Hook to fetch homeowner's own job listings.
     */
    function useHomeownerJobs(params) {
        return react_query_1.useInfiniteQuery({
            queryKey: ['homeowner', 'jobs', params],
            queryFn: async ({ pageParam = 1 }) => {
                try {
                    const searchParams = new URLSearchParams();
                    if (params?.status)
                        searchParams.set('status', params.status);
                    if (params?.category)
                        searchParams.set('category_id', params.category);
                    if (params?.search)
                        searchParams.set('search', params.search);
                    searchParams.set('page', pageParam.toString());
                    const url = `homeowner/jobs/?${searchParams.toString()}`;
                    const response = await client_1.apiClient.get(url).json();
                    return {
                        results: response.data || [],
                        page: response.meta?.pagination?.page || 1,
                        hasNext: response.meta?.pagination?.has_next || false,
                        totalCount: response.meta?.pagination?.total_count || 0,
                    };
                }
                catch (error) {
                    console.error('Error fetching homeowner jobs:', error);
                    throw error;
                }
            },
            initialPageParam: 1,
            getNextPageParam: (lastPage) => {
                if (lastPage.hasNext) {
                    return lastPage.page + 1;
                }
                return undefined;
            },
            retry: 1,
        });
    }
    exports_1("useHomeownerJobs", useHomeownerJobs);
    /**
     * Hook to fetch a single job detail for homeowner.
     */
    function useHomeownerJob(publicId) {
        return react_query_1.useQuery({
            queryKey: ['homeowner', 'jobs', publicId],
            queryFn: async () => {
                const response = await client_1.apiClient
                    .get(`homeowner/jobs/${publicId}/`)
                    .json();
                return response.data;
            },
            enabled: !!publicId,
        });
    }
    exports_1("useHomeownerJob", useHomeownerJob);
    /**
     * Hook to fetch nearby handymen for homeowners.
     * Latitude and longitude are optional - if not provided, returns all handymen sorted by popularity.
     */
    function useNearbyHandymen(params) {
        const isEnabled = params?.enabled !== false;
        return react_query_1.useInfiniteQuery({
            queryKey: ['homeowner', 'handymen', 'nearby', params],
            queryFn: async ({ pageParam = 1 }) => {
                try {
                    const searchParams = new URLSearchParams();
                    if (params?.latitude)
                        searchParams.set('latitude', params.latitude.toString());
                    if (params?.longitude)
                        searchParams.set('longitude', params.longitude.toString());
                    if (params?.category)
                        searchParams.set('category', params.category);
                    if (params?.search)
                        searchParams.set('search', params.search);
                    searchParams.set('page', pageParam.toString());
                    const url = `homeowner/handymen/nearby/?${searchParams.toString()}`;
                    const response = await client_1.apiClient.get(url).json();
                    return {
                        results: response.data || [],
                        page: response.meta?.pagination?.page || 1,
                        hasNext: response.meta?.pagination?.has_next || false,
                        totalCount: response.meta?.pagination?.total_count || 0,
                    };
                }
                catch (error) {
                    console.error('Error fetching nearby handymen:', error);
                    throw error;
                }
            },
            initialPageParam: 1,
            getNextPageParam: (lastPage) => {
                if (lastPage.hasNext) {
                    return lastPage.page + 1;
                }
                return undefined;
            },
            retry: 1,
            enabled: isEnabled,
        });
    }
    exports_1("useNearbyHandymen", useNearbyHandymen);
    /**
     * Hook to fetch a single handyman detail for homeowner.
     */
    function useHomeownerHandyman(publicId) {
        return react_query_1.useQuery({
            queryKey: ['homeowner', 'handymen', publicId],
            queryFn: async () => {
                const response = await client_1.apiClient
                    .get(`homeowner/handymen/${publicId}/`)
                    .json();
                return response.data;
            },
            enabled: !!publicId,
        });
    }
    exports_1("useHomeownerHandyman", useHomeownerHandyman);
    /**
     * Hook to fetch reviews for a specific handyman.
     * Returns paginated list of reviews with censored reviewer names.
     */
    function useHandymanReviews(publicId, options) {
        const isEnabled = options?.enabled !== false && !!publicId;
        return react_query_1.useInfiniteQuery({
            queryKey: ['homeowner', 'handymen', publicId, 'reviews'],
            queryFn: async ({ pageParam = 1 }) => {
                try {
                    const searchParams = new URLSearchParams();
                    searchParams.set('page', pageParam.toString());
                    const url = `homeowner/handymen/${publicId}/reviews/?${searchParams.toString()}`;
                    const response = await client_1.apiClient.get(url).json();
                    return {
                        results: response.data || [],
                        page: response.meta?.pagination?.page || 1,
                        hasNext: response.meta?.pagination?.has_next || false,
                        totalCount: response.meta?.pagination?.total_count || 0,
                        ratingStats: response.meta?.rating_stats,
                    };
                }
                catch (error) {
                    console.error('Error fetching handyman reviews:', error);
                    throw error;
                }
            },
            initialPageParam: 1,
            getNextPageParam: (lastPage) => {
                if (lastPage.hasNext) {
                    return lastPage.page + 1;
                }
                return undefined;
            },
            retry: 1,
            enabled: isEnabled,
        });
    }
    exports_1("useHandymanReviews", useHandymanReviews);
    /**
     * Hook to fetch current homeowner's profile.
     */
    function useHomeownerProfile() {
        return react_query_1.useQuery({
            queryKey: ['homeowner', 'profile'],
            queryFn: async () => {
                const response = await client_1.apiClient
                    .get('homeowner/profile')
                    .json();
                return response.data;
            },
        });
    }
    exports_1("useHomeownerProfile", useHomeownerProfile);
    /**
     * Hook to update homeowner profile.
     */
    function useUpdateHomeownerProfile() {
        const queryClient = react_query_1.useQueryClient();
        return react_query_1.useMutation({
            mutationFn: async (data) => {
                const response = await client_1.apiClient
                    .put('homeowner/profile', { json: data })
                    .json();
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'profile'] });
            },
        });
    }
    exports_1("useUpdateHomeownerProfile", useUpdateHomeownerProfile);
    /**
     * Hook to fetch notifications for homeowner.
     */
    function useHomeownerNotifications() {
        return react_query_1.useInfiniteQuery({
            queryKey: ['homeowner', 'notifications'],
            queryFn: async ({ pageParam = 1 }) => {
                try {
                    const searchParams = new URLSearchParams();
                    searchParams.set('page', pageParam.toString());
                    const url = `homeowner/notifications/?${searchParams.toString()}`;
                    const response = await client_1.apiClient.get(url).json();
                    return {
                        results: response.data || [],
                        page: response.meta?.pagination?.page || 1,
                        hasNext: response.meta?.pagination?.has_next || false,
                        totalCount: response.meta?.pagination?.total_count || 0,
                    };
                }
                catch (error) {
                    console.error('Error fetching notifications:', error);
                    throw error;
                }
            },
            initialPageParam: 1,
            getNextPageParam: (lastPage) => {
                if (lastPage.hasNext) {
                    return lastPage.page + 1;
                }
                return undefined;
            },
            retry: 1,
        });
    }
    exports_1("useHomeownerNotifications", useHomeownerNotifications);
    /**
     * Hook to mark a notification as read.
     */
    function useMarkHomeownerNotificationRead() {
        const queryClient = react_query_1.useQueryClient();
        return react_query_1.useMutation({
            mutationFn: async (publicId) => {
                const response = await client_1.apiClient
                    .post(`homeowner/notifications/${publicId}/read/`)
                    .json();
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'notifications'] });
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'unread-count'] });
            },
        });
    }
    exports_1("useMarkHomeownerNotificationRead", useMarkHomeownerNotificationRead);
    /**
     * Hook to mark all notifications as read.
     * Uses the batch endpoint for efficiency.
     */
    function useMarkAllHomeownerNotificationsRead() {
        const queryClient = react_query_1.useQueryClient();
        return react_query_1.useMutation({
            mutationFn: async () => {
                const response = await client_1.apiClient
                    .post('homeowner/notifications/read-all/')
                    .json();
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'notifications'] });
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'unread-count'] });
            },
        });
    }
    exports_1("useMarkAllHomeownerNotificationsRead", useMarkAllHomeownerNotificationsRead);
    /**
     * Hook to get the number of unread notifications for the homeowner.
     * Uses the dedicated unread-count endpoint for efficiency.
     */
    function useHomeownerUnreadCount(enabled = true) {
        return react_query_1.useQuery({
            queryKey: ['homeowner', 'unread-count'],
            queryFn: async () => {
                try {
                    const response = await client_1.apiClient
                        .get('homeowner/notifications/unread-count/')
                        .json();
                    return response.data?.unread_count || 0;
                }
                catch (error) {
                    console.error('Error fetching unread count:', error);
                    return 0;
                }
            },
            enabled, // Only fetch when enabled
            staleTime: 30000, // Consider data fresh for 30 seconds
            refetchInterval: enabled ? 60000 : false, // Refetch every minute only when enabled
        });
    }
    exports_1("useHomeownerUnreadCount", useHomeownerUnreadCount);
    /**
     * Hook to fetch applications for homeowner's jobs.
     * Supports filtering by job_id and status.
     */
    function useHomeownerApplications(params) {
        return react_query_1.useInfiniteQuery({
            queryKey: ['homeowner', 'applications', params],
            queryFn: async ({ pageParam = 1 }) => {
                try {
                    const searchParams = new URLSearchParams();
                    if (params?.job_id)
                        searchParams.set('job_id', params.job_id);
                    if (params?.status)
                        searchParams.set('status', params.status);
                    searchParams.set('page', pageParam.toString());
                    const url = `homeowner/applications/?${searchParams.toString()}`;
                    const response = await client_1.apiClient
                        .get(url)
                        .json();
                    return {
                        results: response.data || [],
                        page: response.meta?.pagination?.page || 1,
                        hasNext: response.meta?.pagination?.has_next || false,
                        totalCount: response.meta?.pagination?.total_count || 0,
                    };
                }
                catch (error) {
                    console.error('Error fetching homeowner applications:', error);
                    throw error;
                }
            },
            initialPageParam: 1,
            getNextPageParam: (lastPage) => {
                if (lastPage.hasNext) {
                    return lastPage.page + 1;
                }
                return undefined;
            },
            retry: 1,
            staleTime: 2 * 60 * 1000, // 2 minutes
            gcTime: 5 * 60 * 1000, // 5 minutes
        });
    }
    exports_1("useHomeownerApplications", useHomeownerApplications);
    /**
     * Hook to fetch a single application detail for homeowner.
     */
    function useHomeownerApplicationDetail(publicId) {
        return react_query_1.useQuery({
            queryKey: ['homeowner', 'applications', publicId],
            queryFn: async () => {
                const response = await client_1.apiClient
                    .get(`homeowner/applications/${publicId}/`)
                    .json();
                return response.data;
            },
            enabled: !!publicId,
        });
    }
    exports_1("useHomeownerApplicationDetail", useHomeownerApplicationDetail);
    /**
     * Hook to approve an application.
     * This will set the job status to 'in_progress' and reject all other pending applications.
     */
    function useApproveApplication() {
        const queryClient = react_query_1.useQueryClient();
        return react_query_1.useMutation({
            mutationFn: async (publicId) => {
                const response = await client_1.apiClient
                    .post(`homeowner/applications/${publicId}/approve/`)
                    .json();
                return response.data;
            },
            onSuccess: () => {
                // Invalidate related queries
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'applications'] });
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'jobs'] });
            },
        });
    }
    exports_1("useApproveApplication", useApproveApplication);
    /**
     * Hook to reject an application.
     */
    function useRejectApplication() {
        const queryClient = react_query_1.useQueryClient();
        return react_query_1.useMutation({
            mutationFn: async (publicId) => {
                const response = await client_1.apiClient
                    .post(`homeowner/applications/${publicId}/reject/`)
                    .json();
                return response.data;
            },
            onSuccess: () => {
                // Invalidate related queries
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'applications'] });
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'jobs'] });
            },
        });
    }
    exports_1("useRejectApplication", useRejectApplication);
    // ========== Ongoing Job Hooks ==========
    /**
     * Hook to fetch work sessions for a job.
     */
    function useHomeownerWorkSessions(jobId) {
        return react_query_1.useQuery({
            queryKey: ['homeowner', 'jobs', jobId, 'sessions'],
            queryFn: async () => {
                const response = await client_1.apiClient
                    .get(`homeowner/jobs/${jobId}/sessions/`)
                    .json();
                return response.data || [];
            },
            enabled: !!jobId,
        });
    }
    exports_1("useHomeownerWorkSessions", useHomeownerWorkSessions);
    /**
     * Hook to fetch daily reports for a job.
     */
    function useHomeownerDailyReports(jobId) {
        return react_query_1.useQuery({
            queryKey: ['homeowner', 'jobs', jobId, 'reports'],
            queryFn: async () => {
                const response = await client_1.apiClient
                    .get(`homeowner/jobs/${jobId}/reports/`)
                    .json();
                return response.data || [];
            },
            enabled: !!jobId,
        });
    }
    exports_1("useHomeownerDailyReports", useHomeownerDailyReports);
    /**
     * Hook to fetch a single daily report.
     */
    function useHomeownerDailyReport(jobId, reportId) {
        return react_query_1.useQuery({
            queryKey: ['homeowner', 'jobs', jobId, 'reports', reportId],
            queryFn: async () => {
                const response = await client_1.apiClient
                    .get(`homeowner/jobs/${jobId}/reports/${reportId}/`)
                    .json();
                return response.data;
            },
            enabled: !!jobId && !!reportId,
        });
    }
    exports_1("useHomeownerDailyReport", useHomeownerDailyReport);
    /**
     * Hook to review (approve/reject) a daily report.
     */
    function useReviewDailyReport() {
        const queryClient = react_query_1.useQueryClient();
        return react_query_1.useMutation({
            mutationFn: async ({ jobId, reportId, data, }) => {
                const response = await client_1.apiClient
                    .post(`homeowner/jobs/${jobId}/reports/${reportId}/review/`, { json: data })
                    .json();
                return response.data;
            },
            onSuccess: (_, { jobId, reportId }) => {
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'jobs', jobId, 'reports'] });
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'jobs', jobId, 'reports', reportId] });
            },
        });
    }
    exports_1("useReviewDailyReport", useReviewDailyReport);
    /**
     * Hook to approve job completion.
     */
    function useApproveJobCompletion() {
        const queryClient = react_query_1.useQueryClient();
        return react_query_1.useMutation({
            mutationFn: async (jobId) => {
                const response = await client_1.apiClient
                    .post(`homeowner/jobs/${jobId}/completion/approve/`)
                    .json();
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'jobs'] });
            },
        });
    }
    exports_1("useApproveJobCompletion", useApproveJobCompletion);
    /**
     * Hook to reject job completion.
     */
    function useRejectJobCompletion() {
        const queryClient = react_query_1.useQueryClient();
        return react_query_1.useMutation({
            mutationFn: async ({ jobId, data }) => {
                const response = await client_1.apiClient
                    .post(`homeowner/jobs/${jobId}/completion/reject/`, { json: data || {} })
                    .json();
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'jobs'] });
            },
        });
    }
    exports_1("useRejectJobCompletion", useRejectJobCompletion);
    /**
     * Hook to fetch disputes for a job.
     */
    function useHomeownerDisputes(jobId) {
        return react_query_1.useQuery({
            queryKey: ['homeowner', 'jobs', jobId, 'disputes'],
            queryFn: async () => {
                const response = await client_1.apiClient
                    .get(`homeowner/jobs/${jobId}/disputes/`)
                    .json();
                return response.data || [];
            },
            enabled: !!jobId,
        });
    }
    exports_1("useHomeownerDisputes", useHomeownerDisputes);
    /**
     * Hook to create a dispute.
     */
    function useCreateDispute() {
        const queryClient = react_query_1.useQueryClient();
        return react_query_1.useMutation({
            mutationFn: async ({ jobId, data }) => {
                const response = await client_1.apiClient
                    .post(`homeowner/jobs/${jobId}/disputes/create/`, { json: data })
                    .json();
                return response.data;
            },
            onSuccess: (_, { jobId }) => {
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'jobs', jobId, 'disputes'] });
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'jobs'] });
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'job-dashboard', jobId] });
            },
        });
    }
    exports_1("useCreateDispute", useCreateDispute);
    /**
     * Hook to fetch comprehensive job dashboard data for homeowner.
     */
    function useHomeownerJobDashboard(jobId) {
        return react_query_1.useQuery({
            queryKey: ['homeowner', 'job-dashboard', jobId],
            queryFn: async () => {
                try {
                    const response = await client_1.apiClient
                        .get(`homeowner/jobs/${jobId}/dashboard/`)
                        .json();
                    return response.data;
                }
                catch (error) {
                    console.error('DEBUG: ERROR fetching homeowner job dashboard:', error);
                    throw error;
                }
            },
            enabled: !!jobId,
            staleTime: 5 * 1000,
        });
    }
    exports_1("useHomeownerJobDashboard", useHomeownerJobDashboard);
    /**
     * Hook to create a review for a handyman.
     */
    function useCreateHandymanReview() {
        const queryClient = react_query_1.useQueryClient();
        return react_query_1.useMutation({
            mutationFn: async ({ jobId, data }) => {
                const response = await client_1.apiClient
                    .post(`homeowner/jobs/${jobId}/review/`, { json: data })
                    .json();
                return response.data;
            },
            onSuccess: (_, { jobId }) => {
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'job-dashboard', jobId] });
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'jobs'] });
            },
        });
    }
    exports_1("useCreateHandymanReview", useCreateHandymanReview);
    /**
     * Hook to update a review for a handyman.
     */
    function useUpdateHandymanReview() {
        const queryClient = react_query_1.useQueryClient();
        return react_query_1.useMutation({
            mutationFn: async ({ jobId, data }) => {
                const response = await client_1.apiClient
                    .put(`homeowner/jobs/${jobId}/review/`, { json: data })
                    .json();
                return response.data;
            },
            onSuccess: (_, { jobId }) => {
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'job-dashboard', jobId] });
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'jobs'] });
            },
        });
    }
    exports_1("useUpdateHandymanReview", useUpdateHandymanReview);
    /**
     * Hook to fetch reimbursements for a job (homeowner view).
     */
    function useHomeownerReimbursements(jobId) {
        return react_query_1.useQuery({
            queryKey: ['homeowner', 'jobs', jobId, 'reimbursements'],
            queryFn: async () => {
                const response = await client_1.apiClient
                    .get(`homeowner/jobs/${jobId}/reimbursements/`)
                    .json();
                return response.data || [];
            },
            enabled: !!jobId,
        });
    }
    exports_1("useHomeownerReimbursements", useHomeownerReimbursements);
    /**
     * Hook to fetch a single reimbursement (homeowner view).
     */
    function useHomeownerReimbursement(jobId, reimbursementId) {
        return react_query_1.useQuery({
            queryKey: ['homeowner', 'jobs', jobId, 'reimbursements', reimbursementId],
            queryFn: async () => {
                const response = await client_1.apiClient
                    .get(`homeowner/jobs/${jobId}/reimbursements/${reimbursementId}/`)
                    .json();
                return response.data;
            },
            enabled: !!jobId && !!reimbursementId,
        });
    }
    exports_1("useHomeownerReimbursement", useHomeownerReimbursement);
    /**
     * Hook to review (approve/reject) a reimbursement.
     */
    function useReviewReimbursement() {
        const queryClient = react_query_1.useQueryClient();
        return react_query_1.useMutation({
            mutationFn: async ({ jobId, reimbursementId, data, }) => {
                const response = await client_1.apiClient
                    .post(`homeowner/jobs/${jobId}/reimbursements/${reimbursementId}/review/`, { json: data })
                    .json();
                return response.data;
            },
            onSuccess: (_, { jobId, reimbursementId }) => {
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'jobs', jobId, 'reimbursements'] });
                queryClient.invalidateQueries({
                    queryKey: ['homeowner', 'jobs', jobId, 'reimbursements', reimbursementId],
                });
                queryClient.invalidateQueries({ queryKey: ['homeowner', 'job-dashboard', jobId] });
            },
        });
    }
    exports_1("useReviewReimbursement", useReviewReimbursement);
    var exportedNames_1 = {
        "useHomeownerJobs": true,
        "useHomeownerJob": true,
        "useNearbyHandymen": true,
        "useHomeownerHandyman": true,
        "useHandymanReviews": true,
        "useHomeownerProfile": true,
        "useUpdateHomeownerProfile": true,
        "useHomeownerNotifications": true,
        "useMarkHomeownerNotificationRead": true,
        "useMarkAllHomeownerNotificationsRead": true,
        "useHomeownerUnreadCount": true,
        "useHomeownerApplications": true,
        "useHomeownerApplicationDetail": true,
        "useApproveApplication": true,
        "useRejectApplication": true,
        "useHomeownerWorkSessions": true,
        "useHomeownerDailyReports": true,
        "useHomeownerDailyReport": true,
        "useReviewDailyReport": true,
        "useApproveJobCompletion": true,
        "useRejectJobCompletion": true,
        "useHomeownerDisputes": true,
        "useCreateDispute": true,
        "useHomeownerJobDashboard": true,
        "useCreateHandymanReview": true,
        "useUpdateHandymanReview": true,
        "useHomeownerReimbursements": true,
        "useHomeownerReimbursement": true,
        "useReviewReimbursement": true
    };
    function exportStar_1(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default" && !exportedNames_1.hasOwnProperty(n)) exports[n] = m[n];
        }
        exports_1(exports);
    }
    return {
        setters: [
            function (react_query_1_1) {
                react_query_1 = react_query_1_1;
            },
            function (client_1_1) {
                client_1 = client_1_1;
            },
            function (useCreateJob_1_1) {
                exportStar_1(useCreateJob_1_1);
            },
            function (useUpdateJob_1_1) {
                exportStar_1(useUpdateJob_1_1);
            },
            function (useDeleteJob_1_1) {
                exportStar_1(useDeleteJob_1_1);
            },
            function (useDirectOffers_1_1) {
                exportStar_1(useDirectOffers_1_1);
            }
        ],
        execute: function () {
        }
    };
});
