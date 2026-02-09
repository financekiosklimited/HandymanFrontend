'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  YStack,
  XStack,
  ScrollView,
  Text,
  Button,
  Spinner,
  Sheet,
  Switch,
  Input,
  GradientBackground,
} from '@my/ui'
import { FormInput, FormSelect } from '@my/ui'
import { useHandymanProfile, useUpdateHandymanProfile, useHandymanCategories } from '@my/api'
import type { HandymanProfileUpdateRequest } from '@my/api'
import { useRouter } from 'expo-router'
import { AlertCircle, ChevronDown, Search, User, Briefcase, Clock } from '@tamagui/lucide-icons'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { KeyboardAvoidingView, Platform } from 'react-native'
import { HTTPError } from 'ky'
import { PageHeader } from '@my/ui'
import { PAGE_DESCRIPTIONS } from 'app/constants/page-descriptions'

interface FormData {
  display_name: string
  job_title: string
  hourly_rate: string
  category_id: string
  address: string
  date_of_birth: string
  is_active: boolean
  is_available: boolean
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

export function HandymanProfileEditScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const { data: profile, isLoading: profileLoading } = useHandymanProfile()
  const { data: categories, isLoading: categoriesLoading } = useHandymanCategories()
  const updateMutation = useUpdateHandymanProfile()

