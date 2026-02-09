import { useEffect, useCallback, useMemo } from 'react'
import { useRouter, usePathname } from 'expo-router'
import { YStack } from 'tamagui'
import { BottomNav } from '@my/ui'
import { useAuthStore, useHomeownerUnreadCount } from '@my/api'
import { useNavigationGuard } from 'app/hooks/useNavigationGuard'
import { Stack } from 'expo-router'
import { defaultScreenOptions } from 'app/navigation/config'

export default function HomeownerLayout() {
  const router = useRouter()
  const pathname = usePathname()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const activeRole = useAuthStore((state) => state.activeRole)

  // Use navigation guard with reduced delay (300ms instead of 400ms)
  // Navigation feels more responsive while still preventing double-taps
  const { push, replace, isNavigating } = useNavigationGuard({ delay: 300 })

  // Only fetch unread notification count when authenticated as homeowner
  const shouldFetchNotifications = isAuthenticated && activeRole === 'homeowner'
  const { data: unreadCount = 0 } = useHomeownerUnreadCount(shouldFetchNotifications)

  /**
   * Handle Add Job button press - Navigate immediately, verification happens on the screen
   * This is "optimistic navigation" - we don't wait for async operations
   */
  const handleAddJobPress = useCallback(() => {
    // Navigate immediately - phone verification check moved to add job screen
    push('/(homeowner)/jobs/add' as any)
  }, [push])

  // Memoized auth check effect
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      replace('/auth/login')
      return
    }

    // Redirect to correct role homepage if not homeowner
    if (activeRole !== 'homeowner') {
      if (activeRole === 'handyman') {
        replace('/(handyman)/' as any)
      } else {
        replace('/')
      }
    }
  }, [isAuthenticated, activeRole, replace])

  // Memoized route mapping - only recalculates when pathname changes
  const activeRoute = useMemo(() => {
    if (pathname === '/updates' || pathname.startsWith('/updates/')) {
      return '/(homeowner)/updates'
    }
    if (pathname === '/jobs/add' || pathname.startsWith('/jobs/add/')) {
      return 'add'
    }
    if (pathname === '/jobs' || pathname.startsWith('/jobs/')) {
      return '/(homeowner)/jobs'
    }
    if (pathname === '/profile' || pathname.startsWith('/profile/')) {
      return '/(homeowner)/profile'
    }
    if (pathname === '/' || pathname === '') {
      return '/(homeowner)/'
    }
    return '/(homeowner)/'
  }, [pathname])

  // Memoized visibility check - only recalculates when pathname changes
  const shouldShowNav = useMemo(() => {
    // Hide on add job listing
    if (pathname.startsWith('/jobs/add')) return false
    // Hide on edit job listing
    if (pathname.startsWith('/jobs/edit')) return false
    // Hide on direct offers screens
    if (pathname.startsWith('/direct-offers')) return false
    // Hide on detail/nested screens (but not jobs list)
    if (pathname.match(/^\/jobs\/[^/]+$/) && pathname !== '/jobs/add') return false
    if (pathname.startsWith('/handymen/')) return false
    if (pathname.startsWith('/bookmarks')) return false
    if (pathname.startsWith('/messages')) return false
    return true
  }, [pathname])

  // Memoized navigation handler to prevent recreating function on every render
  const handleNavigate = useCallback(
    (route: string) => {
      push(route as any)
    },
    [push]
  )

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
    >
      <YStack flex={1}>
        <Stack
          screenOptions={{
            ...defaultScreenOptions,
            headerShown: false,
          }}
        />
      </YStack>
      {shouldShowNav && (
        <BottomNav
          activeRoute={activeRoute}
          variant="homeowner"
          notificationCount={unreadCount}
          onAddPress={handleAddJobPress}
          isAddLoading={isNavigating}
          onNavigate={handleNavigate}
        />
      )}
    </YStack>
  )
}
