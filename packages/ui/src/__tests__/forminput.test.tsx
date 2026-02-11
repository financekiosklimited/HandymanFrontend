import { describe, it, expect } from 'vitest'

describe('FormInput Components', () => {
  it('should import FormInput component', async () => {
    const { FormInput } = await import('../FormInput')
    expect(FormInput).toBeDefined()
    expect(typeof FormInput).toBe('object') // forwardRef returns an object
  })

  it('should import FormTextArea component', async () => {
    const { FormTextArea } = await import('../FormInput')
    expect(FormTextArea).toBeDefined()
    expect(typeof FormTextArea).toBe('function')
  })

  it('should import FormSelect component', async () => {
    const { FormSelect } = await import('../FormInput')
    expect(FormSelect).toBeDefined()
    expect(typeof FormSelect).toBe('function')
  })
})
