System.register(['vitest'], (exports_1, context_1) => {
  let vitest_1
  let mockKy
  const __moduleName = context_1 && context_1.id
  return {
    setters: [
      (vitest_1_1) => {
        vitest_1 = vitest_1_1
      },
    ],
    execute: () => {
      // Mock matchMedia for Tamagui
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vitest_1.vi.fn().mockImplementation((query) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vitest_1.vi.fn(), // deprecated
          removeListener: vitest_1.vi.fn(), // deprecated
          addEventListener: vitest_1.vi.fn(),
          removeEventListener: vitest_1.vi.fn(),
          dispatchEvent: vitest_1.vi.fn(),
        })),
      })
      // Mock expo modules
      vitest_1.vi.mock('expo-router', () => ({
        useRouter: () => ({
          push: vitest_1.vi.fn(),
          replace: vitest_1.vi.fn(),
          back: vitest_1.vi.fn(),
        }),
        useLocalSearchParams: () => ({}),
        usePathname: () => '/',
      }))
      vitest_1.vi.mock('expo-constants', () => ({
        default: {
          expoConfig: {
            extra: {},
          },
        },
      }))
      // Mock expo-linear-gradient
      vitest_1.vi.mock('expo-linear-gradient', () => ({
        LinearGradient: ({ children }) => children,
      }))
      // Mock expo modules that use native code
      vitest_1.vi.mock('expo-image-picker', () => ({
        requestMediaLibraryPermissionsAsync: vitest_1.vi.fn(() =>
          Promise.resolve({ granted: true })
        ),
        launchImageLibraryAsync: vitest_1.vi.fn(() => Promise.resolve({ canceled: true })),
        MediaTypeOptions: {
          Images: 'Images',
        },
      }))
      vitest_1.vi.mock('expo-document-picker', () => ({
        getDocumentAsync: vitest_1.vi.fn(() => Promise.resolve({ canceled: true })),
      }))
      vitest_1.vi.mock('expo-location', () => ({
        requestForegroundPermissionsAsync: vitest_1.vi.fn(() =>
          Promise.resolve({ status: 'granted' })
        ),
        getCurrentPositionAsync: vitest_1.vi.fn(() =>
          Promise.resolve({
            coords: {
              latitude: 37.7749,
              longitude: -122.4194,
            },
          })
        ),
      }))
      // Mock SafeAreaContext
      vitest_1.vi.mock('react-native-safe-area-context', () => ({
        SafeAreaProvider: ({ children }) => children,
        SafeAreaView: ({ children }) => children,
        useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
      }))
      // Mock async storage
      vitest_1.vi.mock('@react-native-async-storage/async-storage', () => ({
        setItem: vitest_1.vi.fn(() => Promise.resolve()),
        getItem: vitest_1.vi.fn(() => Promise.resolve(null)),
        removeItem: vitest_1.vi.fn(() => Promise.resolve()),
      }))
      // Mock tamagui toast
      vitest_1.vi.mock('@tamagui/toast', () => ({
        Toast: () => null,
        ToastProvider: ({ children }) => children,
        useToast: () => ({
          show: vitest_1.vi.fn(),
          hide: vitest_1.vi.fn(),
        }),
      }))
      // Mock burnt toast
      vitest_1.vi.mock('burnt', () => ({
        toast: vitest_1.vi.fn(),
      }))
      // Mock ky HTTP client
      mockKy = vitest_1.vi.fn(() => Promise.resolve(new Response()))
      mockKy.create = vitest_1.vi.fn(() => mockKy)
      mockKy.get = vitest_1.vi.fn(() => Promise.resolve(new Response()))
      mockKy.post = vitest_1.vi.fn(() => Promise.resolve(new Response()))
      mockKy.put = vitest_1.vi.fn(() => Promise.resolve(new Response()))
      mockKy.delete = vitest_1.vi.fn(() => Promise.resolve(new Response()))
      mockKy.patch = vitest_1.vi.fn(() => Promise.resolve(new Response()))
      vitest_1.vi.mock('ky', () => ({
        HTTPError: class HTTPError extends Error {
          constructor(response, request, options) {
            super(`HTTP Error ${response.status}`)
            this.response = { status: response.status }
            this.request = request
            this.options = options
          }
        },
        TimeoutError: class TimeoutError extends Error {
          constructor(message) {
            super(message)
            this.name = 'TimeoutError'
          }
        },
        default: mockKy,
      }))
      // Mock reanimated
      vitest_1.vi.mock('react-native-reanimated', () => ({
        useSharedValue: vitest_1.vi.fn(() => ({ value: 0 })),
        useAnimatedStyle: vitest_1.vi.fn(() => ({})),
        useAnimatedGestureHandler: vitest_1.vi.fn(() => ({})),
        withSpring: vitest_1.vi.fn((value) => value),
        withDelay: vitest_1.vi.fn((delay, value) => value),
        withTiming: vitest_1.vi.fn((value, config, callback) => {
          // Call the callback if provided to test animation completion
          if (callback) {
            callback(true)
          }
          return value
        }),
        withRepeat: vitest_1.vi.fn((animation) => animation),
        withSequence: vitest_1.vi.fn((...animations) => animations[animations.length - 1]),
        interpolate: vitest_1.vi.fn((value, inputRange, outputRange) => outputRange[0]),
        runOnJS: vitest_1.vi.fn((fn) => fn),
        Easing: {
          out: vitest_1.vi.fn(() => (t) => t),
          inOut: vitest_1.vi.fn(() => (t) => t),
          ease: vitest_1.vi.fn(() => (t) => t),
          sin: vitest_1.vi.fn(() => (t) => t),
          cubic: vitest_1.vi.fn(() => (t) => t),
        },
        default: {
          useSharedValue: vitest_1.vi.fn(() => ({ value: 0 })),
          useAnimatedStyle: vitest_1.vi.fn(() => ({})),
          View: ({ children }) => children,
        },
      }))
    },
  }
})
