'use client'

import { XStack, YStack, Text, Button, Image, View } from 'tamagui'
import type { Notification } from '@my/api'

// Format relative time (e.g., "3 hours ago", "2 days ago")
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) {
    return 'Just now'
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Get initials from title (first 2 characters of first 2 words)
function getInitials(title: string): string {
  const words = title.split(' ').filter((w) => w.length > 0)
  if (words.length >= 2 && words[0]?.[0] && words[1]?.[0]) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return title.substring(0, 2).toUpperCase()
}

interface NotificationCardProps {
  notification: Notification
  onPress: () => void
}

export function NotificationCard({ notification, onPress }: NotificationCardProps) {
  const isUnread = !notification.is_read
  const initials = getInitials(notification.title)

  return (
    <Button
      unstyled
      onPress={onPress}
      bg={isUnread ? '$primaryBackground' : '$backgroundStrong'}
      borderRadius={12}
      borderWidth={1.5}
      borderColor={isUnread ? '$primary' : '$borderColor'}
      p="$md"
      pressStyle={{ opacity: 0.7, scale: 0.98 }}
      animation="quick"
    >
      <XStack
        gap="$md"
        alignItems="flex-start"
      >
        {/* Avatar circle */}
        <View
          width={48}
          height={48}
          borderRadius={24}
          overflow="hidden"
          alignItems="center"
          justifyContent="center"
        >
          {notification.thumbnail ? (
            <Image
              source={{ uri: notification.thumbnail }}
              width={48}
              height={48}
              borderRadius={24}
            />
          ) : (
            <View
              width={48}
              height={48}
              borderRadius={24}
              bg="$backgroundMuted"
              alignItems="center"
              justifyContent="center"
            >
              <Text
                fontSize={16}
                fontWeight="600"
                color="$color"
              >
                {initials}
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <YStack
          flex={1}
          gap={4}
        >
          {/* Title and Body combined */}
          <Text
            fontSize={14}
            color="$color"
            lineHeight={20}
          >
            <Text fontWeight="700">{notification.title} </Text>
            <Text fontWeight="400">{notification.body}</Text>
          </Text>

          {/* Timestamp */}
          <Text
            fontSize={13}
            color="$colorSubtle"
            letterSpacing={0.26}
            lineHeight={24}
          >
            {formatRelativeTime(notification.created_at)}
          </Text>
        </YStack>
      </XStack>
    </Button>
  )
}
