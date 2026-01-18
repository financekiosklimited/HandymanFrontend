'use client'

import { useState } from 'react'
import { YStack, XStack, Text, Button, Input, Spinner } from '@my/ui'
import { GradientBackground } from '@my/ui'
import { useLogin, useActivateRole, formatErrorMessage } from '@my/api'
import { useRouter } from 'expo-router'
import { ArrowLeft, Eye, EyeOff } from '@tamagui/lucide-icons'
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
  // Handle ky TimeoutError
  if (error instanceof TimeoutError) {
    return 'Request timed out. Please try again.'
  }

  // Handle HTTPError from ky
  if (error instanceof HTTPError) {
    try {
      // Parse error response body
      const errorData = (await error.response.json()) as ApiErrorResponse

      // Prioritize message field for validation errors
      if (errorData?.message) {
        return errorData.message
      }

      // Fallback to detail if exists
      if (errorData?.detail) {
        return errorData.detail
      }

      // Handle status code specific messages
      switch (error.response.status) {
        case 400:
          return 'Invalid email or password. Please check your credentials and try again.'
        case 401:
          return 'Invalid email or password. Please check your credentials and try again.'
        case 403:
          return 'You do not have permission to perform this action.'
        case 404:
          return 'Account not found. Please check your email and try again.'
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
      // If parsing fails, use status code
      switch (error.response.status) {
        case 400:
        case 401:
          return 'Invalid email or password. Please check your credentials and try again.'
        case 403:
          return 'You do not have permission to perform this action.'
        case 404:
          return 'Account not found. Please check your email and try again.'
        case 500:
        case 502:
        case 503:
          return 'Server error. Please try again later.'
        default:
          return 'Something went wrong. Please try again.'
      }
    }
  }

  // Use the shared error formatter for other errors
  return formatErrorMessage(error)
}

export function LoginScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loginMutation = useLogin()
  const activateRoleMutation = useActivateRole()

  const isLoading = loginMutation.isPending || activateRoleMutation.isPending

  const handleLogin = async (role: Role) => {
    // Client-side validation
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    if (!password.trim()) {
      setError('Please enter your password')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    setError(null)
    setSelectedRole(role)

    try {
      // Step 1: Login
      await loginMutation.mutateAsync({ email: email.trim(), password })

      // Step 2: Activate role
      await activateRoleMutation.mutateAsync({ role })

      // Step 3: Redirect based on role
      if (role === 'handyman') {
        router.replace('/(handyman)/')
      } else {
        router.replace('/(homeowner)/')
      }
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
        {/* Header with back button */}
        <XStack
          px="$4"
          py="$3"
          alignItems="center"
        >
          <Button
            unstyled
            onPress={() => router.replace('/(guest)')}
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
          <YStack pt="$4">
            <Text
              fontSize={32}
              fontWeight="bold"
              color="$color"
            >
              Login
            </Text>
            <Text
              fontSize="$4"
              color="$colorSubtle"
              mt="$1"
            >
              Welcome back! Sign in to continue
            </Text>
          </YStack>

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
              {/* Forgot Password link */}
              <XStack
                justifyContent="flex-end"
                mt="$1"
              >
                <Button
                  unstyled
                  onPress={() => router.push('/auth/forgot-password/email')}
                  pressStyle={{ opacity: 0.7 }}
                >
                  <Text
                    fontSize="$3"
                    fontWeight="600"
                    color="$primary"
                  >
                    Forgot Password?
                  </Text>
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

        {/* Bottom buttons */}
        <YStack
          px="$4"
          pb="$3xl"
          pt="$2xl"
          gap="$3"
        >
          {/* Sign in as Homeowner */}
          <Button
            bg="$primary"
            borderRadius="$4"
            py="$3"
            px="$4"
            minHeight={54}
            onPress={() => handleLogin('homeowner')}
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
                  Signing in...
                </Text>
              </XStack>
            ) : (
              <Text
                color="white"
                fontSize="$4"
                fontWeight="600"
              >
                Sign in as Homeowner
              </Text>
            )}
          </Button>

          {/* Sign in as Handyman */}
          <Button
            bg="white"
            borderColor="$primary"
            borderWidth={1.5}
            borderRadius="$4"
            py="$3"
            px="$4"
            minHeight={54}
            onPress={() => handleLogin('handyman')}
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
                  Signing in...
                </Text>
              </XStack>
            ) : (
              <Text
                color="$primary"
                fontSize="$4"
                fontWeight="600"
              >
                Sign in as Handyman
              </Text>
            )}
          </Button>

          {/* Register link */}
          <XStack
            justifyContent="center"
            mt="$2"
          >
            <Text
              fontSize="$3"
              color="$colorSubtle"
            >
              Don't have an account?{' '}
            </Text>
            <Button
              unstyled
              onPress={() => router.push('/auth/register')}
              pressStyle={{ opacity: 0.7 }}
            >
              <Text
                fontSize="$3"
                fontWeight="700"
                color="$primary"
              >
                Register
              </Text>
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </GradientBackground>
  )
}
