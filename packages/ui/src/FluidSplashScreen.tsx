import React, { useEffect } from 'react'
import { YStack, XStack, Text, View } from 'tamagui'
import { Home, Wrench } from '@tamagui/lucide-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  interpolate,
  Easing,
  withDelay,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'expo-image'

const AnimatedYStack = Animated.createAnimatedComponent(YStack)
const AnimatedXStack = Animated.createAnimatedComponent(XStack)
const AnimatedView = Animated.createAnimatedComponent(View)

interface FluidSplashScreenProps {
  onAnimationComplete?: () => void
  minDisplayTime?: number
}

// Local splash screen background image
const SPLASH_SCREEN_IMAGE = require('../../../handymankiosk-splash-screen.jpg')

export function FluidSplashScreen({
  onAnimationComplete,
  minDisplayTime = 2500,
}: FluidSplashScreenProps) {
  const logoScale = useSharedValue(0)
  const logoOpacity = useSharedValue(0)
  const textY = useSharedValue(30)
  const textOpacity = useSharedValue(0)
  const loaderOpacity = useSharedValue(0)
  const bgOpacity = useSharedValue(0)

  // Subtle floating animation for background elements
  const floatY = useSharedValue(0)

  useEffect(() => {
    // Background fade in
    bgOpacity.value = withTiming(1, { duration: 800 })

    // Logo entrance animation
    logoScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100, mass: 0.8 }))
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 600 }))

    // Text entrance animation
    textY.value = withDelay(500, withSpring(0, { damping: 15, stiffness: 120 }))
    textOpacity.value = withDelay(500, withTiming(1, { duration: 500 }))

    // Loading indicator entrance
    loaderOpacity.value = withDelay(900, withTiming(1, { duration: 400 }))

    // Gentle floating animation
    floatY.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    )

    // Call completion callback after minimum display time
    if (onAnimationComplete) {
      const timer = setTimeout(onAnimationComplete, minDisplayTime)
      return () => clearTimeout(timer)
    }
  }, [])

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }))

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textY.value }],
    opacity: textOpacity.value,
  }))

  const loaderStyle = useAnimatedStyle(() => ({
    opacity: loaderOpacity.value,
  }))

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }))

  const floatStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(floatY.value, [0, 1], [-15, 15]) }],
  }))

  return (
    <View
      flex={1}
      overflow="hidden"
      backgroundColor="#0C9A5C"
    >
      {/* Splash Screen Background with Green Tint */}
      <AnimatedView
        style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, bgStyle]}
      >
        <Image
          source={SPLASH_SCREEN_IMAGE}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
        {/* Subtle green gradient tint overlay */}
        <LinearGradient
          colors={['rgba(12,154,92,0.15)', 'rgba(12,154,92,0.25)', 'rgba(12,154,92,0.35)']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        {/* Dark overlay for better text contrast */}
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.3)']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
      </AnimatedView>

      {/* Subtle Decorative Element */}
      <AnimatedView
        style={[
          {
            position: 'absolute',
            top: '15%',
            right: '10%',
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: 'rgba(255,255,255,0.05)',
          },
          floatStyle1,
        ]}
      />

      {/* Main Content */}
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        padding="$4"
        position="relative"
        zIndex={10}
      >
        {/* Logo Container */}
        <AnimatedYStack
          style={logoStyle}
          alignItems="center"
          gap="$6"
        >
          {/* Clean Logo Container with subtle shadow */}
          <View
            width={120}
            height={120}
            backgroundColor="white"
            borderRadius="$7"
            alignItems="center"
            justifyContent="center"
            shadowColor="rgba(0,0,0,0.2)"
            shadowRadius={40}
            shadowOffset={{ width: 0, height: 8 }}
          >
            <YStack alignItems="center">
              <Home
                size={52}
                color="#0C9A5C"
                strokeWidth={2}
              />
              <View
                position="absolute"
                bottom={22}
                right={26}
                backgroundColor="white"
                padding="$1"
                borderRadius="$2"
                shadowColor="rgba(0,0,0,0.1)"
                shadowRadius={6}
              >
                <Wrench
                  size={28}
                  color="#FFB800"
                  strokeWidth={2.5}
                />
              </View>
            </YStack>
          </View>
        </AnimatedYStack>

        {/* App Name & Tagline */}
        <AnimatedYStack
          style={textStyle}
          alignItems="center"
          gap="$3"
          marginTop="$8"
        >
          <Text
            fontSize="$9"
            fontWeight="700"
            color="white"
            textAlign="center"
            letterSpacing={-0.5}
            textShadowColor="rgba(0,0,0,0.3)"
            textShadowOffset={{ width: 0, height: 2 }}
            textShadowRadius={4}
          >
            HandymanKiosk
          </Text>
          <Text
            fontSize="$4"
            color="rgba(255,255,255,0.95)"
            textAlign="center"
            fontWeight="400"
            textShadowColor="rgba(0,0,0,0.2)"
            textShadowOffset={{ width: 0, height: 1 }}
            textShadowRadius={2}
          >
            Your Home, Our Expertise
          </Text>
        </AnimatedYStack>

        {/* Minimal Loading Indicator */}
        <AnimatedXStack
          style={loaderStyle}
          position="absolute"
          bottom={80}
          gap="$2"
          alignItems="center"
        >
          <LoadingDot delay={0} />
          <LoadingDot delay={150} />
          <LoadingDot delay={300} />
        </AnimatedXStack>
      </YStack>
    </View>
  )
}

