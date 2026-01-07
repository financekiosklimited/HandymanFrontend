import { YStack, XStack, Text, Image } from 'tamagui'
import type { GuestJob, HomeownerJob } from '@my/api'

interface JobCardProps {
  job: GuestJob | HomeownerJob
  onPress?: () => void
  showCategory?: boolean
  statusLabel?: string
  statusColor?: string
  statusTextColor?: string
}

export function JobCard({
  job,
  onPress,
  showCategory = false,
  statusLabel,
  statusColor = '$primary',
  statusTextColor = '$backgroundStrong',
}: JobCardProps) {
  // Get first image if available
  const jobImage = job.images?.[0]?.image

  return (
    <YStack
      bg="$backgroundStrong"
      borderRadius="$md"
      overflow="hidden"
      onPress={onPress}
      pressStyle={{ opacity: 0.8 }}
      cursor="pointer"
      height={200}
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
