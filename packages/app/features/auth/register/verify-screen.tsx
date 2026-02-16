'use client'

import { useState, useRef, useEffect } from 'react'
import { YStack, XStack, Text, Button, Input, Spinner, PressPresets } from '@my/ui'
import { GradientBackground, PageHeader } from '@my/ui'
import {
  useVerifyEmail,
  useResendVerificationEmail,
  useAuthStore,
  formatErrorMessage,
} from '@my/api'
import { useRouter } from 'expo-router'
import { PAGE_DESCRIPTIONS } from 'app/constants/page-descriptions'
import { HTTPError, TimeoutError } from 'ky'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import type { TextInput } from 'react-native'

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
        return 'Invalid verification code. Please try again.'
      case 401:
        return 'Please sign in to verify your email.'
      case 429:
        return 'Too many attempts. Please wait before trying again.'
      default:
        return 'Something went wrong. Please try again.'
    }
  }

  return formatErrorMessage(error)
}

export function RegisterVerifyScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const email = useAuthStore((state) => state.email)

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const inputRefs = useRef<(TextInput | null)[]>([])

  const verifyEmailMutation = useVerifyEmail()
  const resendEmailMutation = useResendVerificationEmail()

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true)
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  // Mask email for display
  const getMaskedEmail = () => {
    if (!email) return 'your email'
    const [localPart = '', domain = ''] = email.split('@')
    if (!domain) return email
    if (localPart.length <= 2) return email
    const visibleStart = localPart.slice(0, 2)
    const masked = '*'.repeat(Math.min(localPart.length - 2, 5))
    return `${visibleStart}${masked}@${domain}`
  }

  const handleOtpChange = (value: string, index: number) => {
    // Filter only numeric characters
    const numericValue = value.replace(/[^0-9]/g, '')

    // Handle paste (multiple digits)
    if (numericValue.length > 1) {
      const pastedOtp = numericValue.slice(0, 6).split('')
      const newOtp = [...otp]

      pastedOtp.forEach((char, i) => {
        if (i < 6) {
          newOtp[i] = char
        }
      })

      setOtp(newOtp)
      if (error) setError(null)

      // Focus on the last filled input or the next empty one
      const filledCount = Math.min(pastedOtp.length, 6)
      const focusIndex = filledCount >= 6 ? 5 : filledCount - 1
      setTimeout(() => inputRefs.current[focusIndex]?.focus(), 0)
      return
    }

    // Handle single digit
    if (numericValue.length === 1) {
      const newOtp = [...otp]
      newOtp[index] = numericValue
      setOtp(newOtp)
      if (error) setError(null)

      // Auto focus next
      if (index < 5) {
        setTimeout(() => inputRefs.current[index + 1]?.focus(), 0)
      }
    } else if (numericValue.length === 0) {
      // Handle backspace
      const newOtp = [...otp]
      newOtp[index] = ''
      setOtp(newOtp)
    }
  }

  const handleKeyPress = (key: string, index: number) => {
    // Move to previous on backspace if current is empty
    if (key === 'Backspace' && !otp[index] && index > 0) {
      setTimeout(() => inputRefs.current[index - 1]?.focus(), 0)
    }
  }

  const handleVerify = async () => {
    const otpCode = otp.join('')

    if (otpCode.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }

    if (!email) {
      setError('Email not found. Please go back and try again.')
      return
    }

    setError(null)

    try {
      await verifyEmailMutation.mutateAsync({
        email: email,
        otp: otpCode,
      })
      // Navigate to verified screen after successful verification
      router.push('/auth/register/verified')
    } catch (err) {
      const errorMessage = await getHumanReadableError(err)
      setError(errorMessage)
    }
  }

  const handleResend = async () => {
    if (!canResend || !email) return

    try {
      await resendEmailMutation.mutateAsync({ email })
      // Reset countdown
      setCountdown(60)
      setCanResend(false)
      setError(null)
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
          title="Verify your email"
          description={PAGE_DESCRIPTIONS['register']}
        />

        {/* Main content */}
        <YStack
          flex={1}
          px="$4"
          gap="$6"
        >
          {/* Masked email display */}
          <XStack
            flexWrap="wrap"
            pt="$4"
          >
            <Text
              fontSize="$4"
              color="$colorSubtle"
              lineHeight={24}
            >
              Please enter the 6-digit code sent to{' '}
            </Text>
            <Text
              fontSize="$4"
              color="$color"
              fontWeight="600"
              lineHeight={24}
            >
              {getMaskedEmail()}
            </Text>
          </XStack>

          {/* OTP Input */}
          <XStack
            gap="$2"
            justifyContent="center"
            mt="$6"
          >
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(ref: unknown) => {
                  inputRefs.current[index] = ref as TextInput | null
                }}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e.nativeEvent.key, index)}
                keyboardType="number-pad"
                textContentType={index === 0 ? 'oneTimeCode' : 'none'}
                autoComplete={index === 0 ? 'sms-otp' : 'off'}
                maxLength={index === 0 ? 6 : 1}
                selectTextOnFocus
                bg="white"
                borderWidth={1}
                borderColor={digit ? '$primary' : '$borderColorHover'}
                borderRadius="$4"
                width={48}
                height={56}
                textAlign="center"
                color="$color"
                focusStyle={{ borderColor: '$primary', borderWidth: 2 }}
              />
            ))}
          </XStack>

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
              mt="$4"
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

          {/* Resend section */}
          <YStack
            alignItems="center"
            gap="$2"
            mt="$8"
          >
            <Text
              fontSize="$3"
              color="$colorSubtle"
            >
              Didn't receive the code?
            </Text>
            <Button
              unstyled
              onPress={handleResend}
              disabled={!canResend || resendEmailMutation.isPending}
              pressStyle={PressPresets.icon.pressStyle}
              animation={PressPresets.icon.animation}
            >
              {resendEmailMutation.isPending ? (
                <Spinner
                  size="small"
                  color="$primary"
                />
              ) : (
                <Text
                  fontSize="$3"
                  fontWeight="700"
                  color={canResend ? '$color' : '$colorSubtle'}
                >
                  {canResend ? 'Resend code' : `Resend code (${countdown}s)`}
                </Text>
              )}
            </Button>
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
            onPress={handleVerify}
            disabled={verifyEmailMutation.isPending || otp.join('').length !== 6}
            pressStyle={PressPresets.primary.pressStyle}
            animation={PressPresets.primary.animation}
            opacity={otp.join('').length !== 6 ? 0.6 : 1}
          >
            {verifyEmailMutation.isPending ? (
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
                  Verifying...
                </Text>
              </XStack>
            ) : (
              <Text
                color="white"
                fontSize="$4"
                fontWeight="600"
              >
                Verify email
              </Text>
            )}
          </Button>
        </YStack>
      </YStack>
    </GradientBackground>
  )
}
