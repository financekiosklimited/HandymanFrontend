'use client'

import { useState, useCallback } from 'react'
import { Alert, Pressable } from 'react-native'
import { YStack, XStack, ScrollView, Text, Button, Image, Spinner, View } from '@my/ui'
import { GradientBackground } from '@my/ui'
import { useGuestHandyman, useHomeownerProfile, formatErrorMessage, apiClient } from '@my/api'
import type { ChatConversationResponse } from '@my/api'
import {
  ArrowLeft,
  MapPin,
  Star,
  DollarSign,
  Award,
  User,
  MessageCircle,
  Briefcase,
  ChevronRight,
} from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { useToastController } from '@tamagui/toast'

interface HomeownerHandymanDetailScreenProps {
  handymanId: string
}

export function HomeownerHandymanDetailScreen({ handymanId }: HomeownerHandymanDetailScreenProps) {
  const router = useRouter()
  const insets = useSafeArea()
  const toast = useToastController()
  const { data: handyman, isLoading, error } = useGuestHandyman(handymanId)
  const { data: profile, refetch: refetchProfile } = useHomeownerProfile()
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [isCheckingPhone, setIsCheckingPhone] = useState(false)

  // Start chat handler - navigates to chat screen without creating conversation yet
  const handleStartChat = () => {
    if (!handymanId || !handyman) return
    const params = new URLSearchParams({
      userId: handymanId,
      name: handyman.display_name,
    })
    if (handyman.avatar_url) params.append('avatar', handyman.avatar_url)
    router.push(`/(homeowner)/messages/new?${params.toString()}`)
  }

  /**
   * Handle Send Direct Offer button press - check phone verification first
   */
  const handleSendDirectOffer = useCallback(async () => {
    if (!handymanId || !handyman) return

    setIsCheckingPhone(true)

    try {
      // Refetch profile to get latest phone verification status
      const { data: freshProfile } = await refetchProfile()

      if (freshProfile?.is_phone_verified) {
        // Phone verified, proceed to create direct offer
        const params = new URLSearchParams({
          handymanId,
          handymanName: handyman.display_name,
        })
        if (handyman.avatar_url) params.append('handymanAvatar', handyman.avatar_url)
        if (handyman.rating) params.append('handymanRating', handyman.rating.toString())
        if (handyman.review_count)
          params.append('handymanReviewCount', handyman.review_count.toString())
        router.push(`/(homeowner)/direct-offers/create?${params.toString()}`)
      } else {
        // Phone not verified, show alert and redirect
        Alert.alert(
          'Phone Verification Required',
          'Please verify your phone number before sending a direct offer.',
          [
            {
              text: 'Verify Now',
              onPress: () => router.push('/user/phone/send'),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        )
      }
    } catch (error) {
      console.error('Error checking phone verification:', error)
      // On error, still allow navigation but warn
      Alert.alert(
        'Could Not Verify Status',
        'Unable to check phone verification status. Would you like to verify your phone?',
        [
          {
            text: 'Verify Phone',
            onPress: () => router.push('/user/phone/send'),
          },
          {
            text: 'Try Again',
            style: 'cancel',
          },
        ]
      )
    } finally {
      setIsCheckingPhone(false)
    }
  }, [handymanId, handyman, refetchProfile, router])

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
            Loading profile...
          </Text>
        </YStack>
      </GradientBackground>
    )
  }

  if (error || !handyman) {
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
            <User
              size={28}
              color="$error"
            />
          </YStack>
          <Text
            color="$color"
            fontSize="$5"
            fontWeight="600"
          >
            Profile Not Found
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
            Handyman Profile
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
            {/* Profile Hero */}
            <YStack
              alignItems="center"
              mb="$xl"
            >
              {/* Avatar */}
              <YStack
                width={120}
                height={120}
                borderRadius={60}
                overflow="hidden"
                bg="$backgroundMuted"
                mb="$md"
                shadowColor="rgba(0,0,0,0.1)"
                shadowOffset={{ width: 0, height: 4 }}
                shadowRadius={16}
                borderWidth={4}
                borderColor="rgba(255,255,255,0.8)"
              >
                {handyman.avatar_url ? (
                  <Image
                    source={{ uri: handyman.avatar_url }}
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
                    <Text
                      fontSize={40}
                      fontWeight="bold"
                      color="$primary"
                    >
                      {handyman.display_name.charAt(0).toUpperCase()}
                    </Text>
                  </YStack>
                )}
              </YStack>

              {/* Name */}
              <Text
                fontSize={26}
                fontWeight="bold"
                color="$color"
                textAlign="center"
                mb="$xs"
              >
                {handyman.display_name}
              </Text>

              {/* Categories as subtitle */}
              {handyman.categories && handyman.categories.length > 0 && (
                <Text
                  fontSize="$4"
                  color="$colorSubtle"
                  textAlign="center"
                  mb="$md"
                >
                  {handyman.categories.map((c) => c.name).join(' • ')}
                </Text>
              )}

              {/* Rating Badge - Tappable to see reviews (only show if there are actual reviews) */}
              {handyman.review_count > 0 && (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/(homeowner)/handymen/[id]/reviews',
                      params: { id: handymanId, name: handyman.display_name },
                    } as any)
                  }
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <XStack
                    bg="$warningBackground"
                    px="$lg"
                    py="$sm"
                    borderRadius="$full"
                    alignItems="center"
                    gap="$xs"
                  >
                    <Star
                      size={18}
                      fill="#FFB800"
                      color="#FFB800"
                    />
                    <Text
                      fontSize="$5"
                      fontWeight="600"
                      color="$accent"
                    >
                      {Number(handyman.rating).toFixed(1)}
                    </Text>
                    <Text
                      fontSize="$3"
                      color="$accent"
                    >
                      ({handyman.review_count} {handyman.review_count === 1 ? 'review' : 'reviews'})
                    </Text>
                    <ChevronRight
                      size={16}
                      color="$accent"
                    />
                  </XStack>
                </Pressable>
              )}
            </YStack>

            {/* Action Buttons */}
            <YStack
              gap="$sm"
              mb="$lg"
            >
              {/* Send Direct Offer Button */}
              <Button
                bg="$primary"
                borderRadius={16}
                py="$md"
                onPress={handleSendDirectOffer}
                disabled={isCheckingPhone}
                pressStyle={{ opacity: 0.8 }}
                shadowColor="$primary"
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={0.3}
                shadowRadius={8}
              >
                <XStack
                  alignItems="center"
                  justifyContent="center"
                  gap="$sm"
                >
                  {isCheckingPhone ? (
                    <Spinner
                      size="small"
                      color="white"
                    />
                  ) : (
                    <Briefcase
                      size={20}
                      color="white"
                    />
                  )}
                  <Text
                    color="white"
                    fontSize="$4"
                    fontWeight="600"
                  >
                    {isCheckingPhone ? 'Checking...' : 'Send Direct Offer'}
                  </Text>
                </XStack>
              </Button>

              {/* Chat Button */}
              <Button
                bg="$backgroundMuted"
                borderRadius={16}
                py="$md"
                borderWidth={1}
                borderColor="$borderColor"
                onPress={handleStartChat}
                disabled={isChatLoading}
                pressStyle={{ opacity: 0.8 }}
              >
                <XStack
                  alignItems="center"
                  justifyContent="center"
                  gap="$sm"
                >
                  {isChatLoading ? (
                    <Spinner
                      size="small"
                      color="$primary"
                    />
                  ) : (
                    <MessageCircle
                      size={22}
                      color="$primary"
                    />
                  )}
                  <Text
                    color="$color"
                    fontSize="$4"
                    fontWeight="600"
                  >
                    {isChatLoading ? 'Starting chat...' : 'Chat with Handyman'}
                  </Text>
                </XStack>
              </Button>
            </YStack>

            {/* Quick Stats */}
            <XStack
              gap="$md"
              mb="$lg"
            >
              {handyman.hourly_rate && (
                <YStack
                  flex={1}
                  bg="$backgroundMuted"
                  borderRadius={16}
                  p="$md"
                  alignItems="center"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <YStack
                    width={36}
                    height={36}
                    borderRadius="$full"
                    bg="$primaryBackground"
                    alignItems="center"
                    justifyContent="center"
                    mb="$xs"
                  >
                    <DollarSign
                      size={18}
                      color="$primary"
                    />
                  </YStack>
                  <Text
                    fontSize="$5"
                    fontWeight="bold"
                    color="$color"
                  >
                    ${handyman.hourly_rate}
                  </Text>
                  <Text
                    fontSize="$2"
                    color="$colorSubtle"
                  >
                    per hour
                  </Text>
                </YStack>
              )}

              {handyman.distance_km != null && (
                <YStack
                  flex={1}
                  bg="$backgroundMuted"
                  borderRadius={16}
                  p="$md"
                  alignItems="center"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <YStack
                    width={36}
                    height={36}
                    borderRadius="$full"
                    bg="$primaryBackground"
                    alignItems="center"
                    justifyContent="center"
                    mb="$xs"
                  >
                    <MapPin
                      size={18}
                      color="$primary"
                    />
                  </YStack>
                  <Text
                    fontSize="$5"
                    fontWeight="bold"
                    color="$color"
                  >
                    {Number(handyman.distance_km).toFixed(1)} km
                  </Text>
                  <Text
                    fontSize="$2"
                    color="$colorSubtle"
                  >
                    away
                  </Text>
                </YStack>
              )}

              {handyman.review_count > 0 && (
                <YStack
                  flex={1}
                  bg="$backgroundMuted"
                  borderRadius={16}
                  p="$md"
                  alignItems="center"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <YStack
                    width={36}
                    height={36}
                    borderRadius="$full"
                    bg="$primaryBackground"
                    alignItems="center"
                    justifyContent="center"
                    mb="$xs"
                  >
                    <Award
                      size={18}
                      color="$primary"
                    />
                  </YStack>
                  <Text
                    fontSize="$5"
                    fontWeight="bold"
                    color="$color"
                  >
                    {handyman.review_count}
                  </Text>
                  <Text
                    fontSize="$2"
                    color="$colorSubtle"
                  >
                    reviews
                  </Text>
                </YStack>
              )}
            </XStack>

            {/* About Card */}
            {handyman.bio && (
              <YStack
                bg="$backgroundMuted"
                borderRadius={20}
                p="$lg"
                mb="$lg"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Text
                  fontSize="$3"
                  fontWeight="600"
                  color="$colorSubtle"
                  mb="$sm"
                >
                  ABOUT
                </Text>
                <Text
                  fontSize="$4"
                  color="$color"
                  lineHeight={22}
                >
                  {handyman.bio}
                </Text>
              </YStack>
            )}

            {/* Specialties */}
            {handyman.categories && handyman.categories.length > 0 && (
              <YStack
                bg="$backgroundMuted"
                borderRadius={20}
                p="$lg"
                mb="$lg"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Text
                  fontSize="$3"
                  fontWeight="600"
                  color="$colorSubtle"
                  mb="$md"
                >
                  SPECIALTIES
                </Text>
                <XStack
                  flexWrap="wrap"
                  gap="$sm"
                >
                  {handyman.categories.map((category) => (
                    <XStack
                      key={category.public_id}
                      bg="$primary"
                      px="$md"
                      py="$sm"
                      borderRadius="$full"
                    >
                      <Text
                        fontSize="$3"
                        fontWeight="500"
                        color="white"
                      >
                        {category.name}
                      </Text>
                    </XStack>
                  ))}
                </XStack>
              </YStack>
            )}

            {/* Rating Details Card - Tappable to see reviews (only show if there are actual reviews) */}
            {handyman.review_count > 0 && (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/(homeowner)/handymen/[id]/reviews',
                    params: { id: handymanId, name: handyman.display_name },
                  } as any)
                }
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              >
                <YStack
                  bg="$backgroundMuted"
                  borderRadius={20}
                  p="$lg"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <XStack
                    justifyContent="space-between"
                    alignItems="center"
                    mb="$md"
                  >
                    <Text
                      fontSize="$3"
                      fontWeight="600"
                      color="$colorSubtle"
                    >
                      RATING & REVIEWS
                    </Text>
                    <XStack
                      alignItems="center"
                      gap="$xs"
                    >
                      <Text
                        fontSize="$2"
                        color="$primary"
                        fontWeight="500"
                      >
                        See all
                      </Text>
                      <ChevronRight
                        size={16}
                        color="$primary"
                      />
                    </XStack>
                  </XStack>
                  <XStack
                    alignItems="center"
                    gap="$lg"
                  >
                    <YStack alignItems="center">
                      <Text
                        fontSize={42}
                        fontWeight="bold"
                        color="$color"
                        lineHeight={48}
                      >
                        {Number(handyman.rating).toFixed(1)}
                      </Text>
                      <XStack
                        alignItems="center"
                        gap={4}
                        mt="$xs"
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={18}
                            fill={star <= Math.round(handyman.rating) ? '#FFB800' : '#D1D1D6'}
                            color={star <= Math.round(handyman.rating) ? '#FFB800' : '#D1D1D6'}
                          />
                        ))}
                      </XStack>
                    </YStack>
                    <YStack
                      flex={1}
                      gap="$xs"
                    >
                      <Text
                        fontSize="$4"
                        fontWeight="500"
                        color="$color"
                      >
                        {handyman.review_count} {handyman.review_count === 1 ? 'Review' : 'Reviews'}
                      </Text>
                      <Text
                        fontSize="$3"
                        color="$colorSubtle"
                        lineHeight={18}
                      >
                        Based on verified customer feedback and completed jobs
                      </Text>
                    </YStack>
                  </XStack>
                </YStack>
              </Pressable>
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </GradientBackground>
  )
}
