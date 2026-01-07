import { YStack, Text } from 'tamagui'
import React from 'react'

interface WelcomeHeaderProps {
  displayName?: string | null
  subtitle: string
}

export function WelcomeHeader({ displayName, subtitle }: WelcomeHeaderProps) {
  const firstName = displayName?.split(' ')[0] || 'User'

  return (
    <YStack
      gap="$lg"
      pl="$xs"
      py="$2xl"
    >
      <Text
        fontSize="$8"
        fontWeight="bold"
        color="$color"
      >
        Welcome, {firstName}
      </Text>
      <Text
        fontSize="$5"
        color="$colorSubtle"
        lineHeight={22}
      >
        {subtitle}
      </Text>
    </YStack>
  )
}
