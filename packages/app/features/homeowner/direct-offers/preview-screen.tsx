'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
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
  PressPresets,
} from '@my/ui'
import { GradientBackground } from '@my/ui'
import {
  useCreateDirectOffer,
  formatErrorMessage,
  formatValidationError,
  OFFER_EXPIRY_OPTIONS,
} from '@my/api'
import type { CreateDirectOfferValidationError, LocalAttachment, AttachmentUpload } from '@my/api'
import { useRouter, useLocalSearchParams } from 'expo-router'
import {
  MapPin,
  DollarSign,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Briefcase,
  ListChecks,
  FileText,
  Clock,
  Calendar,
  Play,
  Video,
  File,
  User,
} from '@tamagui/lucide-icons'
import { PageHeader } from '@my/ui'
import { PAGE_DESCRIPTIONS } from 'app/constants/page-descriptions'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { HTTPError } from 'ky'
import { Dimensions, FlatList, Pressable, Linking } from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const IMAGE_WIDTH = SCREEN_WIDTH - 32

interface JobTask {
  id: string
  title: string
}

interface HandymanInfo {
  public_id: string
  display_name: string
  avatar_url: string | null
  rating: number
  review_count: number
  job_title?: string | null
}

interface PreviewData {
  title: string
  description: string
  estimated_budget: number
  category_id: string
  city_id: string
  address: string
  postal_code: string
  offer_expires_in_days: number
  target_handyman_id: string
  tasks: JobTask[]
  attachments: LocalAttachment[]
  categoryName?: string
  cityName?: string
  cityProvince?: string
}

