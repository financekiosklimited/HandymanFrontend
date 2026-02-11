import { describe, it, expect, vi } from 'vitest'
import { formatErrorMessage, formatValidationError } from '../errors'

// Mock ky module
vi.mock('ky', () => ({
  HTTPError: class HTTPError extends Error {
    response: { status: number }
    constructor(response: { status: number }) {
      super('HTTP Error')
      this.response = response
    }
  },
  TimeoutError: class TimeoutError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'TimeoutError'
    }
  },
}))

import { HTTPError, TimeoutError } from 'ky'

describe('formatErrorMessage', () => {
  it('should format TimeoutError', () => {
    const error = new TimeoutError('Request timed out')
    expect(formatErrorMessage(error)).toBe('Request timed out. Please try again.')
  })

  it('should format HTTPError 401', () => {
    const error = new HTTPError({ status: 401 } as any)
    expect(formatErrorMessage(error)).toBe('Session expired. Please log in again.')
  })

  it('should format HTTPError 403', () => {
    const error = new HTTPError({ status: 403 } as any)
    expect(formatErrorMessage(error)).toBe("You don't have permission to perform this action.")
  })

  it('should format HTTPError 404', () => {
    const error = new HTTPError({ status: 404 } as any)
    expect(formatErrorMessage(error)).toBe('The requested resource was not found.')
  })

  it('should format HTTPError 429', () => {
    const error = new HTTPError({ status: 429 } as any)
    expect(formatErrorMessage(error)).toBe('Too many requests. Please wait a moment and try again.')
  })

  it('should format HTTPError 500', () => {
    const error = new HTTPError({ status: 500 } as any)
    expect(formatErrorMessage(error)).toBe('Server error. Please try again later.')
  })

  it('should format HTTPError 502', () => {
    const error = new HTTPError({ status: 502 } as any)
    expect(formatErrorMessage(error)).toBe(
      'Server is temporarily unavailable. Please try again later.'
    )
  })

  it('should format HTTPError 503', () => {
    const error = new HTTPError({ status: 503 } as any)
    expect(formatErrorMessage(error)).toBe('Service unavailable. Please try again later.')
  })

  it('should format HTTPError 504', () => {
    const error = new HTTPError({ status: 504 } as any)
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
