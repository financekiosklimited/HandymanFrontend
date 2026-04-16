import { readFile } from 'node:fs/promises'
import React from 'react'
import TestRenderer, { act } from 'react-test-renderer'
import ts from 'typescript'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CitySummary, HomeownerHandyman } from '@my/api'

type BootstrapResult = {
  selectedCitySeed: string | null
  resolvedCoordinates: {
    latitude: number
    longitude: number
  } | null
  locationError: string | null
  refreshLocation: () => Promise<void>
}

type NearbyHandymenArgs = {
  search?: string
  latitude?: number
  longitude?: number
  category?: string
}

type CityRecord = {
  public_id: string
  name: string
  province: string
  slug: string
}

type RendererInstance = ReturnType<typeof TestRenderer.create>
type TestNode = RendererInstance['root']

type HostComponentProps = {
  children?: React.ReactNode
} & Record<string, unknown>

function getNodeProps(node: TestNode): Record<string, unknown> {
  return node.props as Record<string, unknown>
}

const mockAppButtonModule = {
  AppButton: createHostComponent('AppButton'),
  default: createHostComponent('AppButton'),
}

const mockAppIconButtonModule = {
  AppIconButton: createHostComponent('AppIconButton'),
  default: createHostComponent('AppIconButton'),
}

function flattenText(node: React.ReactNode): string {
  if (Array.isArray(node)) {
    return node.map((child) => flattenText(child)).join('')
  }

  if (node === null || node === undefined || typeof node === 'boolean') {
    return ''
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }

  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: React.ReactNode }>

    if (typeof node.type === 'string') {
      return `${node.type}${flattenText(element.props.children)}`
    }

    if (typeof node.type === 'function') {
      const componentName =
        (node.type as { displayName?: string; name?: string }).displayName ||
        (node.type as { displayName?: string; name?: string }).name ||
        ''

      return `${componentName}${flattenText(element.props.children)}`
    }
  }

  return ''
}

function createHostComponent(name: string) {
  const Component = ({ children, ...props }: HostComponentProps) =>
    React.createElement(name, { ...props, __text: flattenText(children) }, children)

  Component.displayName = name

  return Component
}

function createIconComponent(name: string) {
  const Icon = (props: Record<string, unknown>) => React.createElement(name, props)

  Icon.displayName = name

  return Icon
}

const shared = vi.hoisted(() => {
  const refreshLocation = vi.fn(async () => {})
  const reverseGeocode = vi.fn(async () => ({ city: 'Toronto' }))
  const toastShow = vi.fn()
  const push = vi.fn()
  const requireAsset = vi.fn(() => 'mock-cta-image')
  const nearbyHandymenCalls: NearbyHandymenArgs[] = []
  const nearbyHandymenResults: HomeownerHandyman[] = []

  const cities: CityRecord[] = [
    {
      public_id: 'cached-city-id',
      name: 'Cached City',
      province: 'Ontario',
      slug: 'toronto-on',
    },
    {
      public_id: 'toronto-city-id',
      name: 'Toronto',
      province: 'Ontario',
      slug: 'toronto-on',
    },
    {
      public_id: 'vancouver-city-id',
      name: 'Vancouver',
      province: 'British Columbia',
      slug: 'vancouver-bc',
    },
  ]

  const deniedPermission = {
    status: 'denied',
    granted: false,
    canAskAgain: true,
    expires: 'never',
  }

  const grantedPermission = {
    status: 'granted',
    granted: true,
    canAskAgain: true,
    expires: 'never',
  }

  return {
    refreshLocation,
    reverseGeocode,
    toastShow,
    push,
    requireAsset,
    nearbyHandymenCalls,
    nearbyHandymenResults,
    cities,
    deniedPermission,
    grantedPermission,
    servicesEnabled: true,
    permission: deniedPermission,
    currentPosition: {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 5,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: 1,
    },
    bootstrapResult: {
      selectedCitySeed: 'cached-city-id',
      resolvedCoordinates: {
        latitude: 43.65,
        longitude: -79.36,
      },
      locationError: null,
      refreshLocation,
    } as BootstrapResult,
  }
})

vi.stubGlobal('require', shared.requireAsset)

