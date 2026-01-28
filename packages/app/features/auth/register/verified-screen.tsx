'use client'

import { YStack, XStack, Text, Button } from '@my/ui'
import { GradientBackground } from '@my/ui'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@my/api'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'

export function RegisterVerifiedScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const activeRole = useAuthStore((state) => state.activeRole)

  const handleContinue = () => {
    // Step 3: Redirect based on role
    if (activeRole === 'handyman') {
      router.replace('/(handyman)/')
    } else {
      router.replace('/(homeowner)/')
    }
  }

  return (
    <GradientBackground>
      <YStack
        flex={1}
        pt={insets.top}
        pb={insets.bottom}
      >
        {/* Main content */}
        <YStack
          flex={1}
          px="$4"
          gap="$6"
          justifyContent="center"
          alignItems="center"
        >
          {/* Title */}
          <YStack
            gap="$2"
            alignItems="center"
          >
            <Text
              fontSize={32}
              fontWeight="bold"
              color="$color"
              textAlign="center"
            >
              Email verified
            </Text>
            <Text
              fontSize="$4"
              color="$colorSubtle"
              lineHeight={24}
              textAlign="center"
            >
              Your email has been successfully verified. You can now start exploring HandymanKiosk.
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
              Continue
            </Text>
          </Button>
        </YStack>
      </YStack>
    </GradientBackground>
  )
}
