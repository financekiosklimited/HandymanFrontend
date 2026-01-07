import React from 'react'
import { ForgotPasswordResetScreen } from 'app/features/auth/password/forgot'
import { Stack } from 'expo-router'

export default function ForgotPasswordResetRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'Reset Password' }} />
      <ForgotPasswordResetScreen />
    </>
  )
}
