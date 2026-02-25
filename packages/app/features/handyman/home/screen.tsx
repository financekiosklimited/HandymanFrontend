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
import {
  useHandymanJobsForYou,
  useAuthStore,
  useHandymanProfile,
  useTotalUnreadCount,
  useCategories,
  useCities,
  useHandymanPendingOffersCount,
  useHandymanApplications,
  useHandymanAssignedJobs,
} from '@my/api'
import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'expo-image'
import { JobCard } from '@my/ui'
import { useRouter } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { useDebounce } from 'app/hooks'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
} from 'react-native-reanimated'
import {
  Search,
  MessageCircle,
  MapPin,
  ChevronDown,
  Target,
  Send,
  Clock,
  Star,
  DollarSign,
  Briefcase,
  Wrench,
  Zap,
  Hammer,
  Sparkles,
  PaintBucket,
  TreePine,
  Wind,
  Home,
  Layers,
  Settings,
} from '@tamagui/lucide-icons'
import { useToastController } from '@tamagui/toast'
import { showNewDirectOfferToast } from 'app/utils/toast-messages'
import {
  hasNotificationToastBeenShown,
  markNotificationToastAsShown,
} from 'app/utils/notification-toast-storage'

// Hero Background Image
const HERO_BACKGROUND_IMAGE = require('../../../../../apps/expo/assets/cta-handyman-bg.jpg')

