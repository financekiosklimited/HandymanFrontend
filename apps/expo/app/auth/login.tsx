import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@my/api'
import { LoginScreen } from 'app/features/auth/login'

export default function LoginRoute() {
  const router = useRouter()
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

  // Show login screen if not authenticated
  if (isAuthenticated && activeRole) {
    return null // Will redirect
  }

  return <LoginScreen />
}
