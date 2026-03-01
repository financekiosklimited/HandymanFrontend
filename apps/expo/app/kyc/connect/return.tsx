'use client'

import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { YStack, Text, Spinner } from '@my/ui'
import { GradientBackground } from '@my/ui'
import { useQueryClient } from '@tanstack/react-query'

/**
 * Deep link handler for Stripe Connect onboarding return.
 * Route: handymankiosk://kyc/connect/return
 *
 * The user completed or exited the Stripe Connect onboarding flow.
 * Invalidate KYC queries and redirect to the KYC status screen.
 */
export default function ConnectReturnPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    // Invalidate KYC status to fetch fresh data
    queryClient.invalidateQueries({ queryKey: ['handyman', 'kyc'] })

    // Small delay to let the invalidation propagate, then navigate
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
