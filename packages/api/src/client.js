System.register(["ky", "./store/auth"], function (exports_1, context_1) {
    "use strict";
    var ky_1, auth_1, API_BASE_URL, API_TIMEOUT_MS, isRefreshing, refreshPromise, apiClient;
    var __moduleName = context_1 && context_1.id;
    async function refreshTokens() {
        const { refreshToken, setTokens, setActiveRole, setNextAction, setEmailVerified, logout } = auth_1.getAuthStore.getState();
        if (!refreshToken) {
            logout();
            return false;
        }
        try {
            const response = await ky_1.default
                .post(`${API_BASE_URL}/api/v1/mobile/auth/refresh`, {
                json: { refresh_token: refreshToken },
                headers: { 'Content-Type': 'application/json' },
                timeout: API_TIMEOUT_MS,
            })
                .json();
            if (response.data) {
                setTokens(response.data.access_token, response.data.refresh_token);
                setActiveRole(response.data.active_role);
                setNextAction(response.data.next_action);
                setEmailVerified(response.data.email_verified);
                return true;
            }
            logout();
            return false;
        }
        catch {
            logout();
            return false;
        }
    }
    function createApiClient() {
        const client = ky_1.default.create({
            prefixUrl: `${API_BASE_URL}/api/v1/mobile`,
            timeout: API_TIMEOUT_MS,
            headers: {
                'Content-Type': 'application/json',
            },
            hooks: {
                beforeRequest: [
                    (request) => {
                        const { accessToken } = auth_1.getAuthStore.getState();
                        if (accessToken) {
                            request.headers.set('Authorization', `Bearer ${accessToken}`);
                        }
                    },
                ],
                afterResponse: [
                    async (request, options, response) => {
                        if (response.status === 401) {
                            // Skip refresh for auth endpoints to prevent loops
                            const url = request.url.toString();
                            if (url.includes('/auth/login') ||
                                url.includes('/auth/refresh') ||
                                url.includes('/auth/logout')) {
                                return response;
                            }
                            // Prevent multiple simultaneous refresh attempts
                            if (!isRefreshing) {
                                isRefreshing = true;
                                refreshPromise = refreshTokens().finally(() => {
                                    isRefreshing = false;
                                    refreshPromise = null;
                                });
                            }
                            // Wait for the refresh to complete
                            const success = await refreshPromise;
                            if (success) {
                                // Retry the original request with new token
                                const { accessToken } = auth_1.getAuthStore.getState();
                                if (accessToken) {
                                    request.headers.set('Authorization', `Bearer ${accessToken}`);
                                }
                                return ky_1.default(request, options);
                            }
                        }
                        return response;
                    },
                ],
            },
            retry: {
                limit: 2,
                methods: ['get'],
                statusCodes: [408, 500, 502, 503, 504],
            },
        });
        return client;
    }
    exports_1("createApiClient", createApiClient);
    return {
        setters: [
            function (ky_1_1) {
                ky_1 = ky_1_1;
            },
            function (auth_1_1) {
                auth_1 = auth_1_1;
            }
        ],
        execute: function () {
            API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
            API_TIMEOUT_MS = (() => {
                const raw = process.env.NEXT_PUBLIC_API_TIMEOUT_MS || process.env.EXPO_PUBLIC_API_TIMEOUT_MS;
                const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
                return Number.isFinite(parsed) ? parsed : 30000;
            })();
            // Flag to prevent multiple refresh attempts
            isRefreshing = false;
            refreshPromise = null;
            exports_1("apiClient", apiClient = createApiClient());
        }
    };
});
