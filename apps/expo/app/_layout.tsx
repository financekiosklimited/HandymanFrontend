import { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { Provider } from 'app/provider'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { useState } from 'react'

// MANUAL TEST TOGGLE: Set to true to always show onboarding
const FORCE_ONBOARDING = true

export const unstable_settings = {
  // Ensure that reloading on `/user` keeps a back button present.
  initialRouteName: 'Home',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function App() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useEffect(() => {
    if (interLoaded || interError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync()
    }
  }, [interLoaded, interError])

  if (!interLoaded && !interError) {
    return null
  }

  return <RootLayoutNav />
}


function RootLayoutNav() {
  const colorScheme = useColorScheme()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const complete = await AsyncStorage.getItem('onboarding_complete')
        const shouldShowOnboarding = FORCE_ONBOARDING || complete !== 'true'

        if (shouldShowOnboarding) {
          // We can't navigate immediately if navigation isn't ready, but in expo-router
          // inside a layout, it's usually fine after mount.
          // However, using a small timeout or relying on isMounted logic is safer.
          // For now, let's try direct replace.
          // Use setTimeout to allow the root stack to initialize
          setTimeout(() => {
            router.replace('/onboarding')
          }, 0)
        }
      } catch (e) {
        console.error('Error checking onboarding status:', e)
      } finally {
        setIsChecking(false)
      }
    }

    checkOnboarding()
  }, [])

  return (
    <Provider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
          }}
        />
      </ThemeProvider>
    </Provider>
  )
}