vi.mock('@my/ui', () => {
  const YStack = createHostComponent('YStack')
  const XStack = createHostComponent('XStack')
  const ScrollView = createHostComponent('ScrollView')
  const Text = createHostComponent('Text')
  const Button = createHostComponent('Button')
  const Spinner = createHostComponent('Spinner')
  const View = createHostComponent('View')
  const ScrollIndicator = createHostComponent('ScrollIndicator')
  const Input = createHostComponent('Input')
  const GradientBackground = createHostComponent('GradientBackground')
  const JobCard = createHostComponent('JobCard')

  return {
    YStack,
    XStack,
    ScrollView,
    Text,
    Button,
    Spinner,
    View,
    ScrollIndicator,
    Input,
    GradientBackground,
    JobCard,
    PressPresets: {
      primary: { pressStyle: {}, animation: 'mock-primary' },
      secondary: { pressStyle: {}, animation: 'mock-secondary' },
      card: { pressStyle: {}, animation: 'mock-card' },
      listItem: { pressStyle: {}, animation: 'mock-list-item' },
      filter: { pressStyle: {}, animation: 'mock-filter' },
      icon: { pressStyle: {}, animation: 'mock-icon' },
      document: { pressStyle: {}, animation: 'mock-document' },
    },
  }
})

vi.mock('@my/ui/src/AppButton', () => mockAppButtonModule)

vi.mock('@my/ui/src/AppIconButton', () => mockAppIconButtonModule)

vi.mock('react-native', () => {
  const Pressable = createHostComponent('Pressable')
  const View = createHostComponent('RNView')
  const AnimatedView = createHostComponent('AnimatedRNView')

  return {
    Pressable,
    View,
    FlatList: ({ data = [], renderItem }: { data?: unknown[]; renderItem?: (info: any) => React.ReactNode }) =>
      React.createElement(
        'FlatList',
        { __text: '' },
        data.map((item, index) => renderItem?.({ item, index }) ?? null)
      ),
    Animated: {
      View: AnimatedView,
    },
    Easing: {},
    Alert: {
      alert: vi.fn(),
    },
  }
})

vi.mock('react-native-reanimated', () => {
  const AnimatedView = createHostComponent('AnimatedView')
  const AnimatedScrollView = createHostComponent('AnimatedScrollView')
  const createAnimatedComponent = (Component: React.ComponentType<any>) => Component

  return {
    default: {
      View: AnimatedView,
      ScrollView: AnimatedScrollView,
      createAnimatedComponent,
    },
    createAnimatedComponent,
    View: AnimatedView,
    ScrollView: AnimatedScrollView,
    useAnimatedScrollHandler: vi.fn(() => vi.fn()),
    useSharedValue: (value: unknown) => ({ value }),
    useAnimatedStyle: vi.fn(() => ({})),
    withRepeat: (value: unknown) => value,
    withTiming: (value: unknown) => value,
    withDelay: (_delay: number, value: unknown) => value,
    withSpring: (value: unknown) => value,
    Easing: {
      inOut: vi.fn(),
      sin: vi.fn(),
      bezier: vi.fn(),
    },
    interpolate: (value: number, _input: number[], output: number[]) => output[0] ?? value,
  }
})

vi.mock('expo-location', () => ({
  hasServicesEnabledAsync: vi.fn(async () => shared.servicesEnabled),
  requestForegroundPermissionsAsync: vi.fn(async () => shared.permission),
  getCurrentPositionAsync: vi.fn(async () => shared.currentPosition),
  Accuracy: {
    Balanced: 'balanced',
  },
}))

vi.mock('@my/api', () => ({
  useHomeownerJobs: vi.fn(() => ({
    data: {
      pages: [{ results: [], totalCount: 1 }],
    },
    isLoading: false,
    error: null,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  })),
  useNearbyHandymen: vi.fn((args: NearbyHandymenArgs) => {
    shared.nearbyHandymenCalls.push(args)

    return {
      data: {
        pages: [{ results: shared.nearbyHandymenResults }],
      },
      isLoading: false,
      error: null,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    }
  }),
  useAuthStore: vi.fn((selector: (state: { user: { email: string } | null }) => unknown) =>
    selector({
      user: { email: 'homeowner@example.com' },
    })
  ),
  useHomeownerProfile: vi.fn(() => ({
    data: {
      display_name: 'Jordan',
      is_phone_verified: true,
    },
    isLoading: false,
    refetch: vi.fn(async () => ({
      data: {
        is_phone_verified: true,
      },
    })),
  })),
  useRefreshHomeownerLocation: vi.fn(() => ({
    mutateAsync: vi.fn(async () => null),
  })),
  useTotalUnreadCount: vi.fn(() => ({ data: 0 })),
  useCategories: vi.fn(() => ({
    data: [
      {
        slug: 'plumbing',
        name: 'Plumbing',
      },
    ],
    isLoading: false,
  })),
  useCities: vi.fn(() => ({
    data: shared.cities,
    isLoading: false,
  })),
  useDiscounts: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
  useHomeownerDirectOffers: vi.fn(() => ({
    data: {
      pages: [{ results: [] }],
    },
    isLoading: false,
  })),
}))

