import { useEffect, useState, useCallback } from 'react'
import { Stack, useRouter, usePathname } from 'expo-router'
import { YStack, View } from 'tamagui'
import { BottomNav } from '@my/ui'
import { useAuthStore, useHomeownerUnreadCount, useHomeownerProfile } from '@my/api'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { Alert } from 'react-native'

export default function HomeownerLayout() {
  const router = useRouter()
  const pathname = usePathname()
  const insets = useSafeArea()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const activeRole = useAuthStore((state) => state.activeRole)

  // Only fetch unread notification count when authenticated as homeowner
  const shouldFetchNotifications = isAuthenticated && activeRole === 'homeowner'
  const { data: unreadCount = 0 } = useHomeownerUnreadCount(shouldFetchNotifications)

  // Fetch profile to check phone verification
  const { data: profile, refetch: refetchProfile } = useHomeownerProfile()
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
        router.push('/(homeowner)/jobs/add' as any)
      } else {
        // Phone not verified, show alert and redirect
        Alert.alert(
          'Phone Verification Required',
          'Please verify your phone number before posting a job.',
          [
            {
              text: 'Verify Now',
              onPress: () => router.push('/user/phone/send' as any),
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
            onPress: () => router.push('/user/phone/send' as any),
          },
          {
            text: 'Try Again',
            onPress: () => router.push('/(homeowner)/jobs/add' as any),
          },
        ]
      )
    } finally {
      setIsCheckingPhone(false)
    }
  }, [refetchProfile, router])

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.replace('/auth/login')
      return
    }

    // Redirect to correct role homepage if not homeowner
    if (activeRole !== 'homeowner') {
      if (activeRole === 'handyman') {
        router.replace('/(handyman)/' as any)
      } else {
        router.replace('/')
      }
    }
  }, [isAuthenticated, activeRole, router])

  // Map pathname to active route for bottom nav
  // Note: usePathname() returns just the path without route groups, e.g. "/updates" not "/(homeowner)/updates"
  const getActiveRoute = () => {
    if (pathname === '/updates' || pathname.startsWith('/updates/')) return '/(homeowner)/updates'
    if (pathname === '/jobs/add' || pathname.startsWith('/jobs/add/')) return 'add'
    if (pathname === '/jobs' || pathname.startsWith('/jobs/')) return '/(homeowner)/jobs'
    if (pathname === '/profile' || pathname.startsWith('/profile/')) return '/(homeowner)/profile'
    if (pathname === '/' || pathname === '') return '/(homeowner)/'
    return '/(homeowner)/'
  }

  // Check if we should show bottom nav (hide on certain screens)
  const shouldShowBottomNav = () => {
    // Hide on add job listing
    if (pathname.startsWith('/jobs/add')) return false
    // Hide on edit job listing
    if (pathname.startsWith('/jobs/edit')) return false
    // Hide on detail/nested screens (but not jobs list)
    if (pathname.match(/^\/jobs\/[^/]+$/) && pathname !== '/jobs/add') return false
    if (pathname.startsWith('/handymen/')) return false
    if (pathname.startsWith('/bookmarks')) return false
    if (pathname.startsWith('/messages')) return false
    return true
  }

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
    >
      <View
        flex={1}
        pb={shouldShowBottomNav()}
      >
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </View>
      {shouldShowBottomNav() && (
        <BottomNav
          activeRoute={getActiveRoute()}
          variant="homeowner"
          notificationCount={unreadCount}
          onAddPress={handleAddJobPress}
          isAddLoading={isCheckingPhone}
          onNavigate={(route) => router.push(route as any)}
        />
      )}
    </YStack>
  )
}
