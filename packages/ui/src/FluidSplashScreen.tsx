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

const AnimatedYStack = Animated.createAnimatedComponent(YStack)
const AnimatedXStack = Animated.createAnimatedComponent(XStack)
const AnimatedView = Animated.createAnimatedComponent(View)

interface FluidSplashScreenProps {
  onAnimationComplete?: () => void
  minDisplayTime?: number
}

export function FluidSplashScreen({
  onAnimationComplete,
  minDisplayTime = 2500,
}: FluidSplashScreenProps) {
  const logoScale = useSharedValue(0)
  const logoOpacity = useSharedValue(0)
  const textY = useSharedValue(30)
  const textOpacity = useSharedValue(0)
  const loaderOpacity = useSharedValue(0)

  // Subtle floating animation for background elements
  const floatY = useSharedValue(0)

  useEffect(() => {
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

  const floatStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(floatY.value, [0, 1], [-15, 15]) }],
  }))

  const floatStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(floatY.value, [0, 1], [10, -10]) }],
  }))

  return (
    <View
      flex={1}
      overflow="hidden"
      backgroundColor="#0C9A5C"
    >
      {/* Elegant Gradient Background */}
      <View
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        style={{
          background: 'linear-gradient(160deg, #0C9A5C 0%, #10B981 40%, #059669 100%)',
        }}
      />

      {/* Subtle Decorative Circles - Far Less Prominent */}
      <AnimatedView
        style={[
          {
            position: 'absolute',
            top: '-10%',
            right: '-15%',
            width: 350,
            height: 350,
            borderRadius: 175,
            backgroundColor: 'rgba(255,255,255,0.03)',
          },
          floatStyle1,
        ]}
      />
      <AnimatedView
        style={[
          {
            position: 'absolute',
            bottom: '-5%',
            left: '-10%',
            width: 280,
            height: 280,
            borderRadius: 140,
            backgroundColor: 'rgba(255,255,255,0.02)',
          },
          floatStyle2,
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
          {/* Clean Logo Container */}
          <View
            width={120}
            height={120}
            backgroundColor="white"
            borderRadius="$7"
            alignItems="center"
            justifyContent="center"
            shadowColor="rgba(0,0,0,0.1)"
            shadowRadius={40}
            shadowOffset={{ width: 0, height: 8 }}
            elevation={8}
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
                shadowColor="rgba(0,0,0,0.08)"
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
            fontSize="$10"
            fontWeight="700"
            color="white"
            textAlign="center"
            letterSpacing={-0.5}
          >
            HandymanKiosk
          </Text>
          <Text
            fontSize="$4"
            color="rgba(255,255,255,0.85)"
            textAlign="center"
            fontWeight="400"
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
      {/* Static Gradient Background */}
      <View
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        style={{
          background: 'linear-gradient(160deg, #0C9A5C 0%, #10B981 40%, #059669 100%)',
        }}
      />

      {/* Subtle Decorative Circles */}
      <View
        position="absolute"
        top={-150}
        right={-200}
        width={500}
        height={500}
        borderRadius={250}
        backgroundColor="rgba(255,255,255,0.03)"
      />
      <View
        position="absolute"
        bottom={-100}
        left={-150}
        width={400}
        height={400}
        borderRadius={200}
        backgroundColor="rgba(255,255,255,0.02)"
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
          shadowColor="rgba(0,0,0,0.1)"
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
              shadowColor="rgba(0,0,0,0.08)"
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
          >
            HandymanKiosk
          </Text>
          <Text
            fontSize="$6"
            color="rgba(255,255,255,0.85)"
            textAlign="center"
            fontWeight="400"
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
