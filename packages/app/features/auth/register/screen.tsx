'use client'

import { useState } from 'react'
import { YStack, XStack, Text, Button, Input, Spinner } from '@my/ui'
import { GradientBackground, PageHeader } from '@my/ui'
import { useRegister, useActivateRole, formatErrorMessage } from '@my/api'
import { useRouter } from 'expo-router'
import { Eye, EyeOff } from '@tamagui/lucide-icons'
import { PAGE_DESCRIPTIONS } from 'app/constants/page-descriptions'
import type { Role } from '@my/api'
import { HTTPError, TimeoutError } from 'ky'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'

interface ApiErrorResponse {
  message?: string
  errors?: Record<string, string[] | string> | null
  detail?: string
}

/**
 * Transform API error into human-readable message
 */
async function getHumanReadableError(error: unknown): Promise<string> {
  if (error instanceof TimeoutError) {
    return 'Request timed out. Please try again.'
  }

  if (error instanceof HTTPError) {
    try {
      const errorData = (await error.response.json()) as ApiErrorResponse

      if (errorData?.message) {
        return errorData.message
      }

      if (errorData?.detail) {
        return errorData.detail
      }

      switch (error.response.status) {
        case 400:
          return 'Please check your input and try again.'
        case 409:
          return 'An account with this email already exists.'
        case 422:
          return 'Please check your input and try again.'
        case 500:
        case 502:
        case 503:
          return 'Server error. Please try again later.'
        default:
          return 'Something went wrong. Please try again.'
      }
    } catch {
      switch (error.response.status) {
        case 400:
          return 'Please check your input and try again.'
        case 409:
          return 'An account with this email already exists.'
        case 500:
        case 502:
        case 503:
          return 'Server error. Please try again later.'
        default:
          return 'Something went wrong. Please try again.'
      }
    }
  }

  return formatErrorMessage(error)
}

export function RegisterScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [error, setError] = useState<string | null>(null)

  const registerMutation = useRegister()
  const activateRoleMutation = useActivateRole()

  const isLoading = registerMutation.isPending || activateRoleMutation.isPending

  const handleRegister = async (role: Role) => {
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

    if (!password.trim()) {
      setError('Please enter your password')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setError(null)
    setSelectedRole(role)

    try {
      // Step 1: Register
      await registerMutation.mutateAsync({
        email: email.trim(),
        password,
        initial_role: role,
      })

      // Step 2: Activate role
      await activateRoleMutation.mutateAsync({ role })

      // Step 3: Navigate to email verification
      router.push('/auth/register/verify')
    } catch (err) {
      const humanReadableError = await getHumanReadableError(err)
      setError(humanReadableError)
      setSelectedRole(null)
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
          title="Create account"
          description={PAGE_DESCRIPTIONS['register']}
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
            mt="$2"
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
                  setEmail(text)
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

            {/* Password field */}
            <YStack gap="$2">
              <Text
                fontSize="$3"
                fontWeight="600"
                color="$color"
              >
                Password
              </Text>
              <XStack
                bg="$backgroundStrong"
                borderColor="$borderColorHover"
                borderWidth={1}
                borderRadius="$4"
                alignItems="center"
                minHeight={52}
                focusWithinStyle={{ borderColor: '$primary', borderWidth: 1.5 }}
              >
                <Input
                  key={`password-input-${showPassword ? 'visible' : 'hidden'}`}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text)
                    if (error) setError(null)
                  }}
                  placeholder="Enter your password"
                  bg="transparent"
                  borderWidth={0}
                  flex={1}
                  px="$4"
                  py="$3"
                  placeholderTextColor="$placeholderColor"
                />
                <Button
                  unstyled
                  onPress={() => setShowPassword(!showPassword)}
                  p="$2"
                  mr="$2"
                  hitSlop={8}
                  pressStyle={{ opacity: 0.7 }}
                >
                  {showPassword ? (
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
              <Text
                fontSize="$2"
                color="$colorSubtle"
              >
                Must be at least 8 characters
              </Text>
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

        {/* Bottom buttons */}
        <YStack
          px="$4"
          pb="$3xl"
          pt="$2xl"
          gap="$3"
        >
          {/* Register as Homeowner */}
          <Button
            bg="$primary"
            borderRadius="$4"
            py="$3"
            px="$4"
            minHeight={54}
            onPress={() => handleRegister('homeowner')}
            disabled={isLoading}
            pressStyle={{ opacity: 0.9 }}
          >
            {isLoading && selectedRole === 'homeowner' ? (
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
                  Creating account...
                </Text>
              </XStack>
            ) : (
              <Text
                color="white"
                fontSize="$4"
                fontWeight="600"
              >
                Register as Homeowner
              </Text>
            )}
          </Button>

          {/* Register as Handyman */}
          <Button
            bg="white"
            borderColor="$primary"
            borderWidth={1.5}
            borderRadius="$4"
            py="$3"
            px="$4"
            minHeight={54}
            onPress={() => handleRegister('handyman')}
            disabled={isLoading}
            pressStyle={{ opacity: 0.9 }}
          >
            {isLoading && selectedRole === 'handyman' ? (
              <XStack
                gap="$2"
                alignItems="center"
              >
                <Spinner
                  size="small"
                  color="$primary"
                />
                <Text
                  color="$primary"
                  fontSize="$4"
                  fontWeight="600"
                >
                  Creating account...
                </Text>
              </XStack>
            ) : (
              <Text
                color="$primary"
                fontSize="$4"
                fontWeight="600"
              >
                Register as Handyman
              </Text>
            )}
          </Button>

          {/* Login link */}
          <XStack
            justifyContent="center"
            mt="$2"
          >
            <Text
              fontSize="$3"
              color="$colorSubtle"
            >
              Already have an account?{' '}
            </Text>
            <Button
              unstyled
              onPress={() => router.push('/auth/login')}
              pressStyle={{ opacity: 0.7 }}
            >
              <Text
                fontSize="$3"
                fontWeight="700"
                color="$primary"
              >
                Login
              </Text>
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </GradientBackground>
  )
}
