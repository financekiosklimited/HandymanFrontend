System.register(['@playwright/test'], (exports_1, context_1) => {
  let test_1
  const __moduleName = context_1 && context_1.id
  return {
    setters: [
      (test_1_1) => {
        test_1 = test_1_1
      },
    ],
    execute: () => {
      exports_1(
        'default',
        test_1.defineConfig({
          testDir: './e2e',
          fullyParallel: true,
          forbidOnly: !!process.env.CI,
          retries: process.env.CI ? 2 : 0,
          workers: process.env.CI ? 1 : undefined,
          reporter: 'html',
          use: {
            baseURL: 'http://localhost:3000',
            trace: 'on-first-retry',
          },
          projects: [
            {
              name: 'chromium',
              use: { ...test_1.devices['Desktop Chrome'] },
            },
          ],
          webServer: {
            command: 'yarn dev',
            url: 'http://localhost:3000',
            reuseExistingServer: !process.env.CI,
          },
        })
      )
    },
  }
})
