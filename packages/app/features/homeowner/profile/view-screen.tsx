'use client'

import { YStack, XStack, ScrollView, Text, Button, Spinner, View, Avatar } from '@my/ui'
import { GradientBackground } from '@my/ui'
import { useHomeownerProfile, useActivateRole, useLogout, useAuthStore } from '@my/api'
import { useRouter, useNavigation } from 'expo-router'
import {
  CheckCircle,
  XCircle,
  User,
  RefreshCw,
  Edit3,
  LogOut,
  Settings,
  RotateCcw,
} from '@tamagui/lucide-icons'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { useToastFromParams } from 'app/hooks/useToastFromParams'
import { PageHeader } from '@my/ui'
import { PAGE_DESCRIPTIONS } from 'app/constants/page-descriptions'
import { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import { resetAllOnboarding } from 'app/utils/onboarding-storage'
import { isDevFlagEnabled, setDevFlag } from 'app/utils/dev-flags'

export function HomeownerProfileViewScreen() {
  useToastFromParams()
  const router = useRouter()
  const navigation = useNavigation()
  const insets = useSafeArea()
  const { data: profile, isLoading, error } = useHomeownerProfile()
  const activateRoleMutation = useActivateRole()
  const logoutMutation = useLogout()

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  // Handle switch role
  const handleSwitchRole = async () => {
    try {
      await activateRoleMutation.mutateAsync({ role: 'handyman' })
      router.replace('/(handyman)/profile')
    } catch (error) {
      console.error('Failed to switch role:', error)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      router.replace('/auth/login')
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  // Dev mode state
  const [devModeEnabled, setDevModeEnabled] = useState(false)

  // Check dev mode on mount
  useEffect(() => {
    const checkDevMode = async () => {
      const enabled = await isDevFlagEnabled('FORCE_ONBOARDING')
      setDevModeEnabled(enabled)
    }
    checkDevMode()
  }, [])

  return (
    <GradientBackground>
      <YStack
        flex={1}
        pt={insets.top}
      >
        <PageHeader
          title="My Profile"
          description={PAGE_DESCRIPTIONS['view-profile']}
          onBack={() => {
            if (navigation.canGoBack()) {
              router.back()
            } else {
              router.replace('/(homeowner)/')
            }
          }}
        />

        {/* Content */}
        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {isLoading ? (
            <YStack
              flex={1}
              py="$10"
              alignItems="center"
              justifyContent="center"
            >
              <Spinner
                size="large"
                color="$primary"
              />
              <Text
                color="$placeholderColor"
                mt="$3"
                fontSize={14}
              >
                Loading profile...
              </Text>
            </YStack>
          ) : error ? (
            <YStack
              flex={1}
              py="$10"
              alignItems="center"
              justifyContent="center"
              px="$5"
            >
              <Text
                color="$error"
                textAlign="center"
                fontSize={14}
              >
                Failed to load profile
              </Text>
              <Button
                mt="$4"
                bg="$primary"
                borderRadius={8}
                height={48}
                px="$6"
                onPress={() => router.back()}
                pressStyle={{ opacity: 0.9 }}
              >
                <Text
                  color="white"
                  fontSize={15}
                  fontWeight="600"
                >
                  Go Back
                </Text>
              </Button>
            </YStack>
          ) : profile ? (
            <YStack
              px="$5"
              gap="$5"
            >
              {/* Avatar Section */}
              <YStack
                alignItems="center"
                py="$5"
              >
                <View
                  width={88}
                  height={88}
                  borderRadius={44}
                  bg="$backgroundHover"
                  alignItems="center"
                  justifyContent="center"
                  overflow="hidden"
                >
                  {profile.avatar_url ? (
                    <Avatar
                      circular
                      size="$9"
                    >
                      <Avatar.Image src={profile.avatar_url} />
                      <Avatar.Fallback bg="$primary">
                        <Text
                          color="white"
                          fontSize={32}
                          fontWeight="700"
                        >
                          {profile.display_name?.charAt(0).toUpperCase() || 'H'}
                        </Text>
                      </Avatar.Fallback>
                    </Avatar>
                  ) : (
                    <Text
                      color="$placeholderColor"
                      fontSize={32}
                      fontWeight="700"
                    >
                      {profile.display_name?.charAt(0).toUpperCase() || 'H'}
                    </Text>
                  )}
                </View>
                <Text
                  fontSize={20}
                  fontWeight="700"
                  color="$color"
                  mt="$3"
                >
                  {profile.display_name}
                </Text>
              </YStack>

              {/* Personal Details Section */}
              <YStack
                bg="white"
                borderRadius={12}
                borderWidth={1}
                borderColor="$backgroundHover"
                overflow="hidden"
              >
                {/* Section Header */}
                <XStack
                  px="$4"
                  py="$3.5"
                  alignItems="center"
                  gap="$2.5"
                  borderBottomWidth={1}
                  borderBottomColor="$borderColor"
                >
                  <User
                    size={18}
                    color="$primary"
                  />
                  <Text
                    fontSize={15}
                    fontWeight="700"
                    color="$color"
                  >
                    Personal Details
                  </Text>
                </XStack>

                {/* Email Row */}
                <XStack
                  px="$4"
                  py="$3.5"
                  justifyContent="space-between"
                  alignItems="center"
                  borderBottomWidth={1}
                  borderBottomColor="$borderColor"
                >
                  <Text
                    fontSize={14}
                    color="$placeholderColor"
                  >
                    Email
                  </Text>
                  <Text
                    fontSize={14}
                    color="$color"
                    fontWeight="500"
                  >
                    {profile.email}
                  </Text>
                </XStack>

                {/* Phone Row */}
                <XStack
                  px="$4"
                  py="$3.5"
                  justifyContent="space-between"
                  alignItems="center"
                  borderBottomWidth={1}
                  borderBottomColor="$borderColor"
                >
                  <Text
                    fontSize={14}
                    color="$placeholderColor"
                  >
                    Phone number
                  </Text>
                  <XStack
                    alignItems="center"
                    gap="$1.5"
                  >
                    <Text
                      fontSize={14}
                      color="$color"
                      fontWeight="500"
                    >
                      {profile.phone_number || '-'}
                    </Text>
                    {profile.phone_number &&
                      (profile.is_phone_verified ? (
                        <CheckCircle
                          size={14}
                          color="$success"
                        />
                      ) : (
                        <XCircle
                          size={14}
                          color="$colorMuted"
                        />
                      ))}
                  </XStack>
                </XStack>

                {/* Date of Birth Row */}
                <XStack
                  px="$4"
                  py="$3.5"
                  justifyContent="space-between"
                  alignItems="center"
                  borderBottomWidth={1}
                  borderBottomColor="$borderColor"
                >
                  <Text
                    fontSize={14}
                    color="$placeholderColor"
                  >
                    Date of birth
                  </Text>
                  <Text
                    fontSize={14}
                    color="$color"
                    fontWeight="500"
                  >
                    {formatDate(profile.date_of_birth)}
                  </Text>
                </XStack>

                {/* Address Row */}
                <XStack
                  px="$4"
                  py="$3.5"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text
                    fontSize={14}
                    color="$placeholderColor"
                  >
                    Address
                  </Text>
                  <Text
                    fontSize={14}
                    color="$color"
                    fontWeight="500"
                    textAlign="right"
                    flex={1}
                    ml="$4"
                    numberOfLines={2}
                  >
                    {profile.address || '-'}
                  </Text>
                </XStack>
              </YStack>

              {/* Action Buttons */}
              <YStack
                gap="$3"
                mt="$2"
              >
                {/* Switch Role Button */}
                <Button
                  unstyled
                  bg="white"
                  borderRadius={8}
                  height={52}
                  borderWidth={1}
                  borderColor="$backgroundHover"
                  onPress={handleSwitchRole}
                  disabled={activateRoleMutation.isPending}
                  pressStyle={{ opacity: 0.8, bg: '$backgroundHover' }}
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="row"
                  gap="$2"
                >
                  {activateRoleMutation.isPending ? (
                    <Spinner
                      size="small"
                      color="$primary"
                    />
                  ) : (
                    <>
                      <RefreshCw
                        size={18}
                        color="$color"
                      />
                      <Text
                        color="$color"
                        fontSize={15}
                        fontWeight="600"
                      >
                        Switch to Handyman Role
                      </Text>
                    </>
                  )}
                </Button>

                {/* Edit Profile Button */}
                <Button
                  unstyled
                  bg="$primary"
                  borderRadius={8}
                  height={52}
                  onPress={() => router.push('/(homeowner)/profile/edit')}
                  pressStyle={{ opacity: 0.9 }}
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="row"
                  gap="$2"
                >
                  <Edit3
                    size={18}
                    color="white"
                  />
                  <Text
                    color="white"
                    fontSize={15}
                    fontWeight="600"
                  >
                    Edit Profile
                  </Text>
                </Button>

                {/* Logout Button */}
                <Button
                  unstyled
                  bg="$error"
                  borderRadius={8}
                  height={52}
                  onPress={handleLogout}
                  disabled={logoutMutation.isPending}
                  pressStyle={{ opacity: 0.9 }}
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="row"
                  gap="$2"
                >
                  {logoutMutation.isPending ? (
                    <Spinner
                      size="small"
                      color="white"
                    />
                  ) : (
                    <>
                      <LogOut
                        size={18}
                        color="white"
                      />
                      <Text
                        color="white"
                        fontSize={15}
                        fontWeight="600"
                      >
                        Logout
                      </Text>
                    </>
                  )}
                </Button>

                {/* Reset Onboarding Button */}
                <Button
                  unstyled
                  bg="$warning"
                  borderRadius={8}
                  height={52}
                  onPress={async () => {
                    await resetAllOnboarding()
                    Alert.alert(
                      'Onboarding Reset',
                      'All onboarding toasts will show again on next visit'
                    )
                  }}
                  pressStyle={{ opacity: 0.9 }}
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="row"
                  gap="$2"
                >
                  <RotateCcw
                    size={18}
                    color="white"
                  />
                  <Text
                    color="white"
                    fontSize={15}
                    fontWeight="600"
                  >
                    Reset All Onboarding
                  </Text>
                </Button>

                {/* Dev Mode Toggle Button */}
                <Button
                  unstyled
                  bg={devModeEnabled ? '$success' : '$colorSubtle'}
                  borderRadius={8}
                  height={52}
                  onPress={async () => {
                    const newValue = !devModeEnabled
                    await setDevFlag('FORCE_ONBOARDING', newValue)
                    setDevModeEnabled(newValue)
                    Alert.alert(
                      'Developer Mode',
                      newValue
                        ? 'Onboarding toasts will always show'
                        : 'Normal onboarding behavior restored'
                    )
                  }}
                  pressStyle={{ opacity: 0.9 }}
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="row"
                  gap="$2"
                >
                  <Settings
                    size={18}
                    color="white"
                  />
                  <Text
                    color="white"
                    fontSize={15}
                    fontWeight="600"
                  >
                    {devModeEnabled ? 'Disable Dev Mode' : 'Enable Dev Mode (Force Onboarding)'}
                  </Text>
                </Button>
              </YStack>
            </YStack>
          ) : null}
        </ScrollView>
      </YStack>
    </GradientBackground>
  )
}
