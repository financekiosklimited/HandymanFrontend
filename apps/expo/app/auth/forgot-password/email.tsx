import React from 'react'
import { ForgotPasswordEmailScreen } from 'app/features/auth/password/forgot'
import { Stack } from 'expo-router'

export default function ForgotPasswordEmailRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'Forgot Password' }} />
      <ForgotPasswordEmailScreen />
    </>
  )
}
