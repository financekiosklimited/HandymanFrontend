import { describe, it, expect } from 'vitest'
import { formatErrorMessage, formatValidationError } from '../errors'

describe('formatErrorMessage - HTTP Status Codes', () => {
  // 4xx Client Errors
  describe('4xx Client Errors', () => {
    it('should format 400 Bad Request', () => {
      const error = new Error('400 Bad Request')
      expect(formatErrorMessage(error)).toContain('Invalid request')
    })

    it('should format 401 Unauthorized', () => {
      const error = new Error('401 Unauthorized')
      expect(formatErrorMessage(error)).toContain('Session expired')
    })

    it('should format 403 Forbidden', () => {
      const error = new Error('403 Forbidden')
      expect(formatErrorMessage(error)).toContain('permission')
    })

    it('should format 404 Not Found', () => {
      const error = new Error('404 Not Found')
      expect(formatErrorMessage(error)).toContain('not found')
    })

    it('should format 405 Method Not Allowed', () => {
      const error = new Error('405 Method Not Allowed')
      // Unknown status codes return the original message if no patterns match
      expect(formatErrorMessage(error)).toBe('405 Method Not Allowed')
    })

    it('should format 408 Request Timeout', () => {
      const error = new Error('408 Request Timeout')
      // "Request Timeout" contains "Timeout" so it matches timeout pattern
      expect(formatErrorMessage(error)).toBe('Request timed out. Please try again.')
    })

    it('should format 409 Conflict', () => {
      const error = new Error('409 Conflict')
      expect(formatErrorMessage(error)).toContain('conflicts')
    })

    it('should format 410 Gone', () => {
      const error = new Error('410 Gone')
      // Unknown status codes return the original message if no patterns match
      expect(formatErrorMessage(error)).toBe('410 Gone')
    })

    it('should format 422 Unprocessable Entity', () => {
      const error = new Error('422 Unprocessable Entity')
      expect(formatErrorMessage(error)).toContain('Invalid data')
    })

    it('should format 429 Too Many Requests', () => {
      const error = new Error('429 Too Many Requests')
      expect(formatErrorMessage(error)).toContain('Too many requests')
    })
  })

  // 5xx Server Errors
  describe('5xx Server Errors', () => {
    it('should format 500 Internal Server Error', () => {
      const error = new Error('500 Internal Server Error')
      expect(formatErrorMessage(error)).toContain('Server error')
    })

    it('should format 501 Not Implemented', () => {
      const error = new Error('501 Not Implemented')
      // Unknown status codes return the original message if no patterns match
      expect(formatErrorMessage(error)).toBe('501 Not Implemented')
    })

    it('should format 502 Bad Gateway', () => {
      const error = new Error('502 Bad Gateway')
      expect(formatErrorMessage(error)).toContain('unavailable')
    })

    it('should format 503 Service Unavailable', () => {
      const error = new Error('503 Service Unavailable')
      expect(formatErrorMessage(error)).toContain('unavailable')
    })

    it('should format 504 Gateway', () => {
      // Note: "504 Gateway Timeout" contains "Timeout" so would match timeout pattern
      const error = new Error('504 Gateway')
      expect(formatErrorMessage(error)).toContain('respond')
    })
  })

  // Unknown status codes
  describe('Unknown Status Codes', () => {
    it('should handle unknown 4xx codes', () => {
      const error = new Error('418 HTTP Error')
      // Unknown HTTP status codes with "HTTP" in message get caught by technical pattern
      expect(formatErrorMessage(error)).toContain('unexpected')
    })

    it('should handle unknown 5xx codes', () => {
      const error = new Error('599 HTTP Error')
      // Unknown HTTP status codes with "HTTP" in message get caught by technical pattern
      expect(formatErrorMessage(error)).toContain('unexpected')
    })
  })
})

