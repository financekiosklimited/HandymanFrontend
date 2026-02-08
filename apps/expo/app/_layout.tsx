import { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { SplashScreen } from 'expo-router'
import { Provider } from 'app/provider'
import { defaultScreenOptions } from 'app/navigation/config'
import { Stack } from 'expo-router'

export const unstable_settings = {
  // Ensure that reloading on `/user` keeps a back button present.
  initialRouteName: 'index',
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

  return (
    <Provider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/*
          Root Stack Navigator
          
          IMPORTANT: We apply defaultScreenOptions here to ensure consistent
          animations across ALL screens in the app. This fixes the "screen pops
          up instantly then animation plays" bug caused by inconsistent animation
          configuration between nested Stacks.
          
          Each route group (homeowner), (handyman), (guest) will inherit these
          options but can override them if needed.
        */}
        <Stack
          screenOptions={{
            ...defaultScreenOptions,
            // Allow child stacks to define their own headers
            headerShown: false,
          }}
        />
      </ThemeProvider>
    </Provider>
  )
}
