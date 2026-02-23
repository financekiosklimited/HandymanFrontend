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
import { Animated as AnimatedRN, View as RNView, Easing as EasingRN } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated'
import {
  useHomeownerJobs,
  useNearbyHandymen,
  useAuthStore,
  useHomeownerProfile,
  useTotalUnreadCount,
  useCategories,
  useCities,
} from '@my/api'
import type { HomeownerJobStatus } from '@my/api'
import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'expo-image'
import { JobCard } from '@my/ui'
import { useRouter } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { Alert } from 'react-native'
import { jobStatusColors, type JobStatus, colors } from '@my/config'
import { useDebounce } from 'app/hooks'
import { useToastController } from '@tamagui/toast'
import {
  showWelcomeOnboardingToast,
  showOfferAcceptedToast,
  showOfferDeclinedToast,
} from 'app/utils/toast-messages'
import { shouldShowOnboarding, markOnboardingSeen } from 'app/utils/onboarding-storage'
import {
  hasNotificationToastBeenShown,
  markNotificationToastAsShown,
} from 'app/utils/notification-toast-storage'
import { useHomeownerDirectOffers } from '@my/api'
import {
  Menu,
  Search,
  Bookmark,
  MessageCircle,
  Plus,
  Briefcase,
  Users,
  Zap,
  Wrench,
  Truck,
  PaintBucket,
  Tv,
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
} from '@tamagui/lucide-icons'

// CTA Banner Background Image
const CTA_BACKGROUND_IMAGE = require('../../../../../apps/expo/assets/cta-construction-bg.jpg')

// Create animated components
const AnimatedYStack = Animated.createAnimatedComponent(YStack)
const AnimatedXStack = Animated.createAnimatedComponent(XStack)
const AnimatedView = Animated.createAnimatedComponent(View)
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)
const AnimatedButton = Animated.createAnimatedComponent(Button)

