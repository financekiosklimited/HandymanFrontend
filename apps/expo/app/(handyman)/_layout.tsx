import { useEffect } from 'react'
import { Stack, useRouter, usePathname } from 'expo-router'
import { YStack, View } from 'tamagui'
import { BottomNav } from '@my/ui'
import { useAuthStore, useHandymanUnreadCount } from '@my/api'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'

export default function HandymanLayout() {
  const router = useRouter()
  const pathname = usePathname()
  const insets = useSafeArea()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const activeRole = useAuthStore((state) => state.activeRole)

  // Only fetch unread notification count when authenticated as handyman
  const shouldFetchNotifications = isAuthenticated && activeRole === 'handyman'
  const { data: unreadCount = 0 } = useHandymanUnreadCount(shouldFetchNotifications)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.replace('/auth/login')
      return
    }

    // Redirect to correct role homepage if not handyman
    if (activeRole !== 'handyman') {
      if (activeRole === 'homeowner') {
        router.replace('/(homeowner)/' as any)
      } else {
        router.replace('/')
      }
    }
  }, [isAuthenticated, activeRole, router])

  // Map pathname to active route for bottom nav
  // Note: usePathname() returns just the path without route groups, e.g. "/updates" not "/(handyman)/updates"
  const getActiveRoute = () => {
    if (pathname === '/updates' || pathname.startsWith('/updates/')) return '/(handyman)/updates'
    if (pathname === '/my-jobs' || pathname.startsWith('/my-jobs/')) return '/(handyman)/my-jobs'
    if (pathname === '/profile' || pathname.startsWith('/profile/')) return '/(handyman)/profile'
    if (pathname === '/' || pathname === '') return '/(handyman)/'
    return '/(handyman)/'
  }

  // Check if we should show bottom nav (hide on certain screens)
  const shouldShowBottomNav = () => {
    // Hide on detail/nested screens
    if (pathname.startsWith('/jobs/')) return false
    if (pathname.startsWith('/bookmarks')) return false
    if (pathname.startsWith('/messages')) return false
    return true
  }

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
    >
      <View flex={1}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </View>
      {shouldShowBottomNav() && (
        <BottomNav
          activeRoute={getActiveRoute()}
          variant="handyman"
          notificationCount={unreadCount}
          onNavigate={(route) => router.push(route as any)}
        />
      )}
    </YStack>
  )
}
