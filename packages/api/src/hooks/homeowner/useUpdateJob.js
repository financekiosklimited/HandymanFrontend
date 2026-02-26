System.register(['@tanstack/react-query', '../../client'], (exports_1, context_1) => {
  var react_query_1, client_1
  var __moduleName = context_1 && context_1.id
  /**
   * Hook to update an existing job listing for homeowner.
   * Supports multipart/form-data for attachment uploads (images, videos, documents).
   * Supports task CRUD operations via _delete flag.
   * Uses indexed format: attachments[0].file, attachments[1].file, etc.
   */
  function useUpdateJob() {
    const queryClient = react_query_1.useQueryClient()
    return react_query_1.useMutation({
      mutationFn: async ({ publicId, data }) => {
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
        // Add new attachments using indexed format
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
        // Add attachments to remove
        if (data.attachments_to_remove && data.attachments_to_remove.length > 0) {
          data.attachments_to_remove.forEach((attachmentId, index) => {
            formData.append(`attachments_to_remove[${index}]`, attachmentId)
          })
        }
        const response = await client_1.apiClient
          .put(`homeowner/jobs/${publicId}/`, {
            body: formData,
            headers: {
              'Content-Type': undefined,
            },
          })
          .json()
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
  exports_1('useUpdateJob', useUpdateJob)
  return {
    setters: [
      (react_query_1_1) => {
        react_query_1 = react_query_1_1
      },
      (client_1_1) => {
        client_1 = client_1_1
      },
    ],
    execute: () => {},
  }
})
