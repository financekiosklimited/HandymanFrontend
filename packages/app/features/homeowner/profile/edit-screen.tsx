'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  YStack,
  XStack,
  ScrollView,
  Text,
  Button,
  Spinner,
  Sheet,
  GradientBackground,
} from '@my/ui'
import { FormInput, FormSelect } from '@my/ui'
import { useHomeownerProfile, useUpdateHomeownerProfile } from '@my/api'
import type { HomeownerProfileUpdateRequest } from '@my/api'
import { useRouter } from 'expo-router'
import { ArrowLeft, AlertCircle, User, ChevronDown } from '@tamagui/lucide-icons'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { KeyboardAvoidingView, Platform } from 'react-native'
import { HTTPError } from 'ky'

interface FormData {
  display_name: string
  address: string
  date_of_birth: string
}

// Year Range
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString())
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString())

interface FormErrors {
  [key: string]: string[] | undefined
}

export function HomeownerProfileEditScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const { data: profile, isLoading: profileLoading } = useHomeownerProfile()
  const updateMutation = useUpdateHomeownerProfile()

  const [formData, setFormData] = useState<FormData>({
    display_name: '',
    address: '',
    date_of_birth: '',
  })
  const [errors, setErrors] = useState<FormErrors | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [dateSheetOpen, setDateSheetOpen] = useState(false)

  // Date selection state
  const [tempDate, setTempDate] = useState({
    day: '',
    month: '',
    year: '',
  })

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        address: profile.address || '',
        date_of_birth: profile.date_of_birth || '',
      })

      if (profile.date_of_birth) {
        const [y, m, d] = profile.date_of_birth.split('-')
        setTempDate({
          year: y || '',
          month: m ? (Number.parseInt(m) - 1).toString() : '',
          day: d ? Number.parseInt(d).toString() : '',
        })
      }
    }
  }, [profile])

  // Update field
  const updateField = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      if (errors?.[field]) {
        setErrors((prev) => {
          if (!prev) return prev
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    },
    [errors]
  )

  // Get field errors
  const getFieldErrors = (field: string): string[] => {
    if (!errors?.[field]) return []
    return errors[field] || []
  }

  const handleDateConfirm = () => {
    const month = (Number.parseInt(tempDate.month) + 1).toString().padStart(2, '0')
    const day = tempDate.day.padStart(2, '0')
    const dateStr = `${tempDate.year}-${month}-${day}`
    updateField('date_of_birth', dateStr)
    setDateSheetOpen(false)
  }

  // Handle submit
  const handleSubmit = useCallback(async () => {
    setErrors(null)
    setGeneralError(null)

    // Client-side validation
    const clientErrors: FormErrors = {}
    if (!formData.display_name.trim()) {
      clientErrors.display_name = ['Display name is required']
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      return
    }

    try {
      const updateData: HomeownerProfileUpdateRequest = {
        display_name: formData.display_name.trim(),
        address: formData.address.trim() || undefined,
        date_of_birth: formData.date_of_birth || null,
      }

      await updateMutation.mutateAsync(updateData)
      router.back()
    } catch (error) {
      if (error instanceof HTTPError) {
        try {
          const body = await error.response.json()
          if (body.errors) {
            setErrors(body.errors)
          } else {
            setGeneralError(body.message || 'Failed to update profile')
          }
        } catch {
          setGeneralError('Failed to update profile')
        }
      } else {
        setGeneralError('Failed to update profile')
      }
    }
  }, [formData, updateMutation, router])

  if (profileLoading) {
    return (
      <GradientBackground>
        <YStack
          flex={1}
          pt={insets.top}
          alignItems="center"
          justifyContent="center"
        >
          <Spinner
            size="large"
            color="$primary"
          />
          <Text
            color="$colorSubtle"
            mt="$3"
            fontSize={14}
          >
            Loading profile...
          </Text>
        </YStack>
      </GradientBackground>
    )
  }

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS === 'ios'}
      >
        <YStack
          flex={1}
          pt={insets.top}
        >
          {/* Header */}
          <XStack
            px="$5"
            py="$4"
            alignItems="center"
            gap="$3"
          >
            <Button
              unstyled
              onPress={() => router.back()}
              p="$2"
              hitSlop={12}
              pressStyle={{ opacity: 0.7 }}
            >
              <ArrowLeft
                size={22}
                color="$color"
              />
            </Button>
            <Text
              flex={1}
              fontSize={17}
              fontWeight="700"
              color="$color"
              textAlign="center"
            >
              Edit Profile
            </Text>
            <Button
              unstyled
              onPress={handleSubmit}
              disabled={updateMutation.isPending}
              p="$2"
              hitSlop={12}
              pressStyle={{ opacity: 0.7 }}
            >
              <Text
                color="$primary"
                fontSize={15}
                fontWeight="600"
              >
                {updateMutation.isPending ? 'Saving...' : 'Apply'}
              </Text>
            </Button>
          </XStack>

          {/* Content */}
          <ScrollView
            flex={1}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            <YStack
              px="$5"
              gap="$6"
              pt="$2"
            >
              {/* General Error */}
              {generalError && (
                <XStack
                  bg="$errorBackground"
                  p="$3.5"
                  borderRadius={8}
                  gap="$2.5"
                  alignItems="center"
                  borderWidth={1}
                  borderColor="$errorBackground"
                >
                  <AlertCircle
                    size={18}
                    color="$error"
                  />
                  <Text
                    color="$error"
                    fontSize={14}
                    flex={1}
                  >
                    {generalError}
                  </Text>
                </XStack>
              )}

              {/* Personal Details Section */}
              <YStack gap="$4">
                <XStack
                  alignItems="center"
                  gap="$2"
                >
                  <User
                    size={18}
                    color="$primary"
                  />
                  <Text
                    fontSize={15}
                    fontWeight="700"
                    color="$color"
                  >
                    Personal Details
                  </Text>
                </XStack>

                {/* Display Name */}
                <FormInput
                  label="Display Name"
                  required
                  value={formData.display_name}
                  onChangeText={(text) => updateField('display_name', text)}
                  placeholder="Enter your name"
                  error={getFieldErrors('display_name')}
                />

                {/* Date of Birth Picker */}
                <FormSelect
                  label="Date of Birth"
                  placeholder="Select Date"
                  value={formData.date_of_birth}
                  displayValue={
                    formData.date_of_birth
                      ? new Date(formData.date_of_birth).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : undefined
                  }
                  onPress={() => setDateSheetOpen(true)}
                  error={getFieldErrors('date_of_birth')}
                  rightElement={
                    <ChevronDown
                      size={20}
                      color="$placeholderColor"
                    />
                  }
                />

                {/* Address */}
                <FormInput
                  label="Address"
                  value={formData.address}
                  onChangeText={(text) => updateField('address', text)}
                  placeholder="Enter your address"
                  error={getFieldErrors('address')}
                />
              </YStack>
            </YStack>
          </ScrollView>

          {/* Bottom Submit Button */}
          <YStack
            px="$5"
            py="$4"
            pb={insets.bottom}
            borderTopWidth={1}
            borderTopColor="$borderColor"
          >
            <Button
              unstyled
              bg="$primary"
              borderRadius={8}
              height={52}
              onPress={handleSubmit}
              disabled={updateMutation.isPending}
              pressStyle={{ opacity: 0.9 }}
              alignItems="center"
              justifyContent="center"
              flexDirection="row"
              gap="$2"
            >
              {updateMutation.isPending ? (
                <>
                  <Spinner
                    size="small"
                    color="white"
                  />
                  <Text
                    color="white"
                    fontSize={15}
                    fontWeight="600"
                  >
                    Saving...
                  </Text>
                </>
              ) : (
                <Text
                  color="white"
                  fontSize={15}
                  fontWeight="600"
                >
                  Submit
                </Text>
              )}
            </Button>
          </YStack>
        </YStack>
      </KeyboardAvoidingView>

      {/* Date Picker Sheet */}
      <Sheet
        modal
        open={dateSheetOpen}
        onOpenChange={setDateSheetOpen}
        snapPointsMode="percent"
        snapPoints={[50]}
        dismissOnSnapToBottom
        zIndex={100000}
      >
        <Sheet.Overlay
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Frame
          borderTopLeftRadius={16}
          borderTopRightRadius={16}
          p="$4"
        >
          <Sheet.Handle />
          <YStack
            gap="$4"
            flex={1}
          >
            <XStack
              justifyContent="space-between"
              alignItems="center"
            >
              <Text
                fontSize={17}
                fontWeight="700"
                color="$color"
              >
                Select Date of Birth
              </Text>
              <Button
                unstyled
                onPress={handleDateConfirm}
              >
                <Text
                  color="$primary"
                  fontWeight="600"
                >
                  Done
                </Text>
              </Button>
            </XStack>

            <XStack
              gap="$2"
              flex={1}
            >
              {/* Day */}
              <YStack flex={1}>
                <Text
                  fontSize={12}
                  color="$placeholderColor"
                  mb="$2"
                  textAlign="center"
                >
                  Day
                </Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {days.map((d) => (
                    <Button
                      key={d}
                      unstyled
                      onPress={() => setTempDate((prev) => ({ ...prev, day: d }))}
                      bg={tempDate.day === d ? '$primaryBackground' : 'transparent'}
                      py="$2"
                      borderRadius={4}
                      alignItems="center"
                    >
                      <Text
                        color={tempDate.day === d ? '$primary' : '$color'}
                        fontWeight={tempDate.day === d ? '700' : '400'}
                      >
                        {d}
                      </Text>
                    </Button>
                  ))}
                </ScrollView>
              </YStack>

              {/* Month */}
              <YStack flex={2}>
                <Text
                  fontSize={12}
                  color="$placeholderColor"
                  mb="$2"
                  textAlign="center"
                >
                  Month
                </Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {months.map((m, i) => (
                    <Button
                      key={m}
                      unstyled
                      onPress={() => setTempDate((prev) => ({ ...prev, month: i.toString() }))}
                      bg={tempDate.month === i.toString() ? '$primaryBackground' : 'transparent'}
                      py="$2"
                      borderRadius={4}
                      alignItems="center"
                    >
                      <Text
                        color={tempDate.month === i.toString() ? '$primary' : '$color'}
                        fontWeight={tempDate.month === i.toString() ? '700' : '400'}
                      >
                        {m}
                      </Text>
                    </Button>
                  ))}
                </ScrollView>
              </YStack>

              {/* Year */}
              <YStack flex={1.5}>
                <Text
                  fontSize={12}
                  color="$placeholderColor"
                  mb="$2"
                  textAlign="center"
                >
                  Year
                </Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {years.map((y) => (
                    <Button
                      key={y}
                      unstyled
                      onPress={() => setTempDate((prev) => ({ ...prev, year: y }))}
                      bg={tempDate.year === y ? '$primaryBackground' : 'transparent'}
                      py="$2"
                      borderRadius={4}
                      alignItems="center"
                    >
                      <Text
                        color={tempDate.year === y ? '$primary' : '$color'}
                        fontWeight={tempDate.year === y ? '700' : '400'}
                      >
                        {y}
                      </Text>
                    </Button>
                  ))}
                </ScrollView>
              </YStack>
            </XStack>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </GradientBackground>
  )
}
