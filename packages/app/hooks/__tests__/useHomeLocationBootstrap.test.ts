import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Location from 'expo-location'
import React, { useEffect } from 'react'
import TestRenderer, { act } from 'react-test-renderer'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}))

vi.mock('expo-location', () => ({
  hasServicesEnabledAsync: vi.fn(),
  requestForegroundPermissionsAsync: vi.fn(),
  getCurrentPositionAsync: vi.fn(),
  Accuracy: {
    Balanced: 'balanced',
  },
}))

interface CitySummary {
  public_id: string
  name: string
  province: string
  province_code: string
  slug: string
}

interface CachedLocationSnapshot {
  latitude: string | null
  longitude: string | null
  current_city: CitySummary | null
  last_location_updated_at: string | null
  device_token?: string
}

interface RefreshLocationRequest {
  latitude: number
  longitude: number
  device_token?: string
}

interface UseHomeLocationBootstrapOptions {
  storageKey: string
  refreshLocationMutation: (request: RefreshLocationRequest) => Promise<CachedLocationSnapshot>
}

interface UseHomeLocationBootstrapResult {
  selectedCitySeed: string | null
  resolvedCoordinates: {
    latitude: number
    longitude: number
  } | null
  locationError: string | null
  refreshLocation: () => Promise<void>
}

type HooksModule = Record<string, unknown>

interface HookProbeProps {
  useHook: (options: UseHomeLocationBootstrapOptions) => UseHomeLocationBootstrapResult
  options: UseHomeLocationBootstrapOptions
  onChange: (value: UseHomeLocationBootstrapResult) => void
}

function createDeferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((innerResolve) => {
    resolve = innerResolve
  })

  return { promise, resolve }
}

function HookProbe({ useHook, options, onChange }: HookProbeProps) {
  const value = useHook(options)

  useEffect(() => {
    onChange(value)
  }, [onChange, value])

  return null
}

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

