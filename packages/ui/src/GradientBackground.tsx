'use client'

import { LinearGradient } from 'expo-linear-gradient'
import { YStack, View } from 'tamagui'
import { Animated, Easing } from 'react-native'
import { useRef, useEffect } from 'react'

export interface GradientBackgroundProps {
  children: React.ReactNode
}

// Color palette for all blobs (cycling through these)
const COLOR_PALETTE = [
  'rgba(140, 210, 160, 0.40)', // Mint
  'rgba(160, 200, 170, 0.40)', // Soft Green
  'rgba(180, 210, 180, 0.40)', // Sage
  'rgba(200, 190, 160, 0.40)', // Warm Beige
  'rgba(240, 220, 180, 0.40)', // Cream
  'rgba(220, 200, 160, 0.40)', // Gold
  'rgba(200, 180, 140, 0.40)', // Amber
  'rgba(180, 200, 180, 0.40)', // Teal-Sage
  'rgba(160, 190, 220, 0.40)', // Soft Blue
  'rgba(180, 200, 230, 0.40)', // Light Blue
  'rgba(220, 180, 180, 0.40)', // Soft Coral
  'rgba(230, 170, 170, 0.40)', // Light Red
  'rgba(200, 180, 200, 0.40)', // Soft Purple
  'rgba(140, 210, 160, 0.40)', // Back to Mint
]

// Animated blob with slow color shifting
function ColorShiftingBlob({
  size,
  top,
  left,
  blur = 60,
  delay = 0,
}: {
  size: number
  top: number
  left: number
  blur?: number
  delay?: number
}) {
  const colorAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Start animation with staggered delay
    const startAnimation = () => {
      Animated.loop(
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 20000, // 20 seconds per cycle
          easing: Easing.linear,
          useNativeDriver: false, // Colors need native driver false
        })
      ).start()
    }

    // Apply staggered delay
    if (delay > 0) {
      const timer = setTimeout(startAnimation, delay)
      return () => clearTimeout(timer)
    }
    startAnimation()
    return undefined
  }, [colorAnim, delay])

  // Interpolate color based on animation value
  const backgroundColor = colorAnim.interpolate({
    inputRange: COLOR_PALETTE.map((_, index) => index / (COLOR_PALETTE.length - 1)),
    outputRange: COLOR_PALETTE,
  })

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        filter: `blur(${blur}px)`,
        backgroundColor,
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

      {/* Color-shifting blobs with staggered animation */}
      <View
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={0}
        overflow="hidden"
      >
        {/* Large mint blob - top right - heavy blur, starts immediately */}
        <ColorShiftingBlob
          size={400}
          top={-80}
          left={200}
          blur={80}
          delay={0}
        />

        {/* Large soft sage blob - top center-left - medium blur, 3s delay */}
        <ColorShiftingBlob
          size={350}
          top={20}
          left={-100}
          blur={70}
          delay={3000}
        />

        {/* Medium warm gold blob - center right - soft blur, 6s delay */}
        <ColorShiftingBlob
          size={280}
          top={250}
          left={260}
          blur={55}
          delay={6000}
        />

        {/* Large cream blob - bottom left - heavy blur, 9s delay */}
        <ColorShiftingBlob
          size={380}
          top={480}
          left={-80}
          blur={75}
          delay={9000}
        />

        {/* Medium soft teal blob - bottom right - medium blur, 12s delay */}
        <ColorShiftingBlob
          size={240}
          top={580}
          left={280}
          blur={60}
          delay={12000}
        />

        {/* Small lavender blob - center - soft blur, 15s delay */}
        <ColorShiftingBlob
          size={220}
          top={380}
          left={100}
          blur={50}
          delay={15000}
        />

        {/* Soft pink blob - upper center - medium blur, 5s delay */}
        <ColorShiftingBlob
          size={200}
          top={100}
          left={140}
          blur={65}
          delay={5000}
        />

        {/* Extra accent blob - soft blue - bottom center, 8s delay */}
        <ColorShiftingBlob
          size={180}
          top={700}
          left={180}
          blur={70}
          delay={8000}
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
