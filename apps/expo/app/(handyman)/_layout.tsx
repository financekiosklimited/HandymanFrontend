import { useEffect, useCallback, useMemo } from 'react'
import { useRouter, usePathname } from 'expo-router'
import { YStack } from 'tamagui'
import { BottomNav } from '@my/ui'
import { useAuthStore, useHandymanUnreadCount } from '@my/api'
import { useNavigationGuard } from 'app/hooks/useNavigationGuard'
import { Stack } from 'expo-router'
import { defaultScreenOptions } from 'app/navigation/config'

export default function HandymanLayout() {
  const router = useRouter()
  const pathname = usePathname()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const activeRole = useAuthStore((state) => state.activeRole)

  // Use navigation guard with reduced delay (300ms instead of 400ms)
  const { push, replace, isNavigating } = useNavigationGuard({ delay: 300 })

  // Only fetch unread notification count when authenticated as handyman
  const shouldFetchNotifications = isAuthenticated && activeRole === 'handyman'
  const { data: unreadCount = 0 } = useHandymanUnreadCount(shouldFetchNotifications)

  // Memoized auth check effect
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      replace('/auth/login')
      return
    }

    // Redirect to correct role homepage if not handyman
    if (activeRole !== 'handyman') {
      if (activeRole === 'homeowner') {
        replace('/(homeowner)/' as any)
      } else {
        replace('/')
      }
    }
  }, [isAuthenticated, activeRole, replace])

  // Memoized route mapping - only recalculates when pathname changes
  const activeRoute = useMemo(() => {
    if (pathname === '/updates' || pathname.startsWith('/updates/')) {
      return '/(handyman)/updates'
    }
    if (pathname === '/jobs' || pathname.startsWith('/jobs/')) {
      return '/(handyman)/jobs'
    }
    if (pathname === '/my-jobs' || pathname.startsWith('/my-jobs/')) {
      return '/(handyman)/my-jobs'
    }
    if (pathname === '/profile' || pathname.startsWith('/profile/')) {
      return '/(handyman)/profile'
    }
    if (pathname === '/' || pathname === '') {
      return '/(handyman)/'
    }
    return '/(handyman)/'
  }, [pathname])

  // Memoized visibility check - only recalculates when pathname changes
  const shouldShowNav = useMemo(() => {
    // Hide on detail/nested screens
    if (pathname.startsWith('/jobs/')) return false
    if (pathname.startsWith('/direct-offers')) return false
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
          variant="handyman"
          notificationCount={unreadCount}
          onNavigate={handleNavigate}
          isNavigating={isNavigating}
        />
      )}
    </YStack>
  )
}
