System.register(["vitest/config"], function (exports_1, context_1) {
    "use strict";
    var config_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (config_1_1) {
                config_1 = config_1_1;
            }
        ],
        execute: function () {
            exports_1("default", config_1.defineConfig({
                test: {
                    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/.next/**'],
                    poolOptions: {
                        threads: {
                            singleThread: true,
                        },
                    },
                },
            }));
        }
    };
});
