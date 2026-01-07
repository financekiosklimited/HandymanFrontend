import { useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import { useAuthStore } from '@my/api'

export default function GuestLayout() {
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

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  )
}
