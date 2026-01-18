'use client'

import { YStack, XStack, Text, Button } from '@my/ui'
import { GradientBackground } from '@my/ui'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { ArrowLeft } from '@tamagui/lucide-icons'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'

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
        {/* Header with back button */}
        <XStack
          px="$4"
          py="$3"
          alignItems="center"
        >
          <Button
            unstyled
            onPress={() => router.back()}
            p="$2"
            hitSlop={12}
            pressStyle={{ opacity: 0.7 }}
          >
            <ArrowLeft
              size={24}
              color="$color"
            />
          </Button>
        </XStack>

        {/* Main content */}
        <YStack
          flex={1}
          px="$4"
          gap="$6"
        >
          {/* Title */}
          <YStack
            pt="$4"
            gap="$2"
          >
            <Text
              fontSize={28}
              fontWeight="bold"
              color="$color"
            >
              Password reset
            </Text>
            <Text
              fontSize="$4"
              color="$colorSubtle"
              lineHeight={24}
            >
              Your password has been successfully reset. Continue to set a new password.
            </Text>
          </YStack>
        </YStack>

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
            pressStyle={{ opacity: 0.9 }}
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
