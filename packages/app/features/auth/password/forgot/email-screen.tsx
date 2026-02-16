'use client'

import { useState } from 'react'
import { YStack, XStack, Text, Button, Input, Spinner, PressPresets } from '@my/ui'
import { GradientBackground, PageHeader } from '@my/ui'
import { useForgotPassword, useAuthStore, formatErrorMessage } from '@my/api'
import { useRouter } from 'expo-router'
import { PAGE_DESCRIPTIONS } from 'app/constants/page-descriptions'
import { HTTPError, TimeoutError } from 'ky'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'

/**
 * Transform API error into human-readable message
 */
async function getHumanReadableError(error: unknown): Promise<string> {
  if (error instanceof TimeoutError) {
    return 'Request timed out. Please try again.'
  }

  if (error instanceof HTTPError) {
    try {
      const errorData = (await error.response.json()) as { message?: string; detail?: string }
      if (errorData?.message) return errorData.message
      if (errorData?.detail) return errorData.detail
    } catch {
      // Continue to status code handling
    }

    switch (error.response.status) {
      case 400:
        return 'Please enter a valid email address.'
      case 429:
        return 'Too many attempts. Please wait before trying again.'
      default:
        return 'Something went wrong. Please try again.'
    }
  }

  return formatErrorMessage(error)
}

export function ForgotPasswordEmailScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const setEmail = useAuthStore((state) => state.setEmail)

  const [email, setEmailInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const forgotPasswordMutation = useForgotPassword()

  const handleSendRequest = async () => {
    // Client-side validation
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    setError(null)

    try {
      await forgotPasswordMutation.mutateAsync({ email: email.trim() })
      // Store email for OTP screen
      setEmail(email.trim())
      // Navigate to OTP screen
      router.push('/auth/forgot-password/otp')
    } catch (err) {
      const errorMessage = await getHumanReadableError(err)
      setError(errorMessage)
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
          title="Forgot password"
          description={PAGE_DESCRIPTIONS['forgot-password']}
        />

        {/* Main content */}
        <YStack
          flex={1}
          px="$4"
          gap="$6"
        >
          {/* Form */}
          <YStack
            gap="$5"
            mt="$6"
          >
            {/* Email field */}
            <YStack gap="$2">
              <Text
                fontSize="$3"
                fontWeight="600"
                color="$color"
              >
                Email
              </Text>
              <Input
                value={email}
                onChangeText={(text) => {
                  setEmailInput(text)
                  if (error) setError(null)
                }}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                bg="white"
                borderColor="$borderColorHover"
                borderWidth={1}
                borderRadius="$4"
                px="$4"
                py="$3"
                minHeight={52}
                placeholderTextColor="$placeholderColor"
                focusStyle={{ borderColor: '$primary', borderWidth: 1.5 }}
              />
            </YStack>

            {/* Error message */}
            {!!error && (
              <XStack
                bg="$errorBackground"
                p="$3"
                borderRadius="$4"
                gap="$2"
                alignItems="center"
                borderWidth={1}
                borderColor="$errorBackground"
              >
                <Text
                  color="$error"
                  fontSize="$3"
                  fontWeight="500"
                  flex={1}
                >
                  {error}
                </Text>
              </XStack>
            )}
          </YStack>
        </YStack>

        {/* Bottom button */}
        <YStack
          px="$4"
          pb="$3xl"
          pt="$2xl"
        >
          <Button
            bg={email.trim() ? '$primary' : '$colorMuted'}
            borderRadius="$4"
            py="$3"
            px="$4"
            minHeight={54}
            onPress={handleSendRequest}
            disabled={forgotPasswordMutation.isPending || !email.trim()}
            pressStyle={PressPresets.primary.pressStyle}
            animation={PressPresets.primary.animation}
          >
            {forgotPasswordMutation.isPending ? (
              <XStack
                gap="$2"
                alignItems="center"
              >
                <Spinner
                  size="small"
                  color="white"
                />
                <Text
                  color="white"
                  fontSize="$4"
                  fontWeight="600"
                >
                  Sending...
                </Text>
              </XStack>
            ) : (
              <Text
                color="white"
                fontSize="$4"
                fontWeight="600"
              >
                Send request
              </Text>
            )}
          </Button>
        </YStack>
      </YStack>
    </GradientBackground>
  )
}
