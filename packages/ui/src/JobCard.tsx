import { YStack, XStack, Text, Image, View } from 'tamagui'
import type { GuestJob, HomeownerJob, HandymanJobForYou } from '@my/api'
import { User } from '@tamagui/lucide-icons'

interface JobCardProps {
  job: GuestJob | HomeownerJob | HandymanJobForYou
  onPress?: () => void
  showCategory?: boolean
  showHomeowner?: boolean
  statusLabel?: string
  statusColor?: string
  statusTextColor?: string
}

export function JobCard({
  job,
  onPress,
  showCategory = false,
  showHomeowner = true,
  statusLabel,
  statusColor = '$primary',
  statusTextColor = '$backgroundStrong',
}: JobCardProps) {
  // Get first image if available
  const jobImage = job.images?.[0]?.image

  // Get homeowner info if available
  const homeowner = 'homeowner' in job ? job.homeowner : null

  return (
    <YStack
      bg="$backgroundStrong"
      borderRadius="$md"
      overflow="hidden"
      onPress={onPress}
      pressStyle={{ opacity: 0.8 }}
      cursor="pointer"
      height={220}
    >
      {/* Job Image or Placeholder */}
      <YStack
        width="100%"
        height={90}
        bg="$backgroundMuted"
        alignItems="center"
        justifyContent="center"
        position="relative"
      >
        {jobImage ? (
          <Image
            source={{ uri: jobImage }}
            width="100%"
            height="100%"
            resizeMode="cover"
          />
        ) : (
          <Text
            fontSize="$2"
            color="$colorMuted"
          >
            No image
          </Text>
        )}

        {/* Badges container */}
        <XStack
          position="absolute"
          top={6}
          left={6}
          gap={4}
          flexWrap="wrap"
        >
          {/* Category Badge */}
          {showCategory && job.category && (
            <XStack>
              <Text
                fontSize={10}
                color="$backgroundStrong"
                bg="$primary"
                px={8}
                py={3}
                borderRadius={4}
                fontWeight="500"
              >
                {job.category.name}
              </Text>
            </XStack>
          )}

          {/* Status Badge */}
          {statusLabel && (
            <XStack>
              <Text
                fontSize={10}
                // @ts-expect-error - dynamic color from props
                color={statusTextColor}
                // @ts-expect-error - dynamic color from props
                bg={statusColor}
                px={8}
                py={3}
                borderRadius={4}
                fontWeight="500"
              >
                {statusLabel}
              </Text>
            </XStack>
          )}
        </XStack>
      </YStack>

      {/* Job Details */}
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
          {job.title}
        </Text>

        <Text
          fontSize="$2"
          color="$colorSubtle"
          numberOfLines={2}
          flex={1}
        >
          {job.description || 'No description'}
        </Text>

        {/* Homeowner Info */}
        {showHomeowner && homeowner && (
          <XStack
            alignItems="center"
            gap="$xs"
            mb={2}
          >
            {homeowner.avatar_url ? (
              <Image
                source={{ uri: homeowner.avatar_url }}
                width={16}
                height={16}
                borderRadius={8}
              />
            ) : (
              <View
                width={16}
                height={16}
                borderRadius={8}
                bg="$backgroundMuted"
                alignItems="center"
                justifyContent="center"
              >
                <User
                  size={10}
                  color="$colorMuted"
                />
              </View>
            )}
            <Text
              fontSize={11}
              color="$colorSubtle"
              numberOfLines={1}
              flex={1}
            >
              {homeowner.display_name}
            </Text>
          </XStack>
        )}

        <XStack
          justifyContent="space-between"
          alignItems="center"
        >
          <Text
            fontSize="$2"
            fontWeight="bold"
            color="$primary"
          >
            {job.hourly_rate_min
              ? `$${job.hourly_rate_min}${job.hourly_rate_max ? `-$${job.hourly_rate_max}` : ''}/hr`
              : job.estimated_budget
                ? `$${job.estimated_budget}`
                : ''}
          </Text>
          {job.city && (
            <Text
              fontSize={10}
              color="$colorMuted"
              numberOfLines={1}
            >
              {job.city.name}
            </Text>
          )}
        </XStack>
      </YStack>
    </YStack>
  )
}