vi.mock('expo-linear-gradient', () => ({
  LinearGradient: createHostComponent('LinearGradient'),
}))

vi.mock('expo-image', () => ({
  Image: createHostComponent('ExpoImage'),
}))

vi.mock('expo-router', () => ({
  useRouter: vi.fn(() => ({
    push: shared.push,
  })),
}))

vi.mock('app/provider/safe-area/use-safe-area', () => ({
  useSafeArea: vi.fn(() => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })),
}))

vi.mock('app/hooks', () => ({
  useDebounce: vi.fn((value: string) => value),
  useReverseGeocode: vi.fn(() => ({
    reverseGeocode: shared.reverseGeocode,
  })),
  useHomeLocationBootstrap: vi.fn(() => shared.bootstrapResult),
}))

vi.mock('app/hooks/useHomeLocationBootstrap', () => ({
  useHomeLocationBootstrap: vi.fn(() => shared.bootstrapResult),
}))

vi.mock('app/utils/location', () => ({
  findNearestCity: vi.fn((_latitude: number, _longitude: number, cities: CityRecord[]) => cities[0] ?? null),
  findCityByName: vi.fn((cityName: string, cities: CityRecord[]) =>
    cities.find((city) => city.name.toLowerCase() === cityName.toLowerCase()) ?? null
  ),
}))

vi.mock('@tamagui/toast', () => ({
  useToastController: vi.fn(() => ({
    show: shared.toastShow,
  })),
}))

vi.mock('app/utils/toast-messages', () => ({
  showWelcomeOnboardingToast: vi.fn(),
  showOfferAcceptedToast: vi.fn(),
  showOfferDeclinedToast: vi.fn(),
}))

vi.mock('app/utils/onboarding-storage', () => ({
  shouldShowOnboarding: vi.fn(async () => false),
  markOnboardingSeen: vi.fn(async () => {}),
}))

vi.mock('app/utils/notification-toast-storage', () => ({
  hasNotificationToastBeenShown: vi.fn(async () => true),
  markNotificationToastAsShown: vi.fn(async () => {}),
}))

vi.mock('@my/config', () => ({
  jobStatusColors: {},
  colors: {
    accent: '#000000',
  },
}))

vi.mock('@tamagui/lucide-icons', () => ({
  Menu: createIconComponent('Menu'),
  Search: createIconComponent('Search'),
  Bookmark: createIconComponent('Bookmark'),
  MessageCircle: createIconComponent('MessageCircle'),
  Plus: createIconComponent('Plus'),
  Briefcase: createIconComponent('Briefcase'),
  Users: createIconComponent('Users'),
  Zap: createIconComponent('Zap'),
  Wrench: createIconComponent('Wrench'),
  Truck: createIconComponent('Truck'),
  PaintBucket: createIconComponent('PaintBucket'),
  Tv: createIconComponent('Tv'),
  Star: createIconComponent('Star'),
  MapPin: createIconComponent('MapPin'),
  ChevronDown: createIconComponent('ChevronDown'),
  ChevronUp: createIconComponent('ChevronUp'),
  ShieldCheck: createIconComponent('ShieldCheck'),
  Sparkles: createIconComponent('Sparkles'),
  Hammer: createIconComponent('Hammer'),
  TreePine: createIconComponent('TreePine'),
  Wind: createIconComponent('Wind'),
  Home: createIconComponent('Home'),
  Layers: createIconComponent('Layers'),
  Settings: createIconComponent('Settings'),
  Gift: createIconComponent('Gift'),
  Tag: createIconComponent('Tag'),
  Clock: createIconComponent('Clock'),
}))

async function waitForExpectation(assertion: () => void, timeoutMs = 1000) {
  const startedAt = Date.now()
  let lastError: unknown

  while (Date.now() - startedAt < timeoutMs) {
    try {
      assertion()
      return
    } catch (error) {
      lastError = error
      await act(async () => {
        await Promise.resolve()
      })
      await new Promise((resolve) => setTimeout(resolve, 0))
    }
  }

  throw lastError
}

