import { describe, it, expect, vi, beforeEach } from 'vitest'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Mock AsyncStorage with advanced behavior simulation
const mockStorage = new Map<string, string>()
let mockQuotaExceeded = false
let mockCorruption = false
let mockFailureRate = 0

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => {
      if (Math.random() < mockFailureRate) {
        throw new Error('Random storage failure')
      }
      if (mockCorruption && key.includes('corrupt')) {
        return '{invalid json'
      }
      // Check if key exists in storage (including empty string values)
      if (mockStorage.has(key)) {
        return mockStorage.get(key)!
      }
      return null
    }),
    setItem: vi.fn(async (key: string, value: string) => {
      if (mockQuotaExceeded) {
        throw new Error('QuotaExceededError')
      }
      if (Math.random() < mockFailureRate) {
        throw new Error('Random storage failure')
      }
      mockStorage.set(key, value)
    }),
    removeItem: vi.fn(async (key: string) => {
      if (Math.random() < mockFailureRate) {
        throw new Error('Random storage failure')
      }
      mockStorage.delete(key)
    }),
    getAllKeys: vi.fn(async () => {
      if (Math.random() < mockFailureRate) {
        throw new Error('Random storage failure')
      }
      return Array.from(mockStorage.keys())
    }),
    multiRemove: vi.fn(async (keys: string[]) => {
      if (Math.random() < mockFailureRate) {
        throw new Error('Random storage failure')
      }
      keys.forEach((key) => mockStorage.delete(key))
    }),
    multiSet: vi.fn(async (entries: [string, string][]) => {
      if (mockQuotaExceeded) {
        throw new Error('QuotaExceededError')
      }
      entries.forEach(([key, value]) => mockStorage.set(key, value))
    }),
    multiGet: vi.fn(async (keys: string[]) => {
      if (Math.random() < mockFailureRate) {
        throw new Error('Random storage failure')
      }
      return keys.map((key) => [key, mockStorage.get(key) || null])
    }),
    clear: vi.fn(async () => {
      mockStorage.clear()
    }),
  },
}))

describe('AsyncStorage - Concurrent Operations', () => {
  beforeEach(() => {
    mockStorage.clear()
    mockQuotaExceeded = false
    mockCorruption = false
    mockFailureRate = 0
    vi.clearAllMocks()
  })

  it('should handle multiple simultaneous reads', async () => {
    mockStorage.set('key1', 'value1')
    mockStorage.set('key2', 'value2')
    mockStorage.set('key3', 'value3')

    const results = await Promise.all([
      AsyncStorage.getItem('key1'),
      AsyncStorage.getItem('key2'),
      AsyncStorage.getItem('key3'),
    ])

    expect(results).toEqual(['value1', 'value2', 'value3'])
  })

  it('should handle multiple simultaneous writes', async () => {
    await Promise.all([
      AsyncStorage.setItem('key1', 'value1'),
      AsyncStorage.setItem('key2', 'value2'),
      AsyncStorage.setItem('key3', 'value3'),
    ])

    expect(mockStorage.get('key1')).toBe('value1')
    expect(mockStorage.get('key2')).toBe('value2')
    expect(mockStorage.get('key3')).toBe('value3')
  })

  it('should handle read while writing', async () => {
    mockStorage.set('shared', 'initial')

    const writePromise = AsyncStorage.setItem('shared', 'updated')
    const readPromise = AsyncStorage.getItem('shared')

    await Promise.all([writePromise, readPromise])

    // Storage should be in valid state after concurrent operations
    const finalValue = await AsyncStorage.getItem('shared')
    expect(['initial', 'updated']).toContain(finalValue)
  })

  it('should handle rapid successive operations', async () => {
    for (let i = 0; i < 100; i++) {
      await AsyncStorage.setItem(`key_${i}`, `value_${i}`)
    }

    const allKeys = await AsyncStorage.getAllKeys()
    expect(allKeys.length).toBe(100)
  })

  it('should handle mixed read/write operations', async () => {
    const operations = []

    for (let i = 0; i < 50; i++) {
      if (i % 2 === 0) {
        operations.push(AsyncStorage.setItem(`key_${i}`, `value_${i}`))
      } else {
        operations.push(AsyncStorage.getItem(`key_${i - 1}`))
      }
    }

    await Promise.all(operations)

    // Verify storage is consistent
    const keys = await AsyncStorage.getAllKeys()
    expect(keys.length).toBeGreaterThan(0)
  })

  it('should handle multiSet correctly', async () => {
    const entries: [string, string][] = [
      ['key1', 'value1'],
      ['key2', 'value2'],
      ['key3', 'value3'],
    ]

    await AsyncStorage.multiSet(entries)

    expect(mockStorage.get('key1')).toBe('value1')
    expect(mockStorage.get('key2')).toBe('value2')
    expect(mockStorage.get('key3')).toBe('value3')
  })

  it('should handle multiGet correctly', async () => {
    mockStorage.set('key1', 'value1')
    mockStorage.set('key2', 'value2')
    mockStorage.set('key3', 'value3')

    const results = await AsyncStorage.multiGet(['key1', 'key2', 'key3', 'missing'])

    expect(results).toEqual([
      ['key1', 'value1'],
      ['key2', 'value2'],
      ['key3', 'value3'],
      ['missing', null],
    ])
  })
})

