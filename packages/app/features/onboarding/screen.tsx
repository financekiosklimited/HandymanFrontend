import { useState, useRef, useEffect } from 'react'
import {
  FlatList,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native'
import { YStack, XStack, Text, Button, Theme, PressPresets } from '@my/ui'
import { Shield, ArrowRight, CheckCircle, Gavel, Hammer } from '@tamagui/lucide-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'solito/navigation'
import { Image } from 'expo-image'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSpring,
  interpolate,
  Easing,
  type SharedValue,
} from 'react-native-reanimated'

const { width, height } = Dimensions.get('window')

const AnimatedYStack = Animated.createAnimatedComponent(YStack)
const AnimatedView = Animated.createAnimatedComponent(YStack)

interface Slide {
  id: number
  title: string
  description: string
  icon: typeof Shield
  image: string
  color: string
  iconColor: `$${string}`
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Welcome to HandymanKiosk',
    description:
      'Your trusted partner for home services. Connect with verified local professionals instantly.',
    icon: Shield,
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1000&auto=format&fit=crop',
    color: '$green10',
    iconColor: '$green10',
  },
  {
    id: 2,
    title: 'For Homeowners: Competitive Prices',
    description:
      'Professionals compete for your business. You get the true market price without haggling.',
    icon: Gavel,
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop',
    color: '$emerald10',
    iconColor: '$emerald10',
  },
  {
    id: 3,
    title: 'For Professionals: Win on Merit',
    description:
      'Stop paying for leads. Bid on jobs you want and win based on skill and reputation, not marketing budget.',
    icon: Hammer,
    image:
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=1000&auto=format&fit=crop',
    color: '$blue10',
    iconColor: '$blue10',
  },
  {
    id: 4,
    title: 'Secure & Ready to Start',
    description:
      'Verified reviews, transparent pricing, and secure payments. Join thousands building better communities today.',
    icon: CheckCircle,
    image:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop',
    color: '$teal10',
    iconColor: '$teal10',
  },
]

// Pagination Dot Component
function PaginationDot({
  index,
  currentIndex,
}: {
  index: number
  currentIndex: number
}) {
  const dotStyle = useAnimatedStyle(() => {
    const isActive = index === currentIndex
    return {
      width: withSpring(isActive ? 32 : 8, { damping: 15, stiffness: 150 }),
      transform: [{ scale: withSpring(isActive ? 1.1 : 1, { damping: 12 }) }],
    }
  })

  return (
    <AnimatedYStack
      height={8}
      borderRadius="$10"
      backgroundColor={index === currentIndex ? '$color' : '$color5'}
      style={dotStyle}
    />
  )
}

