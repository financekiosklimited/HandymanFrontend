'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import {
  YStack,
  XStack,
  ScrollView,
  Text,
  Button,
  Input,
  Spinner,
  TextArea,
  Sheet,
  View,
  Image,
  PageHeader,
} from '@my/ui'
import { GradientBackground } from '@my/ui'
import { PAGE_DESCRIPTIONS } from 'app/constants/page-descriptions'
import { useCategories, useCities, useCreateJob } from '@my/api'
import type { Category } from '@my/api'
import type { City } from '@my/api'
import type { CreateJobRequest, CreateJobValidationError, LocalAttachment } from '@my/api'
import { getFileTypeFromMime, ATTACHMENT_LIMITS, isUnsupportedImageFormat } from '@my/api'
import { useRouter } from 'expo-router'
import {
  ChevronDown,
  Plus,
  X,
  ImagePlus,
  AlertCircle,
  Search,
  Video,
  FileText,
  Play,
  Camera,
} from '@tamagui/lucide-icons'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { useToastController } from '@tamagui/toast'
import { showCreateJobOnboardingToast } from 'app/utils/toast-messages'
import { shouldShowOnboarding, markOnboardingSeen } from 'app/utils/onboarding-storage'
import * as ImagePicker from 'expo-image-picker'
import { useEffect } from 'react'

import * as VideoThumbnails from 'expo-video-thumbnails'
import * as ImageManipulator from 'expo-image-manipulator'
import { HTTPError } from 'ky'
import { KeyboardAvoidingView, Platform, TextInput, ActionSheetIOS } from 'react-native'

interface JobTask {
  id: string
  title: string
}

interface FormData {
  title: string
  description: string
  estimated_budget: string
  category_id: string
  city_id: string
  address: string
  postal_code: string
  tasks: JobTask[]
  attachments: LocalAttachment[]
}

// Generate unique ID for local attachments
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Generate and compress video thumbnail to ensure it's under 500KB
async function generateVideoThumbnail(videoUri: string): Promise<string | undefined> {
  try {
    // Generate thumbnail from video
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: 1000,
      quality: 1, // High quality first, we'll compress with ImageManipulator
    })

    // Compress the thumbnail to ensure it's under 500KB
    // Resize to max 720p width and compress with JPEG quality 0.6
    const compressed = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 720 } }], {
      compress: 0.6,
      format: ImageManipulator.SaveFormat.JPEG,
    })

    return compressed.uri
  } catch (error) {
    console.warn('Failed to generate video thumbnail:', error)
    return undefined
  }
}

interface FormErrors {
  [key: string]:
    | string[]
    | { [index: string]: string[] | { non_field_errors?: string[] } }
    | undefined
}

// Get error messages for a field
function getFieldErrors(errors: FormErrors | null, field: string): string[] {
  if (!errors || !errors[field]) return []
  const fieldError = errors[field]
  if (Array.isArray(fieldError)) return fieldError
  return []
}

// Get nested errors for tasks or attachments
function getNestedErrors(errors: FormErrors | null, field: string, index: number): string[] {
  if (!errors || !errors[field]) return []
  const fieldError = errors[field]
  if (typeof fieldError === 'object' && !Array.isArray(fieldError)) {
    const indexError = fieldError[index.toString()]
    if (Array.isArray(indexError)) return indexError
    if (typeof indexError === 'object' && indexError && 'non_field_errors' in indexError) {
      return indexError.non_field_errors || []
    }
  }
  return []
}

// Consistent form field styles
const inputStyles = {
  bg: 'white' as const,
  borderColor: '$borderColorHover' as const,
  borderWidth: 1,
  borderRadius: '$4' as const,
  px: '$4' as const,
  py: '$3' as const,
  minHeight: 52,
}

const labelStyles = {
  fontSize: '$3' as const,
  fontWeight: '600' as const,
  color: '$color' as const,
  mb: '$2' as const,
}

