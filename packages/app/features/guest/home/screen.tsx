'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import * as Location from 'expo-location'
import {
  YStack,
  XStack,
  ScrollView,
  Text,
  Button,
  Spinner,
  View,
  ScrollIndicator,
  PressPresets,
  GradientBackground,
} from '@my/ui'
import { useAnimatedScrollHandler } from 'react-native-reanimated'
import { Pressable } from 'react-native'
import { useGuestJobs, useGuestHandymen, useCategories, useCities } from '@my/api'
import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { useDebounce } from 'app/hooks'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  interpolate,
  LinearTransition,
} from 'react-native-reanimated'
import { Animated as AnimatedRN, Easing as EasingRN, View as RNView } from 'react-native'
import {
  Search,
  MessageCircle,
  Plus,
  Briefcase,
  Zap,
  Wrench,
  PaintBucket,
  Star,
  MapPin,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Sparkles,
  Hammer,
  TreePine,
  Wind,
  Home,
  Layers,
  Settings,
  DollarSign,
  ArrowRight,
  Gift,
  Tag,
  Clock,
} from '@tamagui/lucide-icons'

// CTA Banner Background Image
const CTA_BACKGROUND_IMAGE = require('../../../../../apps/expo/assets/cta-construction-bg.jpg')

// Create animated components
const AnimatedYStack = Animated.createAnimatedComponent(YStack)
const AnimatedXStack = Animated.createAnimatedComponent(XStack)
const AnimatedView = Animated.createAnimatedComponent(View)
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)
const AnimatedButton = Animated.createAnimatedComponent(Button)

// Icon mapping for API categories (Material Design names → Lucide icons)
const iconMap: Record<string, any> = {
  plumbing: Wrench,
  electrical_services: Zap,
  carpenter: Hammer,
  cleaning_services: Sparkles,
  format_paint: PaintBucket,
  yard: TreePine,
  ac_unit: Wind,
  roofing: Home,
  layers: Layers,
  home_repair_service: Settings,
}

// Category colors - vivid colors matching iconography (no green in default state)
const categoryColors: Record<string, string> = {
  plumbing: '#007AFF', // Blue (water)
  electrical_services: '#FFCC00', // Yellow (electricity)
  carpenter: '#FF9500', // Orange (wood)
  cleaning_services: '#00D4FF', // Cyan/Aqua (clean water)
  format_paint: '#FF2D55', // Magenta (paint)
  yard: '#8B4513', // Brown (soil/earth)
  ac_unit: '#5AC8FA', // Light Blue (cool air)
  roofing: '#FF3B30', // Red (roof tiles)
  layers: '#AF52DE', // Purple (general)
  home_repair_service: '#FF6B35', // Coral (hand tools)
}

// Animation configuration with native driver
const ANIMATION_CONFIG = {
  duration: 400,
  easing: Easing.out(Easing.cubic),
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
}

// Virtualized horizontal list hook - only renders visible items + buffer
function useVirtualizedList<T>(items: T[], itemWidth: number, bufferSize = 2) {
  const scrollX = useSharedValue(0)
  const containerWidth = useSharedValue(0)

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollX.value / itemWidth) - bufferSize
    const end = Math.floor((scrollX.value + containerWidth.value) / itemWidth) + bufferSize
    return {
      start: Math.max(0, start),
      end: Math.min(items.length - 1, end),
    }
  }, [items.length, itemWidth, bufferSize, scrollX.value, containerWidth.value])

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x
    },
  })

  const onLayout = useCallback(
    (event: { nativeEvent: { layout: { width: number } } }) => {
      containerWidth.value = event.nativeEvent.layout.width
    },
    [containerWidth]
  )

  return {
    visibleRange,
    scrollHandler,
    onLayout,
    scrollX,
  }
}

// Animated card component with entrance animation
function AnimatedCard({
  children,
  index,
  onPress,
  style,
}: {
  children: React.ReactNode
  index: number
  onPress?: () => void
  style?: any
}) {
  const opacity = useSharedValue(0)
  const translateX = useSharedValue(50)
  const scale = useSharedValue(1)

  useEffect(() => {
    // Stagger entrance animation - only first 6 items animate
    if (index < 6) {
      const delay = index * 80
      opacity.value = withDelay(delay, withTiming(1, { duration: 400 }))
      translateX.value = withDelay(delay, withTiming(0, { duration: 400 }))
    } else {
      opacity.value = 1
      translateX.value = 0
    }
  }, [index, opacity, translateX])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }))

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, SPRING_CONFIG)
  }, [scale])

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG)
  }, [scale])

  return (
    <AnimatedView
      style={[animatedStyle, style]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onPress={onPress}
    >
      {children}
    </AnimatedView>
  )
}

// Collapsible Section using JS-driven Layout Animation for proper sibling reflow
function CollapsibleSection({
  children,
  expanded,
}: { children: React.ReactNode; expanded: boolean }) {
  const [contentHeight, setContentHeight] = useState(0)
  const animatedHeight = useRef(new AnimatedRN.Value(0)).current

  useEffect(() => {
    AnimatedRN.timing(animatedHeight, {
      toValue: expanded ? contentHeight : 0,
      duration: 300,
      easing: EasingRN.bezier(0.4, 0.0, 0.2, 1), // Standard easing
      useNativeDriver: false, // Critical: this triggers layout updates
    }).start()
  }, [expanded, contentHeight, animatedHeight])

  return (
    <AnimatedRN.View
      style={{
        height: animatedHeight,
        overflow: 'hidden',
      }}
    >
      <RNView
        style={{ position: 'absolute', width: '100%' }}
        onLayout={(event) => {
          const height = event.nativeEvent.layout.height
          if (height > 0 && Math.abs(contentHeight - height) > 1) {
            setContentHeight(height)
          }
        }}
      >
        {children}
      </RNView>
    </AnimatedRN.View>
  )
}

// Animated category icon with spring feedback
function AnimatedCategoryIcon({
  children,
  onPress,
}: {
  children: React.ReactNode
  isSelected: boolean
  onPress: () => void
}) {
  const scale = useSharedValue(1)

  const handlePress = useCallback(() => {
    scale.value = withSequence(withTiming(0.9, { duration: 80 }), withSpring(1, SPRING_CONFIG))
    onPress()
  }, [onPress, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <AnimatedView
      style={animatedStyle}
      onPress={handlePress}
    >
      {children}
    </AnimatedView>
  )
}

// Hardcoded city coordinates from backend seed data
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'toronto-on': { lat: 43.65107, lng: -79.347015 },
  'ottawa-on': { lat: 45.42153, lng: -75.697193 },
  'mississauga-on': { lat: 43.589045, lng: -79.64412 },
  'hamilton-on': { lat: 43.255203, lng: -79.843826 },
  'vancouver-bc': { lat: 49.282729, lng: -123.120738 },
  'surrey-bc': { lat: 49.1058, lng: -122.825095 },
  'calgary-ab': { lat: 51.044733, lng: -114.071883 },
  'edmonton-ab': { lat: 53.544389, lng: -113.490927 },
  'montreal-qc': { lat: 45.501689, lng: -73.567256 },
  'quebec-city-qc': { lat: 46.813878, lng: -71.207981 },
  'winnipeg-mb': { lat: 49.895136, lng: -97.138374 },
  'halifax-ns': { lat: 44.648764, lng: -63.575239 },
}

