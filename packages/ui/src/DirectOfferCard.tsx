import { YStack, XStack, Text, Image, View } from 'tamagui'
import { User, MapPin, DollarSign } from '@tamagui/lucide-icons'
import type { HomeownerDirectOffer, HandymanDirectOffer } from '@my/api'
import { formatOfferDate } from '@my/api'
import { OfferStatusBadge } from './OfferStatusBadge'
import { TimeRemainingBadge } from './TimeRemainingBadge'

type DirectOffer = HomeownerDirectOffer | HandymanDirectOffer

interface DirectOfferCardProps {
  offer: DirectOffer
  onPress?: () => void
  /**
   * Which perspective to show:
   * - homeowner: Shows target handyman info
   * - handyman: Shows homeowner info
   */
  variant: 'homeowner' | 'handyman'
}

// Type guards
function isHomeownerOffer(offer: DirectOffer): offer is HomeownerDirectOffer {
  return 'target_handyman' in offer
}

function isHandymanOffer(offer: DirectOffer): offer is HandymanDirectOffer {
  return 'homeowner' in offer
}

/**
 * Card component for displaying direct offer summary.
 * Adapts display based on whether viewing as homeowner or handyman.
 */
export function DirectOfferCard({ offer, onPress, variant }: DirectOfferCardProps) {
  const isPending = offer.offer_status === 'pending'

  // Get person info based on variant
  const person =
    variant === 'homeowner' && isHomeownerOffer(offer)
      ? offer.target_handyman
      : variant === 'handyman' && isHandymanOffer(offer)
        ? offer.homeowner
        : null

  const personLabel = variant === 'homeowner' ? 'To' : 'From'

  return (
    <YStack
      bg="$backgroundStrong"
      borderRadius="$md"
      overflow="hidden"
      onPress={onPress}
      pressStyle={{ opacity: 0.8 }}
      cursor="pointer"
      p="$md"
      gap="$sm"
    >
      {/* Header: Status and Time */}
      <XStack
        justifyContent="space-between"
        alignItems="center"
      >
        <OfferStatusBadge status={offer.offer_status} />
        {isPending && <TimeRemainingBadge expiresAt={offer.offer_expires_at} />}
        {!isPending && (
          <Text
            fontSize={10}
            color="$colorMuted"
          >
            {formatOfferDate(offer.created_at)}
          </Text>
        )}
      </XStack>

      {/* Title */}
      <Text
        fontSize="$4"
        fontWeight="600"
        color="$color"
        numberOfLines={2}
      >
        {offer.title}
      </Text>

      {/* Description */}
      <Text
        fontSize="$2"
        color="$colorSubtle"
        numberOfLines={2}
      >
        {offer.description || 'No description'}
      </Text>

      {/* Budget and Location Row */}
      <XStack
        justifyContent="space-between"
        alignItems="center"
        gap="$sm"
      >
        <XStack
          alignItems="center"
          gap={4}
        >
          <DollarSign
            size={14}
            color="$primary"
          />
          <Text
            fontSize="$3"
            fontWeight="600"
            color="$primary"
          >
            ${offer.estimated_budget.toLocaleString()}
          </Text>
        </XStack>

        {offer.city && (
          <XStack
            alignItems="center"
            gap={4}
            flex={1}
            justifyContent="flex-end"
          >
            <MapPin
              size={12}
              color="$colorMuted"
            />
            <Text
              fontSize={11}
              color="$colorMuted"
              numberOfLines={1}
            >
              {offer.city.name}
            </Text>
          </XStack>
        )}
      </XStack>

      {/* Person Info */}
      {person && (
        <XStack
          alignItems="center"
          gap="$sm"
          pt="$sm"
          borderTopWidth={1}
          borderTopColor="$borderColor"
        >
          {person.avatar_url ? (
            <Image
              source={{ uri: person.avatar_url }}
              width={32}
              height={32}
              borderRadius={16}
            />
          ) : (
            <View
              width={32}
              height={32}
              borderRadius={16}
              bg="$backgroundMuted"
              alignItems="center"
              justifyContent="center"
            >
              <User
                size={16}
                color="$colorMuted"
              />
            </View>
          )}
          <YStack
            flex={1}
            gap={2}
          >
            <XStack
              alignItems="center"
              gap={4}
            >
              <Text
                fontSize={10}
                color="$colorMuted"
              >
                {personLabel}:
              </Text>
              <Text
                fontSize="$2"
                fontWeight="500"
                color="$color"
                numberOfLines={1}
              >
                {person.display_name}
              </Text>
            </XStack>
            {person.rating > 0 && (
              <XStack
                alignItems="center"
                gap={4}
              >
                <Text
                  fontSize={11}
                  color="$accent"
                >
                  ★
                </Text>
                <Text
                  fontSize={10}
                  color="$colorSubtle"
                >
                  {person.rating.toFixed(1)} ({person.review_count} reviews)
                </Text>
              </XStack>
            )}
          </YStack>
        </XStack>
      )}

      {/* Category Badge */}
      {offer.category && (
        <XStack>
          <Text
            fontSize={10}
            color="$colorSubtle"
            bg="$backgroundMuted"
            px={8}
            py={3}
            borderRadius={4}
          >
            {offer.category.name}
          </Text>
        </XStack>
      )}
    </YStack>
  )
}