async function loadHomeownerHomeScreen() {
  const screenSourcePath = decodeURIComponent(new URL('../screen.tsx', import.meta.url).pathname).replace(
    /^\/(\w:\/)/,
    '$1'
  )
  const source = await readFile(screenSourcePath, 'utf8')
  const patchedSource = source.replace(
    "const CTA_BACKGROUND_IMAGE = require('../../../../../apps/expo/assets/cta-construction-bg.jpg')",
    "const CTA_BACKGROUND_IMAGE = 'mock-cta-image'"
  )

  const transpiled = ts.transpileModule(patchedSource, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  })

  const moduleMap = new Map<string, unknown>([
    ['react', await import('react')],
    ['expo-location', await import('expo-location')],
    ['@my/ui', await import('@my/ui')],
    ['@my/ui/src/AppButton', mockAppButtonModule],
    ['@my/ui/src/AppIconButton', mockAppIconButtonModule],
    ['react-native-reanimated', await import('react-native-reanimated')],
    ['react-native', await import('react-native')],
    ['@my/api', await import('@my/api')],
    ['expo-linear-gradient', await import('expo-linear-gradient')],
    ['expo-image', await import('expo-image')],
    ['expo-router', await import('expo-router')],
    [
      'app/provider/safe-area/use-safe-area',
      await import('app/provider/safe-area/use-safe-area'),
    ],
    ['@my/config', await import('@my/config')],
    ['app/hooks', await import('app/hooks')],
    ['app/hooks/useHomeLocationBootstrap', await import('app/hooks/useHomeLocationBootstrap')],
    ['app/utils/location', await import('app/utils/location')],
    ['@tamagui/toast', await import('@tamagui/toast')],
    ['app/utils/toast-messages', await import('app/utils/toast-messages')],
    ['app/utils/onboarding-storage', await import('app/utils/onboarding-storage')],
    [
      'app/utils/notification-toast-storage',
      await import('app/utils/notification-toast-storage'),
    ],
    ['@tamagui/lucide-icons', await import('@tamagui/lucide-icons')],
  ])

  const localModule = {
    exports: {},
  }

  const localRequire = (moduleId: string) => {
    if (moduleId.endsWith('.jpg')) {
      return 'mock-cta-image'
    }

    if (!moduleMap.has(moduleId)) {
      throw new Error(`Unexpected screen dependency: ${moduleId}`)
    }

    return moduleMap.get(moduleId)
  }

  const evaluateModule = new Function('require', 'module', 'exports', transpiled.outputText)

  evaluateModule(localRequire, localModule, localModule.exports)

  return (localModule.exports as { HomeownerHomeScreen: React.ComponentType<any> })
    .HomeownerHomeScreen
}

async function renderScreen() {
  let renderer!: RendererInstance
  const HomeownerHomeScreen = await loadHomeownerHomeScreen()

  await act(async () => {
    renderer = TestRenderer.create(React.createElement(HomeownerHomeScreen))
  })

  return renderer
}

function getLatestNearbyHandymenArgs(): NearbyHandymenArgs | undefined {
  return shared.nearbyHandymenCalls.at(-1)
}

function findTextNodes(root: TestNode, text: string): TestNode[] {
  return root.findAll(
    (node: TestNode) => {
      const props = getNodeProps(node)

      return (
        node.type === 'Text' &&
        typeof props.__text === 'string' &&
        props.__text.includes(text)
      )
    }
  )
}

function pressButtonWithText(root: TestNode, text: string) {
  const button = root.find(
    (node: TestNode) => {
      const props = getNodeProps(node)

      return (
        node.type === 'Button' &&
        typeof props.onPress === 'function' &&
        typeof props.__text === 'string' &&
        props.__text.includes(text)
      )
    }
  )

  act(() => {
    nodePress(button)
  })
}

function nodePress(node: TestNode) {
  const props = getNodeProps(node)

  if (typeof props.onPress !== 'function') {
    throw new Error('Expected test node to expose an onPress handler')
  }

  props.onPress()
}

const calgaryCity: CitySummary = {
  public_id: 'calgary-city-id',
  name: 'Calgary',
  province: 'Alberta',
  province_code: 'AB',
  slug: 'calgary-ab',
}

function createHomeownerHandyman(
  index: number,
  overrides: Partial<HomeownerHandyman> = {}
): HomeownerHandyman {
  return {
    public_id: `handyman-${index}`,
    display_name: `Handyman ${index}`,
    avatar_url: null,
    bio: 'Reliable local pro',
    rating: 4.9,
    review_count: 18,
    hourly_rate: 85,
    distance_km: null,
    city: null,
    categories: [
      {
        public_id: 'plumbing-category',
        name: 'Plumbing',
      },
    ],
    ...overrides,
  }
}

