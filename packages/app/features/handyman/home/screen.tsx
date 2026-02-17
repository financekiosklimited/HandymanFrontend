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
import { JobCard } from '@my/ui'
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
    >
      <MessageCircle
        size={20}
        color="$color"
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
              Search jobs...
            </Text>
          </XStack>

          <XStack
            alignItems="center"
            gap="$3"
          >
            <MessageBadgeButton
              chatRole="handyman"
              onPress={() => router.push('/(handyman)/messages')}
            />
          </XStack>
        </XStack>

        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent
            const paddingToBottom = 100
            const isCloseToBottom =
              layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom

            if (isCloseToBottom) {
              debouncedFetchNext()
            }
          }}
          scrollEventThrottle={400}
        >
          {/* Welcome Message */}
          <YStack
            px="$4"
            py="$3"
          >
            <Text
              fontSize="$7"
              fontWeight="bold"
              color="$color"
              lineHeight="$7"
            >
              Welcome, <Text color="$primary">{displayName}</Text>
            </Text>
            <Text
              fontSize="$3"
              color="$colorSubtle"
              mt="$1"
            >
              Ready to find your next job?
            </Text>
          </YStack>

          {/* Action Required Dashboard */}
          <YStack
            px="$4"
            pb="$4"
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
                mb="$3"
              >
                Action Required
              </Text>
              <XStack gap="$2">
                {/* Direct Offers - Red Theme */}
                <Button
                  unstyled
                  flex={1}
                  bg={pendingOffersCount > 0 ? 'rgba(239, 68, 68, 0.15)' : '$backgroundSubtle'}
                  borderColor={pendingOffersCount > 0 ? 'rgb(239, 68, 68)' : '$borderColor'}
                  borderWidth={2}
                  borderRadius="$4"
                  p="$3"
                  onPress={() => router.push('/(handyman)/jobs?tab=offers')}
                  pressStyle={PressPresets.primary.pressStyle}
                  animation={PressPresets.primary.animation}
                >
                  <YStack
                    alignItems="center"
                    gap="$1"
                  >
                    <View
                      bg={pendingOffersCount > 0 ? 'rgb(239, 68, 68)' : '$colorMuted'}
                      p="$2"
                      borderRadius="$3"
                    >
                      <Target
                        size={20}
                        color="white"
                      />
                    </View>
                    <Text
                      fontSize="$6"
                      fontWeight="bold"
                      color={pendingOffersCount > 0 ? 'rgb(239, 68, 68)' : '$colorMuted'}
                    >
                      {pendingOffersCount}
                    </Text>
                    <Text
                      fontSize="$1"
                      color="$colorSubtle"
                      textAlign="center"
                    >
                      Direct Offers
                    </Text>
                  </YStack>
                  {pendingOffersCount > 0 && (
                    <View
                      position="absolute"
                      top={-4}
                      right={-4}
                      bg="rgb(239, 68, 68)"
                      minWidth={18}
                      height={18}
                      borderRadius={9}
                      alignItems="center"
                      justifyContent="center"
                      borderWidth={2}
                      borderColor="white"
                    >
                      <Text
                        fontSize={10}
                        fontWeight="700"
                        color="white"
                      >
                        {pendingOffersCount > 9 ? '9+' : pendingOffersCount}
                      </Text>
                    </View>
                  )}
                </Button>

                {/* Pending Bids - Green Theme with Send Icon */}
                <Button
                  unstyled
                  flex={1}
                  bg={pendingBidsCount > 0 ? 'rgba(12, 154, 92, 0.15)' : '$backgroundSubtle'}
                  borderColor={pendingBidsCount > 0 ? 'rgb(12, 154, 92)' : '$borderColor'}
                  borderWidth={2}
                  borderRadius="$4"
                  p="$3"
                  onPress={() => router.push('/(handyman)/jobs?tab=applicants')}
                  pressStyle={PressPresets.primary.pressStyle}
                  animation={PressPresets.primary.animation}
                >
                  <YStack
                    alignItems="center"
                    gap="$1"
                  >
                    <View
                      bg={pendingBidsCount > 0 ? 'rgb(12, 154, 92)' : '$colorMuted'}
                      p="$2"
                      borderRadius="$3"
                    >
                      <Send
                        size={20}
                        color="white"
                      />
                    </View>
                    <Text
                      fontSize="$6"
                      fontWeight="bold"
                      color={pendingBidsCount > 0 ? 'rgb(12, 154, 92)' : '$colorMuted'}
                    >
                      {pendingBidsCount}
                    </Text>
                    <Text
                      fontSize="$1"
                      color="$colorSubtle"
                      textAlign="center"
                    >
                      Pending Bids
                    </Text>
                  </YStack>
                </Button>

                {/* Active Jobs - Blue Theme */}
                <Button
                  unstyled
                  flex={1}
                  bg={activeJobsCount > 0 ? 'rgba(59, 130, 246, 0.15)' : '$backgroundSubtle'}
                  borderColor={activeJobsCount > 0 ? 'rgb(59, 130, 246)' : '$borderColor'}
                  borderWidth={2}
                  borderRadius="$4"
                  p="$3"
                  onPress={() => router.push('/(handyman)/jobs?tab=active')}
                  pressStyle={PressPresets.primary.pressStyle}
                  animation={PressPresets.primary.animation}
                >
                  <YStack
                    alignItems="center"
                    gap="$1"
                  >
                    <View
                      bg={activeJobsCount > 0 ? 'rgb(59, 130, 246)' : '$colorMuted'}
                      p="$2"
                      borderRadius="$3"
                    >
                      <Clock
                        size={20}
                        color="white"
                      />
                    </View>
                    <Text
                      fontSize="$6"
                      fontWeight="bold"
                      color={activeJobsCount > 0 ? 'rgb(59, 130, 246)' : '$colorMuted'}
                    >
                      {activeJobsCount}
                    </Text>
                    <Text
                      fontSize="$1"
                      color="$colorSubtle"
                      textAlign="center"
                    >
                      Active
                    </Text>
                  </YStack>
                </Button>
              </XStack>
            </YStack>
          </YStack>

          {/* Concise Stats */}
          <YStack
            px="$4"
            pb="$4"
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
          </YStack>

          {/* Job Filters Panel */}
          <YStack
            px="$4"
            mb="$4"
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
          </YStack>

          {/* Jobs List */}
          <YStack
            px="$4"
            pb="$8"
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
                filteredJobs.map((job) => (
                  <View key={job.public_id}>
                    <JobCard
                      job={job}
                      showCategory
                      onPress={() => router.push(`/(handyman)/jobs/${job.public_id}`)}
                    />
                  </View>
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
          </YStack>
        </ScrollView>
      </YStack>
    </View>
  )
}
