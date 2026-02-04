import React, { useEffect } from 'react'
import { YStack, XStack, Text, View } from 'tamagui'
import { Home, Wrench, Hammer, Paintbrush, HardHat } from '@tamagui/lucide-icons'
import { Image } from 'expo-image'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
  withDelay,
  interpolateColor,
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
  const progress = useSharedValue(0)
  const logoScale = useSharedValue(0)
  const logoOpacity = useSharedValue(0)
  const textY = useSharedValue(20)
  const textOpacity = useSharedValue(0)
  const loaderOpacity = useSharedValue(0)

  // Background floating elements
  const bubble1Y = useSharedValue(0)
  const bubble2Y = useSharedValue(0)
  const bubble3Y = useSharedValue(0)

  // Background pattern animations
  const patternRotation = useSharedValue(0)
  const patternFloat1 = useSharedValue(0)
  const patternFloat2 = useSharedValue(0)
  const patternFloat3 = useSharedValue(0)
  const patternFloat4 = useSharedValue(0)

  useEffect(() => {
    // Start gradient animation
    progress.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    )

    // Logo entrance animation
    logoScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100, mass: 0.8 }))
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 600 }))

    // Text entrance animation
    textY.value = withDelay(600, withSpring(0, { damping: 15, stiffness: 120 }))
    textOpacity.value = withDelay(600, withTiming(1, { duration: 500 }))

    // Loading indicator entrance
    loaderOpacity.value = withDelay(1000, withTiming(1, { duration: 400 }))

    // Floating bubbles animation
    bubble1Y.value = withRepeat(
      withTiming(-30, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    )
    bubble2Y.value = withDelay(
      500,
      withRepeat(withTiming(25, { duration: 3500, easing: Easing.inOut(Easing.sin) }), -1, true)
    )
    bubble3Y.value = withDelay(
      1000,
      withRepeat(withTiming(-20, { duration: 2800, easing: Easing.inOut(Easing.sin) }), -1, true)
    )

    // Background pattern animations
    patternRotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    )
    patternFloat1.value = withRepeat(
      withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    )
    patternFloat2.value = withDelay(
      1000,
      withRepeat(withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.sin) }), -1, true)
    )
    patternFloat3.value = withDelay(
      500,
      withRepeat(withTiming(1, { duration: 4500, easing: Easing.inOut(Easing.sin) }), -1, true)
    )
    patternFloat4.value = withDelay(
      1500,
      withRepeat(withTiming(1, { duration: 5500, easing: Easing.inOut(Easing.sin) }), -1, true)
    )

    // Call completion callback after minimum display time
    if (onAnimationComplete) {
      const timer = setTimeout(onAnimationComplete, minDisplayTime)
      return () => clearTimeout(timer)
    }
  }, [])

  // Animated gradient colors
  const gradientStyle = useAnimatedStyle(() => {
    const color1 = interpolateColor(
      progress.value,
      [0, 0.33, 0.66, 1],
      ['#0C9A5C', '#0EA5E9', '#8B5CF6', '#0C9A5C']
    )
    const color2 = interpolateColor(
      progress.value,
      [0, 0.33, 0.66, 1],
      ['#34C759', '#06B6D4', '#EC4899', '#34C759']
    )
    const color3 = interpolateColor(
      progress.value,
      [0, 0.33, 0.66, 1],
      ['#0C9A5C', '#10B981', '#0C9A5C', '#0C9A5C']
    )

    return {
      backgroundColor: color1,
      backgroundImage: `linear-gradient(135deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`,
    }
  })

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

  const bubble1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: bubble1Y.value }],
  }))

  const bubble2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: bubble2Y.value }],
  }))

  const bubble3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: bubble3Y.value }],
  }))

  const patternRotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${patternRotation.value}deg` }],
  }))

  const patternFloat1Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(patternFloat1.value, [0, 1], [-10, 10]) },
      { translateX: interpolate(patternFloat1.value, [0, 1], [-5, 5]) },
    ],
    opacity: interpolate(patternFloat1.value, [0, 1], [0.03, 0.06]),
  }))

  const patternFloat2Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(patternFloat2.value, [0, 1], [8, -8]) },
      { translateX: interpolate(patternFloat2.value, [0, 1], [6, -6]) },
    ],
    opacity: interpolate(patternFloat2.value, [0, 1], [0.04, 0.07]),
  }))

  const patternFloat3Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(patternFloat3.value, [0, 1], [-12, 12]) },
      { translateX: interpolate(patternFloat3.value, [0, 1], [-8, 8]) },
    ],
    opacity: interpolate(patternFloat3.value, [0, 1], [0.02, 0.05]),
  }))

  const patternFloat4Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(patternFloat4.value, [0, 1], [6, -6]) },
      { translateX: interpolate(patternFloat4.value, [0, 1], [4, -4]) },
    ],
    opacity: interpolate(patternFloat4.value, [0, 1], [0.03, 0.06]),
  }))

  return (
    <View
      flex={1}
      overflow="hidden"
    >
      {/* Background Image Layer 1 - House Silhouette */}
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop',
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          opacity: 0.4,
        }}
        contentFit="cover"
        cachePolicy="memory-disk"
      />

      {/* Background Image Layer 2 - Construction Worker Silhouette */}
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=2670&auto=format&fit=crop',
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          opacity: 0.35,
        }}
        contentFit="cover"
        cachePolicy="memory-disk"
      />

      {/* Green Brand Overlay */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(12, 154, 92, 0.15)',
        }}
      />

      {/* Animated Gradient Background */}
      <AnimatedView
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.7,
          },
          gradientStyle,
        ]}
      />

      {/* Background Pattern - House Icons */}
      <AnimatedView
        style={[
          {
            position: 'absolute',
            top: '5%',
            left: '5%',
          },
          patternFloat1Style,
        ]}
      >
        <Home
          size={60}
          color="white"
          strokeWidth={1}
        />
      </AnimatedView>
      <AnimatedView
        style={[
          {
            position: 'absolute',
            top: '15%',
            right: '8%',
          },
          patternFloat2Style,
        ]}
      >
        <Home
          size={48}
          color="white"
          strokeWidth={1}
        />
      </AnimatedView>
      <AnimatedView
        style={[
          {
            position: 'absolute',
            bottom: '25%',
            left: '3%',
          },
          patternFloat3Style,
        ]}
      >
        <Home
          size={55}
          color="white"
          strokeWidth={1}
        />
      </AnimatedView>
      <AnimatedView
        style={[
          {
            position: 'absolute',
            bottom: '35%',
            right: '5%',
          },
          patternFloat4Style,
        ]}
      >
        <Home
          size={42}
          color="white"
          strokeWidth={1}
        />
      </AnimatedView>

      {/* Background Pattern - Tool Icons */}
      <AnimatedView
        style={[
          {
            position: 'absolute',
            top: '8%',
            right: '20%',
          },
          patternFloat2Style,
        ]}
      >
        <Wrench
          size={36}
          color="white"
          strokeWidth={1.5}
        />
      </AnimatedView>
      <AnimatedView
        style={[
          {
            position: 'absolute',
            top: '30%',
            left: '8%',
          },
          patternFloat3Style,
        ]}
      >
        <Hammer
          size={40}
          color="white"
          strokeWidth={1.5}
        />
      </AnimatedView>
      <AnimatedView
        style={[
          {
            position: 'absolute',
            bottom: '15%',
            left: '15%',
          },
          patternFloat1Style,
        ]}
      >
        <Paintbrush
          size={38}
          color="white"
          strokeWidth={1.5}
        />
      </AnimatedView>
      <AnimatedView
        style={[
          {
            position: 'absolute',
            bottom: '20%',
            right: '12%',
          },
          patternFloat4Style,
        ]}
      >
        <HardHat
          size={44}
          color="white"
          strokeWidth={1.5}
        />
      </AnimatedView>
      <AnimatedView
        style={[
          {
            position: 'absolute',
            top: '45%',
            right: '3%',
          },
          patternFloat1Style,
        ]}
      >
        <Wrench
          size={32}
          color="white"
          strokeWidth={1.5}
        />
      </AnimatedView>
      <AnimatedView
        style={[
          {
            position: 'absolute',
            top: '20%',
            left: '25%',
          },
          patternFloat4Style,
        ]}
      >
        <Hammer
          size={35}
          color="white"
          strokeWidth={1.5}
        />
      </AnimatedView>

      {/* Floating Background Bubbles */}
      <AnimatedView
        style={[
          {
            position: 'absolute',
            top: '10%',
            left: '-10%',
            width: 300,
            height: 300,
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 150,
          },
          bubble1Style,
        ]}
      />
      <AnimatedView
        style={[
          {
            position: 'absolute',
            bottom: '20%',
            right: '-5%',
            width: 200,
            height: 200,
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: 100,
          },
          bubble2Style,
        ]}
      />
      <AnimatedView
        style={[
          {
            position: 'absolute',
            top: '40%',
            right: '10%',
            width: 120,
            height: 120,
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderRadius: 60,
          },
          bubble3Style,
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
          {/* Glassmorphism Logo Container */}
          <View
            width={140}
            height={140}
            backgroundColor="rgba(255,255,255,0.2)"
            borderRadius="$8"
            alignItems="center"
            justifyContent="center"
            borderWidth={1}
            borderColor="rgba(255,255,255,0.3)"
            backdropFilter="blur(10px)"
            shadowColor="rgba(0,0,0,0.15)"
            shadowRadius={30}
            shadowOffset={{ width: 0, height: 10 }}
          >
            <View
              width={100}
              height={100}
              backgroundColor="rgba(255,255,255,0.95)"
              borderRadius="$6"
              alignItems="center"
              justifyContent="center"
            >
              <YStack alignItems="center">
                <Home
                  size={48}
                  color="#0C9A5C"
                  strokeWidth={2}
                />
                <View
                  position="absolute"
                  bottom={18}
                  right={22}
                  backgroundColor="white"
                  padding="$1"
                  borderRadius="$2"
                  shadowColor="rgba(0,0,0,0.1)"
                  shadowRadius={4}
                >
                  <Wrench
                    size={28}
                    color="#FFB800"
                    strokeWidth={2.5}
                  />
                </View>
              </YStack>
            </View>
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
            fontWeight="bold"
            color="white"
            textAlign="center"
            letterSpacing={-0.5}
            textShadowColor="rgba(0,0,0,0.1)"
            textShadowRadius={10}
            textShadowOffset={{ width: 0, height: 2 }}
          >
            HandymanKiosk
          </Text>
          <Text
            fontSize="$4"
            color="rgba(255,255,255,0.9)"
            textAlign="center"
            fontWeight="500"
          >
            Your Home, Our Expertise
          </Text>
        </AnimatedYStack>

        {/* Elegant Loading Indicator */}
        <AnimatedXStack
          style={loaderStyle}
          position="absolute"
          bottom={100}
          gap="$3"
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
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.6, 1]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.4, 1]),
  }))

  return (
    <AnimatedView
      style={[
        {
          width: 10,
          height: 10,
          backgroundColor: 'rgba(255,255,255,0.8)',
          borderRadius: 5,
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
        backgroundColor="#0C9A5C"
        style={{
          backgroundImage: 'linear-gradient(135deg, #0C9A5C 0%, #34C759 50%, #0EA5E9 100%)',
        }}
      />

      {/* Floating Bubbles */}
      <View
        position="absolute"
        top={200}
        left={-100}
        width={400}
        height={400}
        backgroundColor="rgba(255,255,255,0.1)"
        borderRadius={200}
      />
      <View
        position="absolute"
        bottom={400}
        right={-50}
        width={300}
        height={300}
        backgroundColor="rgba(255,255,255,0.08)"
        borderRadius={150}
      />

      {/* Static Background Pattern - House Icons */}
      <View
        position="absolute"
        top={150}
        left={80}
      >
        <Home
          size={100}
          color="rgba(255,255,255,0.04)"
          strokeWidth={1}
        />
      </View>
      <View
        position="absolute"
        top={400}
        right={120}
      >
        <Home
          size={80}
          color="rgba(255,255,255,0.05)"
          strokeWidth={1}
        />
      </View>
      <View
        position="absolute"
        bottom={800}
        left={50}
      >
        <Home
          size={90}
          color="rgba(255,255,255,0.03)"
          strokeWidth={1}
        />
      </View>
      <View
        position="absolute"
        bottom={1000}
        right={80}
      >
        <Home
          size={70}
          color="rgba(255,255,255,0.04)"
          strokeWidth={1}
        />
      </View>

      {/* Static Background Pattern - Tool Icons */}
      <View
        position="absolute"
        top={200}
        right={300}
      >
        <Wrench
          size={60}
          color="rgba(255,255,255,0.05)"
          strokeWidth={1.5}
        />
      </View>
      <View
        position="absolute"
        top={800}
        left={150}
      >
        <Hammer
          size={70}
          color="rgba(255,255,255,0.04)"
          strokeWidth={1.5}
        />
      </View>
      <View
        position="absolute"
        bottom={500}
        left={200}
      >
        <Paintbrush
          size={65}
          color="rgba(255,255,255,0.05)"
          strokeWidth={1.5}
        />
      </View>
      <View
        position="absolute"
        bottom={700}
        right={200}
      >
        <HardHat
          size={75}
          color="rgba(255,255,255,0.04)"
          strokeWidth={1.5}
        />
      </View>
      <View
        position="absolute"
        top={1200}
        right={100}
      >
        <Wrench
          size={55}
          color="rgba(255,255,255,0.03)"
          strokeWidth={1.5}
        />
      </View>
      <View
        position="absolute"
        top={600}
        left={350}
      >
        <Hammer
          size={60}
          color="rgba(255,255,255,0.04)"
          strokeWidth={1.5}
        />
      </View>

      {/* Logo Container */}
      <YStack
        position="absolute"
        top={1000}
        left={0}
        right={0}
        alignItems="center"
        gap="$8"
      >
        {/* Glassmorphism Logo Container */}
        <View
          width={280}
          height={280}
          backgroundColor="rgba(255,255,255,0.2)"
          borderRadius="$8"
          alignItems="center"
          justifyContent="center"
          borderWidth={1}
          borderColor="rgba(255,255,255,0.3)"
        >
          <View
            width={200}
            height={200}
            backgroundColor="rgba(255,255,255,0.95)"
            borderRadius="$6"
            alignItems="center"
            justifyContent="center"
          >
            <YStack alignItems="center">
              <Home
                size={96}
                color="#0C9A5C"
                strokeWidth={2}
              />
              <View
                position="absolute"
                bottom={35}
                right={45}
                backgroundColor="white"
                padding="$2"
                borderRadius="$2"
              >
                <Wrench
                  size={56}
                  color="#FFB800"
                  strokeWidth={2.5}
                />
              </View>
            </YStack>
          </View>
        </View>

        {/* App Name */}
        <YStack
          alignItems="center"
          gap="$4"
        >
          <Text
            fontSize="$12"
            fontWeight="bold"
            color="white"
            textAlign="center"
            letterSpacing={-1}
          >
            HandymanKiosk
          </Text>
          <Text
            fontSize="$6"
            color="rgba(255,255,255,0.9)"
            textAlign="center"
            fontWeight="500"
          >
            Your Home, Our Expertise
          </Text>
        </YStack>
      </YStack>

      {/* Loading Dots */}
      <XStack
        position="absolute"
        bottom={200}
        left={0}
        right={0}
        justifyContent="center"
        gap="$4"
      >
        <View
          width={20}
          height={20}
          backgroundColor="rgba(255,255,255,0.8)"
          borderRadius={10}
        />
        <View
          width={20}
          height={20}
          backgroundColor="rgba(255,255,255,0.8)"
          borderRadius={10}
        />
        <View
          width={20}
          height={20}
          backgroundColor="rgba(255,255,255,0.8)"
          borderRadius={10}
        />
      </XStack>
    </View>
  )
}

export default FluidSplashScreen
