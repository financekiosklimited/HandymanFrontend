import { memo, useCallback, useMemo, useRef, useEffect } from 'react'
import { XStack, YStack, Text, Button, View, Spinner, useTheme } from 'tamagui'
import { Search, Bell, Plus, Briefcase, User } from '@tamagui/lucide-icons'
import type { IconProps } from '@tamagui/helpers-icon'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'

type NavVariant = 'guest' | 'homeowner' | 'handyman'

interface BottomNavItem {
  id: string
  label: string
  icon: React.ComponentType<IconProps>
  route: string
  requiresAuth?: boolean
}

// Nav items for each variant - defined outside component for stable reference
const guestNavItems: BottomNavItem[] = [
  { id: 'explore', label: 'Explore', icon: Search, route: '/' },
  { id: 'updates', label: 'Updates', icon: Bell, route: '/updates', requiresAuth: true },
  { id: 'add', label: 'Add', icon: Plus, route: '/add', requiresAuth: true },
  { id: 'my-jobs', label: 'My Jobs', icon: Briefcase, route: '/my-jobs', requiresAuth: true },
  { id: 'profile', label: 'Profile', icon: User, route: '/profile', requiresAuth: true },
]

const homeownerNavItems: BottomNavItem[] = [
  { id: 'explore', label: 'Explore', icon: Search, route: '/(homeowner)/' },
  { id: 'updates', label: 'Updates', icon: Bell, route: '/(homeowner)/updates' },
  { id: 'add', label: 'Add', icon: Plus, route: '/(homeowner)/jobs/add' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, route: '/(homeowner)/jobs' },
  { id: 'profile', label: 'Profile', icon: User, route: '/(homeowner)/profile' },
]

const handymanNavItems: BottomNavItem[] = [
  { id: 'explore', label: 'Explore', icon: Search, route: '/(handyman)/' },
  { id: 'updates', label: 'Updates', icon: Bell, route: '/(handyman)/updates' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, route: '/(handyman)/jobs' },
  { id: 'profile', label: 'Profile', icon: User, route: '/(handyman)/profile' },
]

const getNavItems = (variant: NavVariant): BottomNavItem[] => {
  switch (variant) {
    case 'homeowner':
      return homeownerNavItems
    case 'handyman':
      return handymanNavItems
    default:
      return guestNavItems
  }
}

interface BottomNavProps {
  activeRoute?: string
  variant?: NavVariant
  /** Callback for Add button press - used for phone verification check */
  onAddPress?: () => void
  /** Whether the add button is loading (e.g., checking phone verification) */
  isAddLoading?: boolean
  /** Number of unread notifications to show as badge */
  notificationCount?: number
  /** Navigation handler - receives the route to navigate to */
  onNavigate: (route: string) => void
  /** Whether navigation is in progress (from useNavigationGuard) - disables all nav buttons */
  isNavigating?: boolean
}