// Search suggestions for typewriter animation
const SEARCH_SUGGESTIONS = [
  'fix my broken ac',
  'patch my walls',
  'install new lights',
  'repair my plumbing',
  'paint my living room',
  'fix leaky faucet',
  'assemble furniture',
  'repair door hinges',
  'install ceiling fan',
  'clean my gutters',
]

// Mock promo codes data for guest users
interface PromoCode {
  code: string
  discount: string
  description: string
  color: string
  icon: 'sparkles' | 'gift' | 'wrench' | 'tag'
  badge?: string
  expiryText: string
}

const PROMO_CODES: PromoCode[] = [
  {
    code: 'FIRST20',
    discount: '20% OFF',
    description: 'First job discount',
    color: '#0C9A5C',
    icon: 'sparkles',
    badge: 'POPULAR',
    expiryText: 'Ends in 5 days',
  },
  {
    code: 'WELCOME15',
    discount: '$15 OFF',
    description: 'Welcome bonus',
    color: '#FF9500',
    icon: 'gift',
    expiryText: 'Ends in 7 days',
  },
  {
    code: 'REPAIR10',
    discount: '10% OFF',
    description: 'Any repair service',
    color: '#AF52DE',
    icon: 'wrench',
    expiryText: 'Ends in 3 days',
  },
  {
    code: 'WINTERFIX',
    discount: '$25 OFF',
    description: 'Winter repairs',
    color: '#007AFF',
    icon: 'tag',
    badge: 'NEW',
    expiryText: 'Ends in 10 days',
  },
  {
    code: 'QUICK50',
    discount: '50% OFF',
    description: 'Quick fixes',
    color: '#FF2D55',
    icon: 'sparkles',
    badge: 'LIMITED',
    expiryText: 'Ends in 2 days',
  },
]

// Icon mapping for promo codes
const promoIconMap: Record<string, any> = {
  sparkles: Sparkles,
  gift: Gift,
  wrench: Wrench,
  tag: Tag,
}

