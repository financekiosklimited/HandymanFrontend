import { readFile } from 'node:fs/promises'
import React from 'react'
import TestRenderer, { act } from 'react-test-renderer'
import ts from 'typescript'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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
type TestNode = RendererInstance['root']

type HostComponentProps = {
  children?: React.ReactNode
} & Record<string, unknown>

function getNodeProps(node: TestNode): Record<string, unknown> {
  return node.props as Record<string, unknown>
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
  const nearbyHandymenCalls: NearbyHandymenArgs[] = []

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

  const bootstrapResult: BootstrapResult = {
    selectedCitySeed: 'cached-city-id',
    resolvedCoordinates: {
      latitude: 43.65,
      longitude: -79.36,
    },
    locationError: null,
    refreshLocation,
  }

  return {
    refreshLocation,
    reverseGeocode,
    toastShow,
    push,
    nearbyHandymenCalls,
    cities,
    deniedPermission,
    grantedPermission,
    servicesEnabled: true,
    permission: grantedPermission,
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
    bootstrapResult,
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
    withRepeat: (value: unknown) => value,
    withTiming: (value: unknown) => value,
    withDelay: (_delay: number, value: unknown) => value,
    withSpring: (value: unknown) => value,
    withSequence: (...values: unknown[]) => values.at(-1),
    Easing: {
      inOut: vi.fn(),
      sin: vi.fn(),
      bezier: vi.fn(),
      out: vi.fn(),
      cubic: vi.fn(),
    },
    interpolate: (value: number, _input: number[], output: number[]) => output[0] ?? value,
    LinearTransition: {},
    useAnimatedRef: vi.fn(() => ({ current: null })),
    measure: vi.fn(() => null),
    runOnUI: (worklet: (...args: unknown[]) => unknown) => worklet,
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
  useGuestJobs: vi.fn(() => ({
    data: {
      pages: [{ results: [] }],
    },
    isLoading: false,
    error: null,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  })),
  useGuestHandymen: vi.fn((args: NearbyHandymenArgs) => {
    shared.nearbyHandymenCalls.push(args)

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
  useRefreshGuestLocation: vi.fn(() => ({
    mutateAsync: vi.fn(async () => null),
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
  useTypewriter: vi.fn(() => ({
    text: 'Trusted pros',
    showCursor: false,
    pause: vi.fn(),
    resume: vi.fn(),
    markActivity: vi.fn(),
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

vi.mock('@tamagui/lucide-icons', () => ({
  Search: createIconComponent('Search'),
  MessageCircle: createIconComponent('MessageCircle'),
  Plus: createIconComponent('Plus'),
  Briefcase: createIconComponent('Briefcase'),
  Zap: createIconComponent('Zap'),
  Wrench: createIconComponent('Wrench'),
  PaintBucket: createIconComponent('PaintBucket'),
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
  DollarSign: createIconComponent('DollarSign'),
  ArrowRight: createIconComponent('ArrowRight'),
  Gift: createIconComponent('Gift'),
  Tag: createIconComponent('Tag'),
  Clock: createIconComponent('Clock'),
}))

vi.mock('@my/config', () => ({
  colors: {
    accent: '#000000',
  },
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

async function loadGuestHomeScreen() {
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
    ['@tamagui/lucide-icons', await import('@tamagui/lucide-icons')],
    ['@my/config', await import('@my/config')],
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

  return (localModule.exports as { GuestHomeScreen: React.ComponentType<any> }).GuestHomeScreen
}

async function renderScreen() {
  let renderer!: RendererInstance
  const GuestHomeScreen = await loadGuestHomeScreen()

  await act(async () => {
    renderer = TestRenderer.create(React.createElement(GuestHomeScreen))
  })

  return renderer
}

function getLatestNearbyHandymenArgs(): NearbyHandymenArgs | undefined {
  return shared.nearbyHandymenCalls.at(-1)
}

function findTextNodes(root: TestNode, text: string): TestNode[] {
  return root.findAll((node: TestNode) => {
    const props = getNodeProps(node)

    return node.type === 'Text' && typeof props.__text === 'string' && props.__text.includes(text)
  })
}

function nodePress(node: TestNode) {
  const props = getNodeProps(node)

  if (typeof props.onPress !== 'function') {
    throw new Error('Expected test node to expose an onPress handler')
  }

  props.onPress()
}

function pressNodeWithText(root: TestNode, text: string, type?: string) {
  const node = root.find((candidate: TestNode) => {
    const props = getNodeProps(candidate)

    return (
      candidate.type === (type ?? candidate.type) &&
      typeof props.onPress === 'function' &&
      typeof props.__text === 'string' &&
      props.__text.includes(text)
    )
  })

  act(() => {
    nodePress(node)
  })
}

describe('GuestHomeScreen location bootstrap integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    shared.nearbyHandymenCalls.length = 0
    shared.servicesEnabled = true
    shared.permission = shared.grantedPermission
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

  it('keeps the bootstrapped Vancouver coordinates in the guest handymen query until a manual city override changes the session', async () => {
    shared.permission = shared.deniedPermission
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
      expect(findTextNodes(renderer.root, 'Vancouver').length).toBeGreaterThan(0)
      expect(getLatestNearbyHandymenArgs()).toMatchObject({
        latitude: 49.282729,
        longitude: -123.120738,
      })
    })

    pressNodeWithText(renderer.root, 'Select Location', 'XStack')

    await waitForExpectation(() => {
      expect(shared.refreshLocation).toHaveBeenCalledTimes(1)
      expect(findTextNodes(renderer.root, 'Toronto, Ontario').length).toBeGreaterThan(0)
    })

    pressNodeWithText(renderer.root, 'Toronto, Ontario', 'Button')

    await waitForExpectation(() => {
      expect(findTextNodes(renderer.root, 'Toronto').length).toBeGreaterThan(0)
      expect(getLatestNearbyHandymenArgs()).toMatchObject({
        latitude: 43.65107,
        longitude: -79.347015,
      })
      expect(shared.refreshLocation).toHaveBeenCalledTimes(1)
    })
  })

  it('keeps cached city coordinates driving guest browsing when live permission bootstrap is denied', async () => {
    shared.permission = shared.deniedPermission
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
})