  const [formData, setFormData] = useState<FormData>({
    display_name: '',
    job_title: '',
    hourly_rate: '',
    category_id: '',
    address: '',
    date_of_birth: '',
    is_active: true,
    is_available: true,
  })
  const [errors, setErrors] = useState<FormErrors | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [categorySheetOpen, setCategorySheetOpen] = useState(false)
  const [dateSheetOpen, setDateSheetOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')

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
        job_title: profile.job_title || '',
        hourly_rate: profile.hourly_rate?.toString() || '',
        category_id: profile.category?.public_id || '',
        address: profile.address || '',
        date_of_birth: profile.date_of_birth || '',
        is_active: profile.is_active ?? true,
        is_available: profile.is_available ?? true,
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

  // Get selected category
  const selectedCategory = categories?.find((c) => c.public_id === formData.category_id)

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!categories) return []
    if (!categorySearch.trim()) return categories
    return categories.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
  }, [categories, categorySearch])

  // Update field
  const updateField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
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

  // Handle category sheet
  const handleCategorySheetChange = (open: boolean) => {
    setCategorySheetOpen(open)
    if (!open) setCategorySearch('')
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

    if (formData.hourly_rate && Number.isNaN(Number.parseFloat(formData.hourly_rate))) {
      clientErrors.hourly_rate = ['Please enter a valid number']
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      return
    }

    try {
      const updateData: HandymanProfileUpdateRequest = {
        display_name: formData.display_name.trim(),
        job_title: formData.job_title.trim() || undefined,
        hourly_rate: formData.hourly_rate ? Number.parseFloat(formData.hourly_rate) : null,
        category_id: formData.category_id || null,
        address: formData.address.trim() || undefined,
        date_of_birth: formData.date_of_birth || null,
        is_active: formData.is_active,
        is_available: formData.is_available,
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
          <PageHeader
            title="Edit Profile"
            description={PAGE_DESCRIPTIONS['edit-profile']}
            onBack={() => router.back()}
          />

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

              {/* Professional Details Section */}
              <YStack gap="$4">
                <XStack
                  alignItems="center"
                  gap="$2"
                >
                  <Briefcase
                    size={18}
                    color="$primary"
                  />
                  <Text
                    fontSize={15}
                    fontWeight="700"
                    color="$color"
                  >
                    Professional Details
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

                {/* Job Title */}
                <FormInput
                  label="Job Title"
                  value={formData.job_title}
                  onChangeText={(text) => updateField('job_title', text)}
                  placeholder="e.g. AC Fixer, Plumber"
                  error={getFieldErrors('job_title')}
                />

                {/* Hourly Rate */}
                <FormInput
                  label="Hourly Rate"
                  value={formData.hourly_rate}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9.]/g, '')
                    const parts = numericValue.split('.')
                    const sanitized =
                      parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue
                    updateField('hourly_rate', sanitized)
                  }}
                  placeholder="e.g. 75"
                  keyboardType="decimal-pad"
                  error={getFieldErrors('hourly_rate')}
                  leftElement={
                    <Text
                      color="$placeholderColor"
                      fontWeight="600"
                      mr="$1"
                    >
                      $
                    </Text>
                  }
                />

                {/* Category */}
                <FormSelect
                  label="Category"
                  placeholder="Select category"
                  value={formData.category_id}
                  displayValue={categoriesLoading ? 'Loading...' : selectedCategory?.name}
                  onPress={() => handleCategorySheetChange(true)}
                  error={getFieldErrors('category_id')}
                  rightElement={
                    <ChevronDown
                      size={20}
                      color="$placeholderColor"
                    />
                  }
                />
              </YStack>

              {/* Availability Section */}
              <YStack gap="$4">
                <XStack
                  alignItems="center"
                  gap="$2"
                >
                  <Clock
                    size={18}
                    color="$primary"
                  />
                  <Text
                    fontSize={15}
                    fontWeight="700"
                    color="$color"
                  >
                    Availability
                  </Text>
                </XStack>

                {/* Is Active Toggle */}
                <XStack
                  bg="$backgroundHover"
                  borderRadius={8}
                  p="$4"
                  justifyContent="space-between"
                  alignItems="center"
                  borderWidth={1}
                  borderColor="$borderColorHover"
                >
                  <YStack
                    flex={1}
                    mr="$3"
                  >
                    <Text
                      fontSize={14}
                      fontWeight="600"
                      color="$color"
                    >
                      Active Status
                    </Text>
                    <Text
                      fontSize={12}
                      color="$placeholderColor"
                      mt="$0.5"
                    >
                      Show your profile to homeowners
                    </Text>
                  </YStack>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => updateField('is_active', checked)}
                    size="$3"
                    bg={formData.is_active ? '$primary' : '$borderColorHover'}
                  >
                    <Switch.Thumb
                      animation="quick"
                      bg="white"
                    />
                  </Switch>
                </XStack>

                {/* Is Available Toggle */}
                <XStack
                  bg="$backgroundHover"
                  borderRadius={8}
                  p="$4"
                  justifyContent="space-between"
                  alignItems="center"
                  borderWidth={1}
                  borderColor="$borderColorHover"
                >
                  <YStack
                    flex={1}
                    mr="$3"
                  >
                    <Text
                      fontSize={14}
                      fontWeight="600"
                      color="$color"
                    >
                      Available for Work
                    </Text>
                    <Text
                      fontSize={12}
                      color="$placeholderColor"
                      mt="$0.5"
                    >
                      Accept new job applications
                    </Text>
                  </YStack>
                  <Switch
                    checked={formData.is_available}
                    onCheckedChange={(checked) => updateField('is_available', checked)}
                    size="$3"
                    bg={formData.is_available ? '$primary' : '$borderColorHover'}
                  >
                    <Switch.Thumb
                      animation="quick"
                      bg="white"
                    />
                  </Switch>
                </XStack>
              </YStack>

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
                    <XStack
                      gap="$2"
                      alignItems="center"
                    >
                      <ChevronDown
                        size={20}
                        color="$placeholderColor"
                      />
                    </XStack>
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

      {/* Category Selection Sheet */}
      <Sheet
        modal
        open={categorySheetOpen}
        onOpenChange={handleCategorySheetChange}
        snapPointsMode="percent"
        snapPoints={[60]}
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
        >
          <Sheet.Handle />
          <YStack
            p="$5"
            gap="$4"
            flex={1}
          >
            <Text
              fontSize={17}
              fontWeight="700"
              color="$color"
            >
              Select Category
            </Text>

            {/* Search Input */}
            <XStack
              bg="$backgroundHover"
              borderRadius={8}
              px="$3.5"
              py="$2.5"
              alignItems="center"
              gap="$2.5"
            >
              <Search
                size={18}
                color="$placeholderColor"
              />
              <Input
                flex={1}
                value={categorySearch}
                onChangeText={setCategorySearch}
                placeholder="Search categories..."
                bg="white"
                borderWidth={0}
                p={0}
                size="$4"
                placeholderTextColor="$placeholderColor"
              />
            </XStack>

            {/* Categories List */}
            <ScrollView
              flex={1}
              showsVerticalScrollIndicator={false}
            >
              <YStack gap="$2">
                {filteredCategories.map((category) => (
                  <Button
                    key={category.public_id}
                    unstyled
                    onPress={() => {
                      updateField('category_id', category.public_id)
                      handleCategorySheetChange(false)
                    }}
                    bg={
                      formData.category_id === category.public_id ? '$primaryBackground' : 'white'
                    }
                    borderRadius={8}
                    p="$3.5"
                    pressStyle={{ opacity: 0.8, bg: '$backgroundHover' }}
                    borderWidth={1}
                    borderColor={
                      formData.category_id === category.public_id ? '$primary' : '$borderColorHover'
                    }
                  >
                    <Text
                      color={formData.category_id === category.public_id ? '$primary' : '$color'}
                      fontWeight={formData.category_id === category.public_id ? '600' : '400'}
                      fontSize={14}
                    >
                      {category.name}
                    </Text>
                  </Button>
                ))}
              </YStack>
            </ScrollView>
          </YStack>
        </Sheet.Frame>
      </Sheet>

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
