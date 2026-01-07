import React from 'react'
import { ForgotPasswordOtpScreen } from 'app/features/auth/password/forgot'
import { Stack } from 'expo-router'

export default function ForgotPasswordOtpRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'Verify Code' }} />
      <ForgotPasswordOtpScreen />
    </>
  )
}
