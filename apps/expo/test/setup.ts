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

// Mock reanimated
vi.mock('react-native-reanimated', () => ({
  useSharedValue: vi.fn(() => ({ value: 0 })),
  useAnimatedStyle: vi.fn(() => ({})),
  useAnimatedGestureHandler: vi.fn(() => ({})),
  default: {
    useSharedValue: vi.fn(() => ({ value: 0 })),
    useAnimatedStyle: vi.fn(() => ({})),
  },
}))
