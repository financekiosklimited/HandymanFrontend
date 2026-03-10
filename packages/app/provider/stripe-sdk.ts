import { Platform } from 'react-native'
import type {
  InitPaymentSheetResult,
  InitStripeParams,
  PaymentSheet,
  PaymentSheetError,
  PresentPaymentSheetResult,
  StripeError,
} from '@stripe/stripe-react-native'

type StripeModule = typeof import('@stripe/stripe-react-native')

export const STRIPE_UNAVAILABLE_MESSAGE =
  'Payments are unavailable in this build. Rebuild the development app to include Stripe.'

let cachedStripeModule: StripeModule | null | undefined
let hasLoggedStripeLoadFailure = false

function createUnavailableStripeError(
  message = STRIPE_UNAVAILABLE_MESSAGE
): StripeError<PaymentSheetError> {
  return {
    code: 'Failed' as PaymentSheetError,
    message,
  }
}

function logStripeLoadFailure(error: unknown) {
  if (hasLoggedStripeLoadFailure) {
    return
  }

  hasLoggedStripeLoadFailure = true
  console.warn(
    'Stripe native module is unavailable. Rebuild the development app to include it.',
    error
  )
}

function getStripeModule(): StripeModule | null {
  if (Platform.OS === 'web') {
    return null
  }

  if (cachedStripeModule !== undefined) {
    return cachedStripeModule
  }

  try {
    const stripeModule = require('@stripe/stripe-react-native') as StripeModule
    cachedStripeModule = stripeModule
  } catch (error) {
    cachedStripeModule = null
    logStripeLoadFailure(error)
  }

  return cachedStripeModule
}

export function isStripeAvailable() {
  return getStripeModule() !== null
}

export async function initializeStripe(params: InitStripeParams) {
  if (!params.publishableKey) {
    return
  }

  const stripeModule = getStripeModule()

  if (!stripeModule) {
    return
  }

  await stripeModule.initStripe(params)
}

export async function initializeStripePaymentSheet(
  params: PaymentSheet.SetupParams
): Promise<InitPaymentSheetResult> {
  const stripeModule = getStripeModule()

  if (!stripeModule) {
    return {
      error: createUnavailableStripeError(),
    }
  }

  return stripeModule.initPaymentSheet(params)
}

export async function presentStripePaymentSheet(
  options?: PaymentSheet.PresentOptions
): Promise<PresentPaymentSheetResult> {
  const stripeModule = getStripeModule()

  if (!stripeModule) {
    return {
      error: createUnavailableStripeError(),
    }
  }

  return stripeModule.presentPaymentSheet(options)
}
