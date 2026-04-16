import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Location from 'expo-location'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { LocationSnapshot } from '@my/api'

type LocationSnapshotWithDeviceToken = LocationSnapshot & {
  device_token?: string
}

type RefreshLocationRequest = {
  latitude: number
  longitude: number
  device_token?: string
}

type ResolvedCoordinates = {
  latitude: number
  longitude: number
}

export interface UseHomeLocationBootstrapOptions {
  storageKey: string
  refreshLocationMutation: (
    request: RefreshLocationRequest
  ) => Promise<LocationSnapshotWithDeviceToken>
}

export interface UseHomeLocationBootstrapResult {
  selectedCitySeed: string | null
  resolvedCoordinates: ResolvedCoordinates | null
  locationError: string | null
  refreshLocation: () => Promise<void>
}

function toResolvedCoordinates(snapshot: LocationSnapshot | null): ResolvedCoordinates | null {
  if (!snapshot?.latitude || !snapshot.longitude) {
    return null
  }

  const latitude = Number.parseFloat(snapshot.latitude)
  const longitude = Number.parseFloat(snapshot.longitude)

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null
  }

  return {
    latitude,
    longitude,
  }
}

function getLocationErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Unable to refresh location'
}

export function useHomeLocationBootstrap(
  options: UseHomeLocationBootstrapOptions
): UseHomeLocationBootstrapResult {
  const { refreshLocationMutation, storageKey } = options

  const [selectedCitySeed, setSelectedCitySeed] = useState<string | null>(null)
  const [resolvedCoordinates, setResolvedCoordinates] = useState<ResolvedCoordinates | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  const hasBootstrappedRef = useRef(false)
  const cachedSnapshotRef = useRef<LocationSnapshotWithDeviceToken | null>(null)

  const applySnapshot = useCallback((snapshot: LocationSnapshotWithDeviceToken | null): void => {
    const mergedSnapshot = snapshot
      ? {
          ...snapshot,
          device_token: snapshot.device_token ?? cachedSnapshotRef.current?.device_token,
        }
      : null

    cachedSnapshotRef.current = mergedSnapshot
    setSelectedCitySeed(mergedSnapshot?.current_city?.public_id ?? null)
    setResolvedCoordinates(toResolvedCoordinates(mergedSnapshot))
  }, [])

  const refreshLocation = useCallback(async (): Promise<void> => {
    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync()

      if (!servicesEnabled) {
        throw new Error('Location services are disabled')
      }

      const permission = await Location.requestForegroundPermissionsAsync()

      if (!permission.granted) {
        throw new Error('Location permission was not granted')
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      const request: RefreshLocationRequest = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }

      if (cachedSnapshotRef.current?.device_token) {
        request.device_token = cachedSnapshotRef.current.device_token
      }

      const snapshot = await refreshLocationMutation(request)

      applySnapshot(snapshot)
      setLocationError(null)

      await AsyncStorage.setItem(storageKey, JSON.stringify(snapshot))
    } catch (error) {
      setLocationError(getLocationErrorMessage(error))
    }
  }, [applySnapshot, refreshLocationMutation, storageKey])

  useEffect(() => {
    if (hasBootstrappedRef.current) {
      return
    }

    hasBootstrappedRef.current = true

    let isMounted = true

    void (async () => {
      try {
        const cachedValue = await AsyncStorage.getItem(storageKey)

        if (cachedValue && isMounted) {
          const snapshot = JSON.parse(cachedValue) as LocationSnapshotWithDeviceToken
          applySnapshot(snapshot)
        }
      } catch {
        // Ignore cache read failures and continue with a live refresh.
      }

      if (isMounted) {
        await refreshLocation()
      }
    })()

    return () => {
      isMounted = false
    }
  }, [applySnapshot, refreshLocation, storageKey])

  return {
    selectedCitySeed,
    resolvedCoordinates,
    locationError,
    refreshLocation,
  }
}
