import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { GuestLocationRefreshRequest, GuestLocationRefreshResponse } from '../types/guest'
import type {
  HomeownerLocationRefreshRequest,
  HomeownerLocationRefreshResponse,
} from '../types/homeowner'
import type {
  HandymanLocationRefreshRequest,
  HandymanLocationRefreshResponse,
} from '../types/handyman'

interface MutationConfig<TVariables, TData> {
  mutationFn: (variables: TVariables) => Promise<TData>
  onSuccess?: (data: TData) => void
}

const invalidateQueries = vi.fn()
const useQueryClientMock = vi.fn(() => ({ invalidateQueries }))
const useMutationMock = vi.fn(
  <TVariables, TData>(config: MutationConfig<TVariables, TData>) => config
)
const jsonMock = vi.fn()
const postMock = vi.fn(() => ({ json: jsonMock }))

vi.mock('@tanstack/react-query', () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}))

vi.mock('../client', () => ({
  apiClient: {
    post: postMock,
  },
}))

function asMutationConfig<TVariables, TData>(value: unknown): MutationConfig<TVariables, TData> {
  return value as MutationConfig<TVariables, TData>
}

describe('location refresh mutation hooks', () => {
  beforeEach(() => {
    invalidateQueries.mockReset()
    useQueryClientMock.mockClear()
    useMutationMock.mockClear()
    jsonMock.mockReset()
    postMock.mockClear()
  })

  it('posts homeowner refresh coordinates and invalidates profile and nearby queries', async () => {
    const response: HomeownerLocationRefreshResponse = {
      latitude: '43.651070',
      longitude: '-79.347015',
      current_city: {
        public_id: 'city-1',
        name: 'Toronto',
        province: 'Ontario',
        province_code: 'ON',
        slug: 'toronto-on',
      },
      last_location_updated_at: '2026-04-06T12:00:00Z',
    }
    const request: HomeownerLocationRefreshRequest = {
      latitude: 43.65107,
      longitude: -79.347015,
    }
    jsonMock.mockResolvedValue({ data: response })

    const { useRefreshHomeownerLocation } = await import('../hooks/homeowner/useRefreshLocation')
    const mutation = asMutationConfig<
      HomeownerLocationRefreshRequest,
      HomeownerLocationRefreshResponse
    >(useRefreshHomeownerLocation())

    await expect(mutation.mutationFn(request)).resolves.toEqual(response)
    expect(postMock).toHaveBeenCalledWith('homeowner/profile/location/refresh/', { json: request })

    mutation.onSuccess?.(response)

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['homeowner', 'profile'] })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['homeowner', 'handymen', 'nearby'],
    })
  })

  it('posts handyman refresh coordinates and invalidates profile and jobs-for-you queries', async () => {
    const response: HandymanLocationRefreshResponse = {
      latitude: '43.651070',
      longitude: '-79.347015',
      current_city: {
        public_id: 'city-1',
        name: 'Toronto',
        province: 'Ontario',
        province_code: 'ON',
        slug: 'toronto-on',
      },
      last_location_updated_at: '2026-04-06T12:00:00Z',
    }
    const request: HandymanLocationRefreshRequest = {
      latitude: 43.65107,
      longitude: -79.347015,
    }
    jsonMock.mockResolvedValue({ data: response })

    const { useRefreshHandymanLocation } = await import('../hooks/handyman/useRefreshLocation')
    const mutation = asMutationConfig<
      HandymanLocationRefreshRequest,
      HandymanLocationRefreshResponse
    >(useRefreshHandymanLocation())

    await expect(mutation.mutationFn(request)).resolves.toEqual(response)
    expect(postMock).toHaveBeenCalledWith('handyman/profile/location/refresh/', { json: request })

    mutation.onSuccess?.(response)

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['handyman', 'profile'] })
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['handyman', 'jobs', 'for-you'] })
  })

  it('posts guest refresh coordinates with optional device token and invalidates guest handymen', async () => {
    const response: GuestLocationRefreshResponse = {
      device_token: 'device-token-123',
      latitude: '43.651070',
      longitude: '-79.347015',
      current_city: {
        public_id: 'city-1',
        name: 'Toronto',
        province: 'Ontario',
        province_code: 'ON',
        slug: 'toronto-on',
      },
      last_location_updated_at: '2026-04-06T12:00:00Z',
    }
    const request: GuestLocationRefreshRequest = {
      latitude: 43.65107,
      longitude: -79.347015,
      device_token: 'device-token-123',
    }
    jsonMock.mockResolvedValue({ data: response })

    const { useRefreshGuestLocation } = await import('../hooks/guest/useRefreshLocation')
    const mutation = asMutationConfig<GuestLocationRefreshRequest, GuestLocationRefreshResponse>(
      useRefreshGuestLocation()
    )

    await expect(mutation.mutationFn(request)).resolves.toEqual(response)
    expect(postMock).toHaveBeenCalledWith('guest/location/refresh/', { json: request })

    mutation.onSuccess?.(response)

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['guest', 'handymen'] })
  })
})
