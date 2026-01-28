'use client'

import { useState, useCallback } from 'react'
import {
  YStack,
  XStack,
  ScrollView,
  Text,
  Button,
  Input,
  Spinner,
  TextArea,
  View,
  Image,
  Sheet,
} from '@my/ui'
import { GradientBackground } from '@my/ui'
import {
  useHandymanJobDetail,
  useApplyForJob,
  formatErrorMessage,
  ATTACHMENT_LIMITS,
  isUnsupportedImageFormat,
} from '@my/api'
import type { LocalAttachment, AttachmentUpload } from '@my/api'
import { useRouter } from 'expo-router'
import {
  ArrowLeft,
  Plus,
  X,
  Clock,
  DollarSign,
  Package,
  FileText,
  Paperclip,
  AlertCircle,
  Send,
  Briefcase,
  Camera,
  ImagePlus,
  Video,
  File,
  Play,
} from '@tamagui/lucide-icons'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import * as VideoThumbnails from 'expo-video-thumbnails'
import * as ImageManipulator from 'expo-image-manipulator'
import { useToastController } from '@tamagui/toast'
import { KeyboardAvoidingView, Platform, ActionSheetIOS, Pressable } from 'react-native'

interface Material {
  id: string
  name: string
  price: string
  description: string
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

interface FormData {
  predicted_hours: string
  estimated_total_price: string
  negotiation_reasoning: string
  materials: Material[]
  attachments: LocalAttachment[]
}

interface ApplyFormScreenProps {
  jobId: string
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

export function ApplyFormScreen({ jobId }: ApplyFormScreenProps) {
  const router = useRouter()
  const insets = useSafeArea()
  const toast = useToastController()
  const { data: job, isLoading: jobLoading } = useHandymanJobDetail(jobId)
  const applyMutation = useApplyForJob()

  const [formData, setFormData] = useState<FormData>({
    predicted_hours: '',
    estimated_total_price: '',
    negotiation_reasoning: '',
    materials: [],
    attachments: [],
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachmentPickerOpen, setAttachmentPickerOpen] = useState(false)

  // New material form
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    price: '',
    description: '',
  })

  // Update form field
  const updateField = useCallback(
    (field: keyof FormData, value: string | Material[] | LocalAttachment[]) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    },
    [errors]
  )

  // Add material
  const addMaterial = useCallback(() => {
    if (!newMaterial.name.trim() || !newMaterial.price.trim()) return

    const material: Material = {
      id: Date.now().toString(),
      name: newMaterial.name.trim(),
      price: newMaterial.price,
      description: newMaterial.description.trim(),
    }

    updateField('materials', [...formData.materials, material])
    setNewMaterial({ name: '', price: '', description: '' })
  }, [newMaterial, formData.materials, updateField])

  // Remove material
  const removeMaterial = useCallback(
    (id: string) => {
      updateField(
        'materials',
        formData.materials.filter((m) => m.id !== id)
      )
    },
    [formData.materials, updateField]
  )

  // Attachment limits
  const maxAttachments = ATTACHMENT_LIMITS.jobApplication.maxCount
  const totalAttachments = formData.attachments.length

