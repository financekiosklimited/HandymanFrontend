import { useEffect } from 'react'
import { useRouter, usePathname } from 'expo-router'
import { YStack } from 'tamagui'
import { BottomNav } from '@my/ui'
import { useAuthStore } from '@my/api'
import { useNavigationGuard } from 'app/hooks/useNavigationGuard'
import { Stack } from 'expo-router'
import { defaultScreenOptions } from 'app/navigation/config'

export default function GuestLayout() {
  const router = useRouter()
  const pathname = usePathname()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const activeRole = useAuthStore((state) => state.activeRole)

  // Use navigation guard to prevent double navigation
  const { push, replace, isNavigating } = useNavigationGuard({ delay: 400 })

  useEffect(() => {
    // If user is already authenticated, redirect to their homepage
    if (isAuthenticated && activeRole) {
      if (activeRole === 'handyman') {
        replace('/(handyman)/')
      } else if (activeRole === 'homeowner') {
        replace('/(homeowner)/')
      }
    }
  }, [isAuthenticated, activeRole, replace])

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
        {/*
          Nested Stack for guest routes
          Inherits animation config from root, but we explicitly set it here
          to ensure consistency even if root config changes
        */}
        <Stack
          screenOptions={{
            ...defaultScreenOptions,
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
          onNavigate={(route) => push(route as any)}
          isNavigating={isNavigating}
        />
      )}
    </YStack>
  )
}