describe('AsyncStorage - Error Scenarios', () => {
  beforeEach(() => {
    mockStorage.clear()
    mockQuotaExceeded = false
    mockCorruption = false
    mockFailureRate = 0
    vi.clearAllMocks()
  })

  it('should handle quota exceeded error', async () => {
    mockQuotaExceeded = true

    await expect(AsyncStorage.setItem('key', 'value')).rejects.toThrow('QuotaExceededError')
  })

  it('should handle storage failure on read', async () => {
    mockFailureRate = 1

    await expect(AsyncStorage.getItem('key')).rejects.toThrow('Random storage failure')
  })

  it('should handle storage failure on write', async () => {
    mockFailureRate = 1

    await expect(AsyncStorage.setItem('key', 'value')).rejects.toThrow('Random storage failure')
  })

  it('should handle intermittent failures', async () => {
    mockFailureRate = 0.3

    let successCount = 0
    let failureCount = 0

    for (let i = 0; i < 10; i++) {
      try {
        await AsyncStorage.setItem(`key_${i}`, `value_${i}`)
        successCount++
      } catch {
        failureCount++
      }
    }

    expect(successCount + failureCount).toBe(10)
    expect(failureCount).toBeGreaterThan(0)
  })

  it('should handle corrupted data gracefully', async () => {
    mockCorruption = true
    mockStorage.set('corrupt_key', '{invalid json')

    const value = await AsyncStorage.getItem('corrupt_key')
    expect(value).toBe('{invalid json')
  })

  it('should recover after temporary failure', async () => {
    mockFailureRate = 1
    await expect(AsyncStorage.setItem('key', 'value')).rejects.toThrow()

    mockFailureRate = 0
    await expect(AsyncStorage.setItem('key', 'value')).resolves.not.toThrow()

    const value = await AsyncStorage.getItem('key')
    expect(value).toBe('value')
  })

  it('should handle clear operation', async () => {
    await AsyncStorage.setItem('key1', 'value1')
    await AsyncStorage.setItem('key2', 'value2')

    await AsyncStorage.clear()

    const keys = await AsyncStorage.getAllKeys()
    expect(keys.length).toBe(0)
  })
})

