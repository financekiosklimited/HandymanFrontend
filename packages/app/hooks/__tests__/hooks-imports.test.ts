import { describe, expect, it, vi } from 'vitest'

vi.mock('expo-router', () => ({
  Stack: () => null,
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
  useRouter: () => ({
    back: vi.fn(),
    navigate: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
  }),
}))

vi.mock('@tamagui/toast', () => ({
  Toast: () => null,
  ToastProvider: ({ children }: { children: unknown }) => children,
  useToastController: () => ({
    show: vi.fn(),
  }),
}))

vi.mock('react-native', () => ({
  AppState: {
    addEventListener: vi.fn(() => ({
      remove: vi.fn(),
    })),
  },
}))

describe('Custom Hooks', () => {
  it('should import useDebounce', async () => {
    const { useDebounce } = await import('app/hooks')
    expect(useDebounce).toBeDefined()
    expect(typeof useDebounce).toBe('function')
  })

  it('should import useNavigationGuard', async () => {
    const { useNavigationGuard } = await import('app/hooks')
    expect(useNavigationGuard).toBeDefined()
    expect(typeof useNavigationGuard).toBe('function')
  })

  it('should import useToastFromParams', async () => {
    const { useToastFromParams } = await import('app/hooks')
    expect(useToastFromParams).toBeDefined()
    expect(typeof useToastFromParams).toBe('function')
  })
})

describe('Hooks Index Export', () => {
  it('should export all hooks from index', async () => {
    const hooks = await import('app/hooks')
    expect(hooks.useDebounce).toBeDefined()
    expect(hooks.useNavigationGuard).toBeDefined()
    expect(hooks.useToastFromParams).toBeDefined()
  })
})
