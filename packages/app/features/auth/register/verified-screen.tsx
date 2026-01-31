'use client'

import { YStack, Text, Button } from '@my/ui'
import { GradientBackground, PageHeader } from '@my/ui'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@my/api'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { PAGE_DESCRIPTIONS } from 'app/constants/page-descriptions'

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
        <PageHeader
          title="Email verified"
          description={PAGE_DESCRIPTIONS['register']}
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
