import { describe, it, expect } from 'vitest'

describe('API Client', () => {
  it('should import api client', async () => {
    const api = await import('@my/api')
    expect(api).toBeDefined()
  })
})

describe('Auth Store', () => {
  it('should import auth store functions', async () => {
    const { getAuthStore, useAuthStore, useIsAuthenticated, useActiveRole, useAccessToken } =
      await import('@my/api')
    expect(getAuthStore).toBeDefined()
    expect(useAuthStore).toBeDefined()
    expect(useIsAuthenticated).toBeDefined()
    expect(useActiveRole).toBeDefined()
    expect(useAccessToken).toBeDefined()
  })
})

describe('Error Handling', () => {
  it('should import error formatting functions', async () => {
    const { formatErrorMessage, formatValidationError } = await import('@my/api')
    expect(formatErrorMessage).toBeDefined()
    expect(formatValidationError).toBeDefined()
  })
})

describe('API Types', () => {
  it('should import auth types', async () => {
    const authTypes = await import('@my/api/types/auth')
    expect(authTypes).toBeDefined()
  })

  it('should import common types', async () => {
    const commonTypes = await import('@my/api/types/common')
    expect(commonTypes).toBeDefined()
  })

  it('should import guest types', async () => {
    const guestTypes = await import('@my/api/types/guest')
    expect(guestTypes).toBeDefined()
  })

  it('should import homeowner types', async () => {
    const homeownerTypes = await import('@my/api/types/homeowner')
    expect(homeownerTypes).toBeDefined()
  })

  it('should import handyman types', async () => {
    const handymanTypes = await import('@my/api/types/handyman')
    expect(handymanTypes).toBeDefined()
  })

  it('should import chat types', async () => {
    const chatTypes = await import('@my/api/types/chat')
    expect(chatTypes).toBeDefined()
  })
})

describe('Time Utilities', () => {
  it('should import time utility functions', async () => {
    const time = await import('@my/api/utils/time')
    expect(time.getTimeRemaining).toBeDefined()
    expect(time.formatTimeRemaining).toBeDefined()
    expect(time.getTimeUrgency).toBeDefined()
  })
})