export function GuestHomeScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)

  // Navigation Helper - define early for use in callbacks
  const redirectToLogin = useCallback(() => {
    router.push('/auth/login')
  }, [router])

  //TODO : move typerwriter animation to reanimated-based
  // Typewriter animation state
  const [displayText, setDisplayText] = useState('Search handyman or jobs here!')
  const [showCursor, setShowCursor] = useState(false)
  const animationStateRef = useRef({
    currentSuggestionIndex: 0,
    isTyping: false,
    isPaused: true,
    currentText: 'Search handyman or jobs here!',
  })

  // Blinking cursor effect
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setShowCursor((prev) => !prev)
  //   }, 530)
  //   return () => clearInterval(interval)
  // }, [])

  // Typewriter animation - batched updates for performance
  // useEffect(() => {
  //   let animationFrameId: number
  //   let timeoutId: ReturnType<typeof setTimeout> | null = null
  //   let isActive = true

  //   const animate = () => {
  //     if (!isActive || animationStateRef.current.isPaused) {
  //       timeoutId = setTimeout(animate, 100)
  //       return
  //     }

  //     const { currentSuggestionIndex, isTyping, currentText } = animationStateRef.current
  //     const currentSuggestion = SEARCH_SUGGESTIONS[currentSuggestionIndex]

  //     if (!currentSuggestion) {
  //       timeoutId = setTimeout(animate, 100)
  //       return
  //     }

  //     if (isTyping) {
  //       // Typing phase
  //       if (currentText.length < currentSuggestion.length) {
  //         // Type next 2-3 characters at once for performance
  //         const charsToType = Math.min(3, currentSuggestion.length - currentText.length)
  //         const newText = currentSuggestion.slice(0, currentText.length + charsToType)
  //         animationStateRef.current.currentText = newText
  //         setDisplayText(newText)

  //         // Quick delay (batching characters reduces updates)
  //         timeoutId = setTimeout(animate, 30)
  //       } else {
  //         // Finished typing, pause before deleting
  //         animationStateRef.current.isTyping = false
  //         timeoutId = setTimeout(animate, 800)
  //       }
  //     } else {
  //       // Deleting phase
  //       if (currentText.length > 0) {
  //         // Delete 2-3 characters at once
  //         const charsToDelete = Math.min(3, currentText.length)
  //         const newText = currentText.slice(0, -charsToDelete)
  //         animationStateRef.current.currentText = newText
  //         setDisplayText(newText)

  //         timeoutId = setTimeout(animate, 20)
  //       } else {
  //         // Finished deleting, pick next suggestion with random delay
  //         const nextIndex = Math.floor(Math.random() * SEARCH_SUGGESTIONS.length)
  //         animationStateRef.current.currentSuggestionIndex = nextIndex
  //         animationStateRef.current.isTyping = true

  //         // Random delay: 1-2 seconds
  //         timeoutId = setTimeout(animate, 1000 + Math.random() * 1000)
  //       }
  //     }
  //   }

  //   // Start animation
  //   animate()

  //   return () => {
  //     isActive = false
  //     if (timeoutId) {
  //       clearTimeout(timeoutId)
  //     }
  //   }
  // }, [])

  // Handle search press - redirect to login and pause for 5 seconds
  const handleSearchPress = useCallback(() => {
    animationStateRef.current.isPaused = true
    redirectToLogin()
    // Resume after 5 seconds
    setTimeout(() => {
      animationStateRef.current.isPaused = false
    }, 5000)
  }, [redirectToLogin])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [locationError, setLocationError] = useState<string | null>(null)

  // Debounce search query for handymen API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 400)

  // Filter states
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [minRating, setMinRating] = useState<number | null>(null)
  const [maxHourlyRate, setMaxHourlyRate] = useState<number | null>(null)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [showRatingDropdown, setShowRatingDropdown] = useState(false)
  const [showHourlyRateDropdown, setShowHourlyRateDropdown] = useState(false)

  // Toggle states for horizontal scroll sections
  const [expandHandymen, setExpandHandymen] = useState(false)
  const [expandJobs, setExpandJobs] = useState(false)

  // Debounced category selection to prevent rapid-fire animations
  const [pendingCategory, setPendingCategory] = useState<string | null>(null)
  const debouncedCategorySelection = useDebounce(pendingCategory, 100)

  useEffect(() => {
    setSelectedCategory(debouncedCategorySelection)
  }, [debouncedCategorySelection])

  const handleCategoryPress = useCallback((slug: string) => {
    setPendingCategory((prev) => (prev === slug ? null : slug))
  }, [])

  // Entrance animation values for sections
  const welcomeOpacity = useSharedValue(0)
  const welcomeTranslateY = useSharedValue(30)
  const ctaOpacity = useSharedValue(0)
  const ctaTranslateY = useSharedValue(30)
  const filtersOpacity = useSharedValue(0)
  const filtersTranslateY = useSharedValue(30)
  const handymenOpacity = useSharedValue(0)
  const handymenTranslateY = useSharedValue(30)
  const jobsOpacity = useSharedValue(0)
  const jobsTranslateY = useSharedValue(30)

  // Scroll-responsive background
  const scrollY = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  useEffect(() => {
    // Staggered entrance animations
    welcomeOpacity.value = withTiming(1, { duration: 500 })
    welcomeTranslateY.value = withTiming(0, { duration: 500 })

    ctaOpacity.value = withDelay(150, withTiming(1, { duration: 500 }))
    ctaTranslateY.value = withDelay(150, withTiming(0, { duration: 500 }))

    filtersOpacity.value = withDelay(300, withTiming(1, { duration: 500 }))
    filtersTranslateY.value = withDelay(300, withTiming(0, { duration: 500 }))

    handymenOpacity.value = withDelay(450, withTiming(1, { duration: 500 }))
    handymenTranslateY.value = withDelay(450, withTiming(0, { duration: 500 }))

    jobsOpacity.value = withDelay(600, withTiming(1, { duration: 500 }))
    jobsTranslateY.value = withDelay(600, withTiming(0, { duration: 500 }))
  }, [
    welcomeOpacity,
    welcomeTranslateY,
    ctaOpacity,
    ctaTranslateY,
    filtersOpacity,
    filtersTranslateY,
    handymenOpacity,
    handymenTranslateY,
    jobsOpacity,
    jobsTranslateY,
  ])

  const welcomeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: welcomeOpacity.value,
    transform: [{ translateY: welcomeTranslateY.value }],
  }))

  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaTranslateY.value }],
  }))

  const filtersAnimatedStyle = useAnimatedStyle(() => ({
    opacity: filtersOpacity.value,
    transform: [{ translateY: filtersTranslateY.value }],
  }))

  const handymenSectionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: handymenOpacity.value,
    transform: [{ translateY: handymenTranslateY.value }],
  }))

  const jobsSectionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: jobsOpacity.value,
    transform: [{ translateY: jobsTranslateY.value }],
  }))

  // Continuous CTA pulse animation (gentle scale + shadow)
  const ctaPulseProgress = useSharedValue(0)

  useEffect(() => {
    // Gentle continuous pulse: 4 second loop
    ctaPulseProgress.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
      -1, // Infinite
      true // Reverse
    )
  }, [ctaPulseProgress])

  const ctaPulseAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(ctaPulseProgress.value, [0, 0.5, 1], [1, 1.1, 1])
    const shadowOpacity = interpolate(ctaPulseProgress.value, [0, 0.5, 1], [0.1, 0.25, 0.1])

    return {
      transform: [{ scale }],
      shadowOpacity,
    }
  })

  // Request location permission and get current location
  useEffect(() => {
    async function getLocation() {
      try {
        const enabled = await Location.hasServicesEnabledAsync()
        if (!enabled) {
          setLocationError('Location services are disabled')
          return
        }

        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          setLocationError('Location permission denied')
          return
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })

        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        })
      } catch (error) {
        console.error('Error getting location:', error)
        setLocationError('Failed to get location')
      }
    }

    getLocation()
  }, [])

  // Fetch cities from API
  const { data: cities, isLoading: citiesLoading } = useCities()

  // Get coordinates for selected city
  const selectedCitySlug = selectedCity
    ? cities?.find((c) => c.public_id === selectedCity)?.slug
    : null
  const cityCoords = selectedCitySlug ? CITY_COORDINATES[selectedCitySlug] : null

  // Fetch guest handymen with filters
  const {
    data: handymenData,
    isLoading: handymenLoading,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error: handymenError,
  } = useGuestHandymen({
    search: debouncedSearchQuery || undefined,
    latitude: cityCoords?.lat || location?.latitude,
    longitude: cityCoords?.lng || location?.longitude,
    category: selectedCategory || undefined,
  })

  // Filter handymen by rating and hourly rate (client-side)
  const handymen = useMemo(() => {
    let filteredHandymen = handymenData?.pages.flatMap((page) => page.results) || []
    if (minRating) {
      filteredHandymen = filteredHandymen.filter((h) => h.rating >= minRating)
    }
    if (maxHourlyRate !== null) {
      if (maxHourlyRate === -1) {
        // $101+ option - filter for rates greater than $100
        filteredHandymen = filteredHandymen.filter((h) => h.hourly_rate && h.hourly_rate > 100)
      } else {
        // Standard "or less" options
        filteredHandymen = filteredHandymen.filter(
          (h) => h.hourly_rate && h.hourly_rate <= maxHourlyRate
        )
      }
    }
    return filteredHandymen
  }, [handymenData, minRating, maxHourlyRate])

  // Fetch available jobs for handymen
  const { data: jobsData, isLoading: jobsLoading } = useGuestJobs({
    category: selectedCategory || undefined,
  })

  const jobs = useMemo(() => {
    return jobsData?.pages.flatMap((page) => page.results) || []
  }, [jobsData])

  // Fetch categories from API
  const { data: categories, isLoading: categoriesLoading } = useCategories()

  // Get display labels for filters
  const selectedCityName = selectedCity
    ? cities?.find((c) => c.public_id === selectedCity)?.name
    : null

  const ratingLabel = minRating ? `${minRating}+ Stars` : null
  const hourlyRateLabel =
    maxHourlyRate !== null
      ? maxHourlyRate === -1
        ? '$101/hr or more'
        : `$${maxHourlyRate}/hr or less`
      : null

  return (
    <GradientBackground>
      <YStack flex={1}>
        <AnimatedScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          {/* Job Posting Panel - Photo Background CTA with integrated search */}
          <AnimatedYStack
            pb="$3"
            style={ctaAnimatedStyle}
          >
            <YStack
              overflow="hidden"
              height={380}
              position="relative"
              borderBottomLeftRadius="$6"
              borderBottomRightRadius="$6"
            >
              {/* Background Image - Full Width */}
              <Image
                source={CTA_BACKGROUND_IMAGE}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: '100%',
                  height: '100%',
                }}
                contentFit="cover"
              />

              {/* Top Gradient - Subtle fade to half transparency */}
              <LinearGradient
                colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0)']}
                start={[0.5, 0]}
                end={[0.5, 0.5]}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, zIndex: 5 }}
              />

              {/* Subtle Green Tint Overlay */}
              <LinearGradient
                colors={['rgba(12,154,92,0.20)', 'rgba(12,154,92,0.30)', 'rgba(12,154,92,0.40)']}
                start={[0, 0]}
                end={[1, 1]}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              />

              {/* Subtle Dark Vignette for text readability */}
              <LinearGradient
                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)']}
                start={[0.5, 0]}
                end={[0.5, 1]}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              />

              {/* Decorative Accent Circle */}
              <View
                position="absolute"
                top={-40}
                right={-40}
                width={120}
                height={120}
                bg="rgba(255,255,255,0.15)"
                borderRadius={100}
                pointerEvents="none"
              />

              {/* Search Bar - Integrated at top */}
              <XStack
                px="$4"
                py="$3"
                pt={insets.top + 12}
                alignItems="center"
                gap="$3"
                justifyContent="space-between"
                zIndex={20}
              >
                <Pressable
                  onPress={handleSearchPress}
                  style={{ flex: 1 }}
                >
                  <XStack
                    bg="rgba(255,255,255,0.9)"
                    borderRadius="$4"
                    px="$3"
                    py="$2.5"
                    alignItems="center"
                    gap="$2"
                  >
                    <Search
                      pointerEvents="none"
                      size={18}
                      color="#666"
                    />
                    <Text
                      color="#666"
                      fontSize="$3"
                    >
                      {displayText || ' '}
                      <Text
                        color="#666"
                        fontSize="$3"
                        opacity={showCursor ? 1 : 0}
                      >
                        |
                      </Text>
                    </Text>
                  </XStack>
                </Pressable>

                <Button
                  unstyled
                  onPress={redirectToLogin}
                  position="relative"
                >
                  <MessageCircle
                    size={22}
                    color="white"
                    fill="white"
                  />
                </Button>
              </XStack>

              {/* Content */}
              <YStack
                flex={1}
                justifyContent="center"
                alignItems="center"
                px="$5"
                pb="$6"
                gap="$5"
                zIndex={10}
              >
                {/* Headline */}
                <YStack
                  alignItems="center"
                  gap="$2"
                  pt="$3"
                >
                  <Text
                    fontSize="$9"
                    fontWeight="bold"
                    color="white"
                    textAlign="center"
                    letterSpacing={-0.5}
                  >
                    What needs fixing?
                  </Text>
                  <Text
                    fontSize="$4"
                    color="rgba(255,255,255,0.9)"
                    textAlign="center"
                  >
                    Expert handymen ready to help
                  </Text>
                </YStack>

                {/* CTA Button with Continuous Pulse Animation */}
                <AnimatedButton
                  size="$6"
                  bg="white"
                  color="#0C9A5C"
                  borderRadius="$6"
                  fontWeight="bold"
                  px="$7"
                  py="$3"
                  fontSize="$5"
                  style={ctaPulseAnimatedStyle}
                  onPress={redirectToLogin}
                  shadowColor="rgba(0,0,0,0.25)"
                  shadowRadius={12}
                  shadowOffset={{ width: 0, height: 4 }}
                  icon={
                    <Plus
                      size={24}
                      color="white"
                      strokeWidth={2.5}
                      bg="#0C9A5C"
                      borderRadius={100}
                    />
                  }
                >
                  Post a Job
                </AnimatedButton>
              </YStack>
            </YStack>
          </AnimatedYStack>

          {/* Promo Codes Section */}
          <AnimatedYStack
            px="$4"
            pb="$4"
            style={filtersAnimatedStyle}
          >
            <YStack gap="$2">
              <XStack
                alignItems="center"
                justifyContent="space-between"
                mb="$1"
              >
                <Text
                  fontSize="$5"
                  fontWeight="bold"
                  color="$color"
                >
                  Special Offers
                </Text>
                <Text
                  fontSize="$2"
                  color="$colorSubtle"
                >
                  Save on your first job
                </Text>
              </XStack>

              <ScrollIndicator>
                <Animated.ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 24 }}
                >
                  <XStack gap="$3">
                    {PROMO_CODES.map((promo, index) => {
                      const IconComponent = promoIconMap[promo.icon]
                      return (
                        <AnimatedCard
                          key={promo.code}
                          index={index}
                          onPress={redirectToLogin}
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.92)',
                            borderRadius: 16,
                            overflow: 'hidden',
                            backdropFilter: 'blur(10px)',
                            shadowColor: 'rgba(12,154,92,0.15)',
                            shadowRadius: 15,
                            shadowOpacity: 1,
                            shadowOffset: { width: 0, height: 6 },
                            elevation: 4,
                            width: 180,
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.8)',
                          }}
                        >
                          {/* Gradient Header */}
                          <LinearGradient
                            colors={[promo.color, `${promo.color}DD`]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 10,
                              minHeight: 70,
                            }}
                          >
                            <XStack
                              alignItems="flex-start"
                              justifyContent="space-between"
                            >
                              <YStack>
                                <Text
                                  fontSize="$6"
                                  fontWeight="bold"
                                  color="white"
                                >
                                  {promo.discount}
                                </Text>
                                {promo.badge && (
                                  <View
                                    bg="rgba(255,255,255,0.25)"
                                    px="$1.5"
                                    py="$0.5"
                                    borderRadius="$2"
                                    mt="$1"
                                    alignSelf="flex-start"
                                  >
                                    <Text
                                      fontSize={9}
                                      fontWeight="bold"
                                      color="white"
                                      textTransform="uppercase"
                                      letterSpacing={0.5}
                                    >
                                      {promo.badge}
                                    </Text>
                                  </View>
                                )}
                              </YStack>
                              <View
                                bg="rgba(255,255,255,0.2)"
                                p="$1.5"
                                borderRadius="$3"
                              >
                                <IconComponent
                                  size={18}
                                  color="white"
                                />
                              </View>
                            </XStack>
                          </LinearGradient>

                          {/* Card Body */}
                          <YStack
                            p="$3"
                            gap="$1"
                          >
                            <Text
                              fontSize="$4"
                              fontWeight="bold"
                              color="$color"
                              letterSpacing={2}
                            >
                              {promo.code}
                            </Text>
                            <Text
                              fontSize="$2"
                              color="$colorSubtle"
                              numberOfLines={1}
                            >
                              {promo.description}
                            </Text>
                            <XStack
                              alignItems="center"
                              gap="$1"
                              mt="$1"
                            >
                              <Clock
                                size={10}
                                color="rgba(12,154,92,0.8)"
                              />
                              <Text
                                fontSize={10}
                                color="rgba(12,154,92,0.8)"
                              >
                                {promo.expiryText}
                              </Text>
                            </XStack>
                          </YStack>

                          {/* Apply Button */}
                          <XStack
                            px="$3"
                            pb="$3"
                          >
                            <Button
                              unstyled
                              flex={1}
                              borderRadius="$3"
                              py="$2"
                              px="$3"
                              {...PressPresets.secondary}
                              onPress={redirectToLogin}
                              style={{
                                backgroundColor: `${promo.color}20`,
                              }}
                            >
                              <Text
                                fontSize="$2"
                                fontWeight="bold"
                                style={{ color: promo.color }}
                              >
                                Apply Code
                              </Text>
                            </Button>
                          </XStack>
                        </AnimatedCard>
                      )
                    })}
                  </XStack>
                </Animated.ScrollView>
              </ScrollIndicator>
            </YStack>
          </AnimatedYStack>

          {/* Direct Hire Section */}
          <AnimatedYStack
            px="$4"
            mb="$4"
            style={filtersAnimatedStyle}
          >
            <YStack
              borderRadius="$6"
              p="$4"
              style={{
                backgroundColor: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(20px)',
              }}
              borderWidth={1}
              borderColor="rgba(255,255,255,0.6)"
              shadowColor="rgba(12,154,92,0.08)"
              shadowRadius={20}
              shadowOpacity={1}
              shadowOffset={{ width: 0, height: 8 }}
            >
              <YStack>
                <Text
                  fontSize="$6"
                  fontWeight="bold"
                  color="$color"
                  mb="$1"
                >
                  Want to skip the bids?
                </Text>
                <Text
                  fontSize="$3"
                  color="$colorSubtle"
                  mb="$3"
                  lineHeight="$5"
                >
                  Directly hire a handyman for your job
                </Text>

                {/* Location Filter with City Dropdown */}
                <AnimatedYStack
                  gap="$2"
                  mb="$3"
                  layout={LinearTransition}
                >
                  <XStack
                    alignItems="center"
                    gap="$3"
                    bg="$backgroundSubtle"
                    p="$2.5"
                    borderRadius="$4"
                    {...PressPresets.listItem}
                    onPress={() => setShowCityDropdown(!showCityDropdown)}
                  >
                    <View
                      bg="white"
                      p="$1.5"
                      borderRadius="$3"
                      shadowColor="rgba(0,0,0,0.05)"
                      shadowRadius={2}
                    >
                      <MapPin
                        size={14}
                        color="$primary"
                      />
                    </View>
                    <YStack flex={1}>
                      <Text
                        fontSize={10}
                        color="$colorSubtle"
                        fontWeight="bold"
                        textTransform="uppercase"
                        letterSpacing={1}
                      >
                        Browsing near
                      </Text>
                      <XStack
                        alignItems="center"
                        gap="$1"
                      >
                        <Text
                          fontSize="$3"
                          fontWeight="bold"
                          color="$color"
                        >
                          {selectedCityName || 'Select Location'}
                        </Text>
                        <ChevronDown
                          size={14}
                          color="$colorSubtle"
                          rotate={showCityDropdown ? '180deg' : '0deg'}
                        />
                      </XStack>
                    </YStack>
                  </XStack>

                  {/* City Dropdown - Collapsible */}
                  <CollapsibleSection expanded={showCityDropdown}>
                    <YStack
                      bg="white"
                      borderRadius="$4"
                      borderWidth={1}
                      borderColor="$borderColor"
                      p="$2"
                      gap="$1"
                      overflow="hidden"
                    >
                      <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={{ maxHeight: 200 }}
                      >
                        {citiesLoading ? (
                          <Spinner
                            size="small"
                            color="$primary"
                          />
                        ) : (
                          <>
                            <Button
                              size="$2"
                              unstyled
                              onPress={() => {
                                setSelectedCity(null)
                                setShowCityDropdown(false)
                              }}
                              px="$2"
                              py="$1.5"
                            >
                              <Text
                                color={!selectedCity ? '$primary' : '$color'}
                                fontWeight={!selectedCity ? 'bold' : 'normal'}
                              >
                                All Locations
                              </Text>
                            </Button>
                            {cities?.map((city) => (
                              <Button
                                key={city.public_id}
                                size="$2"
                                unstyled
                                onPress={() => {
                                  setSelectedCity(city.public_id)
                                  setShowCityDropdown(false)
                                }}
                                px="$2"
                                py="$1.5"
                              >
                                <Text
                                  color={selectedCity === city.public_id ? '$primary' : '$color'}
                                  fontWeight={selectedCity === city.public_id ? 'bold' : 'normal'}
                                >
                                  {city.name}, {city.province}
                                </Text>
                              </Button>
                            ))}
                          </>
                        )}
                      </ScrollView>
                    </YStack>
                  </CollapsibleSection>
                </AnimatedYStack>

                {/* Category Icons - Prominent Filter for Trades */}
                <YStack
                  gap="$3"
                  mb="$4"
                >
                  <Text
                    fontSize="$4"
                    fontWeight="bold"
                    color="$color"
                    pt="$2"
                  >
                    Filter by Trade
                  </Text>
                  {categoriesLoading ? (
                    <Spinner
                      size="small"
                      color="$primary"
                    />
                  ) : (
                    <ScrollIndicator>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        <XStack gap="$3">
                          {categories?.map((cat) => {
                            const IconComponent = iconMap[cat.icon] || Wrench
                            const isSelected = selectedCategory === cat.slug

                            return (
                              <YStack
                                key={cat.public_id}
                                alignItems="center"
                                gap="$2"
                                width={70}
                              >
                                <AnimatedCategoryIcon
                                  isSelected={isSelected}
                                  onPress={() => handleCategoryPress(cat.slug)}
                                >
                                  <View
                                    width={56}
                                    height={56}
                                    borderRadius="$6"
                                    alignItems="center"
                                    justifyContent="center"
                                    bg={isSelected ? '$primaryBackground' : '$backgroundSubtle'}
                                    borderColor={isSelected ? '$primary' : '$borderColor'}
                                  >
                                    <IconComponent
                                      size={24}
                                      color={
                                        isSelected
                                          ? '$primary'
                                          : categoryColors[cat.icon] || '#666666'
                                      }
                                      strokeWidth={2}
                                    />
                                  </View>
                                </AnimatedCategoryIcon>
                                <Text
                                  fontSize="$2"
                                  fontWeight="600"
                                  color="$color"
                                  textAlign="center"
                                  numberOfLines={1}
                                  mt="$1"
                                >
                                  {cat.name}
                                </Text>
                              </YStack>
                            )
                          })}
                        </XStack>
                      </ScrollView>
                    </ScrollIndicator>
                  )}
                </YStack>

                {/* Filters - Rate and Rating Only */}
                <YStack gap="$2">
                  <XStack gap="$1">
                    {/* Hourly Rate Filter Button */}
                    <Button
                      flex={1}
                      size="$2"
                      bg={maxHourlyRate ? '$primaryBackground' : 'white'}
                      borderColor={maxHourlyRate ? '$primary' : '$borderColor'}
                      borderWidth={1}
                      color={maxHourlyRate ? '$primary' : '$colorSubtle'}
                      borderRadius="$3"
                      fontSize="$1"
                      fontWeight="bold"
                      px="$0.5"
                      onPress={() => {
                        setShowRatingDropdown(false)
                        setShowHourlyRateDropdown(!showHourlyRateDropdown)
                      }}
                    >
                      {hourlyRateLabel || 'Hourly Rate'} <ChevronDown size={10} />
                    </Button>

                    {/* Rating Filter Button */}
                    <Button
                      flex={1}
                      size="$2"
                      bg={minRating ? '$primaryBackground' : 'white'}
                      borderColor={minRating ? '$primary' : '$borderColor'}
                      borderWidth={1}
                      color={minRating ? '$primary' : '$colorSubtle'}
                      borderRadius="$3"
                      fontSize="$1"
                      fontWeight="bold"
                      px="$0.5"
                      onPress={() => {
                        setShowHourlyRateDropdown(false)
                        setShowRatingDropdown(!showRatingDropdown)
                      }}
                    >
                      {ratingLabel || 'Rating'} <ChevronDown size={10} />
                    </Button>
                  </XStack>

                  {/* Hourly Rate Dropdown - Expand Layout */}
                  <CollapsibleSection expanded={showHourlyRateDropdown}>
                    <YStack
                      bg="white"
                      borderRadius="$4"
                      borderWidth={1}
                      borderColor="$borderColor"
                      p="$2"
                      gap="$1"
                      mt="$1"
                    >
                      <Button
                        size="$2"
                        unstyled
                        onPress={() => {
                          setMaxHourlyRate(null)
                          setShowHourlyRateDropdown(false)
                        }}
                        px="$2"
                        py="$1.5"
                      >
                        <Text
                          color={!maxHourlyRate ? '$primary' : '$color'}
                          fontWeight={!maxHourlyRate ? 'bold' : 'normal'}
                        >
                          All Rates
                        </Text>
                      </Button>
                      {[25, 50, 100].map((rate) => (
                        <Button
                          key={rate}
                          size="$2"
                          unstyled
                          onPress={() => {
                            setMaxHourlyRate(rate)
                            setShowHourlyRateDropdown(false)
                          }}
                          px="$2"
                          py="$1.5"
                        >
                          <Text
                            color={maxHourlyRate === rate ? '$primary' : '$color'}
                            fontWeight={maxHourlyRate === rate ? 'bold' : 'normal'}
                          >
                            ${rate}/hr or less
                          </Text>
                        </Button>
                      ))}
                      {/* $101+ option - stored as -1 for "or more" logic */}
                      <Button
                        size="$2"
                        unstyled
                        onPress={() => {
                          setMaxHourlyRate(-1)
                          setShowHourlyRateDropdown(false)
                        }}
                        px="$2"
                        py="$1.5"
                      >
                        <Text
                          color={maxHourlyRate === -1 ? '$primary' : '$color'}
                          fontWeight={maxHourlyRate === -1 ? 'bold' : 'normal'}
                        >
                          $101/hr or more
                        </Text>
                      </Button>
                    </YStack>
                  </CollapsibleSection>

                  {/* Rating Dropdown - Expand Layout */}
                  <CollapsibleSection expanded={showRatingDropdown}>
                    <YStack
                      bg="white"
                      borderRadius="$4"
                      borderWidth={1}
                      borderColor="$borderColor"
                      p="$2"
                      gap="$1"
                      mt="$1"
                    >
                      <Button
                        size="$2"
                        unstyled
                        onPress={() => {
                          setMinRating(null)
                          setShowRatingDropdown(false)
                        }}
                        px="$2"
                        py="$1.5"
                      >
                        <Text
                          color={!minRating ? '$primary' : '$color'}
                          fontWeight={!minRating ? 'bold' : 'normal'}
                        >
                          All Ratings
                        </Text>
                      </Button>
                      {[4.5, 4, 3.5, 3].map((rating) => (
                        <Button
                          key={rating}
                          size="$2"
                          unstyled
                          onPress={() => {
                            setMinRating(rating)
                            setShowRatingDropdown(false)
                          }}
                          px="$2"
                          py="$1.5"
                        >
                          <Text
                            color={minRating === rating ? '$primary' : '$color'}
                            fontWeight={minRating === rating ? 'bold' : 'normal'}
                          >
                            {rating}+ Stars
                          </Text>
                        </Button>
                      ))}
                    </YStack>
                  </CollapsibleSection>
                </YStack>
              </YStack>
            </YStack>
          </AnimatedYStack>

          {/* Handyman List - Horizontal Scroll with Toggle */}
          <AnimatedYStack
            px="$4"
            pb="$4"
            style={handymenSectionAnimatedStyle}
          >
            <XStack
              justifyContent="space-between"
              alignItems="center"
              mb="$3"
              px="$1"
            >
              <Text
                fontSize="$3"
                fontWeight="bold"
                color="$color"
              >
                {handymen.length} Professionals Available
              </Text>
              <Button
                unstyled
                onPress={() => setExpandHandymen(!expandHandymen)}
                {...PressPresets.icon}
              >
                <XStack
                  alignItems="center"
                  gap="$1"
                >
                  <Text
                    fontSize="$2"
                    fontWeight="bold"
                    color="$primary"
                  >
                    {expandHandymen ? 'Show Less' : 'See All'}
                  </Text>
                  {expandHandymen ? (
                    <ChevronUp
                      size={16}
                      color="#0C9A5C"
                    />
                  ) : (
                    <ChevronDown
                      size={16}
                      color="#0C9A5C"
                    />
                  )}
                </XStack>
              </Button>
            </XStack>

            {handymenLoading ? (
              <Spinner
                size="large"
                color="$primary"
                m="$4"
              />
            ) : handymen.length > 0 ? (
              <YStack>
                {/* Expanded vertical list */}
                <CollapsibleSection expanded={expandHandymen}>
                  <YStack gap="$3">
                    {handymen.map((pro) => (
                      <XStack
                        key={pro.public_id}
                        bg="white"
                        borderRadius="$6"
                        p="$3"
                        borderColor="$borderSubtle"
                        borderWidth={1}
                        shadowColor="rgba(0,0,0,0.03)"
                        shadowRadius={5}
                        shadowOpacity={1}
                        gap="$3"
                        onPress={redirectToLogin}
                      >
                        <View position="relative">
                          <View
                            width={56}
                            height={56}
                            borderRadius="$4"
                            bg="$backgroundSubtle"
                            alignItems="center"
                            justifyContent="center"
                            borderWidth={2}
                            borderColor="white"
                            shadowColor="rgba(0,0,0,0.1)"
                            shadowRadius={3}
                          >
                            <Text
                              fontSize="$5"
                              fontWeight="bold"
                              color="$colorSubtle"
                            >
                              {pro.display_name.charAt(0)}
                            </Text>
                          </View>
                          <View
                            position="absolute"
                            bottom={-4}
                            right={-4}
                            bg="$primary"
                            p={2}
                            borderRadius={100}
                            borderWidth={2}
                            borderColor="white"
                          >
                            <ShieldCheck
                              size={10}
                              color="white"
                            />
                          </View>
                        </View>

                        <YStack
                          flex={1}
                          justifyContent="space-between"
                        >
                          <XStack
                            justifyContent="space-between"
                            alignItems="flex-start"
                          >
                            <YStack flex={1}>
                              <Text
                                fontSize="$3"
                                fontWeight="bold"
                                color="$color"
                                numberOfLines={1}
                              >
                                {pro.display_name}
                              </Text>
                              <Text
                                fontSize={10}
                                color="$colorSubtle"
                              >
                                Specialist
                              </Text>
                            </YStack>
                            <YStack alignItems="flex-end">
                              <Text
                                fontSize="$3"
                                fontWeight="bold"
                                color="$color"
                              >
                                ${pro.hourly_rate || 'N/A'}
                              </Text>
                              <Text
                                fontSize={9}
                                color="$colorSubtle"
                                fontWeight="500"
                              >
                                /hr
                              </Text>
                            </YStack>
                          </XStack>

                          <XStack
                            gap="$3"
                            mt="$1"
                            alignItems="center"
                          >
                            <XStack
                              bg="$warningBackground"
                              px="$1.5"
                              py="$0.5"
                              borderRadius="$2"
                              borderColor="$warningBackground"
                              borderWidth={1}
                              alignItems="center"
                              gap="$1"
                            >
                              <Star
                                size={10}
                                color="$accent"
                                fill="$accent"
                              />
                              <Text
                                fontSize={10}
                                fontWeight="bold"
                                color="$accent"
                              >
                                {pro.rating || 0}
                              </Text>
                              <Text
                                fontSize={10}
                                color="$accent"
                                opacity={0.7}
                              >
                                ({pro.review_count || 0})
                              </Text>
                            </XStack>
                            <XStack
                              alignItems="center"
                              gap="$1"
                            >
                              <Briefcase
                                size={10}
                                color="$colorSubtle"
                              />
                              <Text
                                fontSize={10}
                                color="$colorSubtle"
                              >
                                34 jobs
                              </Text>
                            </XStack>
                          </XStack>

                          <Button
                            size="$2"
                            bg="$color"
                            color="white"
                            borderRadius="$4"
                            mt="$2"
                            fontWeight="bold"
                            {...PressPresets.primary}
                            onPress={redirectToLogin}
                          >
                            Invite to Job
                          </Button>
                        </YStack>
                      </XStack>
                    ))}
                  </YStack>
                </CollapsibleSection>

                {/* Horizontal scroll list with virtualized rendering */}
                <CollapsibleSection expanded={!expandHandymen}>
                  <ScrollIndicator>
                    <Animated.ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <XStack gap="$3">
                        {handymen.slice(0, 6).map((pro, index) => (
                          <AnimatedCard
                            key={pro.public_id}
                            index={index}
                            onPress={redirectToLogin}
                            style={{
                              backgroundColor: 'white',
                              borderRadius: 12,
                              padding: 12,
                              borderWidth: 1,
                              borderColor: '#E5E5EA',
                              shadowColor: 'rgba(0,0,0,0.03)',
                              shadowRadius: 5,
                              shadowOpacity: 1,
                              width: 160,
                            }}
                          >
                            <YStack
                              alignItems="center"
                              gap="$2"
                            >
                              <View position="relative">
                                <View
                                  width={64}
                                  height={64}
                                  borderRadius="$4"
                                  bg="$backgroundSubtle"
                                  alignItems="center"
                                  justifyContent="center"
                                  borderWidth={2}
                                  borderColor="white"
                                >
                                  <Text
                                    fontSize="$6"
                                    fontWeight="bold"
                                    color="$colorSubtle"
                                  >
                                    {pro.display_name.charAt(0)}
                                  </Text>
                                </View>
                                <View
                                  position="absolute"
                                  bottom={-4}
                                  right={-4}
                                  bg="$primary"
                                  p={2}
                                  borderRadius={100}
                                  borderWidth={2}
                                  borderColor="white"
                                >
                                  <ShieldCheck
                                    size={10}
                                    color="white"
                                  />
                                </View>
                              </View>

                              <Text
                                fontSize="$3"
                                fontWeight="bold"
                                color="$color"
                                textAlign="center"
                                numberOfLines={1}
                              >
                                {pro.display_name}
                              </Text>

                              <XStack
                                bg="$warningBackground"
                                px="$1.5"
                                py="$0.5"
                                borderRadius="$2"
                                borderColor="$warningBackground"
                                borderWidth={1}
                                alignItems="center"
                                gap="$1"
                              >
                                <Star
                                  size={10}
                                  color="$accent"
                                  fill="$accent"
                                />
                                <Text
                                  fontSize={10}
                                  fontWeight="bold"
                                  color="$accent"
                                >
                                  {pro.rating || 0}
                                </Text>
                                <Text
                                  fontSize={10}
                                  color="$accent"
                                  opacity={0.7}
                                >
                                  ({pro.review_count || 0})
                                </Text>
                              </XStack>

                              <Text
                                fontSize="$2"
                                fontWeight="bold"
                                color="$color"
                              >
                                ${pro.hourly_rate || 'N/A'}/hr
                              </Text>
                            </YStack>
                          </AnimatedCard>
                        ))}
                      </XStack>
                    </Animated.ScrollView>
                  </ScrollIndicator>
                </CollapsibleSection>
              </YStack>
            ) : (
              <YStack
                py="$8"
                alignItems="center"
                bg="$gray1"
                borderRadius="$6"
                borderWidth={2}
                borderColor="$borderSubtle"
                borderStyle="dashed"
              >
                <Text color="$colorMuted">No professionals found.</Text>
              </YStack>
            )}
          </AnimatedYStack>

          {/* Become a Handyman Banner */}
          <YStack
            px="$4"
            pb="$4"
          >
            <XStack
              borderRadius="$6"
              p="$4"
              alignItems="center"
              gap="$3"
              onPress={() => router.push('/auth/login')}
              {...PressPresets.card}
              bg="#FFB800"
              shadowColor="rgba(0,0,0,0.1)"
              shadowRadius={15}
              shadowOpacity={1}
              shadowOffset={{ width: 0, height: 4 }}
            >
              <View
                bg="rgba(0,0,0,0.15)"
                p="$2.5"
                borderRadius="$4"
              >
                <DollarSign
                  size={24}
                  color="white"
                  strokeWidth={2.5}
                />
              </View>
              <YStack flex={1}>
                <Text
                  fontSize="$4"
                  fontWeight="bold"
                  color="#1A1A1A"
                >
                  Earn Money as a Handyman
                </Text>
                <Text
                  fontSize="$2"
                  color="#4A4A4A"
                >
                  Set your own schedule and rates
                </Text>
              </YStack>
              <ArrowRight
                size={20}
                color="$accent"
              />
            </XStack>
          </YStack>

          {/* Available Jobs - Horizontal Scroll with Toggle */}
          <AnimatedYStack
            px="$4"
            pb="$8"
            style={jobsSectionAnimatedStyle}
          >
            <XStack
              justifyContent="space-between"
              alignItems="center"
              mb="$3"
              px="$1"
            >
              <Text
                fontSize="$3"
                fontWeight="bold"
                color="$color"
              >
                {jobs.length} Jobs Available
              </Text>
              <Button
                unstyled
                onPress={() => setExpandJobs(!expandJobs)}
                {...PressPresets.icon}
              >
                <XStack
                  alignItems="center"
                  gap="$1"
                >
                  <Text
                    fontSize="$2"
                    fontWeight="bold"
                    color="$primary"
                  >
                    {expandJobs ? 'Show Less' : 'See All'}
                  </Text>
                  {expandJobs ? (
                    <ChevronUp
                      size={16}
                      color="#0C9A5C"
                    />
                  ) : (
                    <ChevronDown
                      size={16}
                      color="#0C9A5C"
                    />
                  )}
                </XStack>
              </Button>
            </XStack>

            {jobsLoading ? (
              <Spinner
                size="large"
                color="$primary"
                m="$4"
              />
            ) : jobs.length > 0 ? (
              <YStack>
                {/* Expanded vertical list */}
                <CollapsibleSection expanded={expandJobs}>
                  <YStack gap="$3">
                    {jobs.map((job) => (
                      <YStack
                        key={job.public_id}
                        bg="white"
                        borderRadius="$6"
                        p="$4"
                        borderColor="$borderSubtle"
                        borderWidth={1}
                        shadowColor="rgba(0,0,0,0.03)"
                        shadowRadius={5}
                        shadowOpacity={1}
                        onPress={redirectToLogin}
                      >
                        <XStack
                          justifyContent="space-between"
                          alignItems="flex-start"
                          mb="$2"
                        >
                          <YStack flex={1}>
                            <Text
                              fontSize="$4"
                              fontWeight="bold"
                              color="$color"
                              numberOfLines={2}
                            >
                              {job.title}
                            </Text>
                            <Text
                              fontSize="$2"
                              color="$colorSubtle"
                              mt="$1"
                            >
                              {job.city?.name || 'Location N/A'}
                            </Text>
                          </YStack>
                          <YStack alignItems="flex-end">
                            <Text
                              fontSize="$4"
                              fontWeight="bold"
                              color="$accent"
                            >
                              ${job.estimated_budget}
                            </Text>
                            <Text
                              fontSize="$1"
                              color="$colorSubtle"
                            >
                              budget
                            </Text>
                          </YStack>
                        </XStack>

                        <XStack
                          gap="$2"
                          mt="$2"
                          flexWrap="wrap"
                        >
                          {job.category && (
                            <XStack
                              bg="rgba(12,154,92,0.1)"
                              px="$2"
                              py="$1"
                              borderRadius="$2"
                              alignItems="center"
                              gap="$1"
                            >
                              <Text
                                fontSize="$1"
                                color="$primary"
                                fontWeight="500"
                              >
                                {job.category.name}
                              </Text>
                            </XStack>
                          )}
                          <XStack
                            bg="$accentBackground"
                            px="$2"
                            py="$1"
                            borderRadius="$2"
                            alignItems="center"
                            gap="$1"
                          >
                            <Text
                              fontSize="$1"
                              color="$accent"
                              fontWeight="500"
                            >
                              Open
                            </Text>
                          </XStack>
                        </XStack>
                      </YStack>
                    ))}
                  </YStack>
                </CollapsibleSection>

                {/* Horizontal scroll list with virtualized rendering */}
                <CollapsibleSection expanded={!expandJobs}>
                  <ScrollIndicator>
                    <Animated.ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <XStack gap="$3">
                        {jobs.slice(0, 6).map((job, index) => (
                          <AnimatedCard
                            key={job.public_id}
                            index={index}
                            onPress={redirectToLogin}
                            style={{
                              backgroundColor: 'white',
                              borderRadius: 12,
                              padding: 16,
                              borderWidth: 1,
                              borderColor: '#E5E5EA',
                              shadowColor: 'rgba(0,0,0,0.03)',
                              shadowRadius: 5,
                              shadowOpacity: 1,
                              width: 280,
                            }}
                          >
                            <XStack
                              justifyContent="space-between"
                              alignItems="flex-start"
                              mb="$2"
                            >
                              <YStack flex={1}>
                                <Text
                                  fontSize="$4"
                                  fontWeight="bold"
                                  color="$color"
                                  numberOfLines={2}
                                >
                                  {job.title}
                                </Text>
                                <Text
                                  fontSize="$2"
                                  color="$colorSubtle"
                                  mt="$1"
                                >
                                  {job.city?.name || 'Location N/A'}
                                </Text>
                              </YStack>
                            </XStack>

                            <XStack
                              justifyContent="space-between"
                              alignItems="center"
                              mt="$2"
                            >
                              <Text
                                fontSize="$4"
                                fontWeight="bold"
                                color="$accent"
                              >
                                ${job.estimated_budget}
                              </Text>
                              {job.category && (
                                <XStack
                                  bg="rgba(12,154,92,0.1)"
                                  px="$2"
                                  py="$1"
                                  borderRadius="$2"
                                >
                                  <Text
                                    fontSize="$1"
                                    color="$primary"
                                    fontWeight="500"
                                  >
                                    {job.category.name}
                                  </Text>
                                </XStack>
                              )}
                            </XStack>
                          </AnimatedCard>
                        ))}
                      </XStack>
                    </Animated.ScrollView>
                  </ScrollIndicator>
                </CollapsibleSection>
              </YStack>
            ) : (
              <YStack
                py="$8"
                alignItems="center"
                bg="rgba(255,184,0,0.05)"
                borderRadius="$6"
                borderWidth={2}
                borderColor="rgba(255,184,0,0.3)"
                borderStyle="dashed"
              >
                <Text color="$colorMuted">No jobs available in your area.</Text>
              </YStack>
            )}
          </AnimatedYStack>
        </AnimatedScrollView>
      </YStack>
    </GradientBackground>
  )
}
