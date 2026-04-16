import { readFile } from 'node:fs/promises'
import React from 'react'
import TestRenderer, { act } from 'react-test-renderer'
import ts from 'typescript'
import { beforeEach, describe, expect, it, vi } from 'vitest'

type JobsForYouArgs = {
  search?: string
  latitude?: number
  longitude?: number
  category?: string
  city?: string
  initialPageSize?: number
  pageSize?: number
}

type CityRecord = {
  public_id: string
  name: string
  province: string
  slug: string
}

type CategoryRecord = {
  public_id: string
  name: string
  icon: string
}

type BootstrapResult = {
  selectedCitySeed: string | null
  resolvedCoordinates: {
    latitude: number
    longitude: number
  } | null
  locationError: string | null
  refreshLocation: () => Promise<void>
}

type RendererInstance = ReturnType<typeof TestRenderer.create>

type HostComponentProps = {
  children?: React.ReactNode
} & Record<string, unknown>

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
  const refreshHandymanLocation = vi.fn(async () => null)
  const reverseGeocode = vi.fn(async () => ({ city: 'Toronto' }))
  const toastShow = vi.fn()
  const push = vi.fn()
  const jobsForYouCalls: JobsForYouArgs[] = []

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
  ]

  const categories: CategoryRecord[] = [
    {
      public_id: 'plumbing-id',
      name: 'Plumbing',
      icon: 'plumbing',
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
    refreshHandymanLocation,
    reverseGeocode,
    toastShow,
    push,
    jobsForYouCalls,
    cities,
    categories,
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

vi.mock('@my/ui', () => {
  const YStack = createHostComponent('YStack')
  const XStack = createHostComponent('XStack')
  const ScrollView = createHostComponent('ScrollView')
  const Text = createHostComponent('Text')
  const Button = createHostComponent('Button')
  const Spinner = createHostComponent('Spinner')
  const View = createHostComponent('View')
  const ScrollIndicator = createHostComponent('ScrollIndicator')
  const GradientBackground = createHostComponent('GradientBackground')
  const Input = createHostComponent('Input')
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
    GradientBackground,
    Input,
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
    withTiming: (value: unknown) => value,
    withSpring: (value: unknown) => value,
    withDelay: (_delay: number, value: unknown) => value,
    withSequence: (...values: unknown[]) => values.at(-1),
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
  useHandymanJobsForYou: vi.fn((args: JobsForYouArgs) => {
    shared.jobsForYouCalls.push(args)

    return {
      data: {
        pages: [{ results: [] }],
      },
      isLoading: false,
      error: null,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    }
  }),
  useAuthStore: vi.fn(
    (selector: (state: { user: { email: string } | null; isPhoneVerified: boolean }) => unknown) =>
      selector({
        user: { email: 'handyman@example.com' },
        isPhoneVerified: true,
      })
  ),
  useHandymanProfile: vi.fn(() => ({
    data: {
      display_name: 'Jordan',
      total_earnings: 0,
      completed_jobs_count: 0,
      rating: '0',
    },
  })),
  useTotalUnreadCount: vi.fn(() => ({ data: 0 })),
  useCategories: vi.fn(() => ({
    data: shared.categories,
    isLoading: false,
  })),
  useCities: vi.fn(() => ({
    data: shared.cities,
    isLoading: false,
  })),
  useHandymanPendingOffersCount: vi.fn(() => ({ data: 0 })),
  useHandymanApplications: vi.fn(() => ({
    data: {
      pages: [{ totalCount: 0 }],
    },
  })),
  useHandymanAssignedJobs: vi.fn(() => ({
    data: {
      pages: [{ totalCount: 0 }],
    },
  })),
  useDiscounts: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useRefreshHandymanLocation: vi.fn(() => ({
    mutateAsync: shared.refreshHandymanLocation,
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
  useDebounce: vi.fn((value: string | null) => value),
  useReverseGeocode: vi.fn(() => ({
    reverseGeocode: shared.reverseGeocode,
  })),
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
  showNewDirectOfferToast: vi.fn(),
}))

vi.mock('app/utils/notification-toast-storage', () => ({
  hasNotificationToastBeenShown: vi.fn(async () => true),
  markNotificationToastAsShown: vi.fn(async () => {}),
}))

vi.mock('@tamagui/lucide-icons', () => ({
  Search: createIconComponent('Search'),
  MessageCircle: createIconComponent('MessageCircle'),
  MapPin: createIconComponent('MapPin'),
  ChevronDown: createIconComponent('ChevronDown'),
  Target: createIconComponent('Target'),
  Send: createIconComponent('Send'),
  Clock: createIconComponent('Clock'),
  Star: createIconComponent('Star'),
  DollarSign: createIconComponent('DollarSign'),
  Briefcase: createIconComponent('Briefcase'),
  Wrench: createIconComponent('Wrench'),
  Zap: createIconComponent('Zap'),
  Hammer: createIconComponent('Hammer'),
  Sparkles: createIconComponent('Sparkles'),
  PaintBucket: createIconComponent('PaintBucket'),
  TreePine: createIconComponent('TreePine'),
  Wind: createIconComponent('Wind'),
  Home: createIconComponent('Home'),
  Layers: createIconComponent('Layers'),
  Settings: createIconComponent('Settings'),
  Gift: createIconComponent('Gift'),
  Tag: createIconComponent('Tag'),
  SlidersHorizontal: createIconComponent('SlidersHorizontal'),
  X: createIconComponent('X'),
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

async function loadHandymanHomeScreen() {
  const screenSourcePath = decodeURIComponent(new URL('../screen.tsx', import.meta.url).pathname).replace(
    /^\/(\w:\/)/,
    '$1'
  )
  const source = await readFile(screenSourcePath, 'utf8')

  const transpiled = ts.transpileModule(source, {
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
    ['react-native-reanimated', await import('react-native-reanimated')],
    ['react-native', await import('react-native')],
    ['@my/api', await import('@my/api')],
    ['expo-linear-gradient', await import('expo-linear-gradient')],
    ['expo-image', await import('expo-image')],
    ['expo-router', await import('expo-router')],
    ['app/provider/safe-area/use-safe-area', await import('app/provider/safe-area/use-safe-area')],
    ['app/hooks', await import('app/hooks')],
    ['app/hooks/useHomeLocationBootstrap', await import('app/hooks/useHomeLocationBootstrap')],
    ['app/utils/location', await import('app/utils/location')],
    ['@tamagui/toast', await import('@tamagui/toast')],
    ['app/utils/toast-messages', await import('app/utils/toast-messages')],
    ['app/utils/notification-toast-storage', await import('app/utils/notification-toast-storage')],
    ['@tamagui/lucide-icons', await import('@tamagui/lucide-icons')],
  ])

  const localModule = {
    exports: {},
  }

  const localRequire = (moduleId: string) => {
    if (/\.(?:jpg|jpeg|png|webp|gif|svg)$/i.test(moduleId)) {
      return 'mock-asset'
    }

    if (!moduleMap.has(moduleId)) {
      throw new Error(`Unexpected screen dependency: ${moduleId}`)
    }

    return moduleMap.get(moduleId)
  }

  const evaluateModule = new Function('require', 'module', 'exports', transpiled.outputText)

  evaluateModule(localRequire, localModule, localModule.exports)

  return (localModule.exports as { HandymanHomeScreen: React.ComponentType<any> }).HandymanHomeScreen
}

async function renderScreen() {
  let renderer!: RendererInstance
  const HandymanHomeScreen = await loadHandymanHomeScreen()

  await act(async () => {
    renderer = TestRenderer.create(React.createElement(HandymanHomeScreen))
  })

  return renderer
}

function getLatestJobsForYouArgs(): JobsForYouArgs | undefined {
  return shared.jobsForYouCalls.at(-1)
}

describe('HandymanHomeScreen location bootstrap integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    shared.jobsForYouCalls.length = 0
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

  it('drives jobs-for-you from persisted canonical coordinates when there is no manual city override', async () => {
    await renderScreen()

    await waitForExpectation(() => {
      expect(getLatestJobsForYouArgs()).toMatchObject({
        latitude: 43.65,
        longitude: -79.36,
      })
    })
  })

  it('keeps cached canonical coordinates driving jobs-for-you when the live bootstrap refresh fails', async () => {
    shared.bootstrapResult = {
      selectedCitySeed: 'cached-city-id',
      resolvedCoordinates: {
        latitude: 43.65,
        longitude: -79.36,
      },
      locationError: 'Location permission was not granted',
      refreshLocation: shared.refreshLocation,
    }

    await renderScreen()

    await waitForExpectation(() => {
      expect(getLatestJobsForYouArgs()).toMatchObject({
        latitude: 43.65,
        longitude: -79.36,
      })
    })
  })

  it('passes undefined coordinates to jobs-for-you when no bootstrap coordinates or manual city are available', async () => {
    shared.bootstrapResult = {
      selectedCitySeed: null,
      resolvedCoordinates: null,
      locationError: null,
      refreshLocation: shared.refreshLocation,
    }

    await renderScreen()

    await waitForExpectation(() => {
      expect(getLatestJobsForYouArgs()).toMatchObject({
        latitude: undefined,
        longitude: undefined,
      })
    })
  })
})