// Individual loading dot with pulse animation
function LoadingDot({ delay }: { delay: number }) {
  const pulse = useSharedValue(0)

  useEffect(() => {
    pulse.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }), -1, true)
    )
  }, [])

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.5, 1]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.3, 0.8]),
  }))

  return (
    <AnimatedView
      style={[
        {
          width: 8,
          height: 8,
          backgroundColor: 'rgba(255,255,255,0.6)',
          borderRadius: 4,
        },
        dotStyle,
      ]}
    />
  )
}

// Static version for export/PNG generation
export function FluidSplashScreenExport() {
  return (
    <View
      width={1242}
      height={2688}
      overflow="hidden"
      backgroundColor="#0C9A5C"
      position="relative"
    >
      {/* Background Image */}
      <View
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
      >
        <Image
          source={SPLASH_SCREEN_IMAGE}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
        {/* Green gradient tint overlay */}
        <View
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          style={{
            background:
              'linear-gradient(180deg, rgba(12,154,92,0.15) 0%, rgba(12,154,92,0.25) 50%, rgba(12,154,92,0.35) 100%)',
          }}
        />
        {/* Dark overlay for text contrast */}
        <View
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.3) 100%)',
          }}
        />
      </View>

      {/* Subtle Decorative Circle */}
      <View
        position="absolute"
        top={300}
        right={100}
        width={300}
        height={300}
        borderRadius={150}
        backgroundColor="rgba(255,255,255,0.05)"
      />

      {/* Logo Container */}
      <YStack
        position="absolute"
        top={1050}
        left={0}
        right={0}
        alignItems="center"
        gap="$10"
      >
        {/* Clean Logo Container */}
        <View
          width={240}
          height={240}
          backgroundColor="white"
          borderRadius="$8"
          alignItems="center"
          justifyContent="center"
          shadowColor="rgba(0,0,0,0.2)"
          shadowRadius={60}
          shadowOffset={{ width: 0, height: 12 }}
        >
          <YStack alignItems="center">
            <Home
              size={104}
              color="#0C9A5C"
              strokeWidth={2}
            />
            <View
              position="absolute"
              bottom={45}
              right={50}
              backgroundColor="white"
              padding="$2"
              borderRadius="$2"
              shadowColor="rgba(0,0,0,0.1)"
              shadowRadius={8}
            >
              <Wrench
                size={56}
                color="#FFB800"
                strokeWidth={2.5}
              />
            </View>
          </YStack>
        </View>

        {/* App Name */}
        <YStack
          alignItems="center"
          gap="$4"
        >
          <Text
            fontSize="$13"
            fontWeight="700"
            color="white"
            textAlign="center"
            letterSpacing={-1}
            textShadowColor="rgba(0,0,0,0.3)"
            textShadowOffset={{ width: 0, height: 2 }}
            textShadowRadius={4}
          >
            HandymanKiosk
          </Text>
          <Text
            fontSize="$6"
            color="rgba(255,255,255,0.95)"
            textAlign="center"
            fontWeight="400"
            textShadowColor="rgba(0,0,0,0.2)"
            textShadowOffset={{ width: 0, height: 1 }}
            textShadowRadius={2}
          >
            Your Home, Our Expertise
          </Text>
        </YStack>
      </YStack>

      {/* Loading Dots */}
      <XStack
        position="absolute"
        bottom={250}
        left={0}
        right={0}
        justifyContent="center"
        gap="$3"
      >
        <View
          width={16}
          height={16}
          backgroundColor="rgba(255,255,255,0.5)"
          borderRadius={8}
        />
        <View
          width={16}
          height={16}
          backgroundColor="rgba(255,255,255,0.5)"
          borderRadius={8}
        />
        <View
          width={16}
          height={16}
          backgroundColor="rgba(255,255,255,0.5)"
          borderRadius={8}
        />
      </XStack>
    </View>
  )
}

export default FluidSplashScreen
