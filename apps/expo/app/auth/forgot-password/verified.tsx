import React from 'react'
import { ForgotPasswordVerifiedScreen } from 'app/features/auth/password/forgot'
import { Stack } from 'expo-router'

export default function ForgotPasswordVerifiedRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'Code Verified' }} />
      <ForgotPasswordVerifiedScreen />
    </>
  )
}
