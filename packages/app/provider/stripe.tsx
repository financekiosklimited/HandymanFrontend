'use client'

import type { ReactNode } from 'react'
import { StripeProvider as NativeStripeProvider } from '@stripe/stripe-react-native'

const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''

export function StripeProvider({ children }: { children: ReactNode }) {
  if (!publishableKey) {
    // Stripe not configured — render children without Stripe wrapper
    return <>{children}</>
  }

  return (
    <NativeStripeProvider
      publishableKey={publishableKey}
      merchantIdentifier="merchant.com.handymankiosk.app"
    >
      {children}
    </NativeStripeProvider>
  )
}
