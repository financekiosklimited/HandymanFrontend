import type React from 'react'
import { vi } from 'vitest'

// Mock matchMedia for Tamagui
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock expo modules
vi.mock('expo-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
}))

vi.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {},
    },
  },
}))

// Mock expo-linear-gradient
vi.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock expo modules that use native code
vi.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: vi.fn(() => Promise.resolve({ granted: true })),
  launchImageLibraryAsync: vi.fn(() => Promise.resolve({ canceled: true })),
  MediaTypeOptions: {
    Images: 'Images',
  },
}))

vi.mock('expo-document-picker', () => ({
  getDocumentAsync: vi.fn(() => Promise.resolve({ canceled: true })),
}))

vi.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: vi.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: vi.fn(() =>
    Promise.resolve({
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
    })
  ),
}))

// Mock SafeAreaContext
vi.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}))

// Mock async storage
vi.mock('@react-native-async-storage/async-storage', () => ({
  setItem: vi.fn(() => Promise.resolve()),
  getItem: vi.fn(() => Promise.resolve(null)),
  removeItem: vi.fn(() => Promise.resolve()),
}))

// Mock tamagui toast
vi.mock('@tamagui/toast', () => ({
  Toast: () => null,
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
  useToast: () => ({
    show: vi.fn(),
    hide: vi.fn(),
  }),
}))

// Mock burnt toast
vi.mock('burnt', () => ({
  toast: vi.fn(),
}))

// Mock ky HTTP client
const mockKy = vi.fn(() => Promise.resolve(new Response())) as any
mockKy.create = vi.fn(() => mockKy)
mockKy.get = vi.fn(() => Promise.resolve(new Response()))
mockKy.post = vi.fn(() => Promise.resolve(new Response()))
mockKy.put = vi.fn(() => Promise.resolve(new Response()))
mockKy.delete = vi.fn(() => Promise.resolve(new Response()))
mockKy.patch = vi.fn(() => Promise.resolve(new Response()))

vi.mock('ky', () => ({
  HTTPError: class HTTPError extends Error {
    response: { status: number }
    request: Request
    options: unknown
    constructor(response: Response, request: Request, options: unknown) {
      super(`HTTP Error ${response.status}`)
      this.response = { status: response.status }
      this.request = request
      this.options = options
    }
  },
  TimeoutError: class TimeoutError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'TimeoutError'
    }
  },
  default: mockKy,
}))

// Mock reanimated
vi.mock('react-native-reanimated', () => ({
  useSharedValue: vi.fn(() => ({ value: 0 })),
  useAnimatedStyle: vi.fn(() => ({})),
  useAnimatedGestureHandler: vi.fn(() => ({})),
  withSpring: vi.fn((value) => value),
  withDelay: vi.fn((delay, value) => value),
  withTiming: vi.fn((value, config, callback) => {
    // Call the callback if provided to test animation completion
    if (callback) {
      callback(true)
    }
    return value
  }),
  withRepeat: vi.fn((animation) => animation),
  withSequence: vi.fn((...animations) => animations[animations.length - 1]),
  interpolate: vi.fn((value, inputRange, outputRange) => outputRange[0]),
  runOnJS: vi.fn((fn) => fn),
  Easing: {
    out: vi.fn(() => (t: number) => t),
    inOut: vi.fn(() => (t: number) => t),
    ease: vi.fn(() => (t: number) => t),
    sin: vi.fn(() => (t: number) => t),
    cubic: vi.fn(() => (t: number) => t),
  },
  default: {
    useSharedValue: vi.fn(() => ({ value: 0 })),
    useAnimatedStyle: vi.fn(() => ({})),
    View: ({ children }: { children: React.ReactNode }) => children,
  },
}))
