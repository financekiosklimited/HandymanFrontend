'use client'

import { YStack, XStack, ScrollView, Text, Button, Image, Spinner, View } from '@my/ui'
import { GradientBackground } from '@my/ui'
import { useGuestHandyman, formatErrorMessage } from '@my/api'
import { ArrowLeft, MapPin, Star, DollarSign, Award, User } from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'

interface HandymanDetailScreenProps {
  handymanId: string
}

export function HandymanDetailScreen({ handymanId }: HandymanDetailScreenProps) {
  const router = useRouter()
  const insets = useSafeArea()
  const { data: handyman, isLoading, error } = useGuestHandyman(handymanId)

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

              {/* Rating Badge */}
              {handyman.rating > 0 && (
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
                    fill="$accent"
                    color="$accent"
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
                    ({handyman.total_reviews} {handyman.total_reviews === 1 ? 'review' : 'reviews'})
                  </Text>
                </XStack>
              )}
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

              {handyman.total_reviews > 0 && (
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
                    {handyman.total_reviews}
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

            {/* Rating Details Card */}
            {handyman.rating > 0 && (
              <YStack
                bg="$backgroundMuted"
                borderRadius={20}
                p="$lg"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Text
                  fontSize="$3"
                  fontWeight="600"
                  color="$colorSubtle"
                  mb="$md"
                >
                  RATING & REVIEWS
                </Text>
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
                          fill={
                            star <= Math.round(handyman.rating) ? '$accent' : '$borderColorHover'
                          }
                          color={
                            star <= Math.round(handyman.rating) ? '$accent' : '$borderColorHover'
                          }
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
                      {handyman.total_reviews} {handyman.total_reviews === 1 ? 'Review' : 'Reviews'}
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
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </GradientBackground>
  )
}
