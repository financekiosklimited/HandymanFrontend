'use client'

import { useState, useRef } from 'react'
import { YStack, XStack, ScrollView, Text, Button, Image, Spinner, View, ImageViewer } from '@my/ui'
import { GradientBackground } from '@my/ui'
import { useGuestJob, formatErrorMessage } from '@my/api'
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  User,
  Briefcase,
  DollarSign,
  FileText,
  ListChecks,
  ChevronLeft,
  ChevronRight,
} from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { Dimensions, FlatList, Pressable } from 'react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const IMAGE_WIDTH = SCREEN_WIDTH - 32

interface JobDetailScreenProps {
  jobId: string
}

export function JobDetailScreen({ jobId }: JobDetailScreenProps) {
  const router = useRouter()
  const insets = useSafeArea()
  const { data: job, isLoading, error } = useGuestJob(jobId)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageViewerVisible, setImageViewerVisible] = useState(false)
  const [imageViewerIndex, setImageViewerIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

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
  const hasImages = job.images && job.images.length > 0

  return (
    <GradientBackground>
      <YStack
        flex={1}
        pt={insets.top}
      >
        {/* Header with back button */}
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
            Job Details
          </Text>
          <View width={38} />
        </XStack>

        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
        >
          <YStack
            px="$lg"
            pb={100}
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

              {/* Image Slider */}
              {hasImages && job.images && (
                <YStack gap="$3">
                  <View
                    height={220}
                    borderRadius={20}
                    overflow="hidden"
                    bg="$backgroundMuted"
                  >
                    <FlatList
                      ref={flatListRef}
                      data={job.images}
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      onScroll={handleImageScroll}
                      scrollEventThrottle={16}
                      renderItem={({ item, index }) => (
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
                              source={{ uri: item.image }}
                              width="100%"
                              height="100%"
                              resizeMode="cover"
                            />
                          </View>
                        </Pressable>
                      )}
                      keyExtractor={(item) => item.public_id}
                    />

                    {/* Navigation arrows */}
                    {job.images.length > 1 && (
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
                        {currentImageIndex < job.images.length - 1 && (
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
                    {job.images.length > 1 && (
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
                          {currentImageIndex + 1} / {job.images.length}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Pagination dots */}
                  {job.images.length > 1 && (
                    <XStack
                      justifyContent="center"
                      gap="$2"
                    >
                      {job.images.map((_, index) => (
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

            {/* Posted By Card */}
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
                </XStack>
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

        {/* Fullscreen Image Viewer */}
        {hasImages && job.images && (
          <ImageViewer
            images={job.images.map((img) => img.image)}
            initialIndex={imageViewerIndex}
            visible={imageViewerVisible}
            onClose={() => setImageViewerVisible(false)}
          />
        )}
      </YStack>
    </GradientBackground>
  )
}
