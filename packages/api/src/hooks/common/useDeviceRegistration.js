System.register(["@tanstack/react-query", "../../client", "react-native"], function (exports_1, context_1) {
    "use strict";
    var react_query_1, client_1, react_native_1;
    var __moduleName = context_1 && context_1.id;
    /**
     * Hook to register a device for push notifications.
     */
    function useRegisterDevice() {
        return react_query_1.useMutation({
            mutationFn: async ({ deviceToken, role }) => {
                const deviceType = react_native_1.Platform.OS === 'ios' ? 'ios' : 'android';
                const endpoint = role === 'handyman' ? 'handyman/devices/' : 'homeowner/devices/';
                const response = await client_1.apiClient
                    .post(endpoint, {
                    json: {
                        device_token: deviceToken,
                        device_type: deviceType,
                    },
                })
                    .json();
                return response.data;
            },
        });
    }
    exports_1("useRegisterDevice", useRegisterDevice);
    /**
     * Hook to unregister a device from push notifications.
     */
    function useUnregisterDevice() {
        return react_query_1.useMutation({
            mutationFn: async ({ publicId, role }) => {
                const endpoint = role === 'handyman' ? `handyman/devices/${publicId}/` : `homeowner/devices/${publicId}/`;
                await client_1.apiClient.delete(endpoint);
            },
        });
    }
    exports_1("useUnregisterDevice", useUnregisterDevice);
    return {
        setters: [
            function (react_query_1_1) {
                react_query_1 = react_query_1_1;
            },
            function (client_1_1) {
                client_1 = client_1_1;
            },
            function (react_native_1_1) {
                react_native_1 = react_native_1_1;
            }
        ],
        execute: function () {
        }
    };
});
