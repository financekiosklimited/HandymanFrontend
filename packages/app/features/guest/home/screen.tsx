'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import * as Location from 'expo-location'
import { YStack, XStack, ScrollView, Text, Button, Spinner, View, ScrollIndicator } from '@my/ui'
import { useGuestJobs, useGuestHandymen, useCategories, useCities } from '@my/api'
import { LinearGradient } from 'expo-linear-gradient'
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
  Easing,
  interpolate,
  useAnimatedScrollHandler,
} from 'react-native-reanimated'
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
} from '@tamagui/lucide-icons'

// Create animated components
const AnimatedYStack = Animated.createAnimatedComponent(YStack)
const AnimatedXStack = Animated.createAnimatedComponent(XStack)
const AnimatedView = Animated.createAnimatedComponent(View)
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)

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

// Animated category icon with spring feedback
function AnimatedCategoryIcon({
  children,
  isSelected,
  onPress,
}: {
  children: React.ReactNode
  isSelected: boolean
  onPress: () => void
}) {
  const scale = useSharedValue(1)
  const borderWidth = useSharedValue(1)

  useEffect(() => {
    borderWidth.value = withSpring(isSelected ? 2 : 1, SPRING_CONFIG)
  }, [isSelected, borderWidth])

  const handlePress = useCallback(() => {
    scale.value = withSequence(withTiming(0.9, { duration: 80 }), withSpring(1, SPRING_CONFIG))
    onPress()
  }, [onPress, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderWidth: borderWidth.value,
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

export function GuestHomeScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)

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
    if (maxHourlyRate) {
      filteredHandymen = filteredHandymen.filter(
        (h) => h.hourly_rate && h.hourly_rate <= maxHourlyRate
      )
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

  // Navigation Helper
  const redirectToLogin = () => {
    router.push('/auth/login')
  }

  // Get display labels for filters
  const selectedCityName = selectedCity
    ? cities?.find((c) => c.public_id === selectedCity)?.name
    : null

  const ratingLabel = minRating ? `${minRating}+ Stars` : null
  const hourlyRateLabel = maxHourlyRate ? `$${maxHourlyRate}/hr or less` : null

  return (
    <View
      flex={1}
      backgroundColor="$background"
    >
      <YStack
        flex={1}
        pt={insets.top}
      >
        {/* Header */}
        <XStack
          px="$4"
          py="$3"
          alignItems="center"
          gap="$3"
          justifyContent="space-between"
        >
          {/* Search Input Placeholder */}
          <XStack
            flex={1}
            bg="$backgroundSubtle"
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius="$4"
            px="$3"
            py="$2.5"
            alignItems="center"
            gap="$2"
          >
            <Search
              pointerEvents="none"
              size={18}
              color="$colorSubtle"
            />
            <Text
              color="$colorSubtle"
              fontSize="$3"
            >
              Search HandymanKiosk
            </Text>
          </XStack>

          <XStack
            alignItems="center"
            gap="$3"
          >
            <Button
              unstyled
              onPress={redirectToLogin}
              position="relative"
            >
              <MessageCircle
                size={20}
                color="$color"
              />
            </Button>
          </XStack>
        </XStack>

        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Message */}
          <AnimatedYStack
            px="$4"
            py="$4"
            style={welcomeAnimatedStyle}
          >
            <Text
              fontSize="$8"
              fontWeight="bold"
              color="$color"
              lineHeight="$8"
            >
              Welcome, <Text color="$primary">Guest</Text>
            </Text>
            <Text
              fontSize="$3"
              color="$colorSubtle"
              mt="$1"
            >
              Ready to improve your house?
            </Text>
          </AnimatedYStack>

          {/* Job Posting Panel - Minimalist CTA */}
          <AnimatedYStack
            px="$4"
            pb="$3"
            pt="$2"
            style={ctaAnimatedStyle}
          >
            <YStack
              overflow="hidden"
              borderRadius="$8"
              p="$5"
              shadowColor="$shadowColor"
              shadowRadius={10}
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.1}
              position="relative"
            >
              {/* Gradient Background */}
              <LinearGradient
                colors={['#0C9A5C', '#34C759']}
                start={[0, 0]}
                end={[1, 1]}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              />

              {/* Decorative Blurs (Simulated) */}
              <View
                position="absolute"
                top={-32}
                right={-32}
                width={128}
                height={128}
                bg="rgba(255,255,255,0.2)"
                borderRadius={100}
                style={{ filter: 'blur(30px)' }}
                pointerEvents="none"
              />
              <View
                position="absolute"
                bottom={-32}
                left={-32}
                width={96}
                height={96}
                bg="rgba(0,0,0,0.1)"
                borderRadius={100}
                style={{ filter: 'blur(20px)' }}
                pointerEvents="none"
              />

              <YStack
                zIndex={10}
                alignItems="center"
                gap="$3"
              >
                <Text
                  fontSize="$6"
                  fontWeight="bold"
                  color="white"
                  textAlign="center"
                >
                  What needs fixing?
                </Text>

                {/* Minimalist CTA Button */}
                <Button
                  size="$5"
                  bg="white"
                  color="#0C9A5C"
                  borderRadius="$6"
                  fontWeight="bold"
                  px="$6"
                  py="$3"
                  pressStyle={{ scale: 0.98, opacity: 0.9 }}
                  onPress={redirectToLogin}
                  shadowColor="rgba(0,0,0,0.15)"
                  shadowRadius={8}
                  shadowOffset={{ width: 0, height: 2 }}
                  icon={
                    <Plus
                      size={22}
                      color="white"
                      strokeWidth={2.5}
                      bg="#0C9A5C"
                      borderRadius={100}
                    />
                  }
                >
                  Describe Your Task
                </Button>

                <Text
                  fontSize="$2"
                  color="rgba(255,255,255,0.8)"
                  textAlign="center"
                >
                  Skilled handymen will fix everything for you.
                </Text>
              </YStack>
            </YStack>
          </AnimatedYStack>

          {/* Direct Hire Section */}
          <AnimatedYStack
            px="$4"
            mb="$4"
            style={filtersAnimatedStyle}
          >
            <YStack
              bg="white"
              borderRadius="$6"
              p="$4"
              borderColor="$borderSubtle"
              borderWidth={1}
              shadowColor="$shadowColor"
              shadowRadius={5}
              shadowOpacity={0.05}
              shadowOffset={{ width: 0, height: 2 }}
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
                <YStack
                  gap="$2"
                  mb="$3"
                >
                  <XStack
                    alignItems="center"
                    gap="$3"
                    bg="$backgroundSubtle"
                    p="$2.5"
                    borderRadius="$4"
                    pressStyle={{ bg: '$borderSubtle' }}
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

                  {/* City Dropdown */}
                  {showCityDropdown && (
                    <YStack
                      bg="white"
                      borderRadius="$4"
                      borderWidth={1}
                      borderColor="$borderColor"
                      p="$2"
                      gap="$1"
                      maxHeight={200}
                    >
                      <ScrollView showsVerticalScrollIndicator={false}>
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
                  )}
                </YStack>

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
                  {showHourlyRateDropdown && (
                    <YStack
                      bg="white"
                      borderRadius="$4"
                      borderWidth={1}
                      borderColor="$borderColor"
                      p="$2"
                      gap="$1"
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
                    </YStack>
                  )}

                  {/* Rating Dropdown - Expand Layout */}
                  {showRatingDropdown && (
                    <YStack
                      bg="white"
                      borderRadius="$4"
                      borderWidth={1}
                      borderColor="$borderColor"
                      p="$2"
                      gap="$1"
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
                  )}
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
                animation="micro"
                pressStyle={{ scale: 0.95 }}
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
              expandHandymen ? (
                // Expanded vertical list
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
                          pressStyle={{ opacity: 0.9 }}
                          onPress={redirectToLogin}
                        >
                          Invite to Job
                        </Button>
                      </YStack>
                    </XStack>
                  ))}
                </YStack>
              ) : (
                // Horizontal scroll list with virtualized rendering
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
              )
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
              bg="rgba(255,184,0,0.15)"
              borderRadius="$6"
              p="$4"
              borderColor="#FFB800"
              borderWidth={1}
              alignItems="center"
              gap="$3"
              onPress={() => router.push('/auth/login')}
              pressStyle={{ scale: 0.98 }}
            >
              <View
                bg="#FFB800"
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
                  color="$color"
                >
                  Earn Money as a Handyman
                </Text>
                <Text
                  fontSize="$2"
                  color="$colorSubtle"
                >
                  Set your own schedule and rates
                </Text>
              </YStack>
              <ArrowRight
                size={20}
                color="#FFB800"
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
                animation="micro"
                pressStyle={{ scale: 0.95 }}
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
              expandJobs ? (
                // Expanded vertical list
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
                            color="#FFB800"
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
                          bg="rgba(255,184,0,0.1)"
                          px="$2"
                          py="$1"
                          borderRadius="$2"
                          alignItems="center"
                          gap="$1"
                        >
                          <Text
                            fontSize="$1"
                            color="#FFB800"
                            fontWeight="500"
                          >
                            Open
                          </Text>
                        </XStack>
                      </XStack>
                    </YStack>
                  ))}
                </YStack>
              ) : (
                // Horizontal scroll list with virtualized rendering
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
                          <Text
                            fontSize="$4"
                            fontWeight="bold"
                            color="$color"
                            numberOfLines={2}
                            mb="$2"
                          >
                            {job.title}
                          </Text>

                          <XStack
                            justifyContent="space-between"
                            alignItems="center"
                            mb="$2"
                          >
                            <Text
                              fontSize="$2"
                              color="$colorSubtle"
                            >
                              {job.city?.name || 'Location N/A'}
                            </Text>
                            <Text
                              fontSize="$4"
                              fontWeight="bold"
                              color="#FFB800"
                            >
                              ${job.estimated_budget}
                            </Text>
                          </XStack>

                          <XStack
                            gap="$2"
                            mt="$2"
                          >
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
                            <XStack
                              bg="rgba(255,184,0,0.1)"
                              px="$2"
                              py="$1"
                              borderRadius="$2"
                            >
                              <Text
                                fontSize="$1"
                                color="#FFB800"
                                fontWeight="500"
                              >
                                Open
                              </Text>
                            </XStack>
                          </XStack>
                        </AnimatedCard>
                      ))}
                    </XStack>
                  </Animated.ScrollView>
                </ScrollIndicator>
              )
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
        </ScrollView>
      </YStack>
    </View>
  )
}
