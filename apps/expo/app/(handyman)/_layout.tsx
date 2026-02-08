import { useEffect } from 'react'
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

  // Use navigation guard to prevent double navigation
  const { push, replace, isNavigating } = useNavigationGuard({ delay: 400 })

  // Only fetch unread notification count when authenticated as handyman
  const shouldFetchNotifications = isAuthenticated && activeRole === 'handyman'
  const { data: unreadCount = 0 } = useHandymanUnreadCount(shouldFetchNotifications)

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

  // Map pathname to active route for bottom nav
  // Note: usePathname() returns just the path without route groups, e.g. "/updates" not "/(handyman)/updates"
  const getActiveRoute = () => {
    if (pathname === '/updates' || pathname.startsWith('/updates/')) return '/(handyman)/updates'
    if (pathname === '/jobs' || pathname.startsWith('/jobs/')) return '/(handyman)/jobs'
    if (pathname === '/my-jobs' || pathname.startsWith('/my-jobs/')) return '/(handyman)/my-jobs'
    if (pathname === '/profile' || pathname.startsWith('/profile/')) return '/(handyman)/profile'
    if (pathname === '/' || pathname === '') return '/(handyman)/'
    return '/(handyman)/'
  }

  // Check if we should show bottom nav (hide on certain screens)
  const shouldShowBottomNav = () => {
    // Hide on detail/nested screens
    if (pathname.startsWith('/jobs/')) return false
    if (pathname.startsWith('/direct-offers')) return false
    if (pathname.startsWith('/bookmarks')) return false
    if (pathname.startsWith('/messages')) return false
    return true
  }

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
    >
      <YStack flex={1}>
        {/*
          Nested Stack for handyman routes
          Inherits animation config from root, but we explicitly set it here
          to ensure consistency even if root config changes
        */}
        <Stack
          screenOptions={{
            ...defaultScreenOptions,
            headerShown: false,
          }}
        />
      </YStack>
      {shouldShowBottomNav() && (
        <BottomNav
          activeRoute={getActiveRoute()}
          variant="handyman"
          notificationCount={unreadCount}
          onNavigate={(route) => push(route as any)}
        />
      )}
    </YStack>
  )
}
