import React from 'react'
import { RegisterVerifyScreen } from 'app/features/auth'
import { Stack } from 'expo-router'

export default function RegisterVerifyRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'Verify Email' }} />
      <RegisterVerifyScreen />
    </>
  )
}
