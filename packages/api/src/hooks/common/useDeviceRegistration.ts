import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../../client'
import { Platform } from 'react-native'

interface DeviceRegisterResponse {
  message: string
  data: {
    public_id: string
    device_type: 'ios' | 'android'
    is_active: boolean
  }
  errors: any
  meta: any
}

interface RegisterDeviceParams {
  deviceToken: string
  role: 'handyman' | 'homeowner'
}

/**
 * Hook to register a device for push notifications.
 */
export function useRegisterDevice() {
  return useMutation({
    mutationFn: async ({ deviceToken, role }: RegisterDeviceParams) => {
      const deviceType = Platform.OS === 'ios' ? 'ios' : 'android'
      const endpoint = role === 'handyman' ? 'handyman/devices/' : 'homeowner/devices/'

      const response = await apiClient
        .post(endpoint, {
          json: {
            device_token: deviceToken,
            device_type: deviceType,
          },
        })
        .json<DeviceRegisterResponse>()

      return response.data
    },
  })
}

interface UnregisterDeviceParams {
  publicId: string
  role: 'handyman' | 'homeowner'
}

/**
 * Hook to unregister a device from push notifications.
 */
export function useUnregisterDevice() {
  return useMutation({
    mutationFn: async ({ publicId, role }: UnregisterDeviceParams) => {
      const endpoint =
        role === 'handyman' ? `handyman/devices/${publicId}/` : `homeowner/devices/${publicId}/`

      await apiClient.delete(endpoint)
    },
  })
}