export function AddJobScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const scrollViewRef = useRef<ScrollView>(null)
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: cities, isLoading: citiesLoading } = useCities()
  const createJobMutation = useCreateJob()
  const toast = useToastController()

  // Show create job onboarding toast for first-time users
  useEffect(() => {
    const showOnboarding = async () => {
      const shouldShow = await shouldShowOnboarding('createJob')
      if (!shouldShow) return

      // Delay 1 second then show toast
      setTimeout(() => {
        showCreateJobOnboardingToast(toast)
        markOnboardingSeen('createJob')
      }, 1000)
    }

    showOnboarding()
  }, [toast])

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    estimated_budget: '',
    category_id: '',
    city_id: '',
    address: '',
    postal_code: '',
    tasks: [],
    attachments: [],
  })

  const [errors, setErrors] = useState<FormErrors | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)

  // Sheet states
  const [categorySheetOpen, setCategorySheetOpen] = useState(false)
  const [citySheetOpen, setCitySheetOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  // Search states for sheets
  const [categorySearch, setCategorySearch] = useState('')
  const [citySearch, setCitySearch] = useState('')

  // Get selected category and city names
  const selectedCategory = categories?.find((c) => c.public_id === formData.category_id)
  const selectedCity = cities?.find((c) => c.public_id === formData.city_id)

  // Filtered categories and cities based on search
  const filteredCategories = useMemo(() => {
    if (!categories) return []
    if (!categorySearch.trim()) return categories
    return categories.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
  }, [categories, categorySearch])

  const filteredCities = useMemo(() => {
    if (!cities) return []
    if (!citySearch.trim()) return cities
    const search = citySearch.toLowerCase()
    return cities.filter(
      (c) => c.name.toLowerCase().includes(search) || c.province.toLowerCase().includes(search)
    )
  }, [cities, citySearch])

  // Update form field
  const updateField = useCallback(
    (field: keyof FormData, value: string | JobTask[] | LocalAttachment[]) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      // Clear field error when user types
      if (errors && errors[field]) {
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

  // Add task
  const addTask = useCallback(() => {
    if (!newTaskTitle.trim()) return
    const newTask: JobTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
    }
    updateField('tasks', [...formData.tasks, newTask])
    setNewTaskTitle('')
  }, [newTaskTitle, formData.tasks, updateField])

  // Remove task
  const removeTask = useCallback(
    (taskId: string) => {
      updateField(
        'tasks',
        formData.tasks.filter((t) => t.id !== taskId)
      )
    },
    [formData.tasks, updateField]
  )

  // Sheet state for attachment picker
  const [attachmentPickerOpen, setAttachmentPickerOpen] = useState(false)

  // Pick images from library
  const pickImages = useCallback(async () => {
    const maxCount = ATTACHMENT_LIMITS.job.maxCount
    const remaining = maxCount - formData.attachments.length
    if (remaining <= 0) {
      setGeneralError(`Maximum ${maxCount} attachments allowed`)
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    })

    if (!result.canceled && result.assets) {
      // Filter out unsupported RAW formats
      const supportedAssets = result.assets.filter((asset) => {
        const fileName = asset.fileName || ''
        if (isUnsupportedImageFormat(fileName, asset.mimeType ?? undefined)) {
          return false
        }
        return true
      })

      // Show error if some files were filtered out
      if (supportedAssets.length < result.assets.length) {
        const rejectedCount = result.assets.length - supportedAssets.length
        setGeneralError(`${rejectedCount} image(s) rejected: RAW/DNG formats not supported`)
      }

      if (supportedAssets.length > 0) {
        const newAttachments: LocalAttachment[] = supportedAssets.map((asset) => ({
          id: generateId(),
          file: {
            uri: asset.uri,
            type: asset.mimeType || 'image/jpeg',
            name: asset.fileName || `image_${Date.now()}.jpg`,
          },
          file_type: 'image' as const,
          file_name: asset.fileName || `image_${Date.now()}.jpg`,
          file_size: asset.fileSize || 0,
        }))
        updateField('attachments', [...formData.attachments, ...newAttachments])
      }
    }
    setAttachmentPickerOpen(false)
  }, [formData.attachments, updateField])

  // Take photo with camera
  const takePhoto = useCallback(async () => {
    const maxCount = ATTACHMENT_LIMITS.job.maxCount
    if (formData.attachments.length >= maxCount) {
      setGeneralError(`Maximum ${maxCount} attachments allowed`)
      return
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      setGeneralError('Camera permission is required to take photos')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      const fileName = asset.fileName || ''

      // Check for unsupported RAW formats
      if (isUnsupportedImageFormat(fileName, asset.mimeType ?? undefined)) {
        setGeneralError('RAW/DNG formats are not supported')
        setAttachmentPickerOpen(false)
        return
      }

      const newAttachment: LocalAttachment = {
        id: generateId(),
        file: {
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: asset.fileName || `photo_${Date.now()}.jpg`,
        },
        file_type: 'image',
        file_name: asset.fileName || `photo_${Date.now()}.jpg`,
        file_size: asset.fileSize || 0,
      }
      updateField('attachments', [...formData.attachments, newAttachment])
    }
    setAttachmentPickerOpen(false)
  }, [formData.attachments, updateField])

  // Pick videos from library
  const pickVideos = useCallback(async () => {
    const maxCount = ATTACHMENT_LIMITS.job.maxCount
    const remaining = maxCount - formData.attachments.length
    if (remaining <= 0) {
      setGeneralError(`Maximum ${maxCount} attachments allowed`)
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    })

    if (!result.canceled && result.assets) {
      const newAttachments: LocalAttachment[] = await Promise.all(
        result.assets.map(async (asset) => {
          const thumbnailUri = await generateVideoThumbnail(asset.uri)
          return {
            id: generateId(),
            file: {
              uri: asset.uri,
              type: asset.mimeType || 'video/mp4',
              name: asset.fileName || `video_${Date.now()}.mp4`,
            },
            file_type: 'video' as const,
            file_name: asset.fileName || `video_${Date.now()}.mp4`,
            file_size: asset.fileSize || 0,
            thumbnail_uri: thumbnailUri,
            duration_seconds: asset.duration ? Math.round(asset.duration / 1000) : undefined,
          }
        })
      )
      updateField('attachments', [...formData.attachments, ...newAttachments])
    }
    setAttachmentPickerOpen(false)
  }, [formData.attachments, updateField])

  // Record video with camera
  const recordVideo = useCallback(async () => {
    const maxCount = ATTACHMENT_LIMITS.job.maxCount
    if (formData.attachments.length >= maxCount) {
      setGeneralError(`Maximum ${maxCount} attachments allowed`)
      return
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      setGeneralError('Camera permission is required to record videos')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      quality: 0.8,
      videoMaxDuration: 60,
    })

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      const thumbnailUri = await generateVideoThumbnail(asset.uri)
      const newAttachment: LocalAttachment = {
        id: generateId(),
        file: {
          uri: asset.uri,
          type: asset.mimeType || 'video/mp4',
          name: asset.fileName || `video_${Date.now()}.mp4`,
        },
        file_type: 'video',
        file_name: asset.fileName || `video_${Date.now()}.mp4`,
        file_size: asset.fileSize || 0,
        thumbnail_uri: thumbnailUri,
        duration_seconds: asset.duration ? Math.round(asset.duration / 1000) : undefined,
      }
      updateField('attachments', [...formData.attachments, newAttachment])
    }
    setAttachmentPickerOpen(false)
  }, [formData.attachments, updateField])

  // Remove attachment
  const removeAttachment = useCallback(
    (attachmentId: string) => {
      updateField(
        'attachments',
        formData.attachments.filter((a) => a.id !== attachmentId)
      )
    },
    [formData.attachments, updateField]
  )

  // Show attachment picker (ActionSheet on iOS, Sheet on Android)
  const showAttachmentPicker = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose Images', 'Record Video', 'Choose Videos'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              takePhoto()
              break
            case 2:
              pickImages()
              break
            case 3:
              recordVideo()
              break
            case 4:
              pickVideos()
              break
          }
        }
      )
    } else {
      setAttachmentPickerOpen(true)
    }
  }, [takePhoto, pickImages, recordVideo, pickVideos])

  // Validate form and navigate to preview
  const handleContinue = useCallback(async () => {
    setErrors(null)
    setGeneralError(null)

    // Client-side validation
    const clientErrors: FormErrors = {}

    if (!formData.title.trim()) {
      clientErrors.title = ['Job title is required']
    }

    if (!formData.estimated_budget.trim()) {
      clientErrors.estimated_budget = ['Estimated budget is required']
    } else if (Number.isNaN(Number.parseFloat(formData.estimated_budget))) {
      clientErrors.estimated_budget = ['Please enter a valid number']
    }

    if (!formData.category_id) {
      clientErrors.category_id = ['Please select a category']
    }

    if (!formData.city_id) {
      clientErrors.city_id = ['Please select a city']
    }

    if (!formData.address.trim()) {
      clientErrors.address = ['Address is required']
    }

    if (!formData.description.trim()) {
      clientErrors.description = ['Description is required']
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      return
    }

    // Navigate to preview with form data
    router.push({
      pathname: '/(homeowner)/jobs/add/preview',
      params: {
        formData: JSON.stringify({
          ...formData,
          estimated_budget: Number.parseFloat(formData.estimated_budget),
          categoryName: selectedCategory?.name,
          cityName: selectedCity?.name,
          cityProvince: selectedCity?.province,
        }),
      },
    })
  }, [formData, selectedCategory, selectedCity, router])

  // Reset search when sheet opens/closes
  const handleCategorySheetChange = (open: boolean) => {
    setCategorySheetOpen(open)
    if (!open) setCategorySearch('')
  }

  const handleCitySheetChange = (open: boolean) => {
    setCitySheetOpen(open)
    if (!open) setCitySearch('')
  }

  // Form field label component
  const FieldLabel = ({ label, required = false }: { label: string; required?: boolean }) => (
    <XStack
      gap="$1"
      alignItems="center"
      mb="$2"
    >
      <Text
        fontSize="$3"
        fontWeight="600"
        color="$color"
      >
        {label}
      </Text>
      {required && (
        <Text
          color="$primary"
          fontWeight="bold"
        >
          *
        </Text>
      )}
    </XStack>
  )

  // Error text component
  const ErrorText = ({ errors: fieldErrors }: { errors: string[] }) => (
    <>
      {fieldErrors.map((err, i) => (
        <Text
          key={i}
          color="$error"
          fontSize="$2"
          mt="$1"
        >
          {err}
        </Text>
      ))}
    </>
  )

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
            title="Create Job"
            description={PAGE_DESCRIPTIONS['create-job']}
          />

          {/* Content */}
          <ScrollView
            ref={scrollViewRef}
            flex={1}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <YStack
              px="$4"
              gap="$6"
            >
              {/* Title Section */}
              <YStack gap="$1">
                <Text
                  fontSize={28}
                  fontWeight="bold"
                  color="$color"
                >
                  Create job listing
                </Text>
                <Text
                  fontSize="$4"
                  color="$colorSubtle"
                >
                  Tell us about the job you need help with
                </Text>
              </YStack>

              {/* General Error */}
              {generalError && (
                <XStack
                  bg="$errorBackground"
                  p="$3"
                  borderRadius="$4"
                  gap="$2"
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
                    fontSize="$3"
                    flex={1}
                  >
                    {generalError}
                  </Text>
                </XStack>
              )}

              {/* Form Fields */}
              <YStack gap="$5">
                {/* Job Title */}
                <YStack>
                  <FieldLabel
                    label="Job title"
                    required
                  />
                  <Input
                    value={formData.title}
                    onChangeText={(text) => updateField('title', text)}
                    placeholder="e.g. Fixing AC"
                    {...inputStyles}
                    borderColor={
                      getFieldErrors(errors, 'title').length > 0 ? '$error' : '$borderColorHover'
                    }
                    placeholderTextColor="$placeholderColor"
                    focusStyle={{ borderColor: '$primary', borderWidth: 1.5 }}
                  />
                  <ErrorText errors={getFieldErrors(errors, 'title')} />
                </YStack>

                {/* Estimated Budget */}
                <YStack>
                  <FieldLabel
                    label="Estimated budget"
                    required
                  />
                  <XStack
                    {...inputStyles}
                    borderColor={
                      getFieldErrors(errors, 'estimated_budget').length > 0
                        ? '$error'
                        : '$borderColorHover'
                    }
                    alignItems="center"
                    gap="$2"
                  >
                    <Text
                      color="$colorSubtle"
                      fontSize="$4"
                    >
                      $
                    </Text>
                    <Input
                      value={formData.estimated_budget}
                      onChangeText={(text) => updateField('estimated_budget', text)}
                      placeholder="0.00"
                      bg="transparent"
                      borderWidth={0}
                      flex={1}
                      px={0}
                      py={0}
                      minHeight="auto"
                      keyboardType="numeric"
                      placeholderTextColor="$placeholderColor"
                      focusStyle={{ borderColor: '$primary', borderWidth: 1.5 }}
                    />
                  </XStack>
                  <ErrorText errors={getFieldErrors(errors, 'estimated_budget')} />
                </YStack>

                {/* Category */}
                <YStack>
                  <FieldLabel
                    label="Category"
                    required
                  />
                  <Button
                    unstyled
                    onPress={() => setCategorySheetOpen(true)}
                    {...inputStyles}
                    borderColor={
                      getFieldErrors(errors, 'category_id').length > 0
                        ? '$error'
                        : '$borderColorHover'
                    }
                  >
                    <XStack
                      alignItems="center"
                      justifyContent="space-between"
                      width="100%"
                    >
                      <Text color={selectedCategory ? '$color' : '$placeholderColor'}>
                        {selectedCategory?.name || 'Select a category'}
                      </Text>
                      <ChevronDown
                        size={20}
                        color="$placeholderColor"
                      />
                    </XStack>
                  </Button>
                  <ErrorText errors={getFieldErrors(errors, 'category_id')} />
                </YStack>

                {/* City */}
                <YStack>
                  <FieldLabel
                    label="City"
                    required
                  />
                  <Button
                    unstyled
                    onPress={() => setCitySheetOpen(true)}
                    {...inputStyles}
                    borderColor={
                      getFieldErrors(errors, 'city_id').length > 0 ? '$error' : '$borderColorHover'
                    }
                  >
                    <XStack
                      alignItems="center"
                      justifyContent="space-between"
                      width="100%"
                    >
                      <Text color={selectedCity ? '$color' : '$placeholderColor'}>
                        {selectedCity
                          ? `${selectedCity.name}, ${selectedCity.province}`
                          : 'Select a city'}
                      </Text>
                      <ChevronDown
                        size={20}
                        color="$placeholderColor"
                      />
                    </XStack>
                  </Button>
                  <ErrorText errors={getFieldErrors(errors, 'city_id')} />
                </YStack>

                {/* Address */}
                <YStack>
                  <FieldLabel
                    label="Address"
                    required
                  />
                  <Input
                    value={formData.address}
                    onChangeText={(text) => updateField('address', text)}
                    placeholder="Enter your address"
                    {...inputStyles}
                    borderColor={
                      getFieldErrors(errors, 'address').length > 0 ? '$error' : '$borderColorHover'
                    }
                    placeholderTextColor="$placeholderColor"
                    focusStyle={{ borderColor: '$primary', borderWidth: 1.5 }}
                  />
                  <ErrorText errors={getFieldErrors(errors, 'address')} />
                </YStack>

                {/* Postal Code */}
                <YStack>
                  <FieldLabel label="Postal code" />
                  <Input
                    value={formData.postal_code}
                    onChangeText={(text) => updateField('postal_code', text)}
                    placeholder="Enter postal code (optional)"
                    {...inputStyles}
                    borderColor="$borderColorHover"
                    placeholderTextColor="$placeholderColor"
                    focusStyle={{ borderColor: '$primary', borderWidth: 1.5 }}
                  />
                </YStack>

                {/* Description */}
                <YStack>
                  <FieldLabel
                    label="Description"
                    required
                  />
                  <YStack position="relative">
                    <TextArea
                      value={formData.description}
                      onChangeText={(text) => updateField('description', text.slice(0, 500))}
                      placeholder="Describe your job in detail..."
                      {...inputStyles}
                      borderColor={
                        getFieldErrors(errors, 'description').length > 0
                          ? '$error'
                          : '$borderColorHover'
                      }
                      minHeight={120}
                      placeholderTextColor="$placeholderColor"
                      textAlignVertical="top"
                      focusStyle={{ borderColor: '$primary', borderWidth: 1.5 }}
                    />
                    <Text
                      position="absolute"
                      bottom="$2"
                      right="$3"
                      fontSize="$1"
                      color="$colorMuted"
                    >
                      {formData.description.length}/500
                    </Text>
                  </YStack>
                  <ErrorText errors={getFieldErrors(errors, 'description')} />
                </YStack>

                {/* Tasks */}
                <YStack>
                  <FieldLabel label="Tasks (to-do list)" />

                  {/* Existing tasks */}
                  {formData.tasks.length > 0 && (
                    <YStack
                      gap="$2"
                      mb="$2"
                    >
                      {formData.tasks.map((task, index) => (
                        <XStack
                          key={task.id}
                          bg="white"
                          borderColor="$borderColorHover"
                          borderWidth={1}
                          borderRadius="$4"
                          px="$4"
                          py="$3"
                          alignItems="center"
                          gap="$2"
                        >
                          <View
                            width={24}
                            height={24}
                            borderRadius="$full"
                            bg="$primary"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text
                              color="white"
                              fontSize="$2"
                              fontWeight="600"
                            >
                              {index + 1}
                            </Text>
                          </View>
                          <Text
                            flex={1}
                            color="$color"
                            numberOfLines={1}
                          >
                            {task.title}
                          </Text>
                          <Button
                            unstyled
                            onPress={() => removeTask(task.id)}
                            p="$1"
                            hitSlop={8}
                            pressStyle={{ opacity: 0.7 }}
                          >
                            <X
                              size={18}
                              color="$placeholderColor"
                            />
                          </Button>
                        </XStack>
                      ))}
                      {formData.tasks.map((_, index) =>
                        getNestedErrors(errors, 'tasks', index).map((err, i) => (
                          <Text
                            key={i}
                            color="$error"
                            fontSize="$2"
                          >
                            Task {index + 1}: {err}
                          </Text>
                        ))
                      )}
                    </YStack>
                  )}

                  {/* Add new task */}
                  <XStack
                    {...inputStyles}
                    borderColor="$borderColor"
                    alignItems="center"
                    focusWithinStyle={{
                      borderColor: '$primary',
                      borderWidth: 1.5,
                    }}
                  >
                    <Input
                      value={newTaskTitle}
                      onChangeText={setNewTaskTitle}
                      placeholder="Add a task item"
                      bg="transparent"
                      borderWidth={0}
                      flex={1}
                      px={0}
                      py={0}
                      minHeight="auto"
                      placeholderTextColor="$placeholderColor"
                      onSubmitEditing={addTask}
                      returnKeyType="done"
                    />
                    <Button
                      unstyled
                      onPress={addTask}
                      bg={newTaskTitle.trim() ? '$primary' : '$borderColorHover'}
                      borderRadius="$3"
                      p="$2"
                      disabled={!newTaskTitle.trim()}
                      pressStyle={{ opacity: 0.8 }}
                    >
                      <Plus
                        size={18}
                        color="white"
                      />
                    </Button>
                  </XStack>
                </YStack>

                {/* Attachment Upload */}
                <YStack>
                  <FieldLabel
                    label={`Attachments (${formData.attachments.length}/${ATTACHMENT_LIMITS.job.maxCount})`}
                  />
                  <Text
                    fontSize="$2"
                    color="$colorSubtle"
                    mb="$2"
                  >
                    Add images, videos, or documents
                  </Text>

                  {/* Attachment grid */}
                  <XStack
                    flexWrap="wrap"
                    gap="$3"
                  >
                    {formData.attachments.map((attachment) => (
                      <View
                        key={attachment.id}
                        width={80}
                        height={80}
                        borderRadius="$4"
                        overflow="hidden"
                        position="relative"
                        bg="$backgroundMuted"
                      >
                        {/* Image */}
                        {attachment.file_type === 'image' && (
                          <Image
                            source={{ uri: attachment.file.uri }}
                            width="100%"
                            height="100%"
                            resizeMode="cover"
                          />
                        )}

                        {/* Video thumbnail */}
                        {attachment.file_type === 'video' && (
                          <>
                            {attachment.thumbnail_uri ? (
                              <Image
                                source={{ uri: attachment.thumbnail_uri }}
                                width="100%"
                                height="100%"
                                resizeMode="cover"
                              />
                            ) : (
                              <View
                                width="100%"
                                height="100%"
                                bg="$borderColor"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Video
                                  size={24}
                                  color="$colorMuted"
                                />
                              </View>
                            )}
                            {/* Play icon overlay */}
                            <View
                              position="absolute"
                              top={0}
                              left={0}
                              right={0}
                              bottom={0}
                              alignItems="center"
                              justifyContent="center"
                            >
                              <View
                                bg="rgba(0,0,0,0.5)"
                                borderRadius="$full"
                                p="$1"
                              >
                                <Play
                                  size={16}
                                  color="white"
                                  fill="white"
                                />
                              </View>
                            </View>
                            {/* Duration badge */}
                            {attachment.duration_seconds !== undefined && (
                              <View
                                position="absolute"
                                bottom={4}
                                right={4}
                                bg="rgba(0,0,0,0.7)"
                                px="$1"
                                borderRadius="$1"
                              >
                                <Text
                                  fontSize={9}
                                  color="white"
                                >
                                  {Math.floor(attachment.duration_seconds / 60)}:
                                  {(attachment.duration_seconds % 60).toString().padStart(2, '0')}
                                </Text>
                              </View>
                            )}
                          </>
                        )}

                        {/* Document */}
                        {attachment.file_type === 'document' && (
                          <View
                            width="100%"
                            height="100%"
                            bg="$borderColor"
                            alignItems="center"
                            justifyContent="center"
                            p="$1"
                          >
                            <FileText
                              size={24}
                              color="$primary"
                            />
                            <Text
                              fontSize={8}
                              color="$colorSubtle"
                              numberOfLines={2}
                              textAlign="center"
                              mt="$1"
                            >
                              {attachment.file_name.length > 12
                                ? `${attachment.file_name.slice(0, 10)}...`
                                : attachment.file_name}
                            </Text>
                          </View>
                        )}

                        {/* Remove button */}
                        <Button
                          unstyled
                          onPress={() => removeAttachment(attachment.id)}
                          position="absolute"
                          top={4}
                          right={4}
                          bg="rgba(0,0,0,0.6)"
                          borderRadius="$full"
                          p={4}
                          pressStyle={{ opacity: 0.8 }}
                        >
                          <X
                            size={12}
                            color="white"
                          />
                        </Button>

                        {/* Error overlay */}
                        {getNestedErrors(
                          errors,
                          'attachments',
                          formData.attachments.indexOf(attachment)
                        ).map((err, i) => (
                          <View
                            key={i}
                            position="absolute"
                            bottom={0}
                            left={0}
                            right={0}
                            bg="$error"
                            p={2}
                          >
                            <Text
                              fontSize={8}
                              color="white"
                              numberOfLines={2}
                            >
                              {err}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ))}

                    {/* Add attachment button */}
                    {formData.attachments.length < ATTACHMENT_LIMITS.job.maxCount && (
                      <Button
                        unstyled
                        onPress={showAttachmentPicker}
                        width={80}
                        height={80}
                        bg="white"
                        borderColor="$borderColor"
                        borderWidth={1}
                        borderRadius="$4"
                        borderStyle="dashed"
                        alignItems="center"
                        justifyContent="center"
                        pressStyle={{ opacity: 0.7, bg: '$backgroundMuted' }}
                      >
                        <Plus
                          size={24}
                          color="$colorMuted"
                        />
                      </Button>
                    )}
                  </XStack>
                  <ErrorText errors={getFieldErrors(errors, 'attachments')} />
                </YStack>
              </YStack>
            </YStack>
          </ScrollView>

          {/* Bottom Button */}
          <YStack
            px="$4"
            pb={insets.bottom + 16}
            pt="$3"
            borderTopWidth={1}
            borderColor="$borderColor"
            bg="$background"
          >
            <Button
              bg="$primary"
              borderRadius="$4"
              py="$3"
              minHeight={54}
              onPress={handleContinue}
              disabled={createJobMutation.isPending}
              pressStyle={{ opacity: 0.9 }}
            >
              <Text
                color="white"
                fontSize="$4"
                fontWeight="600"
              >
                Continue to Preview
              </Text>
            </Button>
          </YStack>

          {/* Category Sheet */}
          <Sheet
            open={categorySheetOpen}
            onOpenChange={handleCategorySheetChange}
            snapPoints={[60]}
            dismissOnSnapToBottom
            modal
          >
            <Sheet.Overlay
              animation="100ms"
              opacity={0.5}
            />
            <Sheet.Frame
              borderTopLeftRadius="$6"
              borderTopRightRadius="$6"
            >
              <Sheet.Handle
                bg="$colorMuted"
                mt="$3"
              />
              <YStack
                p="$4"
                gap="$4"
                flex={1}
              >
                <Text
                  fontSize="$6"
                  fontWeight="bold"
                  color="$color"
                >
                  Select Category
                </Text>

                {/* Search Input */}
                <XStack
                  bg="white"
                  borderRadius="$4"
                  px="$3"
                  py="$2"
                  alignItems="center"
                  gap="$2"
                  borderWidth={1}
                  borderColor="$borderColor"
                  focusWithinStyle={{ borderColor: '$primary', borderWidth: 1.5 }}
                >
                  <Search
                    size={20}
                    color="$colorMuted"
                  />
                  <Input
                    value={categorySearch}
                    onChangeText={setCategorySearch}
                    placeholder="Search categories..."
                    bg="transparent"
                    borderWidth={0}
                    flex={1}
                    px={0}
                    py="$1"
                    placeholderTextColor="$placeholderColor"
                    autoCapitalize="none"
                  />
                  {categorySearch.length > 0 && (
                    <Button
                      unstyled
                      onPress={() => setCategorySearch('')}
                      p="$1"
                      pressStyle={{ opacity: 0.7 }}
                    >
                      <X
                        size={16}
                        color="$colorMuted"
                      />
                    </Button>
                  )}
                </XStack>

                <ScrollView
                  flex={1}
                  showsVerticalScrollIndicator={false}
                >
                  <YStack
                    gap="$2"
                    pb="$4"
                  >
                    {filteredCategories.length === 0 ? (
                      <YStack
                        py="$6"
                        alignItems="center"
                      >
                        <Text
                          color="$colorMuted"
                          fontSize="$3"
                        >
                          No categories found
                        </Text>
                      </YStack>
                    ) : (
                      filteredCategories.map((category) => {
                        const isSelected = formData.category_id === category.public_id
                        return (
                          <Button
                            key={category.public_id}
                            unstyled
                            onPress={() => {
                              updateField('category_id', category.public_id)
                              handleCategorySheetChange(false)
                            }}
                            bg={isSelected ? '$primary' : 'white'}
                            borderColor={isSelected ? '$primary' : '$borderColorHover'}
                            borderWidth={1}
                            borderRadius="$4"
                            px="$4"
                            py="$3"
                            pressStyle={{
                              opacity: 0.8,
                              bg: isSelected ? '$primary' : '$backgroundMuted',
                            }}
                          >
                            <Text
                              color={isSelected ? 'white' : '$color'}
                              fontWeight={isSelected ? '600' : '400'}
                            >
                              {category.name}
                            </Text>
                          </Button>
                        )
                      })
                    )}
                  </YStack>
                </ScrollView>
              </YStack>
            </Sheet.Frame>
          </Sheet>

          {/* City Sheet */}
          <Sheet
            open={citySheetOpen}
            onOpenChange={handleCitySheetChange}
            snapPoints={[60]}
            dismissOnSnapToBottom
            modal
          >
            <Sheet.Overlay
              animation="100ms"
              opacity={0.5}
            />
            <Sheet.Frame
              borderTopLeftRadius="$6"
              borderTopRightRadius="$6"
            >
              <Sheet.Handle
                bg="$colorMuted"
                mt="$3"
              />
              <YStack
                p="$4"
                gap="$4"
                flex={1}
              >
                <Text
                  fontSize="$6"
                  fontWeight="bold"
                  color="$color"
                >
                  Select City
                </Text>

                {/* Search Input */}
                <XStack
                  bg="white"
                  borderRadius="$4"
                  px="$3"
                  py="$2"
                  alignItems="center"
                  gap="$2"
                  borderWidth={1}
                  borderColor="$borderColor"
                  focusWithinStyle={{ borderColor: '$primary', borderWidth: 1.5 }}
                >
                  <Search
                    size={20}
                    color="$colorMuted"
                  />
                  <Input
                    value={citySearch}
                    onChangeText={setCitySearch}
                    placeholder="Search cities..."
                    bg="transparent"
                    borderWidth={0}
                    flex={1}
                    px={0}
                    py="$1"
                    placeholderTextColor="$placeholderColor"
                    autoCapitalize="none"
                  />
                  {citySearch.length > 0 && (
                    <Button
                      unstyled
                      onPress={() => setCitySearch('')}
                      p="$1"
                      pressStyle={{ opacity: 0.7 }}
                    >
                      <X
                        size={16}
                        color="$colorMuted"
                      />
                    </Button>
                  )}
                </XStack>

                <ScrollView
                  flex={1}
                  showsVerticalScrollIndicator={false}
                >
                  <YStack
                    gap="$2"
                    pb="$4"
                  >
                    {filteredCities.length === 0 ? (
                      <YStack
                        py="$6"
                        alignItems="center"
                      >
                        <Text
                          color="$colorMuted"
                          fontSize="$3"
                        >
                          No cities found
                        </Text>
                      </YStack>
                    ) : (
                      filteredCities.map((city) => {
                        const isSelected = formData.city_id === city.public_id
                        return (
                          <Button
                            key={city.public_id}
                            unstyled
                            onPress={() => {
                              updateField('city_id', city.public_id)
                              handleCitySheetChange(false)
                            }}
                            bg={isSelected ? '$primary' : 'white'}
                            borderColor={isSelected ? '$primary' : '$borderColorHover'}
                            borderWidth={1}
                            borderRadius="$4"
                            px="$4"
                            py="$3"
                            pressStyle={{
                              opacity: 0.8,
                              bg: isSelected ? '$primary' : '$backgroundMuted',
                            }}
                          >
                            <Text
                              color={isSelected ? 'white' : '$color'}
                              fontWeight={isSelected ? '600' : '400'}
                            >
                              {city.name}, {city.province}
                            </Text>
                          </Button>
                        )
                      })
                    )}
                  </YStack>
                </ScrollView>
              </YStack>
            </Sheet.Frame>
          </Sheet>

          {/* Attachment Picker Sheet (Android only) */}
          {Platform.OS !== 'ios' && (
            <Sheet
              open={attachmentPickerOpen}
              onOpenChange={setAttachmentPickerOpen}
              snapPointsMode="fit"
              dismissOnSnapToBottom
              modal
            >
              <Sheet.Overlay
                animation="100ms"
                opacity={0.5}
              />
              <Sheet.Frame
                borderTopLeftRadius="$6"
                borderTopRightRadius="$6"
                pb="$6"
              >
                <Sheet.Handle
                  bg="$colorMuted"
                  mt="$3"
                />
                <YStack
                  p="$4"
                  gap="$3"
                >
                  <Text
                    fontSize="$5"
                    fontWeight="bold"
                    color="$color"
                    mb="$2"
                  >
                    Add Attachment
                  </Text>

                  <Button
                    unstyled
                    onPress={takePhoto}
                    bg="white"
                    borderColor="$borderColorHover"
                    borderWidth={1}
                    borderRadius="$4"
                    px="$4"
                    py="$3"
                    pressStyle={{ opacity: 0.8, bg: '$backgroundMuted' }}
                  >
                    <XStack
                      alignItems="center"
                      gap="$3"
                    >
                      <Camera
                        size={22}
                        color="$primary"
                      />
                      <Text
                        fontSize="$4"
                        color="$color"
                      >
                        Take Photo
                      </Text>
                    </XStack>
                  </Button>

                  <Button
                    unstyled
                    onPress={pickImages}
                    bg="white"
                    borderColor="$borderColorHover"
                    borderWidth={1}
                    borderRadius="$4"
                    px="$4"
                    py="$3"
                    pressStyle={{ opacity: 0.8, bg: '$backgroundMuted' }}
                  >
                    <XStack
                      alignItems="center"
                      gap="$3"
                    >
                      <ImagePlus
                        size={22}
                        color="$primary"
                      />
                      <Text
                        fontSize="$4"
                        color="$color"
                      >
                        Choose Images
                      </Text>
                    </XStack>
                  </Button>

                  <Button
                    unstyled
                    onPress={recordVideo}
                    bg="white"
                    borderColor="$borderColorHover"
                    borderWidth={1}
                    borderRadius="$4"
                    px="$4"
                    py="$3"
                    pressStyle={{ opacity: 0.8, bg: '$backgroundMuted' }}
                  >
                    <XStack
                      alignItems="center"
                      gap="$3"
                    >
                      <Video
                        size={22}
                        color="$primary"
                      />
                      <Text
                        fontSize="$4"
                        color="$color"
                      >
                        Record Video
                      </Text>
                    </XStack>
                  </Button>

                  <Button
                    unstyled
                    onPress={pickVideos}
                    bg="white"
                    borderColor="$borderColorHover"
                    borderWidth={1}
                    borderRadius="$4"
                    px="$4"
                    py="$3"
                    pressStyle={{ opacity: 0.8, bg: '$backgroundMuted' }}
                  >
                    <XStack
                      alignItems="center"
                      gap="$3"
                    >
                      <Video
                        size={22}
                        color="$primary"
                      />
                      <Text
                        fontSize="$4"
                        color="$color"
                      >
                        Choose Videos
                      </Text>
                    </XStack>
                  </Button>
                </YStack>
              </Sheet.Frame>
            </Sheet>
          )}
        </YStack>
      </KeyboardAvoidingView>
    </GradientBackground>
  )
}
