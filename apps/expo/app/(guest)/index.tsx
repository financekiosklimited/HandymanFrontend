import { GuestHomeScreen } from 'app/features/guest/home'
import { Stack } from 'expo-router'

export default function GuestHome() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <GuestHomeScreen />
    </>
  )
}
