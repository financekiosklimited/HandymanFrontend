import { useMutation } from '@tanstack/react-query'
import { apiClient } from '../../client'
import type { ApiResponse } from '../../types/common'
import type { DiscountValidationRequest, DiscountValidationResponse } from '../../types/discount'

/**
 * Hook to validate a discount code
 * @returns Mutation function for validating discount codes
 */
export function useValidateDiscount() {
  return useMutation({
    mutationFn: async (data: DiscountValidationRequest) => {
      const response = await apiClient
        .post('discounts/validate/', {
          json: data,
        })
        .json<ApiResponse<DiscountValidationResponse>>()
      return response.data
    },
  })
}
