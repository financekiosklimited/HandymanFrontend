import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [
    react({
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
      '@my/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@my/api': path.resolve(__dirname, '../../packages/api/src'),
      '@my/config': path.resolve(__dirname, '../../packages/config/src'),
      app: path.resolve(__dirname, '../../packages/app'),
    },
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.jsx', '.web.js', '.jsx', '.js'],
  },
})
