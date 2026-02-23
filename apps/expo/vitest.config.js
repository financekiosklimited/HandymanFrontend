System.register(["vitest/config", "@vitejs/plugin-react", "node:path"], function (exports_1, context_1) {
    "use strict";
    var config_1, plugin_react_1, node_path_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (config_1_1) {
                config_1 = config_1_1;
            },
            function (plugin_react_1_1) {
                plugin_react_1 = plugin_react_1_1;
            },
            function (node_path_1_1) {
                node_path_1 = node_path_1_1;
            }
        ],
        execute: function () {
            exports_1("default", config_1.defineConfig({
                plugins: [
                    plugin_react_1.default({
                        jsxRuntime: 'automatic',
                    }),
                ],
                esbuild: {
                    include: [/\.[jt]sx?$/],
                    exclude: [],
                    loader: 'tsx',
                    target: 'es2020',
                },
                optimizeDeps: {
                    include: ['@testing-library/react-native', 'react-native', 'tamagui', '@tamagui/core'],
                },
                test: {
                    globals: true,
                    environment: 'jsdom',
                    setupFiles: ['./test/setup.ts'],
                    include: [
                        '../../packages/ui/src/__tests__/**/*.test.tsx',
                        '../../packages/ui/src/__tests__/**/*.test.ts',
                        '../../packages/app/hooks/__tests__/**/*.test.ts',
                        '../../packages/app/utils/__tests__/**/*.test.ts',
                        '../../packages/api/src/__tests__/**/*.test.ts',
                        '../../packages/api/src/hooks/__tests__/**/*.test.ts',
                        '../../packages/api/src/utils/__tests__/**/*.test.ts',
                    ],
                    exclude: ['**/node_modules/**', '**/dist/**', '**/.expo/**', '**/.next/**'],
                    server: {
                        deps: {
                            inline: ['@testing-library/react-native', 'react-native', 'tamagui', '@tamagui/core'],
                        },
                    },
                },
                resolve: {
                    alias: {
                        'react-native': 'react-native-web',
                        'react-native-svg': '@tamagui/react-native-svg',
                        '@my/ui': node_path_1.default.resolve(__dirname, '../../packages/ui/src'),
                        '@my/api': node_path_1.default.resolve(__dirname, '../../packages/api/src'),
                        '@my/config': node_path_1.default.resolve(__dirname, '../../packages/config/src'),
                        app: node_path_1.default.resolve(__dirname, '../../packages/app'),
                    },
                    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.jsx', '.web.js', '.jsx', '.js'],
                },
            }));
        }
    };
});
