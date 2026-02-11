import { describe, it, expect } from 'vitest'

describe('FormInput Import Test', () => {
  it('should import FormInput component', async () => {
    const { FormInput } = await import('../FormInput')
    expect(FormInput).toBeDefined()
  })
})
