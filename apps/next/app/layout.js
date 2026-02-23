System.register(["react/jsx-runtime", "app/provider/NextTamaguiProvider"], function (exports_1, context_1) {
    "use strict";
    var jsx_runtime_1, NextTamaguiProvider_1, metadata;
    var __moduleName = context_1 && context_1.id;
    function RootLayout({ children }) {
        return (
        // You can use `suppressHydrationWarning` to avoid the warning about mismatched content during hydration in dev mode
        _jsx("html", { lang: "en", suppressHydrationWarning: true, children: _jsx("body", { children: _jsx(NextTamaguiProvider_1.NextTamaguiProvider, { children: children }) }) }));
    }
    exports_1("default", RootLayout);
    return {
        setters: [
            function (jsx_runtime_1_1) {
                jsx_runtime_1 = jsx_runtime_1_1;
            },
            function (NextTamaguiProvider_1_1) {
                NextTamaguiProvider_1 = NextTamaguiProvider_1_1;
            }
        ],
        execute: function () {
            exports_1("metadata", metadata = {
                title: 'Tamagui • App Router',
                description: 'Tamagui, Solito, Expo & Next.js',
                icons: '/favicon.ico',
            });
        }
    };
});
