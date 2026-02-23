System.register(["@tanstack/react-query", "../../client", "../../store/auth", "./phone"], function (exports_1, context_1) {
    "use strict";
    var react_query_1, client_1, auth_1;
    var __moduleName = context_1 && context_1.id;
    function useLogin() {
        const { setTokens, setActiveRole, setNextAction, setEmailVerified } = auth_1.getAuthStore.getState();
        return react_query_1.useMutation({
            mutationFn: async (data) => {
                const response = await client_1.apiClient
                    .post('auth/login', { json: data })
                    .json();
                if (!response.data) {
                    throw new Error(response.message || 'Login failed');
                }
                return response.data;
            },
            onSuccess: (data) => {
                setTokens(data.access_token, data.refresh_token);
                setActiveRole(data.active_role);
                setNextAction(data.next_action);
                setEmailVerified(data.email_verified);
            },
        });
    }
    exports_1("useLogin", useLogin);
    function useActivateRole() {
        const { setTokens, setActiveRole, setNextAction, setEmailVerified } = auth_1.getAuthStore.getState();
        return react_query_1.useMutation({
            mutationFn: async (data) => {
                const response = await client_1.apiClient
                    .post('auth/activate-role', { json: data })
                    .json();
                if (!response.data) {
                    throw new Error(response.message || 'Role activation failed');
                }
                return response.data;
            },
            onSuccess: (data) => {
                setTokens(data.access_token, data.refresh_token);
                setActiveRole(data.active_role);
                setNextAction(data.next_action);
                setEmailVerified(data.email_verified);
            },
        });
    }
    exports_1("useActivateRole", useActivateRole);
    function useRefreshToken() {
        const { setTokens, setActiveRole, setNextAction, setEmailVerified } = auth_1.getAuthStore.getState();
        return react_query_1.useMutation({
            mutationFn: async (data) => {
                const response = await client_1.apiClient
                    .post('auth/refresh', { json: data })
                    .json();
                if (!response.data) {
                    throw new Error(response.message || 'Token refresh failed');
                }
                return response.data;
            },
            onSuccess: (data) => {
                setTokens(data.access_token, data.refresh_token);
                setActiveRole(data.active_role);
                setNextAction(data.next_action);
                setEmailVerified(data.email_verified);
            },
        });
    }
    exports_1("useRefreshToken", useRefreshToken);
    function useLogout() {
        const { refreshToken, logout } = auth_1.getAuthStore.getState();
        return react_query_1.useMutation({
            mutationFn: async () => {
                if (!refreshToken) {
                    logout();
                    return;
                }
                try {
                    await client_1.apiClient.post('auth/logout', {
                        json: { refresh_token: refreshToken },
                    });
                }
                catch {
                    // Ignore logout errors - still clear local state
                }
            },
            onSettled: () => {
                logout();
            },
        });
    }
    exports_1("useLogout", useLogout);
    // Registration hook
    function useRegister() {
        const { setTokens, setActiveRole, setNextAction, setEmailVerified, setEmail } = auth_1.getAuthStore.getState();
        return react_query_1.useMutation({
            mutationFn: async (data) => {
                const response = await client_1.apiClient
                    .post('auth/register', { json: data })
                    .json();
                if (!response.data) {
                    throw new Error(response.message || 'Registration failed');
                }
                return { ...response.data, email: data.email };
            },
            onSuccess: (data) => {
                setTokens(data.access_token, data.refresh_token);
                setActiveRole(data.active_role);
                setNextAction(data.next_action);
                setEmailVerified(data.email_verified);
                setEmail(data.email);
            },
        });
    }
    exports_1("useRegister", useRegister);
    // Forgot password hook - sends reset code to email
    function useForgotPassword() {
        return react_query_1.useMutation({
            mutationFn: async (data) => {
                const response = await client_1.apiClient
                    .post('auth/password/forgot', { json: data })
                    .json();
                return response;
            },
        });
    }
    exports_1("useForgotPassword", useForgotPassword);
    // Verify reset code hook - returns reset token
    function useVerifyResetCode() {
        return react_query_1.useMutation({
            mutationFn: async (data) => {
                const response = await client_1.apiClient
                    .post('auth/password/verify', { json: data })
                    .json();
                if (!response.data) {
                    throw new Error(response.message || 'Verification failed');
                }
                return response.data;
            },
        });
    }
    exports_1("useVerifyResetCode", useVerifyResetCode);
    // Reset password hook - sets new password
    function useResetPassword() {
        return react_query_1.useMutation({
            mutationFn: async (data) => {
                const response = await client_1.apiClient
                    .post('auth/password/reset', { json: data })
                    .json();
                return response;
            },
        });
    }
    exports_1("useResetPassword", useResetPassword);
    // Verify email OTP hook - returns refreshed tokens
    function useVerifyEmail() {
        const { setTokens, setActiveRole, setNextAction, setEmailVerified } = auth_1.getAuthStore.getState();
        return react_query_1.useMutation({
            mutationFn: async (data) => {
                const response = await client_1.apiClient
                    .post('auth/email/verify', { json: data })
                    .json();
                if (!response.data) {
                    throw new Error(response.message || 'Email verification failed');
                }
                return response.data;
            },
            onSuccess: (data) => {
                setTokens(data.access_token, data.refresh_token);
                setActiveRole(data.active_role);
                setNextAction(data.next_action);
                setEmailVerified(data.email_verified);
            },
        });
    }
    exports_1("useVerifyEmail", useVerifyEmail);
    // Resend verification email hook
    function useResendVerificationEmail() {
        return react_query_1.useMutation({
            mutationFn: async (data) => {
                const response = await client_1.apiClient
                    .post('auth/email/resend', { json: data })
                    .json();
                return response;
            },
        });
    }
    exports_1("useResendVerificationEmail", useResendVerificationEmail);
    // Helper hook to get current auth role
    function useAuthRole() {
        return auth_1.getAuthStore((state) => state.activeRole);
    }
    exports_1("useAuthRole", useAuthRole);
    var exportedNames_1 = {
        "useLogin": true,
        "useActivateRole": true,
        "useRefreshToken": true,
        "useLogout": true,
        "useRegister": true,
        "useForgotPassword": true,
        "useVerifyResetCode": true,
        "useResetPassword": true,
        "useVerifyEmail": true,
        "useResendVerificationEmail": true,
        "useAuthRole": true
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
            function (auth_1_1) {
                auth_1 = auth_1_1;
            },
            function (phone_1_1) {
                exportStar_1(phone_1_1);
            }
        ],
        execute: function () {
        }
    };
});
