import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { FluidSplashScreen } from '@my/ui'
import { useAuthStore } from '@my/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

// MANUAL TEST TOGGLE: Set to true to always show onboarding
const FORCE_ONBOARDING = true

export function SplashScreen() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const activeRole = useAuthStore((state) => state.activeRole)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Preload any data needed before navigation
    setIsReady(true)
  }, [])

  const handleAnimationComplete = async () => {
    try {
      const complete = await AsyncStorage.getItem('onboarding_complete')
      const shouldShowOnboarding = FORCE_ONBOARDING || complete !== 'true'

      if (shouldShowOnboarding) {
        // Show onboarding for new users
        router.replace('/onboarding')
      } else if (isAuthenticated && activeRole) {
        // Redirect to role-specific homepage for returning users
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
    } catch (e) {
      console.error('Error checking onboarding status:', e)
      // Fallback to guest on error
      router.replace('/(guest)')
    }
  }

  if (!isReady) {
    return null
  }

  return (
    <FluidSplashScreen
      onAnimationComplete={handleAnimationComplete}
      minDisplayTime={2500}
    />
  )
}
