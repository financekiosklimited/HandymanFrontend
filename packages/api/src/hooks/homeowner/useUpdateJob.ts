import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type { ApiResponse } from '../../types/common'
import type { HomeownerJob } from '../../types/homeowner'

export interface TaskInput {
  public_id?: string
  title?: string
  _delete?: boolean
}

export interface UpdateJobRequest {
  title?: string
  description?: string
  estimated_budget?: number
  category_id?: string
  city_id?: string
  address?: string
  postal_code?: string
  status?: 'draft' | 'open' | 'in_progress'
  tasks?: TaskInput[]
  images?: { uri: string; name: string; type: string }[]
  images_to_remove?: string[]
}

export interface UpdateJobValidationError {
  message: string
  data: null
  errors: {
    [key: string]: string[] | { [index: string]: string[] | { non_field_errors?: string[] } }
  }
  meta: null
}

/**
 * Hook to update an existing job listing for homeowner.
 * Supports multipart/form-data for image uploads.
 * Supports task CRUD operations via _delete flag.
 */
export function useUpdateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ publicId, data }: { publicId: string; data: UpdateJobRequest }) => {
      const formData = new FormData()

      // Add basic fields (only if provided)
      if (data.title !== undefined) {
        formData.append('title', data.title)
      }
      if (data.description !== undefined) {
        formData.append('description', data.description)
      }
      if (data.estimated_budget !== undefined) {
        formData.append('estimated_budget', data.estimated_budget.toString())
      }
      if (data.category_id !== undefined) {
        formData.append('category_id', data.category_id)
      }
      if (data.city_id !== undefined) {
        formData.append('city_id', data.city_id)
      }
      if (data.address !== undefined) {
        formData.append('address', data.address)
      }
      if (data.postal_code !== undefined) {
        formData.append('postal_code', data.postal_code)
      }
      if (data.status !== undefined) {
        formData.append('status', data.status)
      }

      // Add tasks with CRUD operations
      if (data.tasks && data.tasks.length > 0) {
        data.tasks.forEach((task, index) => {
          if (task.public_id) {
            formData.append(`tasks[${index}]public_id`, task.public_id)
          }
          if (task._delete) {
            formData.append(`tasks[${index}]_delete`, 'true')
          } else if (task.title !== undefined) {
            formData.append(`tasks[${index}]title`, task.title)
          }
        })
      }

      // Add new images
      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          // @ts-ignore - React Native FormData accepts uri/name/type object
          formData.append('images', {
            uri: image.uri,
            name: image.name,
            type: image.type,
          })
        })
      }

      // Add images to remove
      if (data.images_to_remove && data.images_to_remove.length > 0) {
        data.images_to_remove.forEach((imageId, index) => {
          formData.append(`images_to_remove[${index}]`, imageId)
        })
      }

      const response = await apiClient
        .put(`homeowner/jobs/${publicId}/`, {
          body: formData,
          headers: {
            'Content-Type': undefined,
          },
        })
        .json<ApiResponse<HomeownerJob>>()

      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate homeowner jobs cache to refetch
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'jobs'] })
      // Also invalidate specific job cache
      queryClient.invalidateQueries({ queryKey: ['homeowner', 'jobs', variables.publicId] })
    },
  })
}