function BottomNavComponent({
  activeRoute = '/',
  variant = 'guest',
  onAddPress,
  isAddLoading,
  notificationCount = 0,
  onNavigate,
  isNavigating = false,
}: BottomNavProps) {
  const navItems = useMemo(() => getNavItems(variant), [variant])
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  // Memoized route matcher - determines if a nav item is active
  const isRouteActive = useCallback(
    (route: string, id: string) => {
      return activeRoute === route || activeRoute === id
    },
    [activeRoute]
  )

  // Memoized navigation handler - navigation locking is handled by useNavigationGuard
  const handleNavPress = useCallback(
    (item: BottomNavItem) => {
      // Don't navigate if already on this route
      if (isRouteActive(item.route, item.id)) {
        return
      }

      // If it's the Add button and we have a custom handler, use it
      if (item.id === 'add' && onAddPress) {
        onAddPress()
        return
      }

      // If guest tries to access protected route, redirect to login
      if (variant === 'guest' && item.requiresAuth) {
        onNavigate('/auth/login')
      } else {
        onNavigate(item.route)
      }
    },
    [variant, onAddPress, onNavigate, isRouteActive]
  )

  // Memoize theme colors to prevent recalculation
  const themeColors = useMemo(
    () => ({
      primary: theme.primary?.val,
      colorMuted: theme.colorMuted?.val,
      backgroundStrong: theme.backgroundStrong?.val,
    }),
    [theme.primary?.val, theme.colorMuted?.val, theme.backgroundStrong?.val]
  )

  // Continuous shimmer animation for Add button
  const shimmerProgress = useSharedValue(0)

  // Bell shake animation for Updates button when there are unread notifications
  const bellShakeProgress = useSharedValue(0)
  const bellRingCount = useRef(0)

  useEffect(() => {
    // Continuous shimmer loop - slower (2.5 seconds)
    shimmerProgress.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    )
  }, [shimmerProgress])

  // Trigger bell shake animation periodically when there are unread notifications
  useEffect(() => {
    if (notificationCount <= 0) {
      return
    }

    // Function to trigger the bell shake animation
    const triggerBellAnimation = () => {
      bellShakeProgress.value = 0
      bellShakeProgress.value = withRepeat(
        withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        3, // Ring 3 times
        true,
        (finished) => {
          if (finished) {
            bellShakeProgress.value = 0
          }
        }
      )
    }

    // Initial animation
    triggerBellAnimation()

    // Set up interval to repeat animation every 5-10 seconds (random)
    const intervalId = setInterval(
      () => {
        triggerBellAnimation()
      },
      5000 + Math.random() * 5000
    )

    return () => {
      clearInterval(intervalId)
    }
  }, [notificationCount, bellShakeProgress])

  const shimmerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmerProgress.value, [0, 1], [-150, 350]) }],
    opacity: interpolate(shimmerProgress.value, [0, 0.3, 0.7, 1], [0, 0.7, 0.7, 0]),
  }))

  // Bell shake animation style - creates ringing effect with rotation and scale
  const bellShakeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(bellShakeProgress.value, [0, 0.25, 0.5, 0.75, 1], [0, -15, 15, -15, 0])}deg`,
      },
      { scale: interpolate(bellShakeProgress.value, [0, 0.5, 1], [1, 1.1, 1]) },
    ],
  }))

  return (
    <XStack
      bg="$backgroundStrong"
      borderTopWidth={1}
      borderTopColor="$borderColor"
      px="$xl"
      py="$md"
      pb={insets.bottom || '$md'}
      justifyContent="space-around"
      alignItems="flex-start"
    >
      {navItems.map((item) => {
        const isActive = isRouteActive(item.route, item.id)
        const Icon = item.icon
        const isAddButton = item.id === 'add'
        const isUpdatesButton = item.id === 'updates'
        const showBadge = isUpdatesButton && notificationCount > 0

        return (
          <Button
            key={item.id}
            unstyled
            onPress={() => handleNavPress(item)}
            flexDirection="column"
            alignItems="center"
            gap="$1"
            flex={1}
            pressStyle={{ scale: 0.9 }}
            disabled={isNavigating && !isAddButton}
            opacity={isNavigating && !isAddButton ? 0.7 : 1}
          >
            {isAddButton ? (
              <>
                <View
                  width={60}
                  height={60}
                  borderRadius={30}
                  bg="$primary"
                  alignItems="center"
                  justifyContent="center"
                  opacity={isAddLoading ? 0.7 : 1}
                  top={-30}
                  borderWidth={4}
                  borderColor="$backgroundStrong"
                  position="absolute"
                  alignSelf="center"
                  overflow="hidden"
                >
                  {isAddLoading ? (
                    <Spinner
                      size="small"
                      color="$backgroundStrong"
                    />
                  ) : (
                    <Plus
                      size={28}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      color={themeColors.backgroundStrong as any}
                    />
                  )}
                  {/* Shimmer Overlay */}
                  <Animated.View
                    style={[
                      {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: 80,
                      },
                      shimmerAnimatedStyle,
                    ]}
                    pointerEvents="none"
                  >
                    <LinearGradient
                      colors={[
                        'rgba(255,255,255,0)',
                        'rgba(255,255,255,0.85)',
                        'rgba(255,255,255,0.85)',
                        'rgba(255,255,255,0)',
                      ]}
                      locations={[0, 0.4, 0.6, 1]}
                      start={[0, 0.5]}
                      end={[1, 0.5]}
                      style={{ width: 80, height: '100%' }}
                    />
                  </Animated.View>
                </View>
                {/* Spacer to align text with other tabs that have 24px icons */}
                <View height={24} />
              </>
            ) : (
              <View position="relative">
                {/* Bell shake animation wrapper for Updates button */}
                {isUpdatesButton && showBadge ? (
                  <Animated.View style={bellShakeAnimatedStyle}>
                    <Icon
                      size={24}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      color={
                        isActive ? (themeColors.primary as any) : (themeColors.colorMuted as any)
                      }
                    />
                  </Animated.View>
                ) : (
                  <Icon
                    size={24}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    color={
                      isActive ? (themeColors.primary as any) : (themeColors.colorMuted as any)
                    }
                  />
                )}
                {/* Notification Badge - simplified animation */}
                {showBadge && (
                  <View
                    position="absolute"
                    top={-4}
                    right={-8}
                    minWidth={16}
                    height={16}
                    borderRadius={8}
                    bg="$error"
                    alignItems="center"
                    justifyContent="center"
                    px={4}
                  >
                    <Text
                      fontSize={10}
                      fontWeight="700"
                      color="$backgroundStrong"
                    >
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Text>
                  </View>
                )}
              </View>
            )}
            <Text
              fontSize="$1"
              color={isActive ? '$primary' : '$colorMuted'}
              fontWeight={isActive ? '600' : '400'}
            >
              {item.label}
            </Text>
          </Button>
        )
      })}
    </XStack>
  )
}

// Export memoized component to prevent unnecessary re-renders
export const BottomNav = memo(BottomNavComponent)
