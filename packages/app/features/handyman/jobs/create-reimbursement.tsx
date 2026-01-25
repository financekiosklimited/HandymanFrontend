'use client'

import { useState, useCallback } from 'react'
import {
  YStack,
  XStack,
  ScrollView,
  Text,
  Button,
  Spinner,
  View,
  Image,
  TextArea,
  Input,
  Sheet,
} from '@my/ui'
import { GradientBackground } from '@my/ui'
import {
  ArrowLeft,
  Receipt,
  DollarSign,
  FileText,
  Tag,
  ImagePlus,
  X,
  Check,
  ChevronDown,
  Camera,
  Video,
  File,
  Play,
} from '@tamagui/lucide-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { useToastController } from '@tamagui/toast'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import * as VideoThumbnails from 'expo-video-thumbnails'
import * as ImageManipulator from 'expo-image-manipulator'
import { Modal, Pressable, Platform, ActionSheetIOS } from 'react-native'
import {
  useCreateReimbursement,
  useReimbursementCategories,
  ATTACHMENT_LIMITS,
  isUnsupportedImageFormat,
} from '@my/api'
import type { ReimbursementCategory, LocalAttachment, AttachmentUpload } from '@my/api'

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

export function CreateReimbursementScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const toast = useToastController()
  const { jobId } = useLocalSearchParams<{ jobId: string }>()

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ReimbursementCategory | null>(null)
  const [attachments, setAttachments] = useState<LocalAttachment[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCategorySheet, setShowCategorySheet] = useState(false)
  const [attachmentPickerOpen, setAttachmentPickerOpen] = useState(false)

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useReimbursementCategories()

  const createReimbursementMutation = useCreateReimbursement()

  // Attachment limits
  const maxAttachments = ATTACHMENT_LIMITS.reimbursement.maxCount
  const totalAttachments = attachments.length

  // Pick images from library
  const pickImages = useCallback(async () => {
    const remaining = maxAttachments - totalAttachments
    if (remaining <= 0) {
      toast.show('Maximum attachments reached', {
        message: `You can upload up to ${maxAttachments} files`,
        native: false,
      })
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
        setAttachments((prev) => [...prev, ...newAttachments])
      }
    }
    setAttachmentPickerOpen(false)
  }, [totalAttachments, maxAttachments, toast])

  // Take photo with camera
  const takePhoto = useCallback(async () => {
    if (totalAttachments >= maxAttachments) {
      toast.show('Maximum attachments reached', {
        message: `You can upload up to ${maxAttachments} files`,
        native: false,
      })
      return
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      toast.show('Permission denied', {
        message: 'Camera permission is required to take photos',
        native: false,
      })
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
      setAttachments((prev) => [...prev, newAttachment])
    }
    setAttachmentPickerOpen(false)
  }, [totalAttachments, maxAttachments, toast])

  // Pick videos from library
  const pickVideos = useCallback(async () => {
    const remaining = maxAttachments - totalAttachments
    if (remaining <= 0) {
      toast.show('Maximum attachments reached', {
        message: `You can upload up to ${maxAttachments} files`,
        native: false,
      })
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
      setAttachments((prev) => [...prev, ...newAttachments])
    }
    setAttachmentPickerOpen(false)
  }, [totalAttachments, maxAttachments, toast])

  // Record video with camera
  const recordVideo = useCallback(async () => {
    if (totalAttachments >= maxAttachments) {
      toast.show('Maximum attachments reached', {
        message: `You can upload up to ${maxAttachments} files`,
        native: false,
      })
      return
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      toast.show('Permission denied', {
        message: 'Camera permission is required to record videos',
        native: false,
      })
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
      setAttachments((prev) => [...prev, newAttachment])
    }
    setAttachmentPickerOpen(false)
  }, [totalAttachments, maxAttachments, toast])

  // Pick documents
  const pickDocuments = useCallback(async () => {
    const remaining = maxAttachments - totalAttachments
    if (remaining <= 0) {
      toast.show('Maximum attachments reached', {
        message: `You can upload up to ${maxAttachments} files`,
        native: false,
      })
      return
    }

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
      const newAttachments: LocalAttachment[] = result.assets.slice(0, remaining).map((asset) => ({
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
      setAttachments((prev) => [...prev, ...newAttachments])
    }
    setAttachmentPickerOpen(false)
  }, [totalAttachments, maxAttachments, toast])

  // Remove attachment
  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
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

  const handleSubmit = async () => {
    if (!jobId) return

    // Validation
    if (!name.trim()) {
      toast.show('Name required', {
        message: 'Please enter a name for this expense',
        native: false,
      })
      return
    }

    if (!selectedCategory) {
      toast.show('Category required', {
        message: 'Please select a category',
        native: false,
      })
      return
    }

    const amountNum = Number.parseFloat(amount)
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      toast.show('Invalid amount', {
        message: 'Please enter a valid amount greater than 0',
        native: false,
      })
      return
    }

    if (attachments.length === 0) {
      toast.show('Attachment required', {
        message: 'Please upload at least one receipt or proof',
        native: false,
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Convert LocalAttachment[] to AttachmentUpload[]
      const attachmentUploads: AttachmentUpload[] = attachments.map((attachment) => {
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

      await createReimbursementMutation.mutateAsync({
        jobId,
        data: {
          name: name.trim(),
          category_id: selectedCategory.public_id,
          amount: amountNum,
          notes: notes.trim() || undefined,
          attachments: attachmentUploads,
        },
      })

      toast.show('Reimbursement submitted', {
        message: 'Your request has been sent to the homeowner',
        native: false,
      })
      router.back()
    } catch (error: any) {
      toast.show('Failed to submit', {
        message: error?.message || 'Please try again',
        native: false,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!jobId) {
    return (
      <GradientBackground>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
        >
          <Text color="$error">Invalid job ID</Text>
        </YStack>
      </GradientBackground>
    )
  }

  return (
    <GradientBackground>
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
            New Reimbursement
          </Text>
          <View width={38} />
        </XStack>

        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
        >
          <YStack
            px="$lg"
            pb="$2xl"
            gap="$lg"
          >
            {/* Expense Name */}
            <YStack
              bg="rgba(255,255,255,0.95)"
              borderRadius={16}
              p="$md"
              borderWidth={1}
              borderColor="rgba(0,0,0,0.08)"
              gap="$sm"
            >
              <XStack
                alignItems="center"
                gap="$sm"
              >
                <FileText
                  size={18}
                  color="$primary"
                />
                <Text
                  fontSize="$4"
                  fontWeight="600"
                  color="$color"
                >
                  Expense Name
                </Text>
              </XStack>
              <Input
                placeholder="e.g., Plumbing materials, Tools rental"
                value={name}
                onChangeText={setName}
                bg="$backgroundMuted"
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius="$4"
                px="$md"
                py="$sm"
              />
            </YStack>

            {/* Category */}
            <YStack
              bg="rgba(255,255,255,0.95)"
              borderRadius={16}
              p="$md"
              borderWidth={1}
              borderColor="rgba(0,0,0,0.08)"
              gap="$sm"
            >
              <XStack
                alignItems="center"
                gap="$sm"
              >
                <Tag
                  size={18}
                  color="$primary"
                />
                <Text
                  fontSize="$4"
                  fontWeight="600"
                  color="$color"
                >
                  Category
                </Text>
              </XStack>
              <Pressable onPress={() => setShowCategorySheet(true)}>
                <XStack
                  bg="$backgroundMuted"
                  borderRadius="$4"
                  borderWidth={1}
                  borderColor="$borderColor"
                  px="$md"
                  py="$sm"
                  minHeight={44}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text
                    fontSize="$3"
                    color={selectedCategory ? '$color' : '$colorMuted'}
                  >
                    {selectedCategory ? selectedCategory.name : 'Select a category'}
                  </Text>
                  <ChevronDown
                    size={18}
                    color="$colorMuted"
                  />
                </XStack>
              </Pressable>
            </YStack>

            {/* Amount */}
            <YStack
              bg="rgba(255,255,255,0.95)"
              borderRadius={16}
              p="$md"
              borderWidth={1}
              borderColor="rgba(0,0,0,0.08)"
              gap="$sm"
            >
              <XStack
                alignItems="center"
                gap="$sm"
              >
                <DollarSign
                  size={18}
                  color="$primary"
                />
                <Text
                  fontSize="$4"
                  fontWeight="600"
                  color="$color"
                >
                  Amount
                </Text>
              </XStack>
              <XStack
                bg="$backgroundMuted"
                borderRadius="$4"
                borderWidth={1}
                borderColor="$borderColor"
                px="$md"
                py="$sm"
                alignItems="center"
                gap="$sm"
              >
                <Text
                  fontSize="$4"
                  fontWeight="600"
                  color="$colorSubtle"
                >
                  $
                </Text>
                <Input
                  placeholder="0.00"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  flex={1}
                  bg="transparent"
                  borderWidth={0}
                  px={0}
                />
              </XStack>
            </YStack>

            {/* Notes */}
            <YStack
              bg="rgba(255,255,255,0.95)"
              borderRadius={16}
              p="$md"
              borderWidth={1}
              borderColor="rgba(0,0,0,0.08)"
              gap="$sm"
            >
              <XStack
                alignItems="center"
                gap="$sm"
              >
                <Receipt
                  size={18}
                  color="$primary"
                />
                <Text
                  fontSize="$4"
                  fontWeight="600"
                  color="$color"
                >
                  Notes (Optional)
                </Text>
              </XStack>
              <TextArea
                placeholder="Additional details about this expense..."
                value={notes}
                onChangeText={setNotes}
                bg="$backgroundMuted"
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius="$4"
                px="$md"
                py="$sm"
                minHeight={80}
              />
            </YStack>

            {/* Attachments */}
            <YStack
              bg="rgba(255,255,255,0.95)"
              borderRadius={16}
              p="$md"
              borderWidth={1}
              borderColor="rgba(0,0,0,0.08)"
              gap="$md"
            >
              <XStack
                alignItems="center"
                justifyContent="space-between"
              >
                <XStack
                  alignItems="center"
                  gap="$sm"
                >
                  <ImagePlus
                    size={18}
                    color="$primary"
                  />
                  <Text
                    fontSize="$4"
                    fontWeight="600"
                    color="$color"
                  >
                    Attachments
                  </Text>
                  <Text
                    fontSize="$2"
                    color="$error"
                  >
                    *
                  </Text>
                </XStack>
                <Text
                  fontSize="$2"
                  color="$colorSubtle"
                >
                  {totalAttachments}/{maxAttachments}
                </Text>
              </XStack>

              <Text
                fontSize="$2"
                color="$colorSubtle"
              >
                Upload receipts or proof of purchase (minimum 1 required)
              </Text>

              <XStack
                flexWrap="wrap"
                gap="$sm"
              >
                {attachments.map((attachment) => (
                  <View
                    key={attachment.id}
                    position="relative"
                    width={80}
                    height={80}
                    borderRadius={8}
                    overflow="hidden"
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
                        >
                          {attachment.file_name.split('.').pop()?.toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <Pressable
                      onPress={() => handleRemoveAttachment(attachment.id)}
                      style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: '#FF3B30',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <X
                        size={14}
                        color="white"
                      />
                    </Pressable>
                  </View>
                ))}

                {totalAttachments < maxAttachments && (
                  <Pressable onPress={showAttachmentPicker}>
                    <View
                      width={80}
                      height={80}
                      borderRadius={8}
                      borderWidth={2}
                      borderStyle="dashed"
                      borderColor="$borderColor"
                      alignItems="center"
                      justifyContent="center"
                      bg="$backgroundMuted"
                    >
                      <ImagePlus
                        size={24}
                        color="$colorMuted"
                      />
                    </View>
                  </Pressable>
                )}
              </XStack>
            </YStack>

            {/* Submit Button */}
            <Button
              bg="$primary"
              borderRadius="$lg"
              py="$md"
              onPress={handleSubmit}
              disabled={isSubmitting}
              opacity={isSubmitting ? 0.7 : 1}
            >
              {isSubmitting ? (
                <XStack
                  alignItems="center"
                  gap="$sm"
                >
                  <Spinner
                    size="small"
                    color="white"
                  />
                  <Text
                    color="white"
                    fontWeight="600"
                  >
                    Submitting...
                  </Text>
                </XStack>
              ) : (
                <XStack
                  alignItems="center"
                  gap="$sm"
                >
                  <Check
                    size={18}
                    color="white"
                  />
                  <Text
                    color="white"
                    fontWeight="600"
                  >
                    Submit Request
                  </Text>
                </XStack>
              )}
            </Button>
          </YStack>
        </ScrollView>

        {/* Category Bottom Sheet */}
        <Modal
          visible={showCategorySheet}
          animationType="slide"
          transparent
          onRequestClose={() => setShowCategorySheet(false)}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
            onPress={() => setShowCategorySheet(false)}
          >
            <View
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              bg="$background"
              borderTopLeftRadius={24}
              borderTopRightRadius={24}
              pb={insets.bottom + 20}
            >
              <Pressable>
                <YStack
                  p="$lg"
                  gap="$md"
                >
                  <XStack
                    justifyContent="space-between"
                    alignItems="center"
                    pb="$sm"
                    borderBottomWidth={1}
                    borderBottomColor="rgba(0,0,0,0.08)"
                  >
                    <Text
                      fontSize="$5"
                      fontWeight="700"
                      color="$color"
                    >
                      Select Category
                    </Text>
                    <Button
                      unstyled
                      onPress={() => setShowCategorySheet(false)}
                      p="$sm"
                    >
                      <X
                        size={22}
                        color="$colorSubtle"
                      />
                    </Button>
                  </XStack>

                  {categoriesLoading ? (
                    <YStack
                      py="$xl"
                      alignItems="center"
                    >
                      <Spinner
                        size="large"
                        color="$primary"
                      />
                    </YStack>
                  ) : (
                    <YStack gap="$xs">
                      {categories?.map((category) => (
                        <Pressable
                          key={category.public_id}
                          onPress={() => {
                            setSelectedCategory(category)
                            setShowCategorySheet(false)
                          }}
                        >
                          <XStack
                            bg={
                              selectedCategory?.public_id === category.public_id
                                ? '$primaryBackground'
                                : '$backgroundMuted'
                            }
                            p="$md"
                            borderRadius={12}
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <YStack
                              flex={1}
                              gap="$xs"
                            >
                              <Text
                                fontSize="$4"
                                fontWeight="600"
                                color={
                                  selectedCategory?.public_id === category.public_id
                                    ? '$primary'
                                    : '$color'
                                }
                              >
                                {category.name}
                              </Text>
                              {category.description && (
                                <Text
                                  fontSize="$2"
                                  color="$colorSubtle"
                                  numberOfLines={1}
                                >
                                  {category.description}
                                </Text>
                              )}
                            </YStack>
                            {selectedCategory?.public_id === category.public_id && (
                              <Check
                                size={20}
                                color="$primary"
                              />
                            )}
                          </XStack>
                        </Pressable>
                      ))}
                    </YStack>
                  )}
                </YStack>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

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
      </YStack>
    </GradientBackground>
  )
}
