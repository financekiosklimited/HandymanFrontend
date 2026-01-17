'use client'

import { useMemo, useState } from 'react'
import { YStack, XStack, ScrollView, Text, Button, Spinner, View } from '@my/ui'
import { GradientBackground, DirectOfferCard } from '@my/ui'
import { useHandymanDirectOffers } from '@my/api'
import type { HandymanDirectOffer, DirectOfferStatus } from '@my/api'
import { ArrowLeft, Mail, Filter } from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'

type FilterOption = 'all' | DirectOfferStatus

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
]

export function HandymanDirectOffersListScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all')

  const queryParams =
    activeFilter === 'all' ? undefined : { offer_status: activeFilter as DirectOfferStatus }

  const {
    data: offersData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useHandymanDirectOffers(queryParams)

  // Flatten paginated data
  const offers = useMemo(() => {
    return offersData?.pages.flatMap((page) => page.results) || []
  }, [offersData])

  const handleOfferPress = (offer: HandymanDirectOffer) => {
    router.push(`/(handyman)/direct-offers/${offer.public_id}`)
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
            Direct Offers
          </Text>
          <View width={38} />
        </XStack>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}
        >
          <XStack gap="$sm">
            {FILTER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                unstyled
                onPress={() => setActiveFilter(option.value)}
                bg={activeFilter === option.value ? '$primary' : 'rgba(255,255,255,0.7)'}
                px="$md"
                py="$sm"
                borderRadius="$full"
                borderWidth={1}
                borderColor={activeFilter === option.value ? '$primary' : '$borderColor'}
                pressStyle={{ opacity: 0.8 }}
              >
                <Text
                  fontSize="$2"
                  fontWeight="600"
                  color={activeFilter === option.value ? 'white' : '$color'}
                >
                  {option.label}
                </Text>
              </Button>
            ))}
          </XStack>
        </ScrollView>

        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
        >
          <YStack
            px="$lg"
            pb="$xl"
            gap="$md"
          >
            {/* Section Header */}
            <YStack
              gap="$xs"
              mb="$sm"
            >
              <Text
                fontSize="$6"
                fontWeight="bold"
                color="$color"
              >
                {activeFilter === 'all'
                  ? 'All Offers'
                  : `${FILTER_OPTIONS.find((o) => o.value === activeFilter)?.label} Offers`}
              </Text>
              <Text
                fontSize="$3"
                color="$colorSubtle"
              >
                Direct job offers from homeowners
              </Text>
            </YStack>

            {/* Loading State */}
            {isLoading ? (
              <YStack
                py="$xl"
                alignItems="center"
                gap="$md"
              >
                <Spinner
                  size="large"
                  color="$primary"
                />
                <Text
                  color="$colorSubtle"
                  fontSize="$3"
                >
                  Loading offers...
                </Text>
              </YStack>
            ) : error ? (
              <YStack
                py="$xl"
                alignItems="center"
                bg="rgba(255,255,255,0.7)"
                borderRadius={20}
                gap="$sm"
              >
                <Mail
                  size={40}
                  color="$error"
                />
                <Text
                  color="$error"
                  fontSize="$4"
                  fontWeight="500"
                >
                  Failed to load offers
                </Text>
                <Text
                  color="$colorSubtle"
                  fontSize="$2"
                  textAlign="center"
                >
                  Please try again later
                </Text>
                <Button
                  mt="$sm"
                  bg="$primary"
                  borderRadius="$md"
                  px="$lg"
                  onPress={() => refetch()}
                >
                  <Text
                    color="white"
                    fontWeight="600"
                  >
                    Retry
                  </Text>
                </Button>
              </YStack>
            ) : offers.length === 0 ? (
              <YStack
                py="$2xl"
                alignItems="center"
                bg="rgba(255,255,255,0.7)"
                borderRadius={20}
                gap="$md"
                px="$lg"
              >
                <YStack
                  width={80}
                  height={80}
                  borderRadius="$full"
                  bg="rgba(12,154,92,0.1)"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Mail
                    size={36}
                    color="$primary"
                  />
                </YStack>
                <Text
                  color="$color"
                  fontSize="$5"
                  fontWeight="600"
                >
                  No Offers Yet
                </Text>
                <Text
                  color="$colorSubtle"
                  fontSize="$3"
                  textAlign="center"
                >
                  {activeFilter === 'all'
                    ? "When homeowners send you direct offers, they'll appear here."
                    : `No ${activeFilter} offers at the moment.`}
                </Text>
              </YStack>
            ) : (
              <YStack gap="$sm">
                {offers.map((offer) => (
                  <DirectOfferCard
                    key={offer.public_id}
                    offer={offer}
                    variant="handyman"
                    onPress={() => handleOfferPress(offer)}
                  />
                ))}

                {/* Load More Button */}
                {hasNextPage && (
                  <Button
                    onPress={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    bg="rgba(255,255,255,0.7)"
                    borderRadius="$md"
                    py="$sm"
                    mt="$sm"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    {isFetchingNextPage ? (
                      <XStack
                        alignItems="center"
                        gap="$sm"
                      >
                        <Spinner
                          size="small"
                          color="$primary"
                        />
                        <Text
                          color="$colorSubtle"
                          fontSize="$3"
                        >
                          Loading...
                        </Text>
                      </XStack>
                    ) : (
                      <Text
                        color="$primary"
                        fontSize="$3"
                        fontWeight="500"
                      >
                        Load more offers
                      </Text>
                    )}
                  </Button>
                )}
              </YStack>
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </GradientBackground>
  )
}
