import React from 'react'
import { RegisterScreen } from 'app/features/auth'
import { Stack } from 'expo-router'

export default function RegisterRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'Register' }} />
      <RegisterScreen />
    </>
  )
}
