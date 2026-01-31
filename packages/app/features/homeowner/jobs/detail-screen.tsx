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
import { useHomeownerJob, useDeleteJob } from '@my/api'
import type { HomeownerJobStatus } from '@my/api'
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
  Edit3,
  Trash2,
  Users,
  Play,
} from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { Alert, Dimensions, FlatList, Pressable } from 'react-native'
import { jobStatusColors, type JobStatus } from '@my/config'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const IMAGE_WIDTH = SCREEN_WIDTH - 32

const statusLabels: Record<HomeownerJobStatus, string> = {
  draft: 'Draft',
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  pending_completion: 'Pending Completion',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

interface HomeownerJobDetailScreenProps {
  jobId: string
}

export function HomeownerJobDetailScreen({ jobId }: HomeownerJobDetailScreenProps) {
  const router = useRouter()
  const insets = useSafeArea()
  const { data: job, isLoading, error, refetch } = useHomeownerJob(jobId)
  const deleteJobMutation = useDeleteJob()
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageViewerVisible, setImageViewerVisible] = useState(false)
  const [imageViewerIndex, setImageViewerIndex] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState<{
    uri: string
    thumbnail?: string
  } | null>(null)
  const flatListRef = useRef<FlatList>(null)

  // Type-safe attachment access - must be before any early returns to satisfy Rules of Hooks
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

  // Check if job can be edited/deleted
  const canModify = job && !['completed', 'cancelled', 'deleted'].includes(job.status)

  // Handle edit
  const handleEdit = () => {
    if (!job) return
    router.push(`/(homeowner)/jobs/edit/${job.public_id}`)
  }

  // Handle delete with confirmation
  const handleDelete = () => {
    if (!job) return

    Alert.alert(
      'Delete Job?',
      'Are you sure you want to delete this job listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    )
  }

  const confirmDelete = async () => {
    if (!job) return

    setIsDeleting(true)
    try {
      await deleteJobMutation.mutateAsync(job.public_id)
      router.replace('/(homeowner)/')
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to delete job'
      Alert.alert('Delete Failed', errorMessage)
    } finally {
      setIsDeleting(false)
    }
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
            bg="$errorBackground"
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
            {error instanceof Error
              ? error.message
              : 'The job you are looking for could not be found or may have been deleted.'}
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

  const statusColor = jobStatusColors[job.status as JobStatus] || jobStatusColors.draft

  return (
    <GradientBackground>
      <YStack
        flex={1}
        pt={insets.top}
      >
        <PageHeader
          title="Job Details"
          description={PAGE_DESCRIPTIONS['job-detail']}
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

                {/* Category & Budget Row */}
                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  gap="$sm"
                >
                  <XStack
                    gap="$sm"
                    alignItems="center"
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
                    {/* Status Badge */}
                    <XStack
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      bg={statusColor.bg as any}
                      px="$md"
                      py="$xs"
                      borderRadius="$full"
                    >
                      <Text
                        fontSize="$2"
                        fontWeight="500"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        color={statusColor.text as any}
                      >
                        {statusLabels[job.status]}
                      </Text>
                    </XStack>
                  </XStack>

                  <XStack
                    alignItems="baseline"
                    gap={4}
                  >
                    <Text
                      fontSize="$6"
                      fontWeight="bold"
                      color="$primary"
                    >
                      {'$'}
                      {job.estimated_budget}
                    </Text>
                  </XStack>
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

                    {/* Image counter */}
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

            {/* Applications Card (if any) */}
            {!!job.applicant_count && job.applicant_count > 0 && (
              <YStack
                bg="$infoBackground"
                borderRadius={20}
                p="$lg"
                mb="$lg"
                borderWidth={1}
                borderColor="rgba(59, 130, 246, 0.2)"
              >
                <XStack
                  alignItems="center"
                  gap="$md"
                >
                  <YStack
                    width={40}
                    height={40}
                    borderRadius="$full"
                    bg="rgba(59, 130, 246, 0.2)"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Users
                      size={18}
                      color="$info"
                    />
                  </YStack>
                  <YStack flex={1}>
                    <Text
                      fontSize="$4"
                      fontWeight="600"
                      color="$info"
                    >
                      {job.applicant_count} Application{job.applicant_count > 1 ? 's' : ''}
                    </Text>
                    <Text
                      fontSize="$3"
                      color="$info"
                    >
                      Handymen have applied to this job
                    </Text>
                  </YStack>
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
                        {!!task.description && (
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
            {!!(job.city || job.address) && (
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
                  {!!job.city && (
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
                      </YStack>
                    </XStack>
                  )}
                  {!!job.address && (
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
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      color={statusColor.text as any}
                    >
                      {statusLabels[job.status]}
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
                      {'$'}
                      {job.estimated_budget} estimated
                    </Text>
                  </YStack>
                </XStack>
              </YStack>
            </YStack>
          </YStack>
        </ScrollView>

        {/* Fixed Bottom Action Buttons */}
        {canModify && (
          <YStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            bg="$background"
            px="$lg"
            pt="$md"
            pb={insets.bottom}
            gap="$sm"
            borderTopWidth={1}
            borderTopColor="$borderColor"
          >
            {/* Edit Button */}
            <Button
              bg="$primary"
              color="white"
              py="$md"
              borderRadius="$lg"
              fontWeight="600"
              fontSize="$4"
              onPress={handleEdit}
              pressStyle={{ opacity: 0.8 }}
            >
              <XStack
                alignItems="center"
                gap="$sm"
              >
                <Edit3
                  size={18}
                  color="white"
                />
                <Text
                  color="white"
                  fontWeight="600"
                >
                  Edit Job
                </Text>
              </XStack>
            </Button>

            {/* Delete Button */}
            <Button
              bg="white"
              borderWidth={1}
              borderColor="$error"
              py="$md"
              borderRadius="$lg"
              fontWeight="500"
              fontSize="$4"
              disabled={isDeleting}
              opacity={isDeleting ? 0.7 : 1}
              onPress={handleDelete}
              pressStyle={{ opacity: 0.8 }}
            >
              {isDeleting ? (
                <XStack
                  alignItems="center"
                  gap="$sm"
                >
                  <Spinner
                    size="small"
                    color="$error"
                  />
                  <Text
                    color="$error"
                    fontWeight="500"
                  >
                    Deleting...
                  </Text>
                </XStack>
              ) : (
                <XStack
                  alignItems="center"
                  gap="$sm"
                >
                  <Trash2
                    size={18}
                    color="$error"
                  />
                  <Text
                    color="$error"
                    fontWeight="500"
                  >
                    Delete Job
                  </Text>
                </XStack>
              )}
            </Button>
          </YStack>
        )}

        {/* Show message for non-modifiable jobs */}
        {!canModify && job && (
          <YStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            bg="$backgroundStrong"
            px="$lg"
            pt="$md"
            pb={insets.bottom}
            borderTopWidth={1}
            borderTopColor="$borderColor"
          >
            <YStack
              bg="$backgroundMuted"
              borderRadius="$lg"
              p="$md"
              alignItems="center"
            >
              <Text
                color="$colorSubtle"
                fontSize="$3"
                textAlign="center"
              >
                This job is {job.status.replace('_', ' ')} and cannot be modified.
              </Text>
            </YStack>
          </YStack>
        )}

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
