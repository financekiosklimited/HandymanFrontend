'use client'

import { LinearGradient } from 'expo-linear-gradient'
import { YStack, View } from 'tamagui'

export interface GradientBackgroundProps {
  children: React.ReactNode
}

// Static blob
function StaticBlob({
  size,
  top,
  left,
  blur = 60,
  color,
}: {
  size: number
  top: number
  left: number
  blur?: number
  color: string
}) {
  return (
    <View
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        filter: `blur(${blur}px)`,
        backgroundColor: color,
      }}
    />
  )
}

export function GradientBackground({ children }: GradientBackgroundProps) {
  return (
    <YStack
      flex={1}
      position="relative"
      backgroundColor="#FDFBF9"
    >
      {/* Base gradient */}
      <LinearGradient
        colors={['#FDFBF9', '#F8F4F0', '#FDFBF9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.5, 1]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      />

      {/* Color-shifting blobs -> now Static abstract blobs */}
      <View
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={0}
        overflow="hidden"
      >
        {/* Large mint blob - top right - heavy blur */}
        <StaticBlob
          size={400}
          top={-80}
          left={200}
          blur={80}
          color="rgba(140, 210, 160, 0.40)"
        />

        {/* Large soft sage blob - top center-left - medium blur */}
        <StaticBlob
          size={350}
          top={20}
          left={-100}
          blur={70}
          color="rgba(180, 210, 180, 0.40)"
        />

        {/* Medium warm gold blob - center right - soft blur */}
        <StaticBlob
          size={280}
          top={250}
          left={260}
          blur={55}
          color="rgba(220, 200, 160, 0.40)"
        />

        {/* Large cream blob - bottom left - heavy blur */}
        <StaticBlob
          size={380}
          top={480}
          left={-80}
          blur={75}
          color="rgba(240, 220, 180, 0.40)"
        />

        {/* Medium soft teal blob - bottom right - medium blur */}
        <StaticBlob
          size={240}
          top={580}
          left={280}
          blur={60}
          color="rgba(160, 190, 220, 0.40)"
        />

        {/* Small lavender blob - center - soft blur */}
        <StaticBlob
          size={220}
          top={380}
          left={100}
          blur={50}
          color="rgba(200, 180, 200, 0.40)"
        />

        {/* Soft pink blob - upper center - medium blur */}
        <StaticBlob
          size={200}
          top={100}
          left={140}
          blur={65}
          color="rgba(220, 180, 180, 0.40)"
        />

        {/* Extra accent blob - soft blue - bottom center */}
        <StaticBlob
          size={180}
          top={700}
          left={180}
          blur={70}
          color="rgba(180, 200, 230, 0.40)"
        />

        {/* Top fade overlay for content readability */}
        <LinearGradient
          colors={['rgba(253,251,249,0.95)', 'rgba(253,251,249,0.5)', 'rgba(253,251,249,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.25 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 150,
          }}
        />
      </View>

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
