import React from 'react'
import { RegisterVerifiedScreen } from 'app/features/auth'
import { Stack } from 'expo-router'

export default function RegisterVerifiedRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'Email Verified' }} />
      <RegisterVerifiedScreen />
    </>
  )
}
