import { useEffect } from 'react'
import { YStack } from 'tamagui'
import { useRouter } from 'expo-router'
import { GradientBackground, Logo } from '@my/ui'
import { useAuthStore } from '@my/api'

export function SplashScreen() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const activeRole = useAuthStore((state) => state.activeRole)

  useEffect(() => {
    // Auto-navigate after 2-3 seconds based on auth state
    const timer = setTimeout(() => {
      if (isAuthenticated && activeRole) {
        // Redirect to role-specific homepage
        if (activeRole === 'handyman') {
          router.replace('/(handyman)/')
        } else if (activeRole === 'homeowner') {
          router.replace('/(homeowner)/')
        } else {
          router.replace('/(guest)')
        }
      } else {
        // Not authenticated, go to guest homepage
        router.replace('/(guest)')
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [router, isAuthenticated, activeRole])

  return (
    <GradientBackground>
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        px="$xl"
      >
        <Logo size="lg" showTagline />
      </YStack>
    </GradientBackground>
  )
}
