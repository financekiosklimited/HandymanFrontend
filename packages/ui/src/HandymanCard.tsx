import { YStack, XStack, Text, Image } from 'tamagui'
import type { GuestHandyman } from '@my/api'
import { PressPresets } from './pressAnimations'

interface HandymanCardProps {
  handyman: GuestHandyman
  onPress?: () => void
}

export function HandymanCard({ handyman, onPress }: HandymanCardProps) {
  return (
    <YStack
      bg="$backgroundStrong"
      borderRadius="$md"
      overflow="hidden"
      onPress={onPress}
      animation={PressPresets.card.animation}
      pressStyle={PressPresets.card.pressStyle}
      cursor="pointer"
      height={180}
    >
      {/* Avatar */}
      <YStack
        width="100%"
        height={90}
        bg="$backgroundMuted"
        alignItems="center"
        justifyContent="center"
      >
        {handyman.avatar_url ? (
          <Image
            source={{ uri: handyman.avatar_url }}
            width="100%"
            height="100%"
            resizeMode="cover"
          />
        ) : (
          <Text
            fontSize="$2"
            color="$colorMuted"
          >
            No photo
          </Text>
        )}
      </YStack>

      <YStack
        p="$sm"
        gap={2}
        flex={1}
      >
        <Text
          fontSize="$3"
          fontWeight="600"
          color="$color"
          numberOfLines={1}
        >
          {handyman.display_name}
        </Text>

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
            {handyman.rating > 0
              ? handyman.review_count != null
                ? `${handyman.rating.toFixed(1)} (${handyman.review_count})`
                : handyman.rating.toFixed(1)
              : 'No reviews'}
          </Text>
        </XStack>

        <Text
          fontSize={10}
          color="$colorMuted"
          numberOfLines={2}
          flex={1}
        >
          {handyman.categories && handyman.categories.length > 0
            ? handyman.categories.map((c) => c.name).join(', ')
            : 'No specialties'}
        </Text>
      </YStack>
    </YStack>
  )
}
