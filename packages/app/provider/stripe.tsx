'use client'

import { useEffect, type ReactNode } from 'react'
import { initializeStripe } from './stripe-sdk'

const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''

export function StripeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!publishableKey) {
      return
    }

    void initializeStripe({
      publishableKey,
      merchantIdentifier: 'merchant.com.handymankiosk.app',
    })
  }, [])

  return <>{children}</>
}
