import type { LocalAttachment } from '@my/api'

export type WizardStage = 'administrative' | 'details'

export interface JobTask {
  id: string
  title: string
}

export interface AddJobFormData {
  title: string
  description: string
  estimated_budget: string
  category_id: string
  city_id: string
  address: string
  postal_code: string
  tasks: JobTask[]
  attachments: LocalAttachment[]
}

export interface FormErrors {
  [key: string]:
    | string[]
    | { [index: string]: string[] | { non_field_errors?: string[] } }
    | undefined
}

export function validateAdministrativeStage(formData: AddJobFormData): FormErrors {
  const clientErrors: FormErrors = {}

  if (!formData.title.trim()) {
    clientErrors.title = ['Job title is required']
  }

  if (!formData.city_id) {
    clientErrors.city_id = ['Please select a city']
  }

  if (!formData.address.trim()) {
    clientErrors.address = ['Address is required']
  }

  return clientErrors
}

export function validateDetailsStage(formData: AddJobFormData): FormErrors {
  const clientErrors: FormErrors = {}

  if (!formData.estimated_budget.trim()) {
    clientErrors.estimated_budget = ['Estimated budget is required']
  } else if (Number.isNaN(Number.parseFloat(formData.estimated_budget))) {
    clientErrors.estimated_budget = ['Please enter a valid number']
  }

  if (!formData.category_id) {
    clientErrors.category_id = ['Please select a category']
  }

  if (!formData.description.trim()) {
    clientErrors.description = ['Description is required']
  }

  return clientErrors
}

export function hasFormErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0
}
