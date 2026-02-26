System.register(['ky'], (exports_1, context_1) => {
  var ky_1, ERROR_MESSAGES
  var __moduleName = context_1 && context_1.id
  /**
   * Formats error into human-readable message for display to users.
   * Strips URLs, technical details, and provides user-friendly messages.
   */
  function formatErrorMessage(error) {
    // Handle ky TimeoutError
    if (error instanceof ky_1.TimeoutError) {
      return 'Request timed out. Please try again.'
    }
    // Handle ky HTTPError
    if (error instanceof ky_1.HTTPError) {
      const status = error.response?.status
      if (status && ERROR_MESSAGES[status.toString()]) {
        return ERROR_MESSAGES[status.toString()] ?? 'Something went wrong. Please try again.'
      }
      return 'Something went wrong. Please try again.'
    }
    // Handle standard Error objects
    if (error instanceof Error) {
      const message = error.message
      // Check for timeout-related messages
      if (
        message.includes('timed out') ||
        message.includes('timeout') ||
        message.includes('Timeout')
      ) {
        return 'Request timed out. Please try again.'
      }
      // Check for network errors
      if (
        message.includes('network') ||
        message.includes('Network') ||
        message.includes('fetch') ||
        message.includes('Failed to fetch') ||
        message.includes('NetworkError')
      ) {
        return 'Unable to connect. Please check your internet connection.'
      }
      // Check for abort errors
      if (message.includes('abort') || message.includes('Abort')) {
        return 'Request was cancelled.'
      }
      // Check if message contains URL (technical detail we want to hide)
      if (message.includes('http://') || message.includes('https://')) {
        // Extract just the error type before the URL
        const match = message.match(/^([^:]+):/)?.[1]
        if (match) {
          // Map common error types to user-friendly messages
          if (match.toLowerCase().includes('timeout')) {
            return 'Request timed out. Please try again.'
          }
          if (match.toLowerCase().includes('network')) {
            return 'Unable to connect. Please check your internet connection.'
          }
        }
        return 'Something went wrong. Please try again.'
      }
      // If message looks like HTTP status code
      const statusMatch = message.match(/^(\d{3})\b/)
      if (statusMatch && statusMatch[1]) {
        const statusCode = statusMatch[1]
        if (ERROR_MESSAGES[statusCode]) {
          return ERROR_MESSAGES[statusCode]
        }
      }
      // Return message if it seems user-friendly (no technical jargon)
      const technicalPatterns = [
        /HTTP/i,
        /JSON/i,
        /parse/i,
        /undefined/i,
        /null/i,
        /TypeError/i,
        /ReferenceError/i,
        /SyntaxError/i,
      ]
      if (!technicalPatterns.some((pattern) => pattern.test(message))) {
        return message
      }
    }
    // Fallback for unknown errors
    return 'An unexpected error occurred. Please try again.'
  }
  exports_1('formatErrorMessage', formatErrorMessage)
  /**
   * Helper to extract human-readable error from API validation response.
   * Use this for handling validation errors from the backend.
   */
  function formatValidationError(errorData) {
    // Field name mappings for better readability
    const fieldNames = {
      title: 'Title',
      description: 'Description',
      estimated_budget: 'Estimated budget',
      category_id: 'Category',
      city_id: 'City',
      address: 'Address',
      postal_code: 'Postal code',
      tasks: 'Tasks',
      images: 'Images',
      email: 'Email',
      password: 'Password',
      phone: 'Phone number',
      name: 'Name',
      first_name: 'First name',
      last_name: 'Last name',
    }
    // Priority 1: Extract first meaningful field error
    if (errorData.errors) {
      for (const [field, fieldErrors] of Object.entries(errorData.errors)) {
        if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
          const fieldName = fieldNames[field] || formatFieldName(field)
          return `${fieldName}: ${fieldErrors[0]}`
        }
        if (typeof fieldErrors === 'object' && fieldErrors !== null) {
          // Handle nested errors (tasks, images) and non_field_errors
          for (const [key, nestedErrors] of Object.entries(fieldErrors)) {
            if (
              key === 'non_field_errors' &&
              Array.isArray(nestedErrors) &&
              nestedErrors.length > 0
            ) {
              return `Error: ${nestedErrors[0]}`
            }
            if (Array.isArray(nestedErrors) && nestedErrors.length > 0) {
              const fieldName = fieldNames[field] || formatFieldName(field)
              return `${fieldName}: ${nestedErrors[0]}`
            }
          }
        }
      }
    }
    // Priority 2: Use the main message if it's meaningful
    if (errorData.message && !errorData.message.toLowerCase().includes('validation')) {
      return errorData.message
    }
    // Fallback
    return 'Please check your input and try again.'
  }
  exports_1('formatValidationError', formatValidationError)
  /**
   * Formats a snake_case field name to Title Case
   */
  function formatFieldName(field) {
    return field
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  return {
    setters: [
      (ky_1_1) => {
        ky_1 = ky_1_1
      },
    ],
    execute: () => {
      /**
       * Error messages map for common API errors
       */
      ERROR_MESSAGES = {
        // Network errors
        'Failed to fetch': 'Unable to connect. Please check your internet connection.',
        'Network request failed': 'Unable to connect. Please check your internet connection.',
        NetworkError: 'Unable to connect. Please check your internet connection.',
        // Server errors
        500: 'Server error. Please try again later.',
        502: 'Server is temporarily unavailable. Please try again later.',
        503: 'Service unavailable. Please try again later.',
        504: 'Server took too long to respond. Please try again.',
        // Client errors
        400: 'Invalid request. Please check your input.',
        401: 'Session expired. Please log in again.',
        403: "You don't have permission to perform this action.",
        404: 'The requested resource was not found.',
        409: 'This action conflicts with the current state.',
        422: 'Invalid data. Please check your input.',
        429: 'Too many requests. Please wait a moment and try again.',
      }
    },
  }
})
