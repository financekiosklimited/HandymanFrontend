import { describe, it, expect } from 'vitest'
import { YStack, Text } from 'tamagui'

describe('Tamagui Test', () => {
  it('should import tamagui components', () => {
    expect(YStack).toBeDefined()
    expect(Text).toBeDefined()
  })
})