const statusLabels: Record<HomeownerJobStatus, string> = {
  draft: 'Draft',
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  pending_completion: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

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
      pressStyle={PressPresets.icon.pressStyle}
      animation={PressPresets.icon.animation}
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

export function HomeownerHomeScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const user = useAuthStore((state) => state.user)
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Debounce search query for handymen API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 400)

  // Filter states - MUST be declared before hooks that use them
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [minRating, setMinRating] = useState<number | null>(null)
  const [maxHourlyRate, setMaxHourlyRate] = useState<number | null>(null)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [showRatingDropdown, setShowRatingDropdown] = useState(false)
  const [showHourlyRateDropdown, setShowHourlyRateDropdown] = useState(false)

  // Toggle state for handymen list expansion
  const [expandHandymen, setExpandHandymen] = useState(false)

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

  // Toast controller for onboarding
  const toast = useToastController()

  // Fetch homeowner's jobs
  const {
    data: jobsData,
    isLoading: jobsLoading,
    error: jobsError,
    fetchNextPage: fetchNextJobs,
    hasNextPage: hasMoreJobs,
    isFetchingNextPage: isFetchingMoreJobs,
  } = useHomeownerJobs({
    search: searchQuery || undefined,
  })

  // Fetch direct offers for checking responses
  const { data: offersData, isLoading: offersLoading } = useHomeownerDirectOffers()

  const offers = useMemo(() => {
    return offersData?.pages.flatMap((page) => page.results) || []
  }, [offersData])

  // Show welcome onboarding toast for first-time users (delay 2.5s)
  useEffect(() => {
    const showOnboarding = async () => {
      // Wait for jobs to load
      if (jobsLoading) return

      // Only show if user has 0 jobs
      const jobCount = jobsData?.pages[0]?.totalCount ?? 0
      if (jobCount > 0) return

      // Check if should show (respects dev mode)
      const shouldShow = await shouldShowOnboarding('welcome')
      if (!shouldShow) return

      // Delay 2.5 seconds then show toast
      setTimeout(() => {
        showWelcomeOnboardingToast(toast)
        markOnboardingSeen('welcome')
      }, 2500)
    }

    showOnboarding()
  }, [jobsLoading, jobsData, toast])

  // Check for direct offer responses (accepted/declined)
  useEffect(() => {
    const checkOfferResponses = async () => {
      if (offersLoading || !offers.length) return

      // Find first offer with accepted or rejected status that hasn't shown toast
      for (const offer of offers) {
        if (offer.offer_status === 'accepted') {
          const hasShown = await hasNotificationToastBeenShown('offerAccepted', {
            offerId: offer.public_id,
          })
          if (!hasShown) {
            showOfferAcceptedToast(toast, offer.target_handyman.display_name)
            await markNotificationToastAsShown('offerAccepted', { offerId: offer.public_id })
            break // Only show one toast
          }
        } else if (offer.offer_status === 'rejected') {
          const hasShown = await hasNotificationToastBeenShown('offerDeclined', {
            offerId: offer.public_id,
          })
          if (!hasShown) {
            showOfferDeclinedToast(toast, offer.target_handyman.display_name)
            await markNotificationToastAsShown('offerDeclined', { offerId: offer.public_id })
            break // Only show one toast
          }
        }
      }
    }

    checkOfferResponses()
  }, [offersLoading, offers, toast])

  // Fetch cities from API (needed before handymen hook)
  const { data: cities, isLoading: citiesLoading } = useCities()

  // Get coordinates for selected city
  const selectedCitySlug = selectedCity
    ? cities?.find((c) => c.public_id === selectedCity)?.slug
    : null
  const cityCoords = selectedCitySlug ? CITY_COORDINATES[selectedCitySlug] : null

  // Fetch nearby handymen with filters
  const {
    data: handymenData,
    isLoading: handymenLoading,
    error: handymenError,
    fetchNextPage: fetchNextHandymen,
    hasNextPage: hasMoreHandymen,
    isFetchingNextPage: isFetchingMoreHandymen,
  } = useNearbyHandymen({
    search: debouncedSearchQuery || undefined,
    latitude: cityCoords?.lat || location?.latitude,
    longitude: cityCoords?.lng || location?.longitude,
    category: selectedCategory || undefined,
  })

  // Flatten paginated data
  const jobs = useMemo(() => {
    return jobsData?.pages.flatMap((page) => page.results) || []
  }, [jobsData])

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

  // Fetch profile to get display name and phone verification status
  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useHomeownerProfile()

  // Fetch categories from API
  const { data: categories, isLoading: categoriesLoading } = useCategories()

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Homeowner'

  // Get display labels for filters
  const selectedCityName = selectedCity
    ? cities?.find((c) => c.public_id === selectedCity)?.name
    : null
  const selectedCategoryName = selectedCategory
    ? categories?.find((c) => c.slug === selectedCategory)?.name
    : null
  const ratingLabel = minRating ? `${minRating}+ Stars` : null
  const hourlyRateLabel =
    maxHourlyRate !== null
      ? maxHourlyRate === -1
        ? '$101/hr or more'
        : `$${maxHourlyRate}/hr or less`
      : null

  const [isCheckingPhone, setIsCheckingPhone] = useState(false)

  /**
   * Handle Add Job button press - check phone verification first
   */
  const handleAddJobPress = useCallback(async () => {
    setIsCheckingPhone(true)

    try {
      // Refetch profile to get latest phone verification status
      const { data: freshProfile } = await refetchProfile()

      if (freshProfile?.is_phone_verified) {
        // Phone verified, proceed to add job
        router.push('/(homeowner)/jobs/add')
      } else {
        // Phone not verified, show alert and redirect
        Alert.alert(
          'Phone Verification Required',
          'Please verify your phone number before posting a job.',
          [
            {
              text: 'Verify Now',
              onPress: () => router.push('/user/phone/send'),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        )
      }
    } catch (error) {
      console.error('Error checking phone verification:', error)
      // On error, still allow navigation but warn
      Alert.alert(
        'Could Not Verify Status',
        'Unable to check phone verification status. Would you like to verify your phone?',
        [
          {
            text: 'Verify Phone',
            onPress: () => router.push('/user/phone/send'),
          },
          {
            text: 'Try Again',
            onPress: () => router.push('/(homeowner)/jobs/add'),
          },
        ]
      )
    } finally {
      setIsCheckingPhone(false)
    }
  }, [refetchProfile, router])

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

  // Entrance animation values for sections
  const welcomeOpacity = useSharedValue(0)
  const welcomeTranslateY = useSharedValue(30)
  const ctaOpacity = useSharedValue(0)
  const ctaTranslateY = useSharedValue(30)
  const filtersOpacity = useSharedValue(0)
  const filtersTranslateY = useSharedValue(30)

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
  }, [
    welcomeOpacity,
    welcomeTranslateY,
    ctaOpacity,
    ctaTranslateY,
    filtersOpacity,
    filtersTranslateY,
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

  return (
    <GradientBackground>
      <YStack flex={1}>
        <AnimatedScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          {/* Job Posting Panel - Image Background CTA matching Guest */}
          <AnimatedYStack
            style={welcomeAnimatedStyle}
            mb="$5"
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
                    Search handyman or jobs here!
                  </Text>
                </XStack>

                <MessageBadgeButton
                  chatRole="homeowner"
                  onPress={() => router.push('/(homeowner)/messages')}
                />
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
                  onPress={() => router.push('/(homeowner)/jobs/add')}
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

          {/* My Jobs Section */}
          {/* {jobs.length > 0 && (
            <YStack px="$4" mb="$4">
              <XStack justifyContent="space-between" alignItems="center" mb="$3" px="$1">
                <Text fontSize="$3" fontWeight="bold" color="$color">My Jobs</Text>
                <Text fontSize="$2" fontWeight="bold" color="$primary" onPress={() => router.push('/(homeowner)/jobs')}>View All</Text>
              </XStack>
              <YStack gap="$3">
                {jobs.slice(0, 2).map((job) => (
                  <JobCard key={job.public_id} job={job} onPress={() => router.push(`/(homeowner)/jobs/${job.public_id}`)} />
                ))}
              </YStack>
            </YStack>
          )} */}

          {/* Direct Hire Section */}
          <YStack
            px="$4"
            mb="$4"
          >
            <AnimatedYStack
              bg="white"
              borderRadius="$6"
              p="$4"
              borderColor="$borderSubtle"
              borderWidth={1}
              shadowColor="$shadowColor"
              shadowRadius={5}
              shadowOpacity={0.05}
              shadowOffset={{ width: 0, height: 2 }}
              style={filtersAnimatedStyle}
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
                  <CollapsibleSection expanded={showCityDropdown}>
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
                              pressStyle={PressPresets.listItem.pressStyle}
                              animation={PressPresets.listItem.animation}
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
                                pressStyle={PressPresets.listItem.pressStyle}
                                animation={PressPresets.listItem.animation}
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
                        <XStack
                          gap="$3"
                          height={170}
                        >
                          {(() => {
                            // Split categories into two rows
                            const evenCats = categories?.filter((_, i) => i % 2 === 0) || []
                            const oddCats = categories?.filter((_, i) => i % 2 === 1) || []
                            const maxCols = Math.max(evenCats.length, oddCats.length)

                            return Array.from({ length: maxCols }, (_, colIndex) => {
                              const topCat = evenCats[colIndex]
                              const bottomCat = oddCats[colIndex]

                              return (
                                <YStack
                                  key={`col-${colIndex}`}
                                  gap="$2"
                                  width={70}
                                >
                                  {topCat &&
                                    (() => {
                                      const IconComponent = iconMap[topCat.icon] || Wrench
                                      const isSelected = selectedCategory === topCat.slug
                                      return (
                                        <YStack
                                          alignItems="center"
                                          gap="$1"
                                          onPress={() =>
                                            setSelectedCategory(isSelected ? null : topCat.slug)
                                          }
                                          animation={PressPresets.icon.animation}
                                          pressStyle={PressPresets.icon.pressStyle}
                                        >
                                          <View
                                            width={56}
                                            height={56}
                                            borderRadius="$6"
                                            alignItems="center"
                                            justifyContent="center"
                                            bg={
                                              isSelected
                                                ? '$primaryBackground'
                                                : '$backgroundSubtle'
                                            }
                                            borderWidth={isSelected ? 2 : 1}
                                            borderColor={isSelected ? '$primary' : '$borderColor'}
                                          >
                                            <IconComponent
                                              size={24}
                                              color={
                                                isSelected
                                                  ? '$primary'
                                                  : categoryColors[topCat.icon] || '#666666'
                                              }
                                              strokeWidth={2}
                                            />
                                          </View>
                                          <Text
                                            fontSize="$2"
                                            fontWeight="600"
                                            color="$color"
                                            textAlign="center"
                                            numberOfLines={1}
                                          >
                                            {topCat.name}
                                          </Text>
                                        </YStack>
                                      )
                                    })()}
                                  {bottomCat &&
                                    (() => {
                                      const IconComponent = iconMap[bottomCat.icon] || Wrench
                                      const isSelected = selectedCategory === bottomCat.slug
                                      return (
                                        <YStack
                                          alignItems="center"
                                          gap="$1"
                                          onPress={() =>
                                            setSelectedCategory(isSelected ? null : bottomCat.slug)
                                          }
                                          animation={PressPresets.icon.animation}
                                          pressStyle={PressPresets.icon.pressStyle}
                                        >
                                          <View
                                            width={56}
                                            height={56}
                                            borderRadius="$6"
                                            alignItems="center"
                                            justifyContent="center"
                                            bg={
                                              isSelected
                                                ? '$primaryBackground'
                                                : '$backgroundSubtle'
                                            }
                                            borderWidth={isSelected ? 2 : 1}
                                            borderColor={isSelected ? '$primary' : '$borderColor'}
                                          >
                                            <IconComponent
                                              size={24}
                                              color={
                                                isSelected
                                                  ? '$primary'
                                                  : categoryColors[bottomCat.icon] || '#666666'
                                              }
                                              strokeWidth={2}
                                            />
                                          </View>
                                          <Text
                                            fontSize="$2"
                                            fontWeight="600"
                                            color="$color"
                                            textAlign="center"
                                            numberOfLines={1}
                                          >
                                            {bottomCat.name}
                                          </Text>
                                        </YStack>
                                      )
                                    })()}
                                </YStack>
                              )
                            })
                          })()}
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
                      pressStyle={PressPresets.filter.pressStyle}
                      animation={PressPresets.filter.animation}
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
                      pressStyle={PressPresets.filter.pressStyle}
                      animation={PressPresets.filter.animation}
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
                        pressStyle={PressPresets.listItem.pressStyle}
                        animation={PressPresets.listItem.animation}
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
                          pressStyle={PressPresets.listItem.pressStyle}
                          animation={PressPresets.listItem.animation}
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
                        pressStyle={PressPresets.listItem.pressStyle}
                        animation={PressPresets.listItem.animation}
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
                        pressStyle={PressPresets.listItem.pressStyle}
                        animation={PressPresets.listItem.animation}
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
                          pressStyle={PressPresets.listItem.pressStyle}
                          animation={PressPresets.listItem.animation}
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
            </AnimatedYStack>
          </YStack>

          {/* Handyman List */}
          <YStack
            px="$4"
            pb="$8"
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
                pressStyle={PressPresets.icon.pressStyle}
                animation={PressPresets.icon.animation}
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

            <YStack gap="$3">
              {handymenLoading ? (
                <Spinner
                  size="large"
                  color="$primary"
                  m="$4"
                />
              ) : handymen.length > 0 ? (
                <YStack>
                  {/* Always show first 3 handymen */}
                  {handymen.slice(0, 3).map((pro) => (
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
                      onPress={() => router.push(`/(homeowner)/handymen/${pro.public_id}`)}
                      mb="$3"
                      pressStyle={PressPresets.card.pressStyle}
                      animation={PressPresets.card.animation}
                    >
                      <View position="relative">
                        {/* Placeholder for now since API might not return image yet, or use Avatar if available */}
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
                              fill={colors.accent}
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
                      </YStack>
                    </XStack>
                  ))}

                  {/* Collapsible section for remaining handymen */}
                  <CollapsibleSection expanded={expandHandymen}>
                    <YStack>
                      {handymen.slice(3).map((pro) => (
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
                          onPress={() => router.push(`/(homeowner)/handymen/${pro.public_id}`)}
                          mb="$3"
                          pressStyle={PressPresets.card.pressStyle}
                          animation={PressPresets.card.animation}
                        >
                          <View position="relative">
                            {/* Placeholder for now since API might not return image yet, or use Avatar if available */}
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
                                  fill={colors.accent}
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
                          </YStack>
                        </XStack>
                      ))}
                    </YStack>
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
            </YStack>
          </YStack>
        </AnimatedScrollView>
      </YStack>
    </GradientBackground>
  )
}
