System.register(
  ['react/jsx-runtime', 'app/provider/NextTamaguiProvider'],
  (exports_1, context_1) => {
    let jsx_runtime_1
    let NextTamaguiProvider_1
    let metadata
    const __moduleName = context_1 && context_1.id
    function RootLayout({ children }) {
      return (
        // You can use `suppressHydrationWarning` to avoid the warning about mismatched content during hydration in dev mode
        _jsx('html', {
          lang: 'en',
          suppressHydrationWarning: true,
          children: _jsx('body', {
            children: _jsx(NextTamaguiProvider_1.NextTamaguiProvider, { children: children }),
          }),
        })
      )
    }
    exports_1('default', RootLayout)
    return {
      setters: [
        (jsx_runtime_1_1) => {
          jsx_runtime_1 = jsx_runtime_1_1
        },
        (NextTamaguiProvider_1_1) => {
          NextTamaguiProvider_1 = NextTamaguiProvider_1_1
        },
      ],
      execute: () => {
        exports_1(
          'metadata',
          (metadata = {
            title: 'Tamagui • App Router',
            description: 'Tamagui, Solito, Expo & Next.js',
            icons: '/favicon.ico',
          })
        )
      },
    }
  }
)
