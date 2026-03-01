System.register(
  ['react/jsx-runtime', 'app/features/user/detail-screen', 'solito/navigation'],
  (exports_1, context_1) => {
    'use client'
    let jsx_runtime_1
    let detail_screen_1
    let navigation_1
    const __moduleName = context_1 && context_1.id
    function Page() {
      const { id } = navigation_1.useParams()
      return _jsx(detail_screen_1.UserDetailScreen, { id: id })
    }
    exports_1('default', Page)
    return {
      setters: [
        (jsx_runtime_1_1) => {
          jsx_runtime_1 = jsx_runtime_1_1
        },
        (detail_screen_1_1) => {
          detail_screen_1 = detail_screen_1_1
        },
        (navigation_1_1) => {
          navigation_1 = navigation_1_1
        },
      ],
      execute: () => {},
    }
  }
)
