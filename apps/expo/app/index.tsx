import { SplashScreen } from 'app/features/common/splash'
import { Stack } from 'expo-router'

export default function Index() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SplashScreen />
    </>
  )
}
