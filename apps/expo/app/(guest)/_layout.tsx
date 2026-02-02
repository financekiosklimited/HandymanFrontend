import { useEffect } from 'react'
import { Stack, useRouter, usePathname } from 'expo-router'
import { YStack } from 'tamagui'
import { BottomNav } from '@my/ui'
import { useAuthStore } from '@my/api'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'

export default function GuestLayout() {
  const router = useRouter()
  const pathname = usePathname()
  const insets = useSafeArea()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const activeRole = useAuthStore((state) => state.activeRole)

  useEffect(() => {
    // If user is already authenticated, redirect to their homepage
    if (isAuthenticated && activeRole) {
      if (activeRole === 'handyman') {
        router.replace('/(handyman)/')
      } else if (activeRole === 'homeowner') {
        router.replace('/(homeowner)/')
      }
    }
  }, [isAuthenticated, activeRole, router])

  // Map pathname to active route for bottom nav
  const getActiveRoute = () => {
    if (pathname === '/' || pathname === '') return '/'
    return '/'
  }

  // Check if we should show bottom nav (hide on certain screens)
  const shouldShowBottomNav = () => {
    // Hide on auth screens
    if (pathname.startsWith('/auth/')) return false
    // Hide on detail/nested screens
    if (pathname.startsWith('/handymen/')) return false
    if (pathname.startsWith('/jobs/')) return false
    return true
  }

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
    >
      <YStack flex={1}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
        </Stack>
      </YStack>
      {shouldShowBottomNav() && (
        <BottomNav
          activeRoute={getActiveRoute()}
          variant="guest"
          onNavigate={(route) => router.push(route as any)}
        />
      )}
    </YStack>
  )
}
