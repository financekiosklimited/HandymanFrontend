import type { City } from '@my/api'

/**
 * Calculate distance between two coordinates using Haversine formula.
 * Returns distance in kilometers.
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Find the nearest city from a list of cities based on coordinates.
 * Returns the closest city or null if no cities provided.
 */
export function findNearestCity(latitude: number, longitude: number, cities: City[]): City | null {
  if (!cities.length) return null

  // Calculate distance to each city and find the minimum
  let nearestCity: City | null = null
  let minDistance = Number.POSITIVE_INFINITY

  for (const city of cities) {
    // We need to estimate city coordinates from the slug or use a mapping
    // For now, we'll use a simple approach based on city names
    // In production, you might want to store lat/lng in the City model
    const cityCoords = getCityCoordinates(city.slug)

    if (cityCoords) {
      const distance = calculateDistance(latitude, longitude, cityCoords.lat, cityCoords.lng)

      if (distance < minDistance) {
        minDistance = distance
        nearestCity = city
      }
    }
  }

  return nearestCity
}

/**
 * Get coordinates for a city slug.
 * This is a temporary solution - ideally coordinates should come from the API.
 */
function getCityCoordinates(slug: string): { lat: number; lng: number } | null {
  const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
    'toronto-on': { lat: 43.65107, lng: -79.347015 },
    'ottawa-on': { lat: 45.42153, lng: -75.697193 },
    'mississauga-on': { lat: 43.589045, lng: -79.64412 },
    'hamilton-on': { lat: 43.255203, lng: -79.843826 },
    'vancouver-bc': { lat: 49.282729, lng: -123.120738 },
    'surrey-bc': { lat: 49.1058, lng: -122.825095 },
    'calgary-ab': { lat: 51.044733, lng: -114.071883 },
    'edmonton-ab': { lat: 53.544389, lng: -113.490927 },
    'montreal-qc': { lat: 45.501689, lng: -73.567256 },
    'quebec-city-qc': { lat: 46.813878, lng: -71.207981 },
    'winnipeg-mb': { lat: 49.895136, lng: -97.138374 },
    'halifax-ns': { lat: 44.648764, lng: -63.575239 },
  }

  return CITY_COORDINATES[slug] || null
}

/**
 * Normalize city name for comparison by removing special characters and converting to lowercase.
 */
export function normalizeCityName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/(city|town|village)$/i, '')
}

/**
 * Find a city by name from the list of cities.
 * Returns the matching city or null if not found.
 */
export function findCityByName(cityName: string, cities: City[]): City | null {
  const normalizedInput = normalizeCityName(cityName)

  // First try exact match
  const exactMatch = cities.find((city) => normalizeCityName(city.name) === normalizedInput)
  if (exactMatch) return exactMatch

  // Try partial match (city name contains input or vice versa)
  const partialMatch = cities.find((city) => {
    const normalizedCity = normalizeCityName(city.name)
    return normalizedCity.includes(normalizedInput) || normalizedInput.includes(normalizedCity)
  })

  return partialMatch || null
}
