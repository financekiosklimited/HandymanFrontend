import { Text, type TextProps } from 'tamagui'
import { getDirectOfferStatusColor, type DirectOfferStatus } from '@my/config'

interface OfferStatusBadgeProps extends Omit<TextProps, 'children'> {
  status: DirectOfferStatus
  size?: 'sm' | 'md'
}

/**
 * Badge component that displays the status of a direct offer with appropriate colors.
 */
export function OfferStatusBadge({ status, size = 'sm', ...props }: OfferStatusBadgeProps) {
  const colors = getDirectOfferStatusColor(status)

  const fontSize = size === 'sm' ? 10 : 12
  const px = size === 'sm' ? 8 : 10
  const py = size === 'sm' ? 3 : 4

  return (
    <Text
      fontSize={fontSize}
      // @ts-expect-error - dynamic color
      color={colors.text}
      // @ts-expect-error - dynamic color
      bg={colors.bg}
      px={px}
      py={py}
      borderRadius={4}
      fontWeight="500"
      {...props}
    >
      {colors.label}
    </Text>
  )
}
