'use client'

import { useState, useRef, useMemo } from 'react'
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
  PageHeader,
} from '@my/ui'
import { GradientBackground } from '@my/ui'
import { PAGE_DESCRIPTIONS } from 'app/constants/page-descriptions'
import { useHandymanJobDetail, formatErrorMessage } from '@my/api'
import {
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  Briefcase,
  FileText,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  User,
  MessageCircle,
  Play,
} from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { useToastController } from '@tamagui/toast'
import { showSubmissionErrorToast } from 'app/utils/toast-messages'
import { Alert, Dimensions, FlatList, Pressable } from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const IMAGE_WIDTH = SCREEN_WIDTH - 32

interface HandymanJobDetailScreenProps {
  jobId: string
}

export function HandymanJobDetailScreen({ jobId }: HandymanJobDetailScreenProps) {
  const router = useRouter()
  const insets = useSafeArea()
  const toast = useToastController()
  const { data: job, isLoading, error, refetch } = useHandymanJobDetail(jobId)
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageViewerVisible, setImageViewerVisible] = useState(false)
  const [imageViewerIndex, setImageViewerIndex] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState<{
    uri: string
    thumbnail?: string
  } | null>(null)
  const flatListRef = useRef<FlatList>(null)

  // Type-safe attachment access - must be before any early returns
  const attachments = useMemo(() => {
    if (!job) return []
    return Array.isArray((job as { attachments?: unknown })?.attachments)
      ? ((job as { attachments?: unknown[] })?.attachments as Array<{
          public_id: string
          file_url: string
          file_type: 'image' | 'video' | 'document'
          file_name: string
          file_size: number
          thumbnail_url?: string | null
        }>)
      : []
  }, [job])

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

  // Navigate to apply form
  const handleApply = () => {
    if (!job) return
    router.push(`/(handyman)/jobs/${jobId}/apply`)
  }

  const handleNegotiate = () => {
    Alert.alert('Coming Soon', 'Job negotiation feature will be available soon.')
  }

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
            Loading job details...
          </Text>
        </YStack>
      </GradientBackground>
    )
  }

  if (error || !job) {
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
          <Text
            color="$colorSubtle"
            fontSize="$3"
            textAlign="center"
          >
            {formatErrorMessage(error)}
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

  const hasPrice = job.hourly_rate_min || job.estimated_budget
  const isPending = job.has_applied
  const applicationStatus = job.my_application?.status

  return (
    <GradientBackground>
      <YStack
        flex={1}
        pt={insets.top}
      >
        <PageHeader
          title="Job Details"
          description={PAGE_DESCRIPTIONS['job-detail-handyman']}
        />

        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
        >
          <YStack
            px="$lg"
            pb={180}
          >
            {/* Hero Section */}
            <YStack
              gap="$lg"
              mb="$xl"
            >
              {/* Title */}
              <YStack gap="$sm">
                <Text
                  fontSize={28}
                  fontWeight="bold"
                  color="$color"
                  lineHeight={34}
                >
                  {job.title}
                </Text>

                {/* Category & Price Row */}
                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  gap="$sm"
                >
                  {job.category && (
                    <XStack
                      bg="$primary"
                      px="$md"
                      py="$xs"
                      borderRadius="$full"
                    >
                      <Text
                        fontSize="$2"
                        fontWeight="500"
                        color="white"
                      >
                        {job.category.name}
                      </Text>
                    </XStack>
                  )}

                  {hasPrice && (
                    <XStack
                      alignItems="baseline"
                      gap={4}
                    >
                      <Text
                        fontSize="$6"
                        fontWeight="bold"
                        color="$primary"
                      >
                        {job.hourly_rate_min
                          ? `$${job.hourly_rate_min}${job.hourly_rate_max ? `-${job.hourly_rate_max}` : ''}`
                          : `$${job.estimated_budget}`}
                      </Text>
                      {job.hourly_rate_min && (
                        <Text
                          fontSize="$2"
                          color="$colorSubtle"
                        >
                          /hour
                        </Text>
                      )}
                    </XStack>
                  )}
                </XStack>
              </YStack>

              {/* Attachment Slider */}
              {hasAttachments && (
                <YStack gap="$3">
                  <View
                    height={220}
                    borderRadius={20}
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
                      renderItem={({ item }) => {
                        if (item.file_type === 'image') {
                          return (
                            <Pressable
                              onPress={() => {
                                const imageIndex = imageAttachments.findIndex(
                                  (attachment) => attachment.public_id === item.public_id
                                )
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
                                bg="$backgroundMuted"
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
                                    flex={1}
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
                            alignItems="center"
                            justifyContent="center"
                            bg="$backgroundMuted"
                          >
                            <DocumentThumbnail
                              fileUrl={item.file_url}
                              fileName={item.file_name}
                              fileSize={item.file_size}
                              width={180}
                              height={180}
                              showFileSize={false}
                            />
                          </View>
                        )
                      }}
                      keyExtractor={(item) => item.public_id}
                    />

                    {/* Navigation arrows */}
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

                    {/* Attachment counter */}
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

                  {/* Pagination dots */}
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
            </YStack>

            {/* Posted By Card - placed below thumbnail */}
            {job.homeowner && (
              <YStack
                bg="$backgroundMuted"
                borderRadius={20}
                p="$lg"
                mb="$lg"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <XStack
                  alignItems="center"
                  gap="$2"
                  mb="$md"
                >
                  <User
                    size={18}
                    color="$primary"
                  />
                  <Text
                    fontSize="$3"
                    fontWeight="600"
                    color="$colorSubtle"
                  >
                    POSTED BY
                  </Text>
                </XStack>
                <XStack
                  alignItems="center"
                  gap="$md"
                >
                  {job.homeowner.avatar_url ? (
                    <Image
                      source={{ uri: job.homeowner.avatar_url }}
                      width={48}
                      height={48}
                      borderRadius="$full"
                    />
                  ) : (
                    <YStack
                      width={48}
                      height={48}
                      borderRadius="$full"
                      bg="$primaryBackground"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text
                        fontSize="$5"
                        fontWeight="600"
                        color="$primary"
                      >
                        {job.homeowner.display_name.charAt(0).toUpperCase()}
                      </Text>
                    </YStack>
                  )}
                  <YStack flex={1}>
                    <Text
                      fontSize="$4"
                      fontWeight="500"
                      color="$color"
                    >
                      {job.homeowner.display_name}
                    </Text>
                    <Text
                      fontSize="$3"
                      color="$colorSubtle"
                    >
                      Homeowner
                    </Text>
                  </YStack>
                  {/* Chat Button */}
                  <Button
                    bg="$primary"
                    borderRadius={12}
                    px="$md"
                    py="$sm"
                    disabled={isChatLoading}
                    onPress={() => {
                      if (!job?.homeowner?.public_id) return
                      const params = new URLSearchParams({
                        userId: job.homeowner.public_id,
                        name: job.homeowner.display_name,
                      })
                      if (job.homeowner.avatar_url)
                        params.append('avatar', job.homeowner.avatar_url)
                      router.push(`/(handyman)/messages/new?${params.toString()}`)
                    }}
                    pressStyle={{ opacity: 0.8 }}
                  >
                    <XStack
                      alignItems="center"
                      gap="$xs"
                    >
                      {isChatLoading ? (
                        <Spinner
                          size="small"
                          color="white"
                        />
                      ) : (
                        <MessageCircle
                          size={16}
                          color="white"
                        />
                      )}
                      <Text
                        color="white"
                        fontSize="$3"
                        fontWeight="500"
                      >
                        {isChatLoading ? 'Opening...' : 'Chat'}
                      </Text>
                    </XStack>
                  </Button>
                </XStack>
              </YStack>
            )}

            {/* Description Card */}
            <YStack
              bg="$backgroundMuted"
              borderRadius={20}
              p="$lg"
              mb="$lg"
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
                {job.description || 'No description provided for this job.'}
              </Text>
            </YStack>

            {/* Tasks */}
            {job.tasks && job.tasks.length > 0 && (
              <YStack
                bg="$backgroundMuted"
                borderRadius={20}
                p="$lg"
                mb="$lg"
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
                  {job.tasks.map((task, index) => (
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
                      <YStack
                        flex={1}
                        gap={2}
                      >
                        <Text
                          fontSize="$4"
                          fontWeight="500"
                          color="$color"
                        >
                          {task.title}
                        </Text>
                        {task.description && (
                          <Text
                            fontSize="$3"
                            color="$colorSubtle"
                          >
                            {task.description}
                          </Text>
                        )}
                      </YStack>
                    </XStack>
                  ))}
                </YStack>
              </YStack>
            )}

            {/* Location & Address Card */}
            {(job.city || job.address) && (
              <YStack
                bg="$backgroundMuted"
                borderRadius={20}
                p="$lg"
                mb="$lg"
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
                  {job.city && (
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
                          fontSize="$4"
                          fontWeight="500"
                          color="$color"
                        >
                          {job.city.name}
                        </Text>
                        {job.distance_km != null && (
                          <Text
                            fontSize="$3"
                            color="$colorSubtle"
                          >
                            {Number(job.distance_km).toFixed(1)} km from your location
                          </Text>
                        )}
                      </YStack>
                    </XStack>
                  )}
                  {job.address && (
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
                        {job.address}
                        {job.postal_code && `, ${job.postal_code}`}
                      </Text>
                    </YStack>
                  )}
                </YStack>
              </YStack>
            )}

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
                      textTransform="capitalize"
                    >
                      {job.status}
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
                      Posted on
                    </Text>
                    <Text
                      fontSize="$4"
                      fontWeight="500"
                      color="$color"
                    >
                      {new Date(job.created_at).toLocaleString('en-US', {
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

                {hasPrice && (
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
                        Budget
                      </Text>
                      <Text
                        fontSize="$4"
                        fontWeight="500"
                        color="$color"
                      >
                        {job.hourly_rate_min
                          ? `$${job.hourly_rate_min}${job.hourly_rate_max ? ` - $${job.hourly_rate_max}` : ''} per hour`
                          : `$${job.estimated_budget} estimated`}
                      </Text>
                    </YStack>
                  </XStack>
                )}
              </YStack>
            </YStack>
          </YStack>
        </ScrollView>

        {/* Fixed Bottom Action Buttons */}
        <YStack
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          bg="$backgroundStrong"
          px="$lg"
          pt="$md"
          pb={insets.bottom}
          gap="$sm"
          borderTopWidth={1}
          borderTopColor="$borderColor"
        >
          {/* Apply Button */}
          <Button
            bg={isPending ? '$borderColor' : '$primary'}
            color="white"
            py="$md"
            borderRadius="$lg"
            fontWeight="600"
            fontSize="$4"
            disabled={isPending}
            opacity={isPending ? 0.7 : 1}
            onPress={handleApply}
            pressStyle={{ opacity: 0.8 }}
          >
            {isPending ? (
              <Text
                color="white"
                fontWeight="600"
                textTransform="capitalize"
              >
                {applicationStatus || 'Pending'}
              </Text>
            ) : (
              <Text
                color="white"
                fontWeight="600"
              >
                Apply for Job Listing
              </Text>
            )}
          </Button>

          {/* Negotiate Button */}
          {/* <Button
            bg="white"
            borderWidth={1}
            borderColor="$borderColor"
            py="$md"
            borderRadius="$lg"
            fontWeight="500"
            fontSize="$4"
            disabled
            opacity={0.5}
            onPress={handleNegotiate}
          >
            <Text
              color="$color"
              fontWeight="500"
            >
              Negotiate Job Listing (later)
            </Text>
          </Button> */}
        </YStack>

        {/* Fullscreen Image Viewer */}
        {imageUrls.length > 0 && (
          <ImageViewer
            images={imageUrls}
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
