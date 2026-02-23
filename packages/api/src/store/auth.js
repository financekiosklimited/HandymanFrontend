System.register(["zustand", "zustand/middleware", "react-native", "app/provider/query-client"], function (exports_1, context_1) {
    "use strict";
    var zustand_1, middleware_1, react_native_1, query_client_1, createStorage, getAuthStore, useAuthStore, useIsAuthenticated, useActiveRole, useAccessToken;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (zustand_1_1) {
                zustand_1 = zustand_1_1;
            },
            function (middleware_1_1) {
                middleware_1 = middleware_1_1;
            },
            function (react_native_1_1) {
                react_native_1 = react_native_1_1;
            },
            function (query_client_1_1) {
                query_client_1 = query_client_1_1;
            }
        ],
        execute: function () {
            // Cross-platform storage adapter
            createStorage = () => {
                if (react_native_1.Platform.OS === 'web') {
                    return {
                        getItem: async (name) => {
                            try {
                                return localStorage.getItem(name);
                            }
                            catch {
                                return null;
                            }
                        },
                        setItem: async (name, value) => {
                            localStorage.setItem(name, value);
                        },
                        removeItem: async (name) => {
                            localStorage.removeItem(name);
                        },
                    };
                }
                // For React Native, we'll use a simple in-memory storage for now
                // In production, you should use @react-native-async-storage/async-storage
                const memoryStorage = {};
                return {
                    getItem: async (name) => {
                        return memoryStorage[name] || null;
                    },
                    setItem: async (name, value) => {
                        memoryStorage[name] = value;
                    },
                    removeItem: async (name) => {
                        delete memoryStorage[name];
                    },
                };
            };
            exports_1("getAuthStore", getAuthStore = zustand_1.create()(middleware_1.persist((set) => ({
                // Initial state
                accessToken: null,
                refreshToken: null,
                user: null,
                activeRole: null,
                nextAction: 'none',
                emailVerified: false,
                isPhoneVerified: false,
                phoneNumber: null,
                email: null,
                isAuthenticated: false,
                // Actions
                setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken, isAuthenticated: true }),
                setUser: (user) => set({ user }),
                setActiveRole: (activeRole) => set({ activeRole }),
                setNextAction: (nextAction) => set({ nextAction }),
                setEmailVerified: (emailVerified) => set({ emailVerified }),
                setIsPhoneVerified: (isPhoneVerified) => set({ isPhoneVerified }),
                setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
                setEmail: (email) => set({ email }),
                logout: () => {
                    // Clear all React Query cached data to prevent stale user data
                    query_client_1.queryClient.clear();
                    set({
                        accessToken: null,
                        refreshToken: null,
                        user: null,
                        activeRole: null,
                        nextAction: 'none',
                        emailVerified: false,
                        isPhoneVerified: false,
                        phoneNumber: null,
                        email: null,
                        isAuthenticated: false,
                    });
                },
            }), {
                name: 'auth-storage',
                storage: middleware_1.createJSONStorage(() => createStorage()),
                partialize: (state) => ({
                    accessToken: state.accessToken,
                    refreshToken: state.refreshToken,
                    user: state.user,
                    activeRole: state.activeRole,
                    nextAction: state.nextAction,
                    emailVerified: state.emailVerified,
                    isPhoneVerified: state.isPhoneVerified,
                    phoneNumber: state.phoneNumber,
                    email: state.email,
                    isAuthenticated: state.isAuthenticated,
                }),
            })));
            // Selector hooks for convenience
            exports_1("useAuthStore", useAuthStore = getAuthStore);
            exports_1("useIsAuthenticated", useIsAuthenticated = () => getAuthStore((state) => state.isAuthenticated));
            exports_1("useActiveRole", useActiveRole = () => getAuthStore((state) => state.activeRole));
            exports_1("useAccessToken", useAccessToken = () => getAuthStore((state) => state.accessToken));
        }
    };
});