export function DirectOfferPreviewScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const params = useLocalSearchParams<{ formData: string; handymanInfo: string }>()
  const createOfferMutation = useCreateDirectOffer()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageViewerVisible, setImageViewerVisible] = useState(false)
  const [imageViewerIndex, setImageViewerIndex] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState<{
    uri: string
    thumbnail?: string
  } | null>(null)
  const flatListRef = useRef<FlatList>(null)

  // Parse form data and handyman info from params
  const formData: PreviewData | null = params.formData ? JSON.parse(params.formData) : null
  const handymanInfo: HandymanInfo | null = params.handymanInfo
    ? JSON.parse(params.handymanInfo)
    : null

  // Debug log parsed data
  console.info('[DirectOfferPreview] Parsed formData:', formData)
  console.info('[DirectOfferPreview] Parsed handymanInfo:', handymanInfo)
  if (formData?.attachments) {
    console.info('[DirectOfferPreview] Attachments:', formData.attachments)
  }

  // Get expiry label
  const expiryLabel = useMemo(() => {
    if (!formData) return ''
    const option = OFFER_EXPIRY_OPTIONS.find((o) => o.value === formData.offer_expires_in_days)
    return option?.label || `${formData.offer_expires_in_days} days`
  }, [formData])

  if (!formData || !handymanInfo) {
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

  // Send offer
  const handleSendOffer = useCallback(async () => {
    setErrorMessage(null)

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

    const requestData = {
      target_handyman_id: formData.target_handyman_id,
      title: formData.title,
      description: formData.description,
      estimated_budget: formData.estimated_budget,
      category_id: formData.category_id,
      city_id: formData.city_id,
      address: formData.address,
      postal_code: formData.postal_code || undefined,
      offer_expires_in_days: formData.offer_expires_in_days,
      tasks: formData.tasks.map((t) => ({ title: t.title })),
      attachments,
    }

    try {
      const response = await createOfferMutation.mutateAsync(requestData)

      // Success - navigate to success screen with offer details
      router.replace({
        pathname: '/(homeowner)/direct-offers/success',
        params: {
          offerId: response?.public_id || '',
          handymanName: handymanInfo.display_name,
          expiresInDays: formData.offer_expires_in_days.toString(),
        },
      })
    } catch (error) {
      console.error('[DirectOfferPreview] Failed to send offer:', error)
      console.error('[DirectOfferPreview] Request data:', JSON.stringify(requestData, null, 2))
      if (error instanceof HTTPError) {
        try {
          const errorData = (await error.response.json()) as CreateDirectOfferValidationError
          console.error('[DirectOfferPreview] Server error response:', errorData)
          setErrorMessage(formatValidationError(errorData))
        } catch {
          setErrorMessage('Failed to send offer. Please try again.')
        }
      } else {
        setErrorMessage(formatErrorMessage(error))
      }
    }
  }, [formData, handymanInfo, createOfferMutation, router])

  return (
    <GradientBackground>
      <YStack
        flex={1}
        pt={insets.top}
      >
        <PageHeader
          title="Review Offer"
          description={PAGE_DESCRIPTIONS['create-direct-offer']}
          onBack={() => router.back()}
        />

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
            {!!errorMessage && (
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
                    Unable to send offer
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

            {/* Handyman Card */}
            <YStack
              bg="$primaryBackground"
              borderRadius="$4"
              p="$4"
              borderWidth={1}
              borderColor="$primary"
            >
              <Text
                fontSize="$2"
                color="$primary"
                fontWeight="600"
                mb="$3"
              >
                SENDING OFFER TO
              </Text>
              <XStack
                gap="$3"
                alignItems="center"
              >
                {handymanInfo.avatar_url ? (
                  <Image
                    source={{ uri: handymanInfo.avatar_url }}
                    width={56}
                    height={56}
                    borderRadius={28}
                  />
                ) : (
                  <View
                    width={56}
                    height={56}
                    borderRadius={28}
                    bg="$backgroundMuted"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <User
                      size={24}
                      color="$colorMuted"
                    />
                  </View>
                )}
                <YStack
                  flex={1}
                  gap={2}
                >
                  <Text
                    fontSize="$4"
                    fontWeight="600"
                    color="$color"
                  >
                    {handymanInfo.display_name}
                  </Text>
                  {handymanInfo.job_title && (
                    <Text
                      fontSize="$2"
                      color="$colorSubtle"
                    >
                      {handymanInfo.job_title}
                    </Text>
                  )}
                  {handymanInfo.rating > 0 && (
                    <XStack
                      alignItems="center"
                      gap={4}
                    >
                      <Text
                        fontSize={12}
                        color="$accent"
                      >
                        ★
                      </Text>
                      <Text
                        fontSize="$2"
                        color="$colorSubtle"
                      >
                        {handymanInfo.rating.toFixed(1)} ({handymanInfo.review_count} reviews)
                      </Text>
                    </XStack>
                  )}
                </YStack>
              </XStack>
            </YStack>

            {/* Attachment Gallery */}
            {formData.attachments.length > 0 && (
              <YStack gap="$3">
                <View
                  height={220}
                  borderRadius="$4"
                  overflow="hidden"
                  bg="$backgroundMuted"
                >
                  <FlatList
                    ref={flatListRef}
                    data={formData.attachments}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleImageScroll}
                    scrollEventThrottle={16}
                    renderItem={({ item, index }) => {
                      // Image attachment
                      if (item.file_type === 'image') {
                        return (
                          <Pressable
                            onPress={() => {
                              setImageViewerIndex(index)
                              setImageViewerVisible(true)
                            }}
                          >
                            <View
                              width={IMAGE_WIDTH}
                              height={220}
                            >
                              <Image
                                source={{ uri: item.file.uri }}
                                width="100%"
                                height="100%"
                                resizeMode="cover"
                              />
                            </View>
                          </Pressable>
                        )
                      }

                      // Video attachment
                      if (item.file_type === 'video') {
                        return (
                          <Pressable
                            onPress={() =>
                              setSelectedVideo({
                                uri: item.file.uri,
                                thumbnail: item.thumbnail_uri || undefined,
                              })
                            }
                          >
                            <View
                              width={IMAGE_WIDTH}
                              height={220}
                            >
                              {item.thumbnail_uri ? (
                                <Image
                                  source={{ uri: item.thumbnail_uri }}
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
                              {item.duration_seconds !== undefined && (
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
                                    {Math.floor(item.duration_seconds / 60)}:
                                    {(item.duration_seconds % 60).toString().padStart(2, '0')}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </Pressable>
                        )
                      }

                      // Document attachment
                      return (
                        <Pressable
                          onPress={() => {
                            Linking.openURL(item.file.uri).catch(() => {})
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
                              {item.file_name}
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
                    keyExtractor={(item) => item.id}
                  />

                  {/* Navigation arrows */}
                  {formData.attachments.length > 1 && (
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
                          {...PressPresets.icon}
                        >
                          <ChevronLeft
                            size={20}
                            color="$color"
                          />
                        </Button>
                      )}
                      {currentImageIndex < formData.attachments.length - 1 && (
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
                          {...PressPresets.icon}
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
                  {formData.attachments.length > 1 && (
                    <View
                      position="absolute"
                      bottom="$3"
                      right="$3"
                      bg="rgba(0,0,0,0.6)"
                      px="$2"
                      py="$1"
                      borderRadius="$2"
                    >
                      <Text
                        color="white"
                        fontSize="$2"
                        fontWeight="500"
                      >
                        {currentImageIndex + 1} / {formData.attachments.length}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Pagination dots */}
                {formData.attachments.length > 1 && (
                  <XStack
                    justifyContent="center"
                    gap="$2"
                  >
                    {formData.attachments.map((_, index) => (
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
            {formData.tasks.length > 0 && (
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
                  {formData.tasks.map((task, index) => (
                    <XStack
                      key={task.id}
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

            {/* Offer Details Card */}
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
                <Clock
                  size={18}
                  color="$primary"
                />
                <Text
                  fontSize="$3"
                  fontWeight="600"
                  color="$colorSubtle"
                >
                  OFFER DETAILS
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
                      Offer Expires In
                    </Text>
                    <Text
                      fontSize="$4"
                      fontWeight="500"
                      color="$color"
                    >
                      {expiryLabel}
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
            onPress={handleSendOffer}
            disabled={createOfferMutation.isPending}
            {...PressPresets.primary}
          >
            <XStack
              alignItems="center"
              gap="$2"
            >
              {createOfferMutation.isPending ? (
                <Spinner
                  size="small"
                  color="white"
                />
              ) : (
                <Briefcase
                  size={18}
                  color="white"
                />
              )}
              <Text
                color="white"
                fontSize="$4"
                fontWeight="600"
              >
                {createOfferMutation.isPending ? 'Sending Offer...' : 'Send Offer'}
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
            disabled={createOfferMutation.isPending}
            {...PressPresets.secondary}
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
        {formData.attachments.filter((a) => a.file_type === 'image').length > 0 && (
          <ImageViewer
            images={formData.attachments
              .filter((a) => a.file_type === 'image')
              .map((img) => img.file.uri)}
            initialIndex={imageViewerIndex}
            visible={imageViewerVisible}
            onClose={() => setImageViewerVisible(false)}
          />
        )}

        {/* Fullscreen Video Player */}
        {!!selectedVideo && (
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