describe('useHomeLocationBootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('hydrates cached snapshot first, then overwrites it with the refreshed backend snapshot', async () => {
    const cachedSnapshot: CachedLocationSnapshot = {
      latitude: '43.650000',
      longitude: '-79.360000',
      current_city: {
        public_id: 'cached-city-id',
        name: 'Cached City',
        province: 'Ontario',
        province_code: 'ON',
        slug: 'cached-city-on',
      },
      last_location_updated_at: '2026-04-06T10:00:00Z',
    }

    const refreshedSnapshot: CachedLocationSnapshot = {
      latitude: '43.701000',
      longitude: '-79.401000',
      current_city: {
        public_id: 'fresh-city-id',
        name: 'Fresh City',
        province: 'Ontario',
        province_code: 'ON',
        slug: 'fresh-city-on',
      },
      last_location_updated_at: '2026-04-06T10:05:00Z',
    }

    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(cachedSnapshot))
    vi.mocked(AsyncStorage.setItem).mockResolvedValue(undefined)
    vi.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true)

    const grantedPermissionStatus = 'granted' as Awaited<
      ReturnType<typeof Location.requestForegroundPermissionsAsync>
    >['status']

    const grantedPermission: Awaited<
      ReturnType<typeof Location.requestForegroundPermissionsAsync>
    > = {
      status: grantedPermissionStatus,
      granted: true,
      canAskAgain: true,
      expires: 'never',
    }

    vi.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue(grantedPermission)

    const currentPosition = {
      coords: {
        latitude: 43.700123,
        longitude: -79.400456,
        accuracy: 5,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    }

    vi.mocked(Location.getCurrentPositionAsync).mockResolvedValue(currentPosition)

    const refreshDeferred = createDeferred<CachedLocationSnapshot>()
    const refreshLocationMutation = vi.fn(() => refreshDeferred.promise)

    const hookModulePath = '../useHomeLocationBootstrap'
    let hooksModule: HooksModule

    try {
      hooksModule = (await import(hookModulePath)) as HooksModule
    } catch {
      throw new Error('useHomeLocationBootstrap hook is missing')
    }

    expect(hooksModule.useHomeLocationBootstrap).toBeDefined()

    const useHomeLocationBootstrap = hooksModule.useHomeLocationBootstrap as (
      options: UseHomeLocationBootstrapOptions
    ) => UseHomeLocationBootstrapResult

    let latestResult: UseHomeLocationBootstrapResult | null = null

    await act(async () => {
      TestRenderer.create(
        React.createElement(HookProbe, {
          useHook: useHomeLocationBootstrap,
          options: {
            storageKey: 'homeowner-home-location',
            refreshLocationMutation,
          },
          onChange: (value: UseHomeLocationBootstrapResult) => {
            latestResult = value
          },
        })
      )
    })

    await waitForExpectation(() => {
      expect(latestResult).not.toBeNull()
      expect(latestResult?.selectedCitySeed).toBe('cached-city-id')
      expect(latestResult?.resolvedCoordinates).toEqual({
        latitude: 43.65,
        longitude: -79.36,
      })
    })

    expect(refreshLocationMutation).toHaveBeenCalledWith({
      latitude: 43.700123,
      longitude: -79.400456,
    })

    await act(async () => {
      refreshDeferred.resolve(refreshedSnapshot)
      await refreshDeferred.promise
    })

    await waitForExpectation(() => {
      expect(latestResult?.selectedCitySeed).toBe('fresh-city-id')
      expect(latestResult?.resolvedCoordinates).toEqual({
        latitude: 43.701,
        longitude: -79.401,
      })
    })

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'homeowner-home-location',
      JSON.stringify(refreshedSnapshot)
    )
    await waitForExpectation(() => {
      expect(latestResult?.locationError).toBeNull()
      expect(typeof latestResult?.refreshLocation).toBe('function')
    })
  })

  it('preserves the cached snapshot when location permission is denied', async () => {
    const cachedSnapshot: CachedLocationSnapshot = {
      latitude: '43.650000',
      longitude: '-79.360000',
      current_city: {
        public_id: 'cached-city-id',
        name: 'Cached City',
        province: 'Ontario',
        province_code: 'ON',
        slug: 'cached-city-on',
      },
      last_location_updated_at: '2026-04-06T10:00:00Z',
      device_token: 'guest-token-123',
    }

    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(cachedSnapshot))
    vi.mocked(AsyncStorage.setItem).mockResolvedValue(undefined)
    vi.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true)

    const deniedPermissionStatus = 'denied' as Awaited<
      ReturnType<typeof Location.requestForegroundPermissionsAsync>
    >['status']

    const deniedPermission: Awaited<ReturnType<typeof Location.requestForegroundPermissionsAsync>> =
      {
        status: deniedPermissionStatus,
        granted: false,
        canAskAgain: true,
        expires: 'never',
      }

    vi.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue(deniedPermission)

    const refreshLocationMutation =
      vi.fn<UseHomeLocationBootstrapOptions['refreshLocationMutation']>()

    const hookModulePath = '../useHomeLocationBootstrap'
    let hooksModule: HooksModule

    try {
      hooksModule = (await import(hookModulePath)) as HooksModule
    } catch {
      throw new Error('useHomeLocationBootstrap hook is missing')
    }

    expect(hooksModule.useHomeLocationBootstrap).toBeDefined()

    const useHomeLocationBootstrap = hooksModule.useHomeLocationBootstrap as (
      options: UseHomeLocationBootstrapOptions
    ) => UseHomeLocationBootstrapResult

    let latestResult: UseHomeLocationBootstrapResult | null = null

    await act(async () => {
      TestRenderer.create(
        React.createElement(HookProbe, {
          useHook: useHomeLocationBootstrap,
          options: {
            storageKey: 'guest-home-location',
            refreshLocationMutation,
          },
          onChange: (value: UseHomeLocationBootstrapResult) => {
            latestResult = value
          },
        })
      )
    })

    await waitForExpectation(() => {
      expect(latestResult?.selectedCitySeed).toBe('cached-city-id')
      expect(latestResult?.resolvedCoordinates).toEqual({
        latitude: 43.65,
        longitude: -79.36,
      })
      expect(latestResult?.locationError).toBe('Location permission was not granted')
      expect(typeof latestResult?.refreshLocation).toBe('function')
    })

    expect(refreshLocationMutation).not.toHaveBeenCalled()
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled()
    expect(AsyncStorage.setItem).not.toHaveBeenCalled()
  })

  it('replays the cached guest device token on later refreshes even if the backend snapshot omits it', async () => {
    const cachedSnapshot: CachedLocationSnapshot = {
      latitude: '43.650000',
      longitude: '-79.360000',
      current_city: {
        public_id: 'cached-city-id',
        name: 'Cached City',
        province: 'Ontario',
        province_code: 'ON',
        slug: 'cached-city-on',
      },
      last_location_updated_at: '2026-04-06T10:00:00Z',
      device_token: 'guest-token-123',
    }

    const refreshedSnapshot: CachedLocationSnapshot = {
      latitude: '43.701000',
      longitude: '-79.401000',
      current_city: {
        public_id: 'fresh-city-id',
        name: 'Fresh City',
        province: 'Ontario',
        province_code: 'ON',
        slug: 'fresh-city-on',
      },
      last_location_updated_at: '2026-04-06T10:05:00Z',
    }

    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(cachedSnapshot))
    vi.mocked(AsyncStorage.setItem).mockResolvedValue(undefined)
    vi.mocked(Location.hasServicesEnabledAsync).mockResolvedValue(true)

    const grantedPermissionStatus = 'granted' as Awaited<
      ReturnType<typeof Location.requestForegroundPermissionsAsync>
    >['status']

    const grantedPermission: Awaited<ReturnType<typeof Location.requestForegroundPermissionsAsync>> = {
      status: grantedPermissionStatus,
      granted: true,
      canAskAgain: true,
      expires: 'never',
    }

    vi.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue(grantedPermission)

    const currentPosition = {
      coords: {
        latitude: 43.700123,
        longitude: -79.400456,
        accuracy: 5,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    }

    vi.mocked(Location.getCurrentPositionAsync).mockResolvedValue(currentPosition)

    const refreshLocationMutation = vi.fn(async () => refreshedSnapshot)

    const hookModulePath = '../useHomeLocationBootstrap'
    let hooksModule: HooksModule

    try {
      hooksModule = (await import(hookModulePath)) as HooksModule
    } catch {
      throw new Error('useHomeLocationBootstrap hook is missing')
    }

    expect(hooksModule.useHomeLocationBootstrap).toBeDefined()

    const useHomeLocationBootstrap = hooksModule.useHomeLocationBootstrap as (
      options: UseHomeLocationBootstrapOptions
    ) => UseHomeLocationBootstrapResult

    let latestResult: UseHomeLocationBootstrapResult | null = null

    await act(async () => {
      TestRenderer.create(
        React.createElement(HookProbe, {
          useHook: useHomeLocationBootstrap,
          options: {
            storageKey: 'guest-home-location',
            refreshLocationMutation,
          },
          onChange: (value: UseHomeLocationBootstrapResult) => {
            latestResult = value
          },
        })
      )
    })

    await waitForExpectation(() => {
      expect(refreshLocationMutation).toHaveBeenCalledWith({
        latitude: 43.700123,
        longitude: -79.400456,
        device_token: 'guest-token-123',
      })
    })

    await act(async () => {
      await latestResult?.refreshLocation()
    })

    await waitForExpectation(() => {
      expect(refreshLocationMutation).toHaveBeenNthCalledWith(2, {
        latitude: 43.700123,
        longitude: -79.400456,
        device_token: 'guest-token-123',
      })
    })
  })
})