// Onboarding Slide Component
function OnboardingSlide({
  item,
  index,
  scrollX,
  imageZoom,
  imagePanX,
  iconGlowOpacity,
}: {
  item: Slide
  index: number
  scrollX: SharedValue<number>
  imageZoom: SharedValue<number>
  imagePanX: SharedValue<number>
  iconGlowOpacity: SharedValue<number>
}) {
  // Parallax style for image
  const parallaxStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width]
    const translateX = interpolate(scrollX.value, inputRange, [-width * 0.3, 0, width * 0.3])
    return {
      transform: [{ translateX }],
    }
  })

  // Ken Burns style - gentler zoom to prevent overflow
  const kenBurnsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageZoom.value }, { translateX: imagePanX.value }],
  }))

  // Colored glow style using slide's theme color
  const iconGlowStyle = useAnimatedStyle(() => ({
    shadowColor: item.iconColor,
    shadowRadius: interpolate(iconGlowOpacity.value, [0, 1], [8, 20]),
    shadowOpacity: interpolate(iconGlowOpacity.value, [0, 1], [0.3, 0.7]),
    shadowOffset: { width: 0, height: 0 },
    transform: [{ scale: interpolate(iconGlowOpacity.value, [0, 1], [1, 1.2]) }],
  }))

  const Icon = item.icon

  return (
    <YStack
      testID={`slide-${index}`}
      width={width}
      height={height}
      position="relative"
    >
      {/* Image Section with Parallax + Ken Burns */}
      <YStack
        height="65%"
        width="100%"
        position="relative"
        overflow="hidden"
      >
        <AnimatedYStack style={[{ width: '100%', height: '100%' }, parallaxStyle]}>
          <AnimatedYStack style={[{ width: '100%', height: '100%' }, kenBurnsStyle]}>
            <Image
              source={{ uri: item.image }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          </AnimatedYStack>
        </AnimatedYStack>
        <LinearGradient
          colors={['rgba(0,0,0,0.2)', 'transparent', 'rgba(255,255,255,0.9)']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
      </YStack>

      {/* Content Card */}
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        height="45%"
        backgroundColor="$background"
        borderTopRightRadius={40}
        borderTopLeftRadius={40}
        paddingHorizontal="$6"
        paddingTop="$10"
        paddingBottom="$12"
        alignItems="center"
        justifyContent="flex-start"
        shadowColor="rgba(0,0,0,0.1)"
        shadowRadius={40}
        shadowOffset={{ width: 0, height: -10 }}
        shadowOpacity={1}
      >
        {/* Floating Icon with Colored Glow */}
        <AnimatedYStack
          position="absolute"
          top={-40}
          backgroundColor="$background"
          padding="$4"
          borderRadius="$12"
          elevation={10}
          style={iconGlowStyle}
        >
          <Icon
            size={40}
            color={item.iconColor}
            strokeWidth={2.5}
          />
        </AnimatedYStack>

        <Text
          fontSize="$8"
          fontWeight="bold"
          color="$color"
          marginBottom="$4"
          textAlign="center"
          lineHeight={32}
        >
          {item.title}
        </Text>
        <Text
          fontSize="$5"
          color="$color11"
          textAlign="center"
          lineHeight={24}
          maxWidth={350}
        >
          {item.description}
        </Text>
      </YStack>
    </YStack>
  )
}

export function OnboardingScreen() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  // Scroll position for parallax effect
  const scrollX = useSharedValue(0)

  // Ken Burns animation values
  const imageZoom = useSharedValue(1)
  const imagePanX = useSharedValue(0)

  // Icon glow animation
  const iconGlowOpacity = useSharedValue(0)

  useEffect(() => {
    // Icon glow pulse animation
    iconGlowOpacity.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    )
  }, [])

  useEffect(() => {
    // Ken Burns: slow zoom in (reduced from 1.08 to 1.04 to prevent overflow)
    imageZoom.value = withTiming(1.04, { duration: 15000, easing: Easing.out(Easing.ease) })

    // Ken Burns: subtle horizontal pan (reduced from 20 to 10 to prevent overflow)
    imagePanX.value = withRepeat(
      withTiming(10, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    )
  }, [currentIndex])

  // Handle scroll for parallax and index tracking
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x
    scrollX.value = scrollPosition

    const index = Math.round(scrollPosition / width)
    if (index !== currentIndex) {
      setCurrentIndex(index)

      // Reset Ken Burns animation when changing slides
      imageZoom.value = 1
      imagePanX.value = 0
      imageZoom.value = withTiming(1.1, { duration: 15000, easing: Easing.out(Easing.ease) })
      imagePanX.value = withRepeat(
        withTiming(15, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    }
  }

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true })
  }

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      scrollToIndex(currentIndex + 1)
    } else {
      await completeOnboarding()
    }
  }

  const handleSkip = async () => {
    await completeOnboarding()
  }

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboarding_complete', 'true')
      router.replace('/(guest)')
    } catch (e) {
      console.error('Failed to save onboarding status', e)
      router.replace('/(guest)')
    }
  }

  return (
    <Theme name="light">
      <YStack
        flex={1}
        backgroundColor="$color1"
      >
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <OnboardingSlide
              item={item}
              index={index}
              scrollX={scrollX}
              imageZoom={imageZoom}
              imagePanX={imagePanX}
              iconGlowOpacity={iconGlowOpacity}
            />
          )}
        />

        {/* Bottom Controls */}
        <YStack
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          padding="$6"
          paddingBottom="$8"
          zIndex={100}
        >
          <YStack
            gap="$6"
            maxWidth={450}
            width="100%"
            alignSelf="center"
          >
            {/* Pagination Dots */}
            <XStack
              justifyContent="center"
              gap="$2.5"
            >
              {slides.map((_, index) => (
                <YStack
                  testID="pagination-dot"
                  key={index}
                >
                  <PaginationDot
                    index={index}
                    currentIndex={currentIndex}
                  />
                </YStack>
              ))}
            </XStack>

            {/* Buttons */}
            <XStack
              alignItems="center"
              paddingHorizontal="$2"
              justifyContent={currentIndex === slides.length - 1 ? 'center' : 'space-between'}
            >
              {currentIndex !== slides.length - 1 && (
                <Button
                  chromeless
                  onPress={handleSkip}
                  color="$gray11"
                  fontWeight="bold"
                  fontSize="$3"
                  {...PressPresets.secondary}
                >
                  Skip
                </Button>
              )}

              <Button
                backgroundColor="$color"
                color="$background"
                borderRadius="$10"
                fontWeight="bold"
                size="$5"
                paddingHorizontal={currentIndex === slides.length - 1 ? '$8' : '$5'}
                iconAfter={
                  currentIndex !== slides.length - 1 ? <ArrowRight size={20} /> : undefined
                }
                onPress={handleNext}
                hoverStyle={{ backgroundColor: '$color11' }}
                {...PressPresets.primary}
                shadowColor="$shadowColor"
                shadowRadius={10}
                shadowOffset={{ width: 0, height: 5 }}
                shadowOpacity={0.2}
              >
                {currentIndex === slides.length - 1 ? "Let's explore" : 'Next'}
              </Button>
            </XStack>
          </YStack>
        </YStack>
      </YStack>
    </Theme>
  )
}
