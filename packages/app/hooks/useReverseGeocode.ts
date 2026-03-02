import { useState, useCallback } from 'react'

interface NominatimAddress {
  city?: string
  town?: string
  village?: string
  municipality?: string
  state?: string
  country?: string
  county?: string
}

interface NominatimResponse {
  address: NominatimAddress
  display_name: string
  lat: string
  lon: string
}

interface ReverseGeocodeResult {
  city: string
  state: string
  country: string
  displayName: string
}

interface UseReverseGeocodeReturn {
  reverseGeocode: (latitude: number, longitude: number) => Promise<ReverseGeocodeResult | null>
  isLoading: boolean
  error: string | null
}

// Cache to avoid duplicate API calls for same coordinates
const geocodeCache = new Map<string, ReverseGeocodeResult>()

/**
 * Hook to reverse geocode coordinates using OpenStreetMap Nominatim API.
 * Free service with rate limit of 1 request/second.
 *
 * @returns Object with reverseGeocode function, loading state, and error state
 */
export function useReverseGeocode(): UseReverseGeocodeReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reverseGeocode = useCallback(
    async (latitude: number, longitude: number): Promise<ReverseGeocodeResult | null> => {
      const cacheKey = `${latitude.toFixed(6)},${longitude.toFixed(6)}`

      // Check cache first
      if (geocodeCache.has(cacheKey)) {
        return geocodeCache.get(cacheKey)!
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
          {
            headers: {
              'User-Agent': 'HandymanKiosk/1.0',
            },
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: NominatimResponse = await response.json()

        // Extract city name - Nominatim uses different fields depending on location type
        const cityName =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.municipality ||
          ''

        if (!cityName) {
          throw new Error('Could not determine city from coordinates')
        }

        const result: ReverseGeocodeResult = {
          city: cityName,
          state: data.address.state || '',
          country: data.address.country || '',
          displayName: data.display_name,
        }

        // Cache the result
        geocodeCache.set(cacheKey, result)

        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get location'
        setError(errorMessage)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { reverseGeocode, isLoading, error }
}