// Message button with unread badge
function MessageBadgeButton({
  chatRole,
  onPress,
}: { chatRole: 'homeowner' | 'handyman'; onPress: () => void }) {
  const { data: unreadCount } = useTotalUnreadCount(chatRole)
  const hasUnread = (unreadCount ?? 0) > 0

  return (
    <Button
      unstyled
      onPress={onPress}
      position="relative"
      {...PressPresets.icon}
    >
      <MessageCircle
        size={20}
        color="white"
        fill="white"
      />
      {hasUnread && (
        <View
          position="absolute"
          top={-4}
          right={-4}
          bg="$primary"
          minWidth={16}
          height={16}
          borderRadius={8}
          alignItems="center"
          justifyContent="center"
          borderWidth={2}
          borderColor="white"
        >
          <Text
            fontSize={9}
            fontWeight="700"
            color="white"
          >
            {(unreadCount ?? 0) > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </Button>
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

// Budget filter options
const BUDGET_OPTIONS = [
  { value: null, label: 'All Budgets' },
  { value: 500, label: 'Under $500' },
  { value: 1000, label: 'Under $1,000' },
  { value: 2500, label: 'Under $2,500' },
  { value: 5000, label: 'Under $5,000' },
]

// Create animated components
const AnimatedView = Animated.createAnimatedComponent(View)
const AnimatedYStack = Animated.createAnimatedComponent(YStack)
const AnimatedXStack = Animated.createAnimatedComponent(XStack)
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)

// Icon mapping for API categories (Material Design names -> Lucide icons)
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

// Category colors - vivid colors matching iconography
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

// Animation configuration
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
}

// Animated card component with entrance animation for job cards
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
  const translateY = useSharedValue(30)
  const scale = useSharedValue(1)

  useEffect(() => {
    // Stagger entrance animation - only first 6 items animate
    if (index < 6) {
      const delay = index * 80
      opacity.value = withDelay(delay, withTiming(1, { duration: 400 }))
      translateY.value = withDelay(delay, withTiming(0, { duration: 400 }))
    } else {
      opacity.value = 1
      translateY.value = 0
    }
  }, [index, opacity, translateY])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
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

export function HandymanHomeScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const user = useAuthStore((state) => state.user)
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Filter states
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [maxBudget, setMaxBudget] = useState<number | null>(null)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false)

  // Debounced category selection to prevent rapid-fire animations
  const [pendingCategory, setPendingCategory] = useState<string | null>(null)
  const debouncedCategorySelection = useDebounce(pendingCategory, 100)

  useEffect(() => {
    setSelectedCategory(debouncedCategorySelection)
  }, [debouncedCategorySelection])

  const handleCategoryPress = useCallback((slug: string) => {
    setPendingCategory((prev) => (prev === slug ? null : slug))
  }, [])

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

  // Fetch cities from API (needed before jobs hook)
  const { data: cities, isLoading: citiesLoading } = useCities()

  // Get coordinates for selected city
  const selectedCitySlug = selectedCity
    ? cities?.find((c) => c.public_id === selectedCity)?.slug
    : null
  const cityCoords = selectedCitySlug ? CITY_COORDINATES[selectedCitySlug] : null

  // Fetch categories from API
  const { data: categories, isLoading: categoriesLoading } = useCategories()

  // Fetch handyman's profile
  const { data: profile } = useHandymanProfile()
  const toast = useToastController()

  // Fetch action required data
  const { data: pendingOffersCount = 0 } = useHandymanPendingOffersCount()

  // Check for new direct offers and show toast
  useEffect(() => {
    const checkNewOffers = async () => {
      if (pendingOffersCount > 0) {
        const hasShown = await hasNotificationToastBeenShown('newDirectOffer', {})
        if (!hasShown) {
          showNewDirectOfferToast(toast, 'A homeowner')
          await markNotificationToastAsShown('newDirectOffer', {})
        }
      }
    }
    checkNewOffers()
  }, [pendingOffersCount, toast])
  const { data: applicationsData } = useHandymanApplications({ status: 'pending' })
  const { data: activeJobsData } = useHandymanAssignedJobs({ status: 'in_progress' })

  const pendingBidsCount = applicationsData?.pages[0]?.totalCount ?? 0
  const activeJobsCount = activeJobsData?.pages[0]?.totalCount ?? 0

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Handyman'
  const totalEarnings = profile?.total_earnings || 0
  const completedJobs = profile?.completed_jobs_count || 0
  const rating = profile?.rating || 0

  // Infinite scroll state with debouncing
  const isFetchingRef = useRef(false)
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch jobs for you with filters - initial 5, then 20 per page
  const {
    data: jobsData,
    isLoading: jobsLoading,
    error: jobsError,
    fetchNextPage: fetchNextJobs,
    hasNextPage: hasMoreJobs,
    isFetchingNextPage: isFetchingMoreJobs,
  } = useHandymanJobsForYou({
    search: searchQuery || undefined,
    latitude: cityCoords?.lat || location?.latitude,
    longitude: cityCoords?.lng || location?.longitude,
    category: selectedCategory || undefined,
    city: selectedCity || undefined,
    initialPageSize: 5,
    pageSize: 20,
  })

  // Debounced fetch next page to prevent duplicate calls
  const debouncedFetchNext = useCallback(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
    }

    fetchTimeoutRef.current = setTimeout(() => {
      if (!isFetchingRef.current && hasMoreJobs && !isFetchingMoreJobs) {
        isFetchingRef.current = true
        fetchNextJobs().finally(() => {
          isFetchingRef.current = false
        })
      }
    }, 300)
  }, [fetchNextJobs, hasMoreJobs, isFetchingMoreJobs])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
    }
  }, [])

  // Flatten paginated data
  const jobs = useMemo(() => {
    return jobsData?.pages.flatMap((page) => page.results) || []
  }, [jobsData])

  // Entrance animation values for hero section
  const heroOpacity = useSharedValue(0)
  const heroTranslateY = useSharedValue(30)
  const cardsOpacity = useSharedValue(0)
  const cardsTranslateY = useSharedValue(20)
  const statsOpacity = useSharedValue(0)
  const statsTranslateY = useSharedValue(30)
  const filtersOpacity = useSharedValue(0)
  const filtersTranslateY = useSharedValue(30)
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
    heroOpacity.value = withTiming(1, { duration: 500 })
    heroTranslateY.value = withTiming(0, { duration: 500 })

    cardsOpacity.value = withDelay(150, withTiming(1, { duration: 500 }))
    cardsTranslateY.value = withDelay(150, withTiming(0, { duration: 500 }))

    statsOpacity.value = withDelay(300, withTiming(1, { duration: 500 }))
    statsTranslateY.value = withDelay(300, withTiming(0, { duration: 500 }))

    filtersOpacity.value = withDelay(450, withTiming(1, { duration: 500 }))
    filtersTranslateY.value = withDelay(450, withTiming(0, { duration: 500 }))

    jobsOpacity.value = withDelay(600, withTiming(1, { duration: 500 }))
    jobsTranslateY.value = withDelay(600, withTiming(0, { duration: 500 }))
  }, [
    heroOpacity,
    heroTranslateY,
    cardsOpacity,
    cardsTranslateY,
    statsOpacity,
    statsTranslateY,
    filtersOpacity,
    filtersTranslateY,
    jobsOpacity,
    jobsTranslateY,
  ])

  const heroAnimatedStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroTranslateY.value }],
  }))

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
    transform: [{ translateY: cardsTranslateY.value }],
  }))

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ translateY: statsTranslateY.value }],
  }))

  const filtersAnimatedStyle = useAnimatedStyle(() => ({
    opacity: filtersOpacity.value,
    transform: [{ translateY: filtersTranslateY.value }],
  }))

  const jobsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: jobsOpacity.value,
    transform: [{ translateY: jobsTranslateY.value }],
  }))

  // Filter jobs by budget (client-side)
  const filteredJobs = useMemo(() => {
    if (!maxBudget) return jobs
    return jobs.filter((job) => job.estimated_budget && job.estimated_budget <= maxBudget)
  }, [jobs, maxBudget])

  // Get display labels for filters
  const selectedCityName = selectedCity
    ? cities?.find((c) => c.public_id === selectedCity)?.name
    : null
  const budgetLabel = maxBudget ? BUDGET_OPTIONS.find((b) => b.value === maxBudget)?.label : null

  return (
    <GradientBackground>
      <YStack flex={1}>
        <AnimatedScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          {/* Hero Section - Photo Background with Actions Required */}
          <AnimatedYStack
            pb="$3"
            style={heroAnimatedStyle}
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
                source={HERO_BACKGROUND_IMAGE}
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

              {/* Subtle Orange/Gold Tint Overlay */}
              <LinearGradient
                colors={['rgba(255,159,0,0.15)', 'rgba(255,159,0,0.20)', 'rgba(255,159,0,0.25)']}
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

              {/* Search Bar & Header Actions - Integrated at top */}
              <XStack
                px="$4"
                py="$3"
                pt={insets.top + 12}
                alignItems="center"
                gap="$3"
                justifyContent="space-between"
                zIndex={20}
              >
                <XStack
                  flex={1}
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
                    Search jobs...
                  </Text>
                </XStack>

                <MessageBadgeButton
                  chatRole="handyman"
                  onPress={() => router.push('/(handyman)/messages')}
                />
              </XStack>

              {/* Content */}
              <YStack
                flex={1}
                justifyContent="center"
                px="$4"
                pb="$6"
                gap="$5"
                zIndex={10}
              >
                {/* Headline */}
                <YStack
                  gap="$1"
                  pt="$3"
                >
                  <Text
                    fontSize="$9"
                    fontWeight="bold"
                    color="white"
                    letterSpacing={-0.5}
                  >
                    Actions Required
                  </Text>
                </YStack>

                {/* Action Cards - Horizontal Row */}
                <AnimatedXStack
                  gap="$3"
                  justifyContent="center"
                  style={cardsAnimatedStyle}
                >
                  {/* NEW Offers - Orange Theme */}
                  <Button
                    unstyled
                    flex={1}
                    height={130}
                    bg={pendingOffersCount > 0 ? '#FF9500' : '#FFB84D'}
                    borderRadius="$6"
                    p="$4"
                    onPress={() => router.push('/(handyman)/jobs?tab=offers')}
                    pressStyle={PressPresets.card.pressStyle}
                    animation={PressPresets.card.animation}
                  >
                    {/* Background Icon */}
                    <View
                      position="absolute"
                      bottom={-6}
                      left={-6}
                      opacity={0.15}
                    >
                      <Target
                        size={80}
                        color="white"
                      />
                    </View>
                    <YStack>
                      <Text
                        fontSize="$4"
                        fontWeight="900"
                        color="rgba(255,255,255,0.9)"
                        textTransform="uppercase"
                        letterSpacing={1}
                      >
                        NEW Offers
                      </Text>
                      <Text
                        fontSize="$10"
                        fontWeight="bold"
                        color="white"
                        lineHeight={40}
                        mt="$4"
                        ml="$6"
                      >
                        {pendingOffersCount}
                      </Text>
                    </YStack>
                    {pendingOffersCount > 0 && (
                      <View
                        position="absolute"
                        top={-6}
                        right={-6}
                        bg="white"
                        minWidth={20}
                        height={20}
                        borderRadius={10}
                        alignItems="center"
                        justifyContent="center"
                        shadowColor="rgba(0,0,0,0.2)"
                        shadowRadius={4}
                        shadowOffset={{ width: 0, height: 2 }}
                      >
                        <Text
                          fontSize={11}
                          fontWeight="700"
                          color="#FF9500"
                        >
                          {pendingOffersCount > 9 ? '9+' : pendingOffersCount}
                        </Text>
                      </View>
                    )}
                  </Button>

                  {/* PENDING Bids - Green Theme */}
                  <Button
                    unstyled
                    flex={1}
                    height={130}
                    bg={pendingBidsCount > 0 ? '#0C9A5C' : '#4DB87A'}
                    borderRadius="$6"
                    p="$4"
                    onPress={() => router.push('/(handyman)/jobs?tab=applicants')}
                    pressStyle={PressPresets.card.pressStyle}
                    animation={PressPresets.card.animation}
                  >
                    {/* Background Icon */}
                    <View
                      position="absolute"
                      bottom={-6}
                      left={-6}
                      opacity={0.15}
                    >
                      <Send
                        size={80}
                        color="white"
                      />
                    </View>
                    <YStack>
                      <Text
                        fontSize="$3"
                        fontWeight="900"
                        color="rgba(255,255,255,0.9)"
                        textTransform="uppercase"
                        letterSpacing={1}
                      >
                        PENDING Bids
                      </Text>
                      <Text
                        fontSize="$10"
                        fontWeight="bold"
                        color="white"
                        lineHeight={40}
                        mt="$4"
                        ml="$6"
                      >
                        {pendingBidsCount}
                      </Text>
                    </YStack>
                  </Button>

                  {/* ACTIVE Tasks - Blue Theme */}
                  <Button
                    unstyled
                    flex={1}
                    height={130}
                    bg={activeJobsCount > 0 ? '#3B82F6' : '#6BA3F8'}
                    borderRadius="$6"
                    p="$4"
                    onPress={() => router.push('/(handyman)/jobs?tab=active')}
                    pressStyle={PressPresets.card.pressStyle}
                    animation={PressPresets.card.animation}
                  >
                    {/* Background Icon */}
                    <View
                      position="absolute"
                      bottom={-6}
                      left={-6}
                      opacity={0.15}
                    >
                      <Clock
                        size={80}
                        color="white"
                      />
                    </View>
                    <YStack>
                      <Text
                        fontSize="$4"
                        fontWeight="900"
                        color="rgba(255,255,255,0.9)"
                        textTransform="uppercase"
                        letterSpacing={1}
                      >
                        ACTIVE Tasks
                      </Text>
                      <Text
                        fontSize="$10"
                        fontWeight="bold"
                        color="white"
                        lineHeight={40}
                        mt="$4"
                        ml="$6"
                      >
                        {activeJobsCount}
                      </Text>
                    </YStack>
                  </Button>
                </AnimatedXStack>
              </YStack>
            </YStack>
          </AnimatedYStack>

          {/* Career Overview */}
          <AnimatedYStack
            px="$4"
            pb="$4"
            style={statsAnimatedStyle}
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
              <Text
                fontSize="$4"
                fontWeight="bold"
                color="$color"
                mb="$2"
              >
                Career Overview
              </Text>
              <XStack
                justifyContent="space-around"
                alignItems="center"
              >
                <XStack
                  alignItems="center"
                  gap="$2"
                >
                  <Star
                    size={16}
                    color="gold"
                  />
                  <Text
                    fontSize="$3"
                    fontWeight="600"
                    color="$color"
                  >
                    {rating > 0 ? `${rating.toFixed(1)}` : '—'}
                  </Text>
                </XStack>
                <View
                  width={1}
                  height={20}
                  bg="$borderColor"
                />
                <XStack
                  alignItems="center"
                  gap="$2"
                >
                  <Briefcase
                    size={16}
                    color="$primary"
                  />
                  <Text
                    fontSize="$3"
                    fontWeight="600"
                    color="$color"
                  >
                    {completedJobs} jobs
                  </Text>
                </XStack>
                <View
                  width={1}
                  height={20}
                  bg="$borderColor"
                />
                <XStack
                  alignItems="center"
                  gap="$2"
                >
                  <DollarSign
                    size={16}
                    color="rgb(34, 197, 94)"
                  />
                  <Text
                    fontSize="$3"
                    fontWeight="600"
                    color="$color"
                  >
                    ${(totalEarnings / 1000).toFixed(1)}k
                  </Text>
                </XStack>
              </XStack>
            </YStack>
          </AnimatedYStack>

          {/* Job Filters Panel */}
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
                  fontSize="$4"
                  fontWeight="bold"
                  color="$color"
                  mb="$1"
                >
                  Find Jobs
                </Text>
                <Text
                  fontSize="$3"
                  color="$colorSubtle"
                  mb="$3"
                  lineHeight="$5"
                >
                  Browse available jobs and{' '}
                  <Text
                    fontWeight="500"
                    color="$color"
                  >
                    send your proposals
                  </Text>{' '}
                  to get hired.
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
                    pressStyle={PressPresets.listItem.pressStyle}
                    animation={PressPresets.listItem.animation}
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
                  mb="$3"
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

                {/* Budget Filter */}
                <YStack gap="$2">
                  {/* Budget Filter Button */}
                  <Button
                    flex={1}
                    size="$2"
                    bg={maxBudget ? 'rgba(12, 154, 92, 0.1)' : 'white'}
                    borderColor={maxBudget ? '$primary' : '$borderColor'}
                    borderWidth={1}
                    color={maxBudget ? '$primary' : '$colorSubtle'}
                    borderRadius="$3"
                    fontSize="$1"
                    fontWeight="bold"
                    px="$2"
                    onPress={() => setShowBudgetDropdown(!showBudgetDropdown)}
                    pressStyle={PressPresets.filter.pressStyle}
                    animation={PressPresets.filter.animation}
                  >
                    {budgetLabel || 'Budget'} <ChevronDown size={10} />
                  </Button>

                  {/* Budget Dropdown */}
                  {showBudgetDropdown && (
                    <YStack
                      bg="white"
                      borderRadius="$4"
                      borderWidth={1}
                      borderColor="$borderColor"
                      p="$2"
                      gap="$1"
                    >
                      {BUDGET_OPTIONS.map((option) => (
                        <Button
                          key={option.label}
                          size="$2"
                          unstyled
                          onPress={() => {
                            setMaxBudget(option.value)
                            setShowBudgetDropdown(false)
                          }}
                          px="$2"
                          py="$1.5"
                        >
                          <Text
                            color={maxBudget === option.value ? '$primary' : '$color'}
                            fontWeight={maxBudget === option.value ? 'bold' : 'normal'}
                          >
                            {option.label}
                          </Text>
                        </Button>
                      ))}
                    </YStack>
                  )}
                </YStack>
              </YStack>
            </YStack>
          </AnimatedYStack>

          {/* Jobs List */}
          <AnimatedYStack
            px="$4"
            pb="$8"
            style={jobsAnimatedStyle}
          >
            <Text
              fontSize="$3"
              fontWeight="bold"
              color="$color"
              mb="$3"
              px="$1"
            >
              {filteredJobs.length} Jobs Available
            </Text>

            <YStack gap="$3">
              {jobsLoading ? (
                <Spinner
                  size="large"
                  color="$primary"
                  m="$4"
                />
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                  <AnimatedCard
                    key={job.public_id}
                    index={index}
                    onPress={() => router.push(`/(handyman)/jobs/${job.public_id}`)}
                    style={{ width: '100%' }}
                  >
                    <JobCard
                      job={job}
                      showCategory
                    />
                  </AnimatedCard>
                ))
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
                  <Text color="$colorMuted">No jobs found.</Text>
                </YStack>
              )}

              {/* Loading indicator for infinite scroll */}
              {isFetchingMoreJobs && (
                <XStack
                  alignItems="center"
                  justifyContent="center"
                  gap="$sm"
                  py="$4"
                >
                  <Spinner
                    size="small"
                    color="$primary"
                  />
                  <Text
                    color="$colorSubtle"
                    fontSize="$3"
                  >
                    Loading more jobs...
                  </Text>
                </XStack>
              )}
            </YStack>
          </AnimatedYStack>
        </AnimatedScrollView>
      </YStack>
    </GradientBackground>
  )
}
