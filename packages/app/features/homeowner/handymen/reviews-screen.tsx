'use client'

import { useMemo } from 'react'
import { YStack, XStack, ScrollView, Text, Button, Image, Spinner, View } from '@my/ui'
import { GradientBackground } from '@my/ui'
import {
  useHandymanReviews,
  useGuestHandymanReviews,
  useGuestHandyman,
  formatErrorMessage,
} from '@my/api'
import type { HandymanReviewItem, RatingStats } from '@my/api'
import { ArrowLeft, Star, MessageSquare, User } from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'

interface HandymanReviewsScreenProps {
  handymanId: string
  handymanName?: string
  /** Use homeowner endpoint (authenticated) or guest endpoint (public) */
  mode?: 'homeowner' | 'guest'
}

// Rating Distribution Bar Component
function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <XStack
      alignItems="center"
      gap="$sm"
      py={2}
    >
      <XStack
        alignItems="center"
        gap={2}
        width={20}
      >
        <Text
          fontSize={12}
          fontWeight="600"
          color="$colorSubtle"
        >
          {stars}
        </Text>
      </XStack>
      <Star
        size={12}
        fill="#FFB800"
        color="#FFB800"
      />
      <View
        flex={1}
        height={6}
        borderRadius={3}
        bg="rgba(0,0,0,0.06)"
        overflow="hidden"
      >
        <View
          height={6}
          borderRadius={3}
          width={`${percentage}%` as any}
          bg={stars >= 4 ? '$success' : stars >= 3 ? '$warning' : '$error'}
        />
      </View>
      <Text
        fontSize={11}
        color="$colorMuted"
        width={32}
        textAlign="right"
      >
        {count}
      </Text>
    </XStack>
  )
}

// Rating Summary Card Component
function RatingSummaryCard({ ratingStats }: { ratingStats: RatingStats }) {
  const distribution = ratingStats.distribution

  return (
    <YStack
      bg="rgba(255,255,255,0.98)"
      borderRadius={24}
      p="$lg"
      gap="$md"
      borderWidth={1}
      borderColor="rgba(0,0,0,0.06)"
      shadowColor="black"
      shadowOffset={{ width: 0, height: 8 }}
      shadowOpacity={0.04}
      shadowRadius={16}
    >
      <XStack
        alignItems="center"
        gap="$lg"
      >
        {/* Large Rating Number */}
        <YStack
          alignItems="center"
          gap="$xs"
        >
          <Text
            fontSize={48}
            fontWeight="800"
            color="$color"
            lineHeight={52}
          >
            {ratingStats.average.toFixed(1)}
          </Text>
          <XStack
            alignItems="center"
            gap={3}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                fill={star <= Math.round(ratingStats.average) ? '#FFB800' : '#E5E7EB'}
                color={star <= Math.round(ratingStats.average) ? '#FFB800' : '#E5E7EB'}
              />
            ))}
          </XStack>
          <Text
            fontSize="$2"
            color="$colorSubtle"
            mt={2}
          >
            {ratingStats.total_count} {ratingStats.total_count === 1 ? 'review' : 'reviews'}
          </Text>
        </YStack>

        {/* Rating Distribution */}
        {distribution && (
          <YStack
            flex={1}
            gap={0}
          >
            <RatingBar
              stars={5}
              count={distribution['5']}
              total={ratingStats.total_count}
            />
            <RatingBar
              stars={4}
              count={distribution['4']}
              total={ratingStats.total_count}
            />
            <RatingBar
              stars={3}
              count={distribution['3']}
              total={ratingStats.total_count}
            />
            <RatingBar
              stars={2}
              count={distribution['2']}
              total={ratingStats.total_count}
            />
            <RatingBar
              stars={1}
              count={distribution['1']}
              total={ratingStats.total_count}
            />
          </YStack>
        )}
      </XStack>
    </YStack>
  )
}

// Single Review Card Component
function ReviewCard({ review }: { review: HandymanReviewItem }) {
  const formattedDate = new Date(review.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <YStack
      bg="rgba(255,255,255,0.98)"
      borderRadius={20}
      p="$md"
      gap="$sm"
      borderWidth={1}
      borderColor="rgba(0,0,0,0.05)"
      shadowColor="black"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.02}
      shadowRadius={8}
    >
      {/* Header: Avatar + Name + Rating + Date */}
      <XStack
        alignItems="center"
        gap="$md"
      >
        {/* Avatar */}
        <View
          width={44}
          height={44}
          borderRadius={22}
          overflow="hidden"
          bg="$backgroundMuted"
          borderWidth={2}
          borderColor="rgba(255,255,255,0.8)"
        >
          {review.reviewer_avatar_url ? (
            <Image
              source={{ uri: review.reviewer_avatar_url }}
              width="100%"
              height="100%"
              resizeMode="cover"
            />
          ) : (
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              bg="$primaryBackground"
            >
              <User
                size={20}
                color="$primary"
              />
            </YStack>
          )}
        </View>

        {/* Name and Date */}
        <YStack
          flex={1}
          gap={2}
        >
          <Text
            fontSize="$4"
            fontWeight="600"
            color="$color"
          >
            {review.reviewer_display_name || 'Anonymous'}
          </Text>
          <Text
            fontSize="$2"
            color="$colorMuted"
          >
            {formattedDate}
          </Text>
        </YStack>

        {/* Rating Badge */}
        <XStack
          bg="rgba(245, 158, 11, 0.12)"
          px="$sm"
          py="$xs"
          borderRadius="$full"
          alignItems="center"
          gap={3}
        >
          <Star
            size={14}
            fill="#FFB800"
            color="#FFB800"
          />
          <Text
            fontSize="$3"
            fontWeight="700"
            color="#F59E0B"
          >
            {review.rating}
          </Text>
        </XStack>
      </XStack>

      {/* Comment */}
      {review.comment && (
        <YStack
          bg="$backgroundMuted"
          p="$md"
          borderRadius={14}
          borderWidth={1}
          borderColor="rgba(0,0,0,0.02)"
        >
          <Text
            fontSize="$3"
            color="$color"
            lineHeight={21}
          >
            "{review.comment}"
          </Text>
        </YStack>
      )}
    </YStack>
  )
}

