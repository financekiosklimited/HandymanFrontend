'use client'

import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { YStack, Text, Spinner } from '@my/ui'
import { GradientBackground } from '@my/ui'
import { useQueryClient } from '@tanstack/react-query'

/**
 * Deep link handler for Stripe Connect onboarding refresh.
 * Route: handymankiosk://kyc/connect/refresh
 *
 * The Stripe onboarding link expired or the user needs a new link.
 * Invalidate KYC queries and redirect to KYC status screen where
 * they can generate a fresh onboarding link.
 */
export default function ConnectRefreshPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    // Invalidate KYC status to fetch fresh data
    queryClient.invalidateQueries({ queryKey: ['handyman', 'kyc'] })

    // Navigate to KYC status screen
    const timeout = setTimeout(() => {
      router.replace('/(handyman)/kyc')
    }, 500)

    return () => clearTimeout(timeout)
  }, [queryClient, router])

  return (
    <GradientBackground>
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        gap="$3"
      >
        <Spinner
          size="large"
          color="$primary"
        />
        <Text
          fontSize={15}
          color="$placeholderColor"
        >
          Returning to verification...
        </Text>
      </YStack>
    </GradientBackground>
  )
}