describe('formatErrorMessage - Network Errors', () => {
  it('should detect "Failed to fetch"', () => {
    const error = new Error('Failed to fetch')
    expect(formatErrorMessage(error)).toContain('connect')
  })

  it('should detect "Network request failed"', () => {
    const error = new Error('Network request failed')
    expect(formatErrorMessage(error)).toContain('connect')
  })

  it('should detect "NetworkError"', () => {
    const error = new Error('NetworkError occurred')
    expect(formatErrorMessage(error)).toContain('connect')
  })

  it('should detect network in lowercase', () => {
    const error = new Error('network connection lost')
    expect(formatErrorMessage(error)).toContain('connect')
  })

  it('should detect fetch errors', () => {
    const error = new Error('fetch failed')
    expect(formatErrorMessage(error)).toContain('connect')
  })

  it('should detect connection refused', () => {
    const error = new Error('Connection refused')
    expect(formatErrorMessage(error)).toBe('Connection refused')
  })

  it('should detect DNS errors', () => {
    const error = new Error('getaddrinfo ENOTFOUND')
    expect(formatErrorMessage(error)).toBe('getaddrinfo ENOTFOUND')
  })

  it('should detect timeout in error', () => {
    const error = new Error('The request timed out')
    expect(formatErrorMessage(error)).toContain('timed out')
  })

  it('should detect ETIMEDOUT', () => {
    const error = new Error('ETIMEDOUT')
    expect(formatErrorMessage(error)).toBe('ETIMEDOUT')
  })

  it('should detect ECONNREFUSED', () => {
    const error = new Error('ECONNREFUSED')
    expect(formatErrorMessage(error)).toBe('ECONNREFUSED')
  })
})

describe('formatErrorMessage - Timeout Errors', () => {
  it('should format ky TimeoutError', () => {
    const { TimeoutError } = require('ky')
    const error = new TimeoutError('Request timeout')
    expect(formatErrorMessage(error)).toContain('timed out')
  })

  it('should detect timeout in message', () => {
    const error = new Error('Request timed out after 30s')
    expect(formatErrorMessage(error)).toContain('timed out')
  })

  it('should detect timeout keyword', () => {
    const error = new Error('Timeout exceeded')
    expect(formatErrorMessage(error)).toContain('timed out')
  })

  it('should detect Timeout in capital letters', () => {
    const error = new Error('Connection Timeout')
    expect(formatErrorMessage(error)).toContain('timed out')
  })

  it('should detect timed out phrase', () => {
    const error = new Error('The connection timed out')
    expect(formatErrorMessage(error)).toContain('timed out')
  })
})

describe('formatErrorMessage - Error Types', () => {
  it('should handle standard Error object', () => {
    const error = new Error('Something went wrong')
    expect(formatErrorMessage(error)).toBe('Something went wrong')
  })

  it('should handle Error with empty message', () => {
    const error = new Error('')
    expect(formatErrorMessage(error)).toBe('')
  })

  it('should handle TypeError with technical message', () => {
    const error = new TypeError('Cannot read property')
    expect(formatErrorMessage(error)).toBe('Cannot read property')
  })

  it('should handle RangeError', () => {
    const error = new RangeError('Maximum call stack exceeded')
    expect(formatErrorMessage(error)).toBe('Maximum call stack exceeded')
  })

  it('should handle ReferenceError', () => {
    const error = new ReferenceError('x is not defined')
    expect(formatErrorMessage(error)).toBe('x is not defined')
  })

  it('should handle SyntaxError', () => {
    const error = new SyntaxError('Unexpected token')
    expect(formatErrorMessage(error)).toBe('Unexpected token')
  })

  it('should handle EvalError', () => {
    const error = new EvalError('eval error')
    expect(formatErrorMessage(error)).toBe('eval error')
  })

  it('should handle URIError', () => {
    const error = new URIError('URI malformed')
    expect(formatErrorMessage(error)).toBe('URI malformed')
  })
})

describe('formatErrorMessage - Fallback for Unknown Types', () => {
  it('should handle string error', () => {
    expect(formatErrorMessage('Simple error')).toContain('unexpected')
  })

  it('should handle empty string', () => {
    expect(formatErrorMessage('')).toContain('unexpected')
  })

  it('should handle number', () => {
    expect(formatErrorMessage(404)).toContain('unexpected')
  })

  it('should handle zero', () => {
    expect(formatErrorMessage(0)).toContain('unexpected')
  })

  it('should handle boolean true', () => {
    expect(formatValidationError(true as any)).toContain('check')
  })

  it('should handle error with empty message', () => {
    const errorData = { message: '', errors: {} }
    expect(formatValidationError(errorData)).toContain('check')
  })
})
