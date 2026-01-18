'use client'

import { useState, useMemo } from 'react'
import { YStack, XStack, Text, Button, Input, Spinner, ScrollView, Sheet } from '@my/ui'
import { GradientBackground } from '@my/ui'
import { useCountryCodes, useSendPhoneOtp, formatErrorMessage } from '@my/api'
import type { CountryPhoneCode } from '@my/api'
import { useRouter } from 'expo-router'
import { ArrowLeft, ChevronDown, Search } from '@tamagui/lucide-icons'
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
        return 'Invalid phone number. Please check and try again.'
      case 401:
        return 'Please login to verify your phone.'
      case 429:
        return 'Too many requests. Please wait before trying again.'
      case 503:
        return 'SMS service unavailable. Please try again later.'
      default:
        return 'Something went wrong. Please try again.'
    }
  }

  return formatErrorMessage(error)
}

export function PhoneSendScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<CountryPhoneCode | null>(null)
  const [showCountrySheet, setShowCountrySheet] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: countryCodes, isLoading: isLoadingCountryCodes } = useCountryCodes()
  const sendOtpMutation = useSendPhoneOtp()

  // Set default country when data loads
  useMemo(() => {
    if (countryCodes && countryCodes.length > 0 && !selectedCountry) {
      // Find Canada or Indonesia as default, fallback to first
      const defaultCountry =
        countryCodes.find((c) => c.country_code === 'CA') ||
        countryCodes.find((c) => c.country_code === 'ID') ||
        countryCodes[0]
      setSelectedCountry(defaultCountry || null)
    }
  }, [countryCodes, selectedCountry])

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!countryCodes) return []
    if (!searchQuery.trim()) return countryCodes

    const query = searchQuery.toLowerCase()
    return countryCodes.filter(
      (c) =>
        c.country_name.toLowerCase().includes(query) ||
        c.dial_code.includes(query) ||
        c.country_code.toLowerCase().includes(query)
    )
  }, [countryCodes, searchQuery])

  const handleSendOtp = async () => {
    if (!selectedCountry) {
      setError('Please select a country code')
      return
    }

    const cleanNumber = phoneNumber.replace(/\D/g, '')
    if (!cleanNumber || cleanNumber.length < 6) {
      setError('Please enter a valid phone number')
      return
    }

    const fullPhoneNumber = `${selectedCountry.dial_code}${cleanNumber}`
    setError(null)

    try {
      await sendOtpMutation.mutateAsync({ phone_number: fullPhoneNumber })
      router.push('/user/phone/verify')
    } catch (err) {
      const errorMessage = await getHumanReadableError(err)
      setError(errorMessage)
    }
  }

  const handleSelectCountry = (country: CountryPhoneCode) => {
    setSelectedCountry(country)
    setShowCountrySheet(false)
    setSearchQuery('')
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
              Enter your phone number
            </Text>
            <Text
              fontSize="$4"
              color="$colorSubtle"
              lineHeight={24}
            >
              We'll send you a verification code via SMS to confirm your phone number.
            </Text>
          </YStack>

          {/* Phone Input Section */}
          <YStack
            gap="$3"
            mt="$4"
          >
            <XStack
              gap="$1"
              alignItems="center"
            >
              <Text
                fontSize="$3"
                fontWeight="600"
                color="$color"
              >
                Phone number
              </Text>
              <Text
                fontSize="$3"
                fontWeight="600"
                color="$error"
              >
                *
              </Text>
            </XStack>

            <XStack gap={0}>
              {/* Country Code Selector */}
              <Button
                unstyled
                onPress={() => setShowCountrySheet(true)}
                disabled={isLoadingCountryCodes}
                bg="white"
                borderWidth={1}
                borderColor="$borderColorHover"
                borderTopLeftRadius="$4"
                borderBottomLeftRadius="$4"
                borderRightWidth={0}
                px="$3"
                minHeight={56}
                minWidth={100}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                gap="$1"
                pressStyle={{ opacity: 0.8, bg: '$backgroundMuted' }}
              >
                {isLoadingCountryCodes ? (
                  <Spinner
                    size="small"
                    color="$colorSubtle"
                  />
                ) : selectedCountry ? (
                  <Text
                    fontSize="$4"
                    color="$color"
                  >
                    {selectedCountry.flag_emoji} {selectedCountry.dial_code}
                  </Text>
                ) : (
                  <Text
                    fontSize="$4"
                    color="$colorSubtle"
                  >
                    Select
                  </Text>
                )}
                <ChevronDown
                  size={16}
                  color="$color"
                />
              </Button>

              {/* Phone Number Input */}
              <Input
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text)
                  if (error) setError(null)
                }}
                placeholder="81234567890"
                keyboardType="phone-pad"
                bg="white"
                borderWidth={1}
                borderColor="$borderColorHover"
                borderTopLeftRadius={0}
                borderBottomLeftRadius={0}
                borderTopRightRadius="$4"
                borderBottomRightRadius="$4"
                borderLeftWidth={0}
                flex={1}
                px="$4"
                minHeight={56}
                focusStyle={{ borderColor: '$primary', borderWidth: 1.5 }}
              />
            </XStack>

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
            bg="$primary"
            borderRadius="$4"
            py="$3"
            px="$4"
            minHeight={54}
            onPress={handleSendOtp}
            disabled={sendOtpMutation.isPending || !phoneNumber.trim()}
            pressStyle={{ opacity: 0.9 }}
            opacity={!phoneNumber.trim() ? 0.6 : 1}
          >
            {sendOtpMutation.isPending ? (
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
                Send OTP
              </Text>
            )}
          </Button>
        </YStack>

        {/* Country Selector Sheet */}
        <Sheet
          open={showCountrySheet}
          onOpenChange={setShowCountrySheet}
          snapPoints={[80]}
          dismissOnSnapToBottom
          modal
        >
          <Sheet.Overlay />
          <Sheet.Frame
            bg="$background"
            borderTopLeftRadius="$6"
            borderTopRightRadius="$6"
          >
            <Sheet.Handle
              bg="$colorMuted"
              mt="$3"
            />

            <YStack
              flex={1}
              pt="$4"
              px="$4"
            >
              {/* Header */}
              <Text
                fontSize="$6"
                fontWeight="bold"
                color="$color"
                mb="$4"
              >
                Select Country
              </Text>

              {/* Search */}
              <XStack
                bg="white"
                borderWidth={1}
                borderColor="$borderColorHover"
                borderRadius="$4"
                alignItems="center"
                px="$3"
                mb="$4"
              >
                <Search
                  size={18}
                  color="$colorSubtle"
                />
                <Input
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search country..."
                  flex={1}
                  bg="transparent"
                  borderWidth={0}
                  px="$2"
                  py="$3"
                  placeholderTextColor="$placeholderColor"
                />
              </XStack>

              {/* Country List */}
              <ScrollView
                flex={1}
                showsVerticalScrollIndicator={false}
              >
                <YStack
                  gap="$1"
                  pb="$4"
                >
                  {filteredCountries.map((country) => (
                    <Button
                      key={country.country_code}
                      unstyled
                      onPress={() => handleSelectCountry(country)}
                      bg={
                        selectedCountry?.country_code === country.country_code
                          ? '$backgroundMuted'
                          : 'transparent'
                      }
                      px="$4"
                      py="$3"
                      borderRadius="$3"
                      pressStyle={{ bg: '$backgroundMuted' }}
                    >
                      <XStack
                        flex={1}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <XStack
                          gap="$3"
                          alignItems="center"
                          flex={1}
                        >
                          <Text fontSize="$5">{country.flag_emoji}</Text>
                          <Text
                            fontSize="$4"
                            color="$color"
                            numberOfLines={1}
                            flex={1}
                          >
                            {country.country_name}
                          </Text>
                        </XStack>
                        <Text
                          fontSize="$4"
                          color="$colorSubtle"
                        >
                          {country.dial_code}
                        </Text>
                      </XStack>
                    </Button>
                  ))}
                </YStack>
              </ScrollView>
            </YStack>
          </Sheet.Frame>
        </Sheet>
      </YStack>
    </GradientBackground>
  )
}
