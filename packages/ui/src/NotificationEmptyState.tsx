'use client'

import { YStack, Text, View } from 'tamagui'
import { Bell } from '@tamagui/lucide-icons'

/**
 * Empty state component for notifications screen.
 * Matches the Figma design for "Notification - Empty state" (node 261:1748)
 */
export function NotificationEmptyState() {
  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      px="$6"
      gap="$4"
    >
      {/* Icon Circle */}
      <View
        width={120}
        height={120}
        borderRadius={60}
        bg="$primaryBackground"
        alignItems="center"
        justifyContent="center"
        marginBottom="$4"
      >
        <Bell
          size={56}
          color="$primary"
        />
      </View>

      {/* Title */}
      <Text
        fontSize={28}
        fontWeight="700"
        color="$color"
        textAlign="center"
        letterSpacing={-0.28}
        lineHeight={38}
        maxWidth={329}
      >
        No Notification Available At This Time
      </Text>

      {/* Description */}
      <Text
        fontSize={14}
        fontWeight="400"
        color="$colorSubtle"
        textAlign="center"
        lineHeight={20}
        letterSpacing={-0.14}
        maxWidth={327}
      >
        We strive to keep you informed, and when there are updates or important messages for you,
        we'll make sure to notify you promptly. Thank you for using our app, and stay tuned for
        future notifications!
      </Text>
    </YStack>
  )
}
