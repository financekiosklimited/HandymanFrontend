import { useColorScheme } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  CustomToast,
  TamaguiProvider,
  type TamaguiProviderProps,
  ToastProvider,
  config,
  isWeb,
} from '@my/ui'
import { ToastViewport } from './ToastViewport'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

export function Provider({
  children,
  defaultTheme = 'light',
  ...rest
}: Omit<TamaguiProviderProps, 'config'> & { defaultTheme?: string }) {
  const colorScheme = useColorScheme()
  const theme = defaultTheme || (colorScheme === 'dark' ? 'dark' : 'light')

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider
        config={config}
        defaultTheme={theme}
        {...rest}
      >
        <ToastProvider
          swipeDirection="horizontal"
          duration={6000}
          native={isWeb ? [] : ['mobile']}
        >
          {children}
          <CustomToast />
          <ToastViewport />
        </ToastProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  )
}
