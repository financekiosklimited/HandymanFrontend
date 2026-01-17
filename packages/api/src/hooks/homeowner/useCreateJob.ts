import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type { ApiResponse } from '../../types/common'
import type { HomeownerJob } from '../../types/homeowner'
import type { AttachmentUpload } from '../../types/attachment'

export interface JobTask {
  title: string
}

export interface CreateJobRequest {
  title: string
  description: string
  estimated_budget: number
  category_id: string
  city_id: string
  address: string
  postal_code?: string
  latitude?: number
  longitude?: number
  status?: 'draft' | 'open'
  tasks?: JobTask[]
  attachments?: AttachmentUpload[]
}

export interface CreateJobValidationError {
  message: string
  data: null
  errors: {
    [key: string]: string[] | { [index: string]: string[] | { non_field_errors?: string[] } }
  }
  meta: null
}

/**
 * Hook to create a new job listing for homeowner.
 * Supports multipart/form-data for attachment uploads (images, videos, documents).
 * Uses indexed format: attachments[0].file, attachments[1].file, etc.
 */
export function useCreateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateJobRequest) => {
      const formData = new FormData()

      // Add basic fields
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('estimated_budget', data.estimated_budget.toString())
      formData.append('category_id', data.category_id)
      formData.append('city_id', data.city_id)
      formData.append('address', data.address)

      if (data.postal_code) {
        formData.append('postal_code', data.postal_code)
      }

      if (data.latitude !== undefined) {
        formData.append('latitude', data.latitude.toString())
      }

      if (data.longitude !== undefined) {
        formData.append('longitude', data.longitude.toString())
      }

      if (data.status) {
        formData.append('status', data.status)
      }

      // Add tasks as JSON array
      if (data.tasks && data.tasks.length > 0) {
        data.tasks.forEach((task, index) => {
          formData.append(`tasks[${index}]title`, task.title)
        })
      }

      // Add attachments using indexed format
      if (data.attachments && data.attachments.length > 0) {
        data.attachments.forEach((attachment, index) => {
          // Main file
          // @ts-ignore - React Native FormData accepts RNFile object
          formData.append(`attachments[${index}].file`, attachment.file)

          // Thumbnail for videos (required)
          if (attachment.thumbnail) {
            // @ts-ignore - React Native FormData accepts RNFile object
            formData.append(`attachments[${index}].thumbnail`, attachment.thumbnail)
          }

          // Duration for videos (required)
          if (attachment.duration_seconds !== undefined) {
            formData.append(
              `attachments[${index}].duration_seconds`,
              attachment.duration_seconds.toString()
            )
          }
        })
      }

      const response = await apiClient
        .post('homeowner/jobs/', {
          body: formData,
          headers: {
            'Content-Type': undefined,
          },
        })
        .json<ApiResponse<HomeownerJob>>()

      return response.data
    },
    onSuccess: () => {
      // Invalidate homeowner jobs cache to refetch
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'jobs'] })
    },
  })
}
