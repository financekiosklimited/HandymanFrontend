'use client'

import { useState, useRef, useMemo, useCallback } from 'react'
import {
  YStack,
  XStack,
  ScrollView,
  Text,
  Button,
  Image,
  Spinner,
  View,
  ImageViewer,
  VideoPlayer,
  DocumentThumbnail,
} from '@my/ui'
import { GradientBackground, OfferStatusBadge, TimeRemainingBadge } from '@my/ui'
import {
  useHandymanDirectOffer,
  useAcceptDirectOffer,
  useRejectDirectOffer,
  formatOfferDate,
} from '@my/api'
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  FileText,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  User,
  Play,
  AlertCircle,
  Star,
  MessageCircle,
} from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { Alert, Dimensions, FlatList, Pressable } from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const IMAGE_WIDTH = SCREEN_WIDTH - 32

interface HandymanDirectOfferDetailScreenProps {
  offerId: string
}

export function HandymanDirectOfferDetailScreen({ offerId }: HandymanDirectOfferDetailScreenProps) {
  const router = useRouter()
  const insets = useSafeArea()
  const { data: offer, isLoading, error, refetch } = useHandymanDirectOffer(offerId)
  const acceptMutation = useAcceptDirectOffer()
  const rejectMutation = useRejectDirectOffer()

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageViewerVisible, setImageViewerVisible] = useState(false)
  const [imageViewerIndex, setImageViewerIndex] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState<{
    uri: string
    thumbnail?: string
  } | null>(null)
  const flatListRef = useRef<FlatList>(null)

  // Type-safe attachment access
  const attachments = useMemo(() => {
    if (!offer?.attachments) return []
    return offer.attachments
  }, [offer])

  const imageAttachments = useMemo(
    () => attachments.filter((attachment) => attachment.file_type === 'image'),
    [attachments]
  )
  const imageUrls = useMemo(
    () => imageAttachments.map((attachment) => attachment.file_url),
    [imageAttachments]
  )
  const hasAttachments = attachments.length > 0

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

  // Check if offer can be responded to (only pending)
  const canRespond = offer?.offer_status === 'pending'

  // Handle accept
  const handleAccept = useCallback(() => {
    if (!offer) return

    Alert.alert(
      'Accept This Offer?',
      `By accepting, this job will start immediately and be added to your active jobs. The budget is $${offer.estimated_budget}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept Offer',
          onPress: async () => {
            try {
              await acceptMutation.mutateAsync(offer.public_id)
              Alert.alert('Offer Accepted!', 'This job has been added to your active jobs.', [
                {
                  text: 'View My Jobs',
                  onPress: () => router.replace('/(handyman)/jobs'),
                },
              ])
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to accept offer')
            }
          },
        },
      ]
    )
  }, [offer, acceptMutation, router])

  // Handle reject - navigate to rejection screen
  const handleReject = useCallback(() => {
    if (!offer) return
    router.push(`/(handyman)/direct-offers/${offer.public_id}/reject`)
  }, [offer, router])

  if (isLoading) {
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
            Loading offer details...
          </Text>
        </YStack>
      </GradientBackground>
    )
  }

  if (error || !offer) {
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
            bg="$errorBackground"
            alignItems="center"
            justifyContent="center"
          >
            <AlertCircle
              size={28}
              color="$error"
            />
          </YStack>
          <Text
            color="$color"
            fontSize="$5"
            fontWeight="600"
            textAlign="center"
          >
            Offer not found
          </Text>
          <Text
            color="$colorSubtle"
            fontSize="$3"
            textAlign="center"
          >
            This offer may have been deleted or you don't have permission to view it.
          </Text>
          <Button
            mt="$md"
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
            Offer Details
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
            {/* Status and Time */}
            <XStack
              justifyContent="space-between"
              alignItems="center"
            >
              <OfferStatusBadge
                status={offer.offer_status}
                size="md"
              />
              {offer.offer_status === 'pending' && (
                <TimeRemainingBadge
                  expiresAt={offer.offer_expires_at}
                  size="md"
                />
              )}
              {offer.offer_status !== 'pending' && (
                <Text
                  fontSize="$2"
                  color="$colorMuted"
                >
                  {formatOfferDate(offer.created_at)}
                </Text>
              )}
            </XStack>

            {/* Homeowner Card */}
            <YStack
              bg="$backgroundStrong"
              borderRadius="$4"
              p="$4"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <Text
                fontSize="$2"
                color="$colorMuted"
                fontWeight="600"
                mb="$3"
              >
                FROM HOMEOWNER
              </Text>
              <XStack
                gap="$3"
                alignItems="center"
              >
                {offer.homeowner.avatar_url ? (
                  <Image
                    source={{ uri: offer.homeowner.avatar_url }}
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
                    {offer.homeowner.display_name}
                  </Text>
                  {offer.homeowner.rating > 0 && (
                    <XStack
                      alignItems="center"
                      gap={4}
                    >
                      <Star
                        size={14}
                        fill="#FFB800"
                        color="#FFB800"
                      />
                      <Text
                        fontSize="$2"
                        color="$colorSubtle"
                      >
                        {offer.homeowner.rating.toFixed(1)} ({offer.homeowner.review_count} reviews)
                      </Text>
                    </XStack>
                  )}
                </YStack>
                {/* Chat Button */}
                <Button
                  bg="$primary"
                  borderRadius={12}
                  px="$md"
                  py="$sm"
                  onPress={() => {
                    const params = new URLSearchParams({
                      userId: offer.homeowner.public_id,
                      name: offer.homeowner.display_name,
                    })
                    if (offer.homeowner.avatar_url)
                      params.append('avatar', offer.homeowner.avatar_url)
                    router.push(`/(handyman)/messages/new?${params.toString()}`)
                  }}
                  pressStyle={{ opacity: 0.8 }}
                >
                  <XStack
                    alignItems="center"
                    gap="$xs"
                  >
                    <MessageCircle
                      size={16}
                      color="white"
                    />
                    <Text
                      color="white"
                      fontSize="$3"
                      fontWeight="500"
                    >
                      Chat
                    </Text>
                  </XStack>
                </Button>
              </XStack>
            </YStack>

            {/* Attachment Gallery */}
            {hasAttachments && (
              <YStack gap="$3">
                <View
                  height={220}
                  borderRadius="$4"
                  overflow="hidden"
                  bg="$backgroundMuted"
                >
                  <FlatList
                    ref={flatListRef}
                    data={attachments}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleImageScroll}
                    scrollEventThrottle={16}
                    renderItem={({ item, index }) => {
                      if (item.file_type === 'image') {
                        return (
                          <Pressable
                            onPress={() => {
                              const imgIndex = imageAttachments.findIndex(
                                (a) => a.public_id === item.public_id
                              )
                              setImageViewerIndex(imgIndex >= 0 ? imgIndex : 0)
                              setImageViewerVisible(true)
                            }}
                          >
                            <View
                              width={IMAGE_WIDTH}
                              height={220}
                            >
                              <Image
                                source={{ uri: item.file_url }}
                                width="100%"
                                height="100%"
                                resizeMode="cover"
                              />
                            </View>
                          </Pressable>
                        )
                      }

                      if (item.file_type === 'video') {
                        return (
                          <Pressable
                            onPress={() =>
                              setSelectedVideo({
                                uri: item.file_url,
                                thumbnail: item.thumbnail_url || undefined,
                              })
                            }
                          >
                            <View
                              width={IMAGE_WIDTH}
                              height={220}
                            >
                              {item.thumbnail_url ? (
                                <Image
                                  source={{ uri: item.thumbnail_url }}
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
                                  <Play
                                    size={48}
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
                                  p="$3"
                                >
                                  <Play
                                    size={32}
                                    color="white"
                                    fill="white"
                                  />
                                </View>
                              </View>
                            </View>
                          </Pressable>
                        )
                      }

                      return (
                        <View
                          width={IMAGE_WIDTH}
                          height={220}
                        >
                          <DocumentThumbnail
                            fileUrl={item.file_url}
                            fileName={item.file_name || 'document'}
                            fileSize={item.file_size}
                            mimeType={item.mime_type}
                            width={IMAGE_WIDTH}
                            height={220}
                          />
                        </View>
                      )
                    }}
                    keyExtractor={(item) => item.public_id}
                  />

                  {attachments.length > 1 && (
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
                      {currentImageIndex < attachments.length - 1 && (
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

                  {attachments.length > 1 && (
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
                        {currentImageIndex + 1} / {attachments.length}
                      </Text>
                    </View>
                  )}
                </View>

                {attachments.length > 1 && (
                  <XStack
                    justifyContent="center"
                    gap="$2"
                  >
                    {attachments.map((_, index) => (
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
                    {offer.title}
                  </Text>
                  {offer.category && (
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
                        {offer.category.name}
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
                    ${offer.estimated_budget}
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
                {offer.description}
              </Text>
            </YStack>

            {/* Tasks Section */}
            {offer.tasks && offer.tasks.length > 0 && (
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
                  {offer.tasks.map((task, index) => (
                    <XStack
                      key={task.public_id}
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
                {offer.city && (
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
                        {offer.city.name}, {offer.city.province}
                      </Text>
                    </YStack>
                  </XStack>
                )}

                {offer.address && (
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
                      {offer.address}
                      {offer.postal_code && `, ${offer.postal_code}`}
                    </Text>
                  </YStack>
                )}
              </YStack>
            </YStack>

            {/* Offer Timeline */}
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
                  TIMELINE
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
                      Received
                    </Text>
                    <Text
                      fontSize="$4"
                      fontWeight="500"
                      color="$color"
                    >
                      {new Date(offer.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </YStack>
                </XStack>

                {offer.offer_responded_at && (
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
                        Responded
                      </Text>
                      <Text
                        fontSize="$4"
                        fontWeight="500"
                        color="$color"
                      >
                        {new Date(offer.offer_responded_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </YStack>
                  </XStack>
                )}
              </YStack>
            </YStack>
          </YStack>
        </ScrollView>

        {/* Bottom Actions */}
        {canRespond && (
          <YStack
            px="$4"
            pb={insets.bottom + 16}
            pt="$3"
            borderTopWidth={1}
            borderColor="$borderColor"
            bg="$background"
            gap="$3"
          >
            <Button
              bg="$primary"
              borderRadius="$4"
              py="$3"
              minHeight={54}
              onPress={handleAccept}
              disabled={acceptMutation.isPending}
              pressStyle={{ opacity: 0.9 }}
            >
              <XStack
                alignItems="center"
                gap="$2"
              >
                {acceptMutation.isPending ? (
                  <Spinner
                    size="small"
                    color="white"
                  />
                ) : (
                  <Check
                    size={18}
                    color="white"
                  />
                )}
                <Text
                  color="white"
                  fontSize="$4"
                  fontWeight="600"
                >
                  {acceptMutation.isPending ? 'Accepting...' : 'Accept Offer'}
                </Text>
              </XStack>
            </Button>

            <Button
              bg="$errorBackground"
              borderRadius="$4"
              py="$3"
              minHeight={54}
              onPress={handleReject}
              disabled={rejectMutation.isPending}
              pressStyle={{ opacity: 0.9 }}
            >
              <XStack
                alignItems="center"
                gap="$2"
              >
                <X
                  size={18}
                  color="$error"
                />
                <Text
                  color="$error"
                  fontSize="$4"
                  fontWeight="600"
                >
                  Decline Offer
                </Text>
              </XStack>
            </Button>
          </YStack>
        )}

        {/* Image Viewer */}
        {imageUrls.length > 0 && (
          <ImageViewer
            images={imageUrls}
            initialIndex={imageViewerIndex}
            visible={imageViewerVisible}
            onClose={() => setImageViewerVisible(false)}
          />
        )}

        {/* Video Player */}
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
