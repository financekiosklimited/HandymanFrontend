System.register(['vitest/config'], (exports_1, context_1) => {
  let config_1
  const __moduleName = context_1 && context_1.id
  return {
    setters: [
      (config_1_1) => {
        config_1 = config_1_1
      },
    ],
    execute: () => {
      exports_1(
        'default',
        config_1.defineConfig({
          test: {
            exclude: [
              '**/node_modules/**',
              '**/dist/**',
              '**/e2e/**', // Exclude Playwright e2e tests
              '**/.next/**',
            ],
          },
        })
      )
    },
  }
})
