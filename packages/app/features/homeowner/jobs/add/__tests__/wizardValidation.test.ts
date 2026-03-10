import { describe, expect, test } from 'vitest'
import {
  hasFormErrors,
  type AddJobFormData,
  validateAdministrativeStage,
  validateDetailsStage,
} from '../wizardValidation'

function createForm(overrides: Partial<AddJobFormData> = {}): AddJobFormData {
  return {
    title: 'Fix sink leak',
    description: 'Kitchen sink is leaking under the cabinet',
    estimated_budget: '150',
    category_id: 'cat-1',
    city_id: 'city-1',
    address: '123 Main St',
    postal_code: 'A1A 1A1',
    tasks: [],
    attachments: [],
    ...overrides,
  }
}

describe('add-job wizard validation', () => {
  test('valid administrative data has no errors', () => {
    const errors = validateAdministrativeStage(createForm())
    expect(hasFormErrors(errors)).toBe(false)
  })

  test('administrative stage requires title, city, and address', () => {
    const errors = validateAdministrativeStage(
      createForm({
        title: ' ',
        city_id: '',
        address: '',
      })
    )

    expect(errors.title).toEqual(['Job title is required'])
    expect(errors.city_id).toEqual(['Please select a city'])
    expect(errors.address).toEqual(['Address is required'])
  })

  test('valid details data has no errors', () => {
    const errors = validateDetailsStage(createForm())
    expect(hasFormErrors(errors)).toBe(false)
  })

  test('details stage validates required fields and numeric budget', () => {
    const requiredErrors = validateDetailsStage(
      createForm({
        estimated_budget: '',
        category_id: '',
        description: ' ',
      })
    )

    expect(requiredErrors.estimated_budget).toEqual(['Estimated budget is required'])
    expect(requiredErrors.category_id).toEqual(['Please select a category'])
    expect(requiredErrors.description).toEqual(['Description is required'])

    const numericError = validateDetailsStage(createForm({ estimated_budget: 'abc' }))
    expect(numericError.estimated_budget).toEqual(['Please enter a valid number'])
  })
})