describe('AsyncStorage - Data Integrity', () => {
  beforeEach(() => {
    mockStorage.clear()
    vi.clearAllMocks()
  })

  it('should handle very large values', async () => {
    const largeValue = 'x'.repeat(100000) // 100KB string

    await AsyncStorage.setItem('large_key', largeValue)
    const retrieved = await AsyncStorage.getItem('large_key')

    expect(retrieved).toBe(largeValue)
  })

  it('should handle special characters in keys', async () => {
    const specialKeys = [
      'key with spaces',
      'key\nwith\nnewlines',
      'key\twith\ttabs',
      'key@#$%^&*()',
      'key😀emoji',
      'key🚀unicode',
    ]

    for (const key of specialKeys) {
      await AsyncStorage.setItem(key, `value_for_${key}`)
      const retrieved = await AsyncStorage.getItem(key)
      expect(retrieved).toBe(`value_for_${key}`)
    }
  })

  it('should handle unicode characters in values', async () => {
    const unicodeValues = [
      'Hello 世界',
      'مرحبا بالعالم',
      'Здравствуй мир',
      '🎉🚀💯🔥',
      '日本語テキスト',
    ]

    for (let i = 0; i < unicodeValues.length; i++) {
      const value = unicodeValues[i]!
      await AsyncStorage.setItem(`unicode_${i}`, value)
      const retrieved = await AsyncStorage.getItem(`unicode_${i}`)
      expect(retrieved).toBe(value)
    }
  })

  it('should handle empty string values', async () => {
    await AsyncStorage.setItem('empty_key', '')
    const retrieved = await AsyncStorage.getItem('empty_key')

    // Empty string should be stored and retrieved correctly
    expect(retrieved).toBe('')
  })

  it('should distinguish between empty string and null', async () => {
    await AsyncStorage.setItem('empty', '')

    const emptyValue = await AsyncStorage.getItem('empty')
    const nullValue = await AsyncStorage.getItem('nonexistent')

    expect(emptyValue).toBe('')
    expect(nullValue).toBeNull()
  })

  it('should handle boolean-like strings', async () => {
    await AsyncStorage.setItem('bool_true', 'true')
    await AsyncStorage.setItem('bool_false', 'false')

    expect(await AsyncStorage.getItem('bool_true')).toBe('true')
    expect(await AsyncStorage.getItem('bool_false')).toBe('false')
  })

  it('should handle JSON stringified objects', async () => {
    const complexObject = {
      user: {
        id: 123,
        name: 'John Doe',
        settings: {
          theme: 'dark',
          notifications: true,
        },
      },
      jobs: [1, 2, 3],
    }

    const jsonString = JSON.stringify(complexObject)
    await AsyncStorage.setItem('complex_data', jsonString)

    const retrieved = await AsyncStorage.getItem('complex_data')
    const parsed = JSON.parse(retrieved!)

    expect(parsed).toEqual(complexObject)
  })

  it('should handle many keys', async () => {
    const keyCount = 500

    for (let i = 0; i < keyCount; i++) {
      await AsyncStorage.setItem(`job_${i}`, `value_${i}`)
    }

    const allKeys = await AsyncStorage.getAllKeys()
    expect(allKeys.length).toBe(keyCount)
  })
})

describe('AsyncStorage - Migration & Edge Cases', () => {
  beforeEach(() => {
    mockStorage.clear()
    vi.clearAllMocks()
  })

  it('should handle missing keys gracefully', async () => {
    const value = await AsyncStorage.getItem('nonexistent_key')
    expect(value).toBeNull()
  })

  it('should handle overwriting existing keys', async () => {
    await AsyncStorage.setItem('version', '1.0')
    await AsyncStorage.setItem('version', '2.0')
    await AsyncStorage.setItem('version', '3.0')

    const value = await AsyncStorage.getItem('version')
    expect(value).toBe('3.0')
  })

  it('should handle key deletion', async () => {
    await AsyncStorage.setItem('temp_key', 'temp_value')
    await AsyncStorage.removeItem('temp_key')

    const value = await AsyncStorage.getItem('temp_key')
    expect(value).toBeNull()
  })

  it('should handle multiRemove correctly', async () => {
    await AsyncStorage.setItem('key1', 'value1')
    await AsyncStorage.setItem('key2', 'value2')
    await AsyncStorage.setItem('key3', 'value3')

    await AsyncStorage.multiRemove(['key1', 'key2'])

    expect(await AsyncStorage.getItem('key1')).toBeNull()
    expect(await AsyncStorage.getItem('key2')).toBeNull()
    expect(await AsyncStorage.getItem('key3')).toBe('value3')
  })

  it('should handle setting same key multiple times rapidly', async () => {
    const promises = []
    for (let i = 0; i < 50; i++) {
      promises.push(AsyncStorage.setItem('rapid_key', `value_${i}`))
    }

    await Promise.all(promises)

    const finalValue = await AsyncStorage.getItem('rapid_key')
    expect(finalValue).toMatch(/^value_\d+$/)
  })

  it('should handle null character in strings', async () => {
    const valueWithNull = 'hello\0world'

    await AsyncStorage.setItem('null_test', valueWithNull)
    const retrieved = await AsyncStorage.getItem('null_test')

    expect(retrieved).toBe(valueWithNull)
  })

  it('should handle very long keys', async () => {
    const longKey = 'a'.repeat(500)

    await AsyncStorage.setItem(longKey, 'value')
    const retrieved = await AsyncStorage.getItem(longKey)

    expect(retrieved).toBe('value')
  })
})

