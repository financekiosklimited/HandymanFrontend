import type React from 'react'
import { render as rtlRender, type RenderOptions } from '@testing-library/react-native'
import { TamaguiProvider, config } from '@my/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

interface WrapperProps {
  children: React.ReactNode
}

// Custom render function that wraps components with necessary providers
export function render(ui: React.ReactElement, options?: RenderOptions) {
  const queryClient = createTestQueryClient()

  function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider config={config}>{children}</TamaguiProvider>
      </QueryClientProvider>
    )
  }

  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  }
}

// Re-export everything from testing-library
export * from '@testing-library/react-native'
