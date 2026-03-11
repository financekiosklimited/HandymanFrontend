'use client'

import { Image } from 'tamagui'
import { YStack, View } from 'tamagui'

export interface GradientBackgroundProps {
  children: React.ReactNode
}

export function GradientBackground({ children }: GradientBackgroundProps) {
  return (
    <YStack
      flex={1}
      position="relative"
      backgroundColor="#FDFBF9"
    >
      {/* Background image */}
      <Image
        source={require('../../../apps/expo/assets/gradientbg.jpeg')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
        }}
        resizeMode="cover"
      />

      {/* White overlay to reduce opacity */}
      <View
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
        }}
      />

      {/* Content layer */}
      <YStack
        flex={1}
        position="relative"
        zIndex={1}
      >
        {children}
      </YStack>
    </YStack>
  )
}
