import { XStack, Text, type XStackProps } from 'tamagui'
import { Clock } from '@tamagui/lucide-icons'
import { getTimeUrgencyColor, type TimeUrgency } from '@my/config'
import { formatTimeRemaining, getTimeUrgency } from '@my/api'

interface TimeRemainingBadgeProps extends Omit<XStackProps, 'children'> {
  expiresAt: string | Date
  size?: 'sm' | 'md'
  showIcon?: boolean
}

/**
 * Badge component that displays time remaining until expiry with urgency-based colors.
 */
export function TimeRemainingBadge({
  expiresAt,
  size = 'sm',
  showIcon = true,
  ...props
}: TimeRemainingBadgeProps) {
  const urgency: TimeUrgency = getTimeUrgency(expiresAt)
  const colors = getTimeUrgencyColor(urgency)
  const formattedTime = formatTimeRemaining(expiresAt)

  const fontSize = size === 'sm' ? 10 : 12
  const px = size === 'sm' ? 8 : 10
  const py = size === 'sm' ? 3 : 4
  const iconSize = size === 'sm' ? 10 : 12

  return (
    <XStack
      alignItems="center"
      gap={4}
      // @ts-expect-error - dynamic color
      bg={colors.bg}
      px={px}
      py={py}
      borderRadius={4}
      {...props}
    >
      {showIcon && (
        <Clock
          size={iconSize}
          // @ts-expect-error - dynamic color
          color={colors.text}
        />
      )}
      <Text
        fontSize={fontSize}
        // @ts-expect-error - dynamic color
        color={colors.text}
        fontWeight="500"
      >
        {formattedTime}
      </Text>
    </XStack>
  )
}
