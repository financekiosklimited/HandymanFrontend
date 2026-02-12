import { describe, it, expect } from 'vitest'
import { formatErrorMessage, formatValidationError } from '../errors'

describe('formatErrorMessage', () => {
  it('should format TimeoutError', () => {
    const { TimeoutError } = require('ky')
    const error = new TimeoutError('Request timed out')
    expect(formatErrorMessage(error)).toBe('Request timed out. Please try again.')
  })

  it('should format HTTP status 401 from message', () => {
    const error = new Error('401 Unauthorized')
    expect(formatErrorMessage(error)).toBe('Session expired. Please log in again.')
  })

  it('should format HTTP status 403 from message', () => {
    const error = new Error('403 Forbidden')
    expect(formatErrorMessage(error)).toBe("You don't have permission to perform this action.")
  })

  it('should format HTTP status 404 from message', () => {
    const error = new Error('404 Not Found')
    expect(formatErrorMessage(error)).toBe('The requested resource was not found.')
  })

  it('should format HTTP status 429 from message', () => {
    const error = new Error('429 Too Many Requests')
    expect(formatErrorMessage(error)).toBe('Too many requests. Please wait a moment and try again.')
  })

  it('should format HTTP status 500 from message', () => {
    const error = new Error('500 Internal Server Error')
    expect(formatErrorMessage(error)).toBe('Server error. Please try again later.')
  })

  it('should format HTTP status 502 from message', () => {
    const error = new Error('502 Bad Gateway')
    expect(formatErrorMessage(error)).toBe(
      'Server is temporarily unavailable. Please try again later.'
    )
  })

  it('should format HTTP status 503 from message', () => {
    const error = new Error('503 Service Unavailable')
    expect(formatErrorMessage(error)).toBe('Service unavailable. Please try again later.')
  })

  it('should format HTTP status 504 from message', () => {
    // Note: "504 Gateway Timeout" contains "Timeout" so it would match timeout pattern first
    // Using just "504 Gateway" to test the status code matching
    const error = new Error('504 Gateway')
    expect(formatErrorMessage(error)).toBe('Server took too long to respond. Please try again.')
  })

  it('should detect network error from message', () => {
    const error = new Error('Network error: failed to fetch')
    expect(formatErrorMessage(error)).toBe(
      'Unable to connect. Please check your internet connection.'
    )
  })

  it('should detect timeout from message', () => {
    const error = new Error('Request timeout')
    expect(formatErrorMessage(error)).toBe('Request timed out. Please try again.')
  })

  it('should format Error object', () => {
    const error = new Error('Something went wrong')
    expect(formatErrorMessage(error)).toBe('Something went wrong')
  })

  it('should handle null', () => {
    expect(formatErrorMessage(null)).toBe('An unexpected error occurred. Please try again.')
  })

  it('should handle undefined', () => {
    expect(formatErrorMessage(undefined)).toBe('An unexpected error occurred. Please try again.')
  })

  it('should strip URLs from error messages', () => {
    const error = new Error('Error at https://api.example.com/v1/users')
    const result = formatErrorMessage(error)
    expect(result).not.toContain('https://')
  })

  it('should handle unknown error types', () => {
    const error = { foo: 'bar' }
    expect(formatErrorMessage(error)).toBe('An unexpected error occurred. Please try again.')
  })
})

describe('formatValidationError', () => {
  it('should extract single field error', () => {
    const errorData = {
      errors: {
        email: ['Email is required'],
      },
    }
    expect(formatValidationError(errorData)).toContain('Email')
    expect(formatValidationError(errorData)).toContain('required')
  })

  it('should map snake_case to readable format', () => {
    const errorData = {
      errors: {
        first_name: ['First name is required'],
      },
    }
    expect(formatValidationError(errorData)).toContain('First name')
  })

  it('should use message if no errors object', () => {
    const errorData = {
      message: 'Something went wrong',
    }
    expect(formatValidationError(errorData)).toBe('Something went wrong')
  })

  it('should return generic message if no message or errors', () => {
    const errorData = {}
    expect(formatValidationError(errorData)).toContain('check your input')
  })

  it('should handle empty errors object', () => {
    const errorData = {
      errors: {},
    }
    expect(formatValidationError(errorData)).toContain('check your input')
  })
})