describe('AsyncStorage - Real-world Scenarios', () => {
  beforeEach(() => {
    mockStorage.clear()
    vi.clearAllMocks()
  })

  it('should handle token storage and retrieval', async () => {
    const authToken = {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...',
      expiresAt: Date.now() + 3600000,
    }

    await AsyncStorage.setItem('auth_tokens', JSON.stringify(authToken))
    const retrieved = await AsyncStorage.getItem('auth_tokens')
    const parsed = JSON.parse(retrieved!)

    expect(parsed.accessToken).toBe(authToken.accessToken)
    expect(parsed.refreshToken).toBe(authToken.refreshToken)
    expect(parsed.expiresAt).toBe(authToken.expiresAt)
  })

  it('should handle user preferences persistence', async () => {
    const preferences = {
      theme: 'dark',
      language: 'en',
      notifications: true,
      fontSize: 'medium',
    }

    await AsyncStorage.setItem('user_preferences', JSON.stringify(preferences))
    const retrieved = await AsyncStorage.getItem('user_preferences')

    expect(JSON.parse(retrieved!)).toEqual(preferences)
  })

  it('should handle onboarding state tracking', async () => {
    const onboardingState = {
      welcomeSeen: true,
      createJobSeen: false,
      applicationsSeen: true,
      directOfferSeen: false,
    }

    await AsyncStorage.setItem('onboarding_state', JSON.stringify(onboardingState))

    const partialUpdate = { createJobSeen: true }
    const current = JSON.parse((await AsyncStorage.getItem('onboarding_state'))!)
    await AsyncStorage.setItem('onboarding_state', JSON.stringify({ ...current, ...partialUpdate }))

    const final = JSON.parse((await AsyncStorage.getItem('onboarding_state'))!)
    expect(final.createJobSeen).toBe(true)
    expect(final.welcomeSeen).toBe(true)
  })

  it('should handle cache expiration simulation', async () => {
    const cacheKey = 'api_cache_jobs'
    const cacheData = {
      data: [{ id: 1, title: 'Job 1' }],
      timestamp: Date.now(),
    }

    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData))

    // Simulate reading cache and checking expiration
    const cached = JSON.parse((await AsyncStorage.getItem(cacheKey))!)
    const isExpired = Date.now() - cached.timestamp > 300000 // 5 minutes

    expect(isExpired).toBe(false)
    expect(cached.data).toHaveLength(1)
  })

  it('should handle notification tracking for many jobs', async () => {
    const jobCount = 100

    // Simulate marking notifications as shown for many jobs
    for (let i = 0; i < jobCount; i++) {
      await AsyncStorage.setItem(`notification_shown_job_${i}`, 'true')
    }

    const allKeys = await AsyncStorage.getAllKeys()
    const notificationKeys = allKeys.filter((k: string) => k.startsWith('notification_shown_job_'))

    expect(notificationKeys.length).toBe(jobCount)
  })

  it('should handle atomic update simulation', async () => {
    // Simulate reading, modifying, and writing back atomically
    const initialData = { counter: 0, lastUpdated: Date.now() }
    await AsyncStorage.setItem('atomic_data', JSON.stringify(initialData))

    // Read
    const data = JSON.parse((await AsyncStorage.getItem('atomic_data'))!)

    // Modify
    data.counter += 1
    data.lastUpdated = Date.now()

    // Write back
    await AsyncStorage.setItem('atomic_data', JSON.stringify(data))

    // Verify
    const final = JSON.parse((await AsyncStorage.getItem('atomic_data'))!)
    expect(final.counter).toBe(1)
  })
})
