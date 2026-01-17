'use client'

import { useState, useCallback, useRef } from 'react'
import {
  YStack,
  XStack,
  ScrollView,
  Text,
  Button,
  Spinner,
  View,
  Image,
  ImageViewer,
  VideoPlayer,
} from '@my/ui'
import { GradientBackground } from '@my/ui'
import { useUpdateJob, formatErrorMessage, formatValidationError } from '@my/api'
import type {
  UpdateJobValidationError,
  LocalAttachment,
  Attachment,
  AttachmentUpload,
} from '@my/api'
import { useRouter, useLocalSearchParams } from 'expo-router'
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Send,
  Briefcase,
  ListChecks,
  FileText,
  Clock,
  Calendar,
  Play,
  Video,
  File,
} from '@tamagui/lucide-icons'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { HTTPError } from 'ky'
import { Dimensions, FlatList, Pressable, Linking } from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const IMAGE_WIDTH = SCREEN_WIDTH - 32

interface ExistingTask {
  public_id: string
  title: string
  description?: string
  _delete?: boolean
}

interface NewTask {
  id: string
  title: string
}

interface PreviewData {
  jobId: string
  title: string
  description: string
  estimated_budget: number
  category_id: string
  city_id: string
  address: string
  postal_code: string
  categoryName?: string
  cityName?: string
  cityProvince?: string
  existingTasks: ExistingTask[]
  newTasks: NewTask[]
  existingAttachments: Attachment[]
  newAttachments: LocalAttachment[]
  attachmentsToRemove: string[]
}