  // Pick images from library
  const pickImages = useCallback(async () => {
    const remaining = maxAttachments - totalAttachments
    if (remaining <= 0) return

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

      if (supportedAssets.length > 0) {
        const attachments: LocalAttachment[] = supportedAssets.map((asset) => ({
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
        setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, ...attachments] }))
      }
    }
    setAttachmentPickerOpen(false)
  }, [totalAttachments, maxAttachments])

  // Take photo with camera
  const takePhoto = useCallback(async () => {
    if (totalAttachments >= maxAttachments) return

    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) return

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      const fileName = asset.fileName || ''

      // Check for unsupported RAW formats
      if (isUnsupportedImageFormat(fileName, asset.mimeType ?? undefined)) {
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
      setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, newAttachment] }))
    }
    setAttachmentPickerOpen(false)
  }, [totalAttachments, maxAttachments])

  // Pick videos from library
  const pickVideos = useCallback(async () => {
    const remaining = maxAttachments - totalAttachments
    if (remaining <= 0) return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    })

    if (!result.canceled && result.assets) {
      const attachments: LocalAttachment[] = await Promise.all(
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
      setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, ...attachments] }))
    }
    setAttachmentPickerOpen(false)
  }, [totalAttachments, maxAttachments])

  // Record video with camera
  const recordVideo = useCallback(async () => {
    if (totalAttachments >= maxAttachments) return

    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) return

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
      setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, newAttachment] }))
    }
    setAttachmentPickerOpen(false)
  }, [totalAttachments, maxAttachments])

  // Pick documents
  const pickDocuments = useCallback(async () => {
    const remaining = maxAttachments - totalAttachments
    if (remaining <= 0) return

    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
      ],
      multiple: true,
    })

    if (!result.canceled && result.assets) {
      const attachments: LocalAttachment[] = result.assets.slice(0, remaining).map((asset) => ({
        id: generateId(),
        file: {
          uri: asset.uri,
          type: asset.mimeType || 'application/octet-stream',
          name: asset.name,
        },
        file_type: 'document' as const,
        file_name: asset.name,
        file_size: asset.size || 0,
      }))
      setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, ...attachments] }))
    }
    setAttachmentPickerOpen(false)
  }, [totalAttachments, maxAttachments])

  // Remove attachment
  const removeAttachment = useCallback((id: string) => {
    setFormData((prev) => ({ ...prev, attachments: prev.attachments.filter((a) => a.id !== id) }))
  }, [])

  // Show attachment picker (ActionSheet on iOS, Sheet on Android)
  const showAttachmentPicker = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            'Cancel',
            'Take Photo',
            'Choose Images',
            'Record Video',
            'Choose Videos',
            'Choose Documents',
          ],
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
            case 5:
              pickDocuments()
              break
          }
        }
      )
    } else {
      setAttachmentPickerOpen(true)
    }
  }, [takePhoto, pickImages, recordVideo, pickVideos, pickDocuments])

  // Validate and submit
  const handleSubmit = useCallback(async () => {
    const validationErrors: { [key: string]: string } = {}

    if (!formData.predicted_hours.trim()) {
      validationErrors.predicted_hours = 'Predicted hours is required'
    } else if (
      Number.isNaN(Number.parseFloat(formData.predicted_hours)) ||
      Number.parseFloat(formData.predicted_hours) <= 0
    ) {
      validationErrors.predicted_hours = 'Please enter a valid number greater than 0'
    }

    if (!formData.estimated_total_price.trim()) {
      validationErrors.estimated_total_price = 'Estimated total price is required'
    } else if (
      Number.isNaN(Number.parseFloat(formData.estimated_total_price)) ||
      Number.parseFloat(formData.estimated_total_price) <= 0
    ) {
      validationErrors.estimated_total_price = 'Please enter a valid price greater than 0'
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      // Convert LocalAttachment[] to AttachmentUpload[]
      const attachments: AttachmentUpload[] = formData.attachments.map((attachment) => {
        const upload: AttachmentUpload = {
          file: attachment.file,
        }

        // For videos, include thumbnail and duration
        if (attachment.file_type === 'video') {
          if (attachment.thumbnail_uri) {
            upload.thumbnail = {
              uri: attachment.thumbnail_uri,
              type: 'image/jpeg',
              name: `${attachment.file_name}_thumb.jpg`,
            }
          }
          if (attachment.duration_seconds !== undefined) {
            upload.duration_seconds = attachment.duration_seconds
          }
        }

        return upload
      })

      // Prepare materials
      const materials = formData.materials.map((m) => ({
        name: m.name,
        price: Number.parseFloat(m.price),
        description: m.description || undefined,
      }))

      await applyMutation.mutateAsync({
        job_id: jobId,
        predicted_hours: Number.parseFloat(formData.predicted_hours),
        estimated_total_price: Number.parseFloat(formData.estimated_total_price),
        negotiation_reasoning: formData.negotiation_reasoning || undefined,
        materials: materials.length > 0 ? materials : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      })

      toast.show('Application Submitted!', {
        message: 'Your proposal has been sent to the homeowner.',
        duration: 3000,
        native: false,
        customData: { variant: 'success' },
      })

      // Navigate back to jobs or application list
      router.replace('/(handyman)/my-jobs')
    } catch (error: unknown) {
      toast.show('Submission Failed', {
        message: formatErrorMessage(error),
        duration: 4000,
        native: false,
        customData: { variant: 'error' },
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, jobId, applyMutation, router, toast])

  // Loading state
  if (jobLoading) {
    return (
      <GradientBackground>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          gap="$md"
        >
          <Spinner
            size="large"
            color="$primary"
          />
          <Text
            color="$colorSubtle"
            fontSize="$4"
          >
            Loading job details...
          </Text>
        </YStack>
      </GradientBackground>
    )
  }

  // Error state
  if (!job) {
    return (
      <GradientBackground>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          px="$xl"
          gap="$md"
        >
          <YStack
            width={64}
            height={64}
            borderRadius="$full"
            bg="rgba(255,59,48,0.1)"
            alignItems="center"
            justifyContent="center"
          >
            <Briefcase
              size={28}
              color="$error"
            />
          </YStack>
          <Text
            color="$color"
            fontSize="$5"
            fontWeight="600"
          >
            Job Not Found
          </Text>
          <Button
            mt="$sm"
            onPress={() => router.back()}
            bg="$primary"
            color="white"
            borderRadius="$lg"
            px="$xl"
          >
            Go Back
          </Button>
        </YStack>
      </GradientBackground>
    )
  }

  // Form field label component
  const FieldLabel = ({
    label,
    required = false,
    icon: Icon,
  }: { label: string; required?: boolean; icon?: any }) => (
    <XStack
      gap="$2"
      alignItems="center"
      mb="$2"
    >
      {Icon && (
        <Icon
          size={16}
          color="$primary"
        />
      )}
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
  const ErrorText = ({ error }: { error?: string }) =>
    error ? (
      <Text
        color="$error"
        fontSize="$2"
        mt="$1"
      >
        {error}
      </Text>
    ) : null

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
            px="$4"
            py="$3"
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
                size={24}
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
              Submit Proposal
            </Text>
            <View width={38} />
          </XStack>

          {/* Content */}
          <ScrollView
            flex={1}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            <YStack
              px="$4"
              gap="$6"
            >
              {/* Job Preview Card */}
              <YStack
                bg="rgba(12,154,92,0.08)"
                borderRadius={16}
                p="$md"
                borderWidth={1}
                borderColor="$primary"
                gap="$sm"
              >
                <Text
                  fontSize="$2"
                  fontWeight="600"
                  color="$primary"
                  textTransform="uppercase"
                >
                  Applying For
                </Text>
                <Text
                  fontSize="$5"
                  fontWeight="bold"
                  color="$color"
                >
                  {job.title}
                </Text>
                {job.estimated_budget && (
                  <XStack
                    alignItems="center"
                    gap="$xs"
                  >
                    <DollarSign
                      size={14}
                      color="$colorSubtle"
                    />
                    <Text
                      fontSize="$3"
                      color="$colorSubtle"
                    >
                      Budget: ${job.estimated_budget}
                    </Text>
                  </XStack>
                )}
              </YStack>

              {/* Title Section */}
              <YStack gap="$1">
                <Text
                  fontSize={28}
                  fontWeight="bold"
                  color="$color"
                >
                  Your Proposal
                </Text>
                <Text
                  fontSize="$4"
                  color="$colorSubtle"
                >
                  Provide your estimated hours, price, and materials
                </Text>
              </YStack>

              {/* Form Fields */}
              <YStack gap="$5">
                {/* Predicted Hours */}
                <YStack>
                  <FieldLabel
                    label="Predicted Hours"
                    required
                    icon={Clock}
                  />
                  <Input
                    value={formData.predicted_hours}
                    onChangeText={(text) => updateField('predicted_hours', text)}
                    placeholder="e.g. 8.5"
                    keyboardType="numeric"
                    {...inputStyles}
                    borderColor={errors.predicted_hours ? '$error' : '$borderColorHover'}
                    placeholderTextColor="$placeholderColor"
                    focusStyle={{ borderColor: '$primary', borderWidth: 1.5 }}
                  />
                  <ErrorText error={errors.predicted_hours} />
                </YStack>

                {/* Estimated Total Price */}
                <YStack>
                  <FieldLabel
                    label="Estimated Total Price"
                    required
                    icon={DollarSign}
                  />
                  <XStack
                    {...inputStyles}
                    borderColor={errors.estimated_total_price ? '$error' : '$borderColorHover'}
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
                      value={formData.estimated_total_price}
                      onChangeText={(text) => updateField('estimated_total_price', text)}
                      placeholder="450.00"
                      bg="transparent"
                      borderWidth={0}
                      flex={1}
                      px={0}
                      py={0}
                      minHeight="auto"
                      keyboardType="numeric"
                      placeholderTextColor="$placeholderColor"
                    />
                  </XStack>
                  <ErrorText error={errors.estimated_total_price} />
                </YStack>

                {/* Negotiation Reasoning */}
                <YStack>
                  <FieldLabel
                    label="Notes / Negotiation"
                    icon={FileText}
                  />
                  <YStack position="relative">
                    <TextArea
                      value={formData.negotiation_reasoning}
                      onChangeText={(text) =>
                        updateField('negotiation_reasoning', text.slice(0, 1000))
                      }
                      placeholder="Add any notes about your pricing, approach, or negotiate terms..."
                      {...inputStyles}
                      minHeight={100}
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
                      {formData.negotiation_reasoning.length}/1000
                    </Text>
                  </YStack>
                </YStack>

                {/* Materials Section */}
                <YStack>
                  <FieldLabel
                    label="Materials (Optional)"
                    icon={Package}
                  />
                  <Text
                    fontSize="$2"
                    color="$colorSubtle"
                    mb="$3"
                  >
                    List any materials required for the job with estimated prices
                  </Text>

                  {/* Existing materials */}
                  {formData.materials.length > 0 && (
                    <YStack
                      gap="$2"
                      mb="$3"
                    >
                      {formData.materials.map((material, index) => (
                        <XStack
                          key={material.id}
                          bg="white"
                          borderColor="$borderColorHover"
                          borderWidth={1}
                          borderRadius="$4"
                          p="$3"
                          alignItems="center"
                          gap="$3"
                        >
                          <View
                            width={28}
                            height={28}
                            borderRadius="$full"
                            bg="$primaryBackground"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text
                              color="$primary"
                              fontSize="$2"
                              fontWeight="600"
                            >
                              {index + 1}
                            </Text>
                          </View>
                          <YStack
                            flex={1}
                            gap="$xs"
                          >
                            <Text
                              fontSize="$3"
                              fontWeight="500"
                              color="$color"
                            >
                              {material.name}
                            </Text>
                            {material.description && (
                              <Text
                                fontSize="$2"
                                color="$colorSubtle"
                              >
                                {material.description}
                              </Text>
                            )}
                          </YStack>
                          <Text
                            fontSize="$4"
                            fontWeight="600"
                            color="$primary"
                          >
                            ${material.price}
                          </Text>
                          <Button
                            unstyled
                            onPress={() => removeMaterial(material.id)}
                            p="$1"
                            hitSlop={8}
                            pressStyle={{ opacity: 0.7 }}
                          >
                            <X
                              size={18}
                              color="$error"
                            />
                          </Button>
                        </XStack>
                      ))}
                    </YStack>
                  )}

                  {/* Add new material form */}
                  <YStack
                    bg="$backgroundMuted"
                    borderRadius="$4"
                    p="$3"
                    gap="$3"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <Input
                      value={newMaterial.name}
                      onChangeText={(text) => setNewMaterial((prev) => ({ ...prev, name: text }))}
                      placeholder="Material name"
                      {...inputStyles}
                      placeholderTextColor="$placeholderColor"
                    />
                    <XStack
                      gap="$3"
                      width="100%"
                    >
                      <XStack
                        bg="white"
                        borderColor="$borderColorHover"
                        borderWidth={1}
                        borderRadius="$4"
                        px="$4"
                        py="$3"
                        alignItems="center"
                        gap="$2"
                        flex={1}
                        minHeight={52}
                      >
                        <Text
                          color="$colorSubtle"
                          fontSize="$4"
                        >
                          $
                        </Text>
                        <Input
                          value={newMaterial.price}
                          onChangeText={(text) =>
                            setNewMaterial((prev) => ({ ...prev, price: text }))
                          }
                          placeholder="0.00"
                          bg="transparent"
                          borderWidth={0}
                          flex={1}
                          px={0}
                          py={0}
                          minHeight="auto"
                          keyboardType="numeric"
                          placeholderTextColor="$placeholderColor"
                        />
                      </XStack>
                      <Input
                        value={newMaterial.description}
                        onChangeText={(text) =>
                          setNewMaterial((prev) => ({ ...prev, description: text }))
                        }
                        placeholder="Qty/Description"
                        bg="white"
                        borderColor="$borderColorHover"
                        borderWidth={1}
                        borderRadius="$4"
                        px="$4"
                        py="$3"
                        flex={1}
                        minHeight={52}
                        placeholderTextColor="$placeholderColor"
                      />
                    </XStack>
                    <Button
                      onPress={addMaterial}
                      disabled={!newMaterial.name.trim() || !newMaterial.price.trim()}
                      bg={
                        newMaterial.name.trim() && newMaterial.price.trim()
                          ? '$primary'
                          : '$borderColorHover'
                      }
                      borderRadius="$lg"
                      py="$3"
                      pressStyle={{ opacity: 0.8 }}
                    >
                      <XStack
                        alignItems="center"
                        gap="$2"
                      >
                        <Plus
                          size={18}
                          color="white"
                        />
                        <Text
                          color="white"
                          fontWeight="600"
                        >
                          Add Material
                        </Text>
                      </XStack>
                    </Button>
                  </YStack>
                </YStack>

                {/* Attachments Section */}
                <YStack>
                  <FieldLabel
                    label="Attachments (Optional)"
                    icon={Paperclip}
                  />
                  <Text
                    fontSize="$2"
                    color="$colorSubtle"
                    mb="$3"
                  >
                    Upload quotes, photos, or relevant documents
                  </Text>

                  {/* Existing attachments */}
                  {formData.attachments.length > 0 && (
                    <XStack
                      flexWrap="wrap"
                      gap="$2"
                      mb="$3"
                    >
                      {formData.attachments.map((attachment) => (
                        <View
                          key={attachment.id}
                          width={80}
                          height={80}
                          borderRadius="$3"
                          overflow="hidden"
                          position="relative"
                        >
                          {attachment.file_type === 'image' && (
                            <Image
                              source={{ uri: attachment.file.uri }}
                              width="100%"
                              height="100%"
                              resizeMode="cover"
                            />
                          )}
                          {attachment.file_type === 'video' && (
                            <View
                              width="100%"
                              height="100%"
                              bg="$borderColor"
                            >
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
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <Video
                                    size={24}
                                    color="$colorMuted"
                                  />
                                </View>
                              )}
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
                            </View>
                          )}
                          {attachment.file_type === 'document' && (
                            <View
                              width="100%"
                              height="100%"
                              bg="$borderColor"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <File
                                size={24}
                                color="$primary"
                              />
                              <Text
                                fontSize={8}
                                color="$colorSubtle"
                                mt="$1"
                                numberOfLines={1}
                                px="$1"
                              >
                                {attachment.file_name.split('.').pop()?.toUpperCase()}
                              </Text>
                            </View>
                          )}
                          {/* Remove button */}
                          <Pressable
                            onPress={() => removeAttachment(attachment.id)}
                            style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              backgroundColor: 'rgba(0,0,0,0.6)',
                              borderRadius: 10,
                              padding: 2,
                            }}
                          >
                            <X
                              size={14}
                              color="white"
                            />
                          </Pressable>
                        </View>
                      ))}
                    </XStack>
                  )}

                  <Button
                    onPress={showAttachmentPicker}
                    disabled={totalAttachments >= maxAttachments}
                    bg="transparent"
                    borderWidth={1}
                    borderColor={totalAttachments >= maxAttachments ? '$borderColor' : '$primary'}
                    borderRadius="$lg"
                    py="$3"
                    borderStyle="dashed"
                    pressStyle={{ opacity: 0.8, bg: 'rgba(12,154,92,0.05)' }}
                  >
                    <XStack
                      alignItems="center"
                      gap="$2"
                    >
                      <Plus
                        size={18}
                        color={totalAttachments >= maxAttachments ? '$colorMuted' : '$primary'}
                      />
                      <Text
                        color={totalAttachments >= maxAttachments ? '$colorMuted' : '$primary'}
                        fontWeight="600"
                      >
                        Add Attachment ({totalAttachments}/{maxAttachments})
                      </Text>
                    </XStack>
                  </Button>
                </YStack>
              </YStack>
            </YStack>
          </ScrollView>

          {/* Submit Button Fixed at Bottom */}
          <YStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            bg="rgba(255,255,255,0.98)"
            px="$4"
            py="$4"
            pb={insets.bottom + 16}
            borderTopWidth={1}
            borderTopColor="$borderColor"
          >
            <Button
              onPress={handleSubmit}
              disabled={isSubmitting}
              bg="$primary"
              borderRadius="$lg"
              py="$4"
              minHeight={56}
              pressStyle={{ opacity: 0.9 }}
            >
              {isSubmitting ? (
                <Spinner
                  size="small"
                  color="white"
                />
              ) : (
                <XStack
                  alignItems="center"
                  justifyContent="center"
                  gap="$2"
                >
                  <Send
                    size={18}
                    color="white"
                  />
                  <Text
                    color="white"
                    fontWeight="bold"
                    fontSize="$4"
                  >
                    Submit Application
                  </Text>
                </XStack>
              )}
            </Button>
          </YStack>
        </YStack>

        {/* Android Attachment Picker Sheet */}
        <Sheet
          modal
          open={attachmentPickerOpen}
          onOpenChange={setAttachmentPickerOpen}
          snapPointsMode="fit"
          dismissOnSnapToBottom
        >
          <Sheet.Overlay
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
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

              <Button
                unstyled
                onPress={pickDocuments}
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
                  <FileText
                    size={22}
                    color="$primary"
                  />
                  <Text
                    fontSize="$4"
                    color="$color"
                  >
                    Choose Documents
                  </Text>
                </XStack>
              </Button>
            </YStack>
          </Sheet.Frame>
        </Sheet>
      </KeyboardAvoidingView>
    </GradientBackground>
  )
}
