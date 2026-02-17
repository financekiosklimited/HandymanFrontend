'use client'

import { YStack, Text, Button, PressPresets } from '@my/ui'
import { GradientBackground, PageHeader } from '@my/ui'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { PAGE_DESCRIPTIONS } from 'app/constants/page-descriptions'

export function ForgotPasswordVerifiedScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const { resetToken } = useLocalSearchParams<{ resetToken: string }>()

  const handleContinue = () => {
    router.push({
      pathname: '/auth/forgot-password/reset',
      params: { resetToken },
    })
  }

  return (
    <GradientBackground>
      <YStack
        flex={1}
        pt={insets.top}
        pb={insets.bottom}
      >
        <PageHeader
          title="Password reset"
          description={PAGE_DESCRIPTIONS['forgot-password']}
        />

        {/* Main content */}
        <YStack
          flex={1}
          px="$4"
          gap="$6"
        />

        {/* Bottom button */}
        <YStack
          px="$4"
          pb="$3xl"
          pt="$2xl"
        >
          <Button
            bg="$primary"
            borderRadius="$4"
            py="$3"
            px="$4"
            minHeight={54}
            onPress={handleContinue}
            {...PressPresets.primary}
          >
            <Text
              color="white"
              fontSize="$4"
              fontWeight="600"
            >
              Confirm
            </Text>
          </Button>
        </YStack>
      </YStack>
    </GradientBackground>
  )
}
