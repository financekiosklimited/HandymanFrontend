import ky, { type KyInstance } from 'ky'
import { getAuthStore } from './store/auth'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'

const API_TIMEOUT_MS = (() => {
  const raw = process.env.NEXT_PUBLIC_API_TIMEOUT_MS || process.env.EXPO_PUBLIC_API_TIMEOUT_MS
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN
  return Number.isFinite(parsed) ? parsed : 30_000
})()

// Flag to prevent multiple refresh attempts
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

async function refreshTokens(): Promise<boolean> {
  const { refreshToken, setTokens, setActiveRole, setNextAction, setEmailVerified, logout } =
    getAuthStore.getState()

  if (!refreshToken) {
    logout()
    return false
  }

  try {
    const response = await ky
      .post(`${API_BASE_URL}/api/v1/mobile/auth/refresh`, {
        json: { refresh_token: refreshToken },
        headers: { 'Content-Type': 'application/json' },
        timeout: API_TIMEOUT_MS,
      })
      .json<{
        message: string
        data: {
          access_token: string
          refresh_token: string
          active_role: 'homeowner' | 'handyman' | null
          next_action: 'none' | 'verify_email' | 'fill_profile' | 'activate_role'
          email_verified: boolean
        } | null
      }>()

    if (response.data) {
      setTokens(response.data.access_token, response.data.refresh_token)
      setActiveRole(response.data.active_role)
      setNextAction(response.data.next_action)
      setEmailVerified(response.data.email_verified)
      return true
    }

    logout()
    return false
  } catch {
    logout()
    return false
  }
}

export function createApiClient(): KyInstance {
  const client = ky.create({
    prefixUrl: `${API_BASE_URL}/api/v1/mobile`,
    timeout: API_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
    hooks: {
      beforeRequest: [
        (request) => {
          const { accessToken } = getAuthStore.getState()
          if (accessToken) {
            request.headers.set('Authorization', `Bearer ${accessToken}`)
          }
        },
      ],
      afterResponse: [
        async (request, options, response) => {
          if (response.status === 401) {
            // Skip refresh for auth endpoints to prevent loops
            const url = request.url.toString()
            if (
              url.includes('/auth/login') ||
              url.includes('/auth/refresh') ||
              url.includes('/auth/logout')
            ) {
              return response
            }

            // Prevent multiple simultaneous refresh attempts
            if (!isRefreshing) {
              isRefreshing = true
              refreshPromise = refreshTokens().finally(() => {
                isRefreshing = false
                refreshPromise = null
              })
            }

            // Wait for the refresh to complete
            const success = await refreshPromise

            if (success) {
              // Retry the original request with new token
              const { accessToken } = getAuthStore.getState()
              if (accessToken) {
                request.headers.set('Authorization', `Bearer ${accessToken}`)
              }
              return ky(request, options)
            }
          }
          return response
        },
      ],
    },
    retry: {
      limit: 2,
      methods: ['get'],
      statusCodes: [408, 500, 502, 503, 504],
    },
  })

  return client
}

export const apiClient = createApiClient()
