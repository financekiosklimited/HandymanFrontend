'use client'

import { useState } from 'react'
import { YStack, XStack, Text, Button, Input, Spinner } from '@my/ui'
import { GradientBackground } from '@my/ui'
import { useResetPassword, formatErrorMessage } from '@my/api'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { ArrowLeft, Eye, EyeOff } from '@tamagui/lucide-icons'
import { HTTPError, TimeoutError } from 'ky'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { Toast, useToastController } from '@tamagui/toast'

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
        return 'Invalid or expired reset token. Please try again.'
      case 429:
        return 'Too many attempts. Please wait before trying again.'
      default:
        return 'Something went wrong. Please try again.'
    }
  }

  return formatErrorMessage(error)
}

export function ForgotPasswordResetScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const toast = useToastController()
  const { resetToken } = useLocalSearchParams<{ resetToken: string }>()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetPasswordMutation = useResetPassword()

  const handleUpdatePassword = async () => {
    // Client-side validation
    if (!newPassword.trim()) {
      setError('Please enter a new password')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!confirmPassword.trim()) {
      setError('Please confirm your password')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!resetToken) {
      setError('Reset token not found. Please try again.')
      return
    }

    setError(null)

    try {
      console.log('[Debug] Reset Password Payload:', {
        reset_token: resetToken,
        new_password: newPassword,
      })

      const response = await resetPasswordMutation.mutateAsync({
        reset_token: resetToken,
        new_password: newPassword,
      })

      console.log('[Debug] Reset Password Response:', response)

      toast.show('Password updated!', {
        message: 'Your password has been successfully reset.',
        duration: 3000,
        native: false,
      })

      // Navigate back to login
      router.replace('/auth/login')
    } catch (err) {
      if (err instanceof HTTPError) {
        try {
          const errorBody = await err.response.json()
          console.error('[Debug] Reset Password Error Body:', JSON.stringify(errorBody, null, 2))
        } catch (e) {
          console.error('[Debug] Could not parse error body')
        }
      }
      console.error('[Debug] Reset Password Error:', err)
      const errorMessage = await getHumanReadableError(err)
      setError(errorMessage)
    }
  }

  const isFormValid =
    newPassword.trim() && confirmPassword.trim() && newPassword === confirmPassword

  return (
    <GradientBackground>
      <YStack
        flex={1}
        pt={insets.top}
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
              New password
            </Text>
            <Text
              fontSize="$4"
              color="$colorSubtle"
              lineHeight={24}
            >
              Please set your new password.
            </Text>
          </YStack>

          {/* Form */}
          <YStack
            gap="$5"
            mt="$6"
          >
            {/* New Password field */}
            <YStack gap="$2">
              <Text
                fontSize="$3"
                fontWeight="600"
                color="$color"
              >
                New password
              </Text>
              <XStack
                bg="white"
                borderColor="$borderColorHover"
                borderWidth={1}
                borderRadius="$4"
                alignItems="center"
                minHeight={52}
                focusWithinStyle={{ borderColor: '$primary', borderWidth: 1.5 }}
              >
                <Input
                  key={`new-password-input-${showNewPassword ? 'visible' : 'hidden'}`}
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text)
                    if (error) setError(null)
                  }}
                  placeholder="Enter new password"
                  bg="transparent"
                  borderWidth={0}
                  flex={1}
                  px="$4"
                  py="$3"
                  placeholderTextColor="$placeholderColor"
                />
                <Button
                  unstyled
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  p="$2"
                  mr="$2"
                  hitSlop={8}
                  pressStyle={{ opacity: 0.7 }}
                >
                  {showNewPassword ? (
                    <EyeOff
                      size={20}
                      color="$colorSubtle"
                    />
                  ) : (
                    <Eye
                      size={20}
                      color="$colorSubtle"
                    />
                  )}
                </Button>
              </XStack>
            </YStack>

            {/* Confirm Password field */}
            <YStack gap="$2">
              <Text
                fontSize="$3"
                fontWeight="600"
                color="$color"
              >
                Confirm password
              </Text>
              <XStack
                bg="white"
                borderColor="$borderColorHover"
                borderWidth={1}
                borderRadius="$4"
                alignItems="center"
                minHeight={52}
                focusWithinStyle={{ borderColor: '$primary', borderWidth: 1.5 }}
              >
                <Input
                  key={`confirm-password-input-${showConfirmPassword ? 'visible' : 'hidden'}`}
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text)
                    if (error) setError(null)
                  }}
                  placeholder="Confirm new password"
                  bg="transparent"
                  borderWidth={0}
                  flex={1}
                  px="$4"
                  py="$3"
                  placeholderTextColor="$placeholderColor"
                />
                <Button
                  unstyled
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  p="$2"
                  mr="$2"
                  hitSlop={8}
                  pressStyle={{ opacity: 0.7 }}
                >
                  {showConfirmPassword ? (
                    <EyeOff
                      size={20}
                      color="$colorSubtle"
                    />
                  ) : (
                    <Eye
                      size={20}
                      color="$colorSubtle"
                    />
                  )}
                </Button>
              </XStack>
            </YStack>

            {/* Error message */}
            {error && (
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
            bg={isFormValid ? '$primary' : '$colorMuted'}
            borderRadius="$4"
            py="$3"
            px="$4"
            minHeight={54}
            onPress={handleUpdatePassword}
            disabled={resetPasswordMutation.isPending || !isFormValid}
            pressStyle={{ opacity: 0.9 }}
          >
            {resetPasswordMutation.isPending ? (
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
                  Updating...
                </Text>
              </XStack>
            ) : (
              <Text
                color="white"
                fontSize="$4"
                fontWeight="600"
              >
                Update password
              </Text>
            )}
          </Button>
        </YStack>
      </YStack>
    </GradientBackground>
  )
}
