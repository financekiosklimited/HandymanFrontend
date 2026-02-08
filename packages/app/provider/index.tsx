import { useColorScheme } from 'react-native'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  CustomToast,
  TamaguiProvider,
  type TamaguiProviderProps,
  ToastProvider,
  config,
} from '@my/ui'
import { ToastViewport } from './ToastViewport'
import { queryClient } from './query-client'

export { queryClient } from './query-client'

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
        >
          {children}
          <CustomToast />
          <ToastViewport />
        </ToastProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  )
}
