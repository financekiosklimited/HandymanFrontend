System.register(["react/jsx-runtime", "app/features/user/detail-screen", "solito/navigation"], function (exports_1, context_1) {
    'use client';
    "use strict";
    var jsx_runtime_1, detail_screen_1, navigation_1;
    var __moduleName = context_1 && context_1.id;
    function Page() {
        const { id } = navigation_1.useParams();
        return _jsx(detail_screen_1.UserDetailScreen, { id: id });
    }
    exports_1("default", Page);
    return {
        setters: [
            function (jsx_runtime_1_1) {
                jsx_runtime_1 = jsx_runtime_1_1;
            },
            function (detail_screen_1_1) {
                detail_screen_1 = detail_screen_1_1;
            },
            function (navigation_1_1) {
                navigation_1 = navigation_1_1;
            }
        ],
        execute: function () {
        }
    };
});