// Empty State Component
function EmptyReviews() {
  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      px="$xl"
      py="$xl"
      gap="$md"
    >
      <YStack
        width={100}
        height={100}
        borderRadius={50}
        bg="$backgroundMuted"
        alignItems="center"
        justifyContent="center"
        mb="$sm"
      >
        <MessageSquare
          size={44}
          color="$colorMuted"
        />
      </YStack>
      <Text
        fontSize="$6"
        fontWeight="700"
        color="$color"
        textAlign="center"
      >
        No Reviews Yet
      </Text>
      <Text
        fontSize="$3"
        color="$colorSubtle"
        textAlign="center"
        lineHeight={20}
      >
        This handyman hasn't received any reviews yet. Be the first to leave feedback after a
        completed job!
      </Text>
    </YStack>
  )
}

export function HandymanReviewsScreen({
  handymanId,
  handymanName,
  mode = 'homeowner',
}: HandymanReviewsScreenProps) {
  const router = useRouter()
  const insets = useSafeArea()

  // Fetch handyman details if name not provided
  const { data: handymanData } = useGuestHandyman(handymanId)
  const displayName = handymanName || handymanData?.display_name || 'Handyman'

  // Use appropriate hook based on mode
  const homeownerReviews = useHandymanReviews(handymanId, { enabled: mode === 'homeowner' })
  const guestReviews = useGuestHandymanReviews(handymanId, { enabled: mode === 'guest' })

  const reviewsQuery = mode === 'homeowner' ? homeownerReviews : guestReviews

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = reviewsQuery

  // Flatten paginated results
  const reviews = useMemo(() => {
    return data?.pages.flatMap((page) => page.results) || []
  }, [data])

  // Get rating stats from first page
  const ratingStats = data?.pages[0]?.ratingStats

  // Loading state
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
            Loading reviews...
          </Text>
        </YStack>
      </GradientBackground>
    )
  }

  // Error state
  if (error) {
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
              Reviews
            </Text>
            <View width={38} />
          </XStack>

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
              <MessageSquare
                size={28}
                color="$error"
              />
            </YStack>
            <Text
              color="$color"
              fontSize="$5"
              fontWeight="600"
            >
              Unable to Load Reviews
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
          <YStack
            flex={1}
            alignItems="center"
          >
            <Text
              fontSize={17}
              fontWeight="700"
              color="$color"
              textAlign="center"
            >
              Reviews
            </Text>
            <Text
              fontSize="$2"
              color="$colorSubtle"
              textAlign="center"
              numberOfLines={1}
            >
              {displayName}
            </Text>
          </YStack>
          <View width={38} />
        </XStack>

        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
        >
          <YStack
            px="$lg"
            pb={100}
            gap="$md"
          >
            {/* Rating Summary Card */}
            {ratingStats && ratingStats.total_count > 0 && (
              <RatingSummaryCard ratingStats={ratingStats} />
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <>
                {/* Section Header */}
                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                  mt="$sm"
                  mb="$xs"
                >
                  <Text
                    fontSize="$3"
                    fontWeight="600"
                    color="$colorSubtle"
                  >
                    ALL REVIEWS
                  </Text>
                  <Text
                    fontSize="$2"
                    color="$colorMuted"
                  >
                    {ratingStats?.total_count || reviews.length} total
                  </Text>
                </XStack>

                {/* Review Cards */}
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.public_id}
                    review={review}
                  />
                ))}

                {/* Load More Button */}
                {hasNextPage && (
                  <Button
                    bg="$backgroundMuted"
                    borderRadius={16}
                    py="$md"
                    borderWidth={1}
                    borderColor="$borderColor"
                    onPress={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    pressStyle={{ opacity: 0.8 }}
                    mt="$sm"
                  >
                    {isFetchingNextPage ? (
                      <XStack
                        alignItems="center"
                        justifyContent="center"
                        gap="$sm"
                      >
                        <Spinner
                          size="small"
                          color="$primary"
                        />
                        <Text
                          color="$colorSubtle"
                          fontWeight="500"
                        >
                          Loading more...
                        </Text>
                      </XStack>
                    ) : (
                      <Text
                        color="$primary"
                        fontWeight="600"
                      >
                        Load more reviews
                      </Text>
                    )}
                  </Button>
                )}
              </>
            ) : (
              <EmptyReviews />
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </GradientBackground>
  )
}