function seedHandymenForLocationCase(overrides: Partial<HomeownerHandyman>) {
  shared.nearbyHandymenResults.length = 0
  shared.nearbyHandymenResults.push(
    ...Array.from({ length: 4 }, (_, index) =>
      createHomeownerHandyman(index + 1, overrides)
    )
  )
}

describe('HomeownerHomeScreen location bootstrap integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    shared.nearbyHandymenCalls.length = 0
    shared.nearbyHandymenResults.length = 0
    shared.servicesEnabled = true
    shared.permission = shared.deniedPermission
    shared.currentPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 5,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: 1,
    }
    shared.bootstrapResult = {
      selectedCitySeed: 'cached-city-id',
      resolvedCoordinates: {
        latitude: 43.65,
        longitude: -79.36,
      },
      locationError: null,
      refreshLocation: shared.refreshLocation,
    }
  })

  it('seeds the homeowner location label and nearby-handymen query from the persisted snapshot', async () => {
    const renderer = await renderScreen()

    await waitForExpectation(() => {
      expect(findTextNodes(renderer.root, 'Cached City').length).toBeGreaterThan(0)
      expect(getLatestNearbyHandymenArgs()).toMatchObject({
        latitude: 43.65,
        longitude: -79.36,
      })
    })
  })

  it('lets manual city selection override bootstrap coordinates for the session without refreshing location', async () => {
    shared.bootstrapResult = {
      selectedCitySeed: 'vancouver-city-id',
      resolvedCoordinates: {
        latitude: 49.282729,
        longitude: -123.120738,
      },
      locationError: null,
      refreshLocation: shared.refreshLocation,
    }

    const renderer = await renderScreen()

    await waitForExpectation(() => {
      expect(getLatestNearbyHandymenArgs()).toMatchObject({
        latitude: 49.282729,
        longitude: -123.120738,
      })
    })

    pressButtonWithText(renderer.root, 'Toronto, Ontario')

    await waitForExpectation(() => {
      expect(findTextNodes(renderer.root, 'Toronto').length).toBeGreaterThan(0)
      expect(getLatestNearbyHandymenArgs()).toMatchObject({
        latitude: 43.65107,
        longitude: -79.347015,
      })
      expect(shared.refreshLocation).not.toHaveBeenCalled()
    })
  })

  it('preserves cached city and coordinates when the live bootstrap refresh fails', async () => {
    shared.bootstrapResult = {
      selectedCitySeed: 'cached-city-id',
      resolvedCoordinates: {
        latitude: 43.65,
        longitude: -79.36,
      },
      locationError: 'Location permission was not granted',
      refreshLocation: shared.refreshLocation,
    }

    const renderer = await renderScreen()

    await waitForExpectation(() => {
      expect(findTextNodes(renderer.root, 'Cached City').length).toBeGreaterThan(0)
      expect(getLatestNearbyHandymenArgs()).toMatchObject({
        latitude: 43.65,
        longitude: -79.36,
      })
    })
  })

  it.each([
    [
      'distance and city',
      {
        distance_km: 5.3,
        city: calgaryCity,
      },
      '5.3 km · Calgary',
      3,
      4,
    ],
    [
      'city only',
      {
        city: calgaryCity,
      },
      'Calgary',
      3,
      4,
    ],
    [
      'distance only',
      {
        distance_km: 5.3,
      },
      '5.3 km',
      3,
      4,
    ],
    [
      'nothing when both are missing',
      {
        distance_km: null,
        city: null,
      },
      null,
      0,
      0,
    ],
  ] as const)(
    'renders location fallback for %s across the top cards and expanded handyman list',
    async (_label, overrides, expectedText, expectedCollapsedCount, expectedExpandedCount) => {
      seedHandymenForLocationCase(overrides)

      const renderer = await renderScreen()

      await waitForExpectation(() => {
        if (expectedText) {
          expect(findTextNodes(renderer.root, expectedText).length).toBe(expectedCollapsedCount)
        } else {
          expect(findTextNodes(renderer.root, 'km').length).toBe(0)
          expect(findTextNodes(renderer.root, 'Calgary').length).toBe(0)
        }
      })

      pressButtonWithText(renderer.root, 'See All')

      await waitForExpectation(() => {
        if (expectedText) {
          expect(findTextNodes(renderer.root, expectedText).length).toBe(expectedExpandedCount)
        } else {
          expect(findTextNodes(renderer.root, 'km').length).toBe(0)
          expect(findTextNodes(renderer.root, 'Calgary').length).toBe(0)
        }
      })
    }
  )
})
