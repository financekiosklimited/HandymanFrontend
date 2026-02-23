System.register(["@tanstack/react-query", "../../client"], function (exports_1, context_1) {
    "use strict";
    var react_query_1, client_1;
    var __moduleName = context_1 && context_1.id;
    function useCategories() {
        return react_query_1.useQuery({
            queryKey: ['categories'],
            queryFn: async () => {
                const response = await client_1.apiClient.get('job-categories/').json();
                return response.data;
            },
        });
    }
    exports_1("useCategories", useCategories);
    return {
        setters: [
            function (react_query_1_1) {
                react_query_1 = react_query_1_1;
            },
            function (client_1_1) {
                client_1 = client_1_1;
            }
        ],
        execute: function () {
        }
    };
});