export function EditJobPreviewScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const params = useLocalSearchParams<{ formData: string }>()
  const updateJobMutation = useUpdateJob()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageViewerVisible, setImageViewerVisible] = useState(false)
  const [imageViewerIndex, setImageViewerIndex] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState<{
    uri: string
    thumbnail?: string
  } | null>(null)
  const flatListRef = useRef<FlatList>(null)

  // Parse form data from params
  const formData: PreviewData | null = params.formData ? JSON.parse(params.formData) : null

  if (!formData) {
    return (
      <GradientBackground>
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          px="$4"
        >
          <AlertCircle
            size={48}
            color="$error"
          />
          <Text
            color="$color"
            fontSize="$5"
            fontWeight="600"
            mt="$4"
          >
            Invalid form data
          </Text>
          <Text
            color="$colorSubtle"
            fontSize="$3"
            mt="$2"
            textAlign="center"
          >
            Something went wrong. Please go back and try again.
          </Text>
          <Button
            mt="$6"
            bg="$primary"
            borderRadius="$4"
            px="$6"
            py="$3"
            onPress={() => router.back()}
          >
            <Text
              color="white"
              fontWeight="600"
            >
              Go Back
            </Text>
          </Button>
        </YStack>
      </GradientBackground>
    )
  }

  // Combine all attachments for display
  const allAttachments = [
    ...formData.existingAttachments.map((attachment) => ({
      type: 'existing' as const,
      attachment,
    })),
    ...formData.newAttachments.map((attachment) => ({
      type: 'new' as const,
      attachment,
    })),
  ]

  const imageAttachments = allAttachments.filter((item) => item.attachment.file_type === 'image')

  // Get all visible tasks
  const visibleTasks = [
    ...formData.existingTasks
      .filter((t) => !t._delete)
      .map((t) => ({ type: 'existing' as const, ...t })),
    ...formData.newTasks.map((t) => ({ type: 'new' as const, ...t })),
  ]

  // Handle image scroll
  const handleImageScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x
    const index = Math.round(offsetX / IMAGE_WIDTH)
    setCurrentImageIndex(index)
  }

  const scrollToImage = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true })
    setCurrentImageIndex(index)
  }

  // Update job
  const handleUpdate = useCallback(async () => {
    setErrorMessage(null)

    // Build tasks array with CRUD operations
    const tasks = [
      // Existing tasks (updated or deleted)
      ...formData.existingTasks.map((t) => ({
        public_id: t.public_id,
        ...(t._delete ? { _delete: true as const } : { title: t.title }),
      })),
      // New tasks
      ...formData.newTasks.map((t) => ({ title: t.title })),
    ]

    // Convert LocalAttachment[] to AttachmentUpload[]
    const attachments: AttachmentUpload[] = formData.newAttachments.map((attachment) => {
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

    const requestData = {
      title: formData.title,
      description: formData.description,
      estimated_budget: formData.estimated_budget,
      category_id: formData.category_id,
      city_id: formData.city_id,
      address: formData.address,
      postal_code: formData.postal_code || undefined,
      tasks,
      attachments,
      attachments_to_remove: formData.attachmentsToRemove,
    }

    // Debug: Log request payload
    console.info('=== UPDATE JOB REQUEST PAYLOAD ===')
    console.info(JSON.stringify(requestData, null, 2))

    try {
      const response = await updateJobMutation.mutateAsync({
        publicId: formData.jobId,
        data: requestData,
      })

      // Debug: Log success response
      console.info('=== UPDATE JOB SUCCESS RESPONSE ===')
      console.info(JSON.stringify(response, null, 2))

      // Navigate to job detail
      router.replace(`/(homeowner)/jobs/${formData.jobId}`)
    } catch (error) {
      // Debug: Log error
      console.info('=== UPDATE JOB ERROR ===')
      console.info(error)

      if (error instanceof HTTPError) {
        try {
          const errorData = (await error.response.json()) as UpdateJobValidationError
          console.info('=== UPDATE JOB ERROR RESPONSE BODY ===')
          console.info(JSON.stringify(errorData, null, 2))

          setErrorMessage(formatValidationError(errorData))
        } catch {
          setErrorMessage('Failed to update job. Please try again.')
        }
      } else {
        setErrorMessage(formatErrorMessage(error))
      }
    }
  }, [formData, updateJobMutation, router])

  return (
    <GradientBackground>
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
            fontSize="$6"
            fontWeight="bold"
            color="$color"
            flex={1}
          >
            Review Changes
          </Text>
        </XStack>

        {/* Content */}
        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <YStack
            px="$4"
            gap="$5"
          >
            {/* Error Alert */}
            {errorMessage && (
              <XStack
                bg="$errorBackground"
                p="$4"
                borderRadius="$4"
                gap="$3"
                alignItems="flex-start"
                borderWidth={1}
                borderColor="$errorBackground"
              >
                <AlertCircle
                  size={20}
                  color="$error"
                  flexShrink={0}
                />
                <YStack
                  flex={1}
                  gap="$1"
                >
                  <Text
                    fontWeight="600"
                    color="$error"
                    fontSize="$4"
                  >
                    Unable to update
                  </Text>
                  <Text
                    color="$error"
                    fontSize="$3"
                  >
                    {errorMessage}
                  </Text>
                </YStack>
              </XStack>
            )}

            {/* Attachment Gallery */}
            {allAttachments.length > 0 && (
              <YStack gap="$3">
                <View
                  height={220}
                  borderRadius="$4"
                  overflow="hidden"
                  bg="$backgroundMuted"
                >
                  <FlatList
                    ref={flatListRef}
                    data={allAttachments}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleImageScroll}
                    scrollEventThrottle={16}
                    renderItem={({ item, index }) => {
                      const attachment = item.attachment
                      const fileType =
                        item.type === 'existing'
                          ? (attachment as Attachment).file_type
                          : (attachment as LocalAttachment).file_type

                      // Image attachment
                      if (fileType === 'image') {
                        const imageUri =
                          item.type === 'existing'
                            ? (attachment as Attachment).file_url
                            : (attachment as LocalAttachment).file.uri
                        return (
                          <Pressable
                            onPress={() => {
                              // Find index within image-only attachments for ImageViewer
                              const imageIndex = imageAttachments.findIndex((img) => {
                                if (item.type === 'existing' && img.type === 'existing') {
                                  return (
                                    (img.attachment as Attachment).public_id ===
                                    (attachment as Attachment).public_id
                                  )
                                }
                                if (item.type === 'new' && img.type === 'new') {
                                  return (
                                    (img.attachment as LocalAttachment).id ===
                                    (attachment as LocalAttachment).id
                                  )
                                }
                                return false
                              })
                              if (imageIndex >= 0) {
                                setImageViewerIndex(imageIndex)
                                setImageViewerVisible(true)
                              }
                            }}
                          >
                            <View
                              width={IMAGE_WIDTH}
                              height={220}
                            >
                              <Image
                                source={{ uri: imageUri }}
                                width="100%"
                                height="100%"
                                resizeMode="cover"
                              />
                            </View>
                          </Pressable>
                        )
                      }

                      // Video attachment
                      if (fileType === 'video') {
                        const thumbnailUri =
                          item.type === 'existing'
                            ? (attachment as Attachment).thumbnail_url
                            : (attachment as LocalAttachment).thumbnail_uri
                        const duration =
                          item.type === 'existing'
                            ? (attachment as Attachment).duration_seconds
                            : (attachment as LocalAttachment).duration_seconds
                        const videoUri =
                          item.type === 'existing'
                            ? (attachment as Attachment).file_url
                            : (attachment as LocalAttachment).file.uri
                        return (
                          <Pressable
                            onPress={() =>
                              setSelectedVideo({
                                uri: videoUri,
                                thumbnail: thumbnailUri || undefined,
                              })
                            }
                          >
                            <View
                              width={IMAGE_WIDTH}
                              height={220}
                            >
                              {thumbnailUri ? (
                                <Image
                                  source={{ uri: thumbnailUri }}
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
                                    size={48}
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
                                  p="$3"
                                >
                                  <Play
                                    size={32}
                                    color="white"
                                    fill="white"
                                  />
                                </View>
                              </View>
                              {/* Duration badge */}
                              {duration !== undefined && duration !== null && (
                                <View
                                  position="absolute"
                                  bottom="$3"
                                  left="$3"
                                  bg="rgba(0,0,0,0.7)"
                                  px="$2"
                                  py="$1"
                                  borderRadius="$2"
                                >
                                  <Text
                                    fontSize="$2"
                                    color="white"
                                    fontWeight="500"
                                  >
                                    {Math.floor(duration / 60)}:
                                    {(duration % 60).toString().padStart(2, '0')}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </Pressable>
                        )
                      }

                      // Document attachment
                      const fileName =
                        item.type === 'existing'
                          ? (attachment as Attachment).file_name
                          : (attachment as LocalAttachment).file_name
                      const fileUrl =
                        item.type === 'existing'
                          ? (attachment as Attachment).file_url
                          : (attachment as LocalAttachment).file.uri
                      return (
                        <Pressable
                          onPress={() => {
                            Linking.openURL(fileUrl).catch(() => {
                              // Ignore errors for local files
                            })
                          }}
                        >
                          <View
                            width={IMAGE_WIDTH}
                            height={220}
                            bg="$borderColor"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <File
                              size={48}
                              color="$primary"
                            />
                            <Text
                              fontSize="$4"
                              color="$color"
                              fontWeight="500"
                              mt="$3"
                              px="$4"
                              textAlign="center"
                              numberOfLines={2}
                            >
                              {fileName}
                            </Text>
                            <Text
                              fontSize="$2"
                              color="$colorSubtle"
                              mt="$1"
                            >
                              Document
                            </Text>
                          </View>
                        </Pressable>
                      )
                    }}
                    keyExtractor={(item, index) => {
                      if (item.type === 'existing') {
                        return (item.attachment as Attachment).public_id
                      }
                      return (item.attachment as LocalAttachment).id
                    }}
                  />

                  {/* Navigation arrows */}
                  {allAttachments.length > 1 && (
                    <>
                      {currentImageIndex > 0 && (
                        <Button
                          unstyled
                          position="absolute"
                          left="$3"
                          top="50%"
                          y={-16}
                          bg="$backgroundStrong"
                          borderRadius="$full"
                          p="$2"
                          onPress={() => scrollToImage(currentImageIndex - 1)}
                          pressStyle={{ opacity: 0.8 }}
                        >
                          <ChevronLeft
                            size={20}
                            color="$color"
                          />
                        </Button>
                      )}
                      {currentImageIndex < allAttachments.length - 1 && (
                        <Button
                          unstyled
                          position="absolute"
                          right="$3"
                          top="50%"
                          y={-16}
                          bg="$backgroundStrong"
                          borderRadius="$full"
                          p="$2"
                          onPress={() => scrollToImage(currentImageIndex + 1)}
                          pressStyle={{ opacity: 0.8 }}
                        >
                          <ChevronRight
                            size={20}
                            color="$color"
                          />
                        </Button>
                      )}
                    </>
                  )}

                  {/* Attachment counter */}
                  {allAttachments.length > 1 && (
                    <View
                      position="absolute"
                      bottom="$3"
                      right="$3"
                      bg="$background"
                      px="$2"
                      py="$1"
                      borderRadius="$2"
                    >
                      <Text
                        color="white"
                        fontSize="$2"
                        fontWeight="500"
                      >
                        {currentImageIndex + 1} / {allAttachments.length}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Pagination dots */}
                {allAttachments.length > 1 && (
                  <XStack
                    justifyContent="center"
                    gap="$2"
                  >
                    {allAttachments.map((_, index) => (
                      <View
                        key={index}
                        width={index === currentImageIndex ? 20 : 8}
                        height={8}
                        borderRadius="$full"
                        bg={index === currentImageIndex ? '$primary' : '$borderColorHover'}
                        onPress={() => scrollToImage(index)}
                      />
                    ))}
                  </XStack>
                )}
              </YStack>
            )}

            {/* Title & Budget */}
            <YStack gap="$2">
              <XStack
                justifyContent="space-between"
                alignItems="flex-start"
                gap="$3"
              >
                <YStack
                  flex={1}
                  gap="$2"
                >
                  <Text
                    fontSize={24}
                    fontWeight="bold"
                    color="$color"
                  >
                    {formData.title}
                  </Text>
                  {formData.categoryName && (
                    <XStack
                      alignItems="center"
                      gap="$2"
                    >
                      <Briefcase
                        size={14}
                        color="$primary"
                      />
                      <Text
                        fontSize="$3"
                        color="$primary"
                        fontWeight="500"
                      >
                        {formData.categoryName}
                      </Text>
                    </XStack>
                  )}
                </YStack>
                <YStack
                  bg="$primaryBackground"
                  px="$3"
                  py="$2"
                  borderRadius="$3"
                  alignItems="center"
                >
                  <Text
                    fontSize="$2"
                    color="$primary"
                  >
                    Budget
                  </Text>
                  <Text
                    fontSize="$5"
                    fontWeight="bold"
                    color="$primary"
                  >
                    ${formData.estimated_budget}
                  </Text>
                </YStack>
              </XStack>
            </YStack>

            {/* Description Card */}
            <YStack
              bg="$backgroundMuted"
              borderRadius={20}
              p="$lg"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <XStack
                alignItems="center"
                gap="$2"
                mb="$sm"
              >
                <FileText
                  size={18}
                  color="$primary"
                />
                <Text
                  fontSize="$3"
                  fontWeight="600"
                  color="$colorSubtle"
                >
                  DESCRIPTION
                </Text>
              </XStack>
              <Text
                fontSize="$4"
                color="$color"
                lineHeight={22}
              >
                {formData.description}
              </Text>
            </YStack>

            {/* Tasks Section */}
            {visibleTasks.length > 0 && (
              <YStack
                bg="$backgroundMuted"
                borderRadius={20}
                p="$lg"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <XStack
                  alignItems="center"
                  gap="$2"
                  mb="$md"
                >
                  <ListChecks
                    size={18}
                    color="$primary"
                  />
                  <Text
                    fontSize="$3"
                    fontWeight="600"
                    color="$colorSubtle"
                  >
                    TASK LIST
                  </Text>
                </XStack>
                <YStack gap="$md">
                  {visibleTasks.map((task, index) => (
                    <XStack
                      key={task.type === 'existing' ? task.public_id : task.id}
                      gap="$md"
                      alignItems="flex-start"
                    >
                      <YStack
                        width={24}
                        height={24}
                        borderRadius="$full"
                        bg="$primary"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text
                          fontSize={12}
                          fontWeight="600"
                          color="white"
                        >
                          {index + 1}
                        </Text>
                      </YStack>
                      <Text
                        fontSize="$4"
                        fontWeight="500"
                        color="$color"
                        flex={1}
                      >
                        {task.title}
                      </Text>
                    </XStack>
                  ))}
                </YStack>
              </YStack>
            )}

            {/* Location Section */}
            <YStack
              bg="$backgroundMuted"
              borderRadius={20}
              p="$lg"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <XStack
                alignItems="center"
                gap="$2"
                mb="$md"
              >
                <MapPin
                  size={18}
                  color="$primary"
                />
                <Text
                  fontSize="$3"
                  fontWeight="600"
                  color="$colorSubtle"
                >
                  LOCATION
                </Text>
              </XStack>
              <YStack gap="$md">
                {formData.cityName && (
                  <XStack
                    alignItems="center"
                    gap="$md"
                  >
                    <YStack
                      width={40}
                      height={40}
                      borderRadius="$full"
                      bg="$primaryBackground"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <MapPin
                        size={18}
                        color="$primary"
                      />
                    </YStack>
                    <YStack flex={1}>
                      <Text
                        fontSize="$3"
                        color="$colorSubtle"
                      >
                        City
                      </Text>
                      <Text
                        fontSize="$4"
                        fontWeight="500"
                        color="$color"
                      >
                        {formData.cityName}
                        {formData.cityProvince && `, ${formData.cityProvince}`}
                      </Text>
                    </YStack>
                  </XStack>
                )}

                {formData.address && (
                  <YStack
                    bg="$borderColor"
                    borderRadius={12}
                    p="$md"
                    mt="$xs"
                  >
                    <Text
                      fontSize="$3"
                      color="$colorSubtle"
                      mb={4}
                    >
                      Address
                    </Text>
                    <Text
                      fontSize="$4"
                      color="$color"
                    >
                      {formData.address}
                      {formData.postal_code && `, ${formData.postal_code}`}
                    </Text>
                  </YStack>
                )}
              </YStack>
            </YStack>

            {/* Job Info Card */}
            <YStack
              bg="$backgroundMuted"
              borderRadius={20}
              p="$lg"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <XStack
                alignItems="center"
                gap="$2"
                mb="$md"
              >
                <Briefcase
                  size={18}
                  color="$primary"
                />
                <Text
                  fontSize="$3"
                  fontWeight="600"
                  color="$colorSubtle"
                >
                  JOB DETAILS
                </Text>
              </XStack>
              <YStack gap="$md">
                <XStack
                  alignItems="center"
                  gap="$md"
                >
                  <YStack
                    width={40}
                    height={40}
                    borderRadius="$full"
                    bg="$primaryBackground"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Clock
                      size={18}
                      color="$primary"
                    />
                  </YStack>
                  <YStack flex={1}>
                    <Text
                      fontSize="$3"
                      color="$colorSubtle"
                    >
                      Status
                    </Text>
                    <Text
                      fontSize="$4"
                      fontWeight="500"
                      color="$color"
                    >
                      Preview (Editing)
                    </Text>
                  </YStack>
                </XStack>

                <XStack
                  alignItems="center"
                  gap="$md"
                >
                  <YStack
                    width={40}
                    height={40}
                    borderRadius="$full"
                    bg="$primaryBackground"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <DollarSign
                      size={18}
                      color="$primary"
                    />
                  </YStack>
                  <YStack flex={1}>
                    <Text
                      fontSize="$3"
                      color="$colorSubtle"
                    >
                      Estimated Budget
                    </Text>
                    <Text
                      fontSize="$4"
                      fontWeight="500"
                      color="$color"
                    >
                      ${formData.estimated_budget}
                    </Text>
                  </YStack>
                </XStack>

                <XStack
                  alignItems="center"
                  gap="$md"
                >
                  <YStack
                    width={40}
                    height={40}
                    borderRadius="$full"
                    bg="$primaryBackground"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Calendar
                      size={18}
                      color="$primary"
                    />
                  </YStack>
                  <YStack flex={1}>
                    <Text
                      fontSize="$3"
                      color="$colorSubtle"
                    >
                      Preview Date
                    </Text>
                    <Text
                      fontSize="$4"
                      fontWeight="500"
                      color="$color"
                    >
                      {new Date().toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </Text>
                  </YStack>
                </XStack>
              </YStack>
            </YStack>
          </YStack>
        </ScrollView>

        {/* Bottom Buttons */}
        <YStack
          px="$4"
          pb={insets.bottom + 16}
          pt="$3"
          borderTopWidth={1}
          borderColor="$borderColorHover"
          bg="$background"
          gap="$3"
        >
          <Button
            bg="$primary"
            borderRadius="$4"
            py="$3"
            minHeight={54}
            onPress={handleUpdate}
            disabled={updateJobMutation.isPending}
            pressStyle={{ opacity: 0.9 }}
          >
            <XStack
              alignItems="center"
              gap="$2"
            >
              {updateJobMutation.isPending ? (
                <Spinner
                  size="small"
                  color="white"
                />
              ) : (
                <Send
                  size={18}
                  color="white"
                />
              )}
              <Text
                color="white"
                fontSize="$4"
                fontWeight="600"
              >
                {updateJobMutation.isPending ? 'Updating...' : 'Update Job'}
              </Text>
            </XStack>
          </Button>

          <Button
            bg="white"
            borderColor="$borderColorHover"
            borderWidth={1}
            borderRadius="$4"
            py="$3"
            minHeight={54}
            onPress={() => router.back()}
            disabled={updateJobMutation.isPending}
            pressStyle={{ opacity: 0.9 }}
          >
            <XStack
              alignItems="center"
              gap="$2"
            >
              <Edit3
                size={18}
                color="$color"
              />
              <Text
                color="$color"
                fontSize="$4"
                fontWeight="600"
              >
                Edit
              </Text>
            </XStack>
          </Button>
        </YStack>

        {/* Fullscreen Image Viewer (only for images) */}
        {imageAttachments.length > 0 && (
          <ImageViewer
            images={imageAttachments.map((item) => {
              if (item.type === 'existing') {
                return (item.attachment as Attachment).file_url
              }
              return (item.attachment as LocalAttachment).file.uri
            })}
            initialIndex={imageViewerIndex}
            visible={imageViewerVisible}
            onClose={() => setImageViewerVisible(false)}
          />
        )}

        {/* Fullscreen Video Player */}
        {selectedVideo && (
          <VideoPlayer
            uri={selectedVideo.uri}
            thumbnailUri={selectedVideo.thumbnail}
            visible={true}
            onClose={() => setSelectedVideo(null)}
          />
        )}
      </YStack>
    </GradientBackground>
  )
}
