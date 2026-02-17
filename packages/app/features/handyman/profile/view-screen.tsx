'use client'

import {
  YStack,
  XStack,
  ScrollView,
  Text,
  Button,
  Spinner,
  View,
  Avatar,
  PressPresets,
} from '@my/ui'
import { GradientBackground } from '@my/ui'
import { useHandymanProfile, useActivateRole, useLogout } from '@my/api'
import { useRouter, useNavigation } from 'expo-router'
import {
  CheckCircle,
  XCircle,
  Star,
  User,
  Briefcase,
  RefreshCw,
  Edit3,
  LogOut,
  TrendingUp,
  Clock,
  Send,
  Target,
  Calendar,
  Award,
  DollarSign,
  Settings,
  RotateCcw,
} from '@tamagui/lucide-icons'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { PageHeader } from '@my/ui'
import { PAGE_DESCRIPTIONS } from 'app/constants/page-descriptions'
import { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import { resetAllOnboarding } from 'app/utils/onboarding-storage'
import { isDevFlagEnabled, setDevFlag } from 'app/utils/dev-flags'

export function HandymanProfileViewScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const insets = useSafeArea()
  const { data: profile, isLoading, error } = useHandymanProfile()
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

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-'
    return `$${Number(amount).toFixed(2)}/hr`
  }

  // Handle switch role
  const handleSwitchRole = async () => {
    try {
      await activateRoleMutation.mutateAsync({ role: 'homeowner' })
      router.replace('/(homeowner)/profile')
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
              router.replace('/(handyman)/')
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
                unstyled
                mt="$4"
                bg="$primary"
                borderRadius={8}
                height={48}
                px="$6"
                onPress={() => router.back()}
                {...PressPresets.primary}
                alignItems="center"
                justifyContent="center"
              >
                <Text
                  color="$backgroundStrong"
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
                          color="$backgroundStrong"
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
                {profile.job_title && (
                  <Text
                    fontSize={14}
                    color="$placeholderColor"
                    mt="$1"
                  >
                    {profile.job_title}
                  </Text>
                )}
                {/* Rating */}
                {profile.rating !== null && profile.rating !== undefined && (
                  <XStack
                    alignItems="center"
                    gap="$1.5"
                    mt="$2"
                  >
                    <Star
                      size={16}
                      color="$accent"
                      fill="$accent"
                    />
                    <Text
                      fontSize={14}
                      color="$color"
                      fontWeight="600"
                    >
                      {typeof profile.rating === 'number'
                        ? profile.rating.toFixed(1)
                        : profile.rating}
                    </Text>
                  </XStack>
                )}
                {/* Status Badges */}
                <XStack
                  gap="$2.5"
                  mt="$3"
                >
                  <View
                    bg={profile.is_active ? '$successBackground' : '$errorBackground'}
                    px="$3"
                    py="$1.5"
                    borderRadius={16}
                  >
                    <Text
                      fontSize={12}
                      fontWeight="600"
                      color={profile.is_active ? '$success' : '$error'}
                    >
                      {profile.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                  <View
                    bg={profile.is_available ? '$infoBackground' : '$backgroundMuted'}
                    px="$3"
                    py="$1.5"
                    borderRadius={16}
                  >
                    <Text
                      fontSize={12}
                      fontWeight="600"
                      color={profile.is_available ? '$info' : '$colorMuted'}
                    >
                      {profile.is_available ? 'Available' : 'Unavailable'}
                    </Text>
                  </View>
                </XStack>
              </YStack>

              {/* Professional Details Section */}
              <YStack
                bg="$backgroundStrong"
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
                  <Briefcase
                    size={18}
                    color="$primary"
                  />
                  <Text
                    fontSize={15}
                    fontWeight="700"
                    color="$color"
                  >
                    Professional Details
                  </Text>
                </XStack>

                {/* Job Title Row */}
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
                    Job Title
                  </Text>
                  <Text
                    fontSize={14}
                    color="$color"
                    fontWeight="500"
                  >
                    {profile.job_title || '-'}
                  </Text>
                </XStack>

                {/* Hourly Rate Row */}
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
                    Hourly Rate
                  </Text>
                  <Text
                    fontSize={14}
                    color="$color"
                    fontWeight="500"
                  >
                    {formatCurrency(profile.hourly_rate)}
                  </Text>
                </XStack>

                {/* Category Row */}
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
                    Category
                  </Text>
                  <Text
                    fontSize={14}
                    color="$color"
                    fontWeight="500"
                  >
                    {profile.category?.name || '-'}
                  </Text>
                </XStack>
              </YStack>

              {/* Performance Stats Section */}
              <YStack
                bg="$backgroundStrong"
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
                  <TrendingUp
                    size={18}
                    color="$primary"
                  />
                  <Text
                    fontSize={15}
                    fontWeight="700"
                    color="$color"
                  >
                    Performance Stats
                  </Text>
                </XStack>

                {/* Stats Grid */}
                <YStack
                  px="$4"
                  py="$4"
                  gap="$3"
                >
                  {/* Row 1: Rating, Completion Rate, Earnings */}
                  <XStack gap="$2">
                    {/* Rating Card */}
                    <YStack
                      flex={1}
                      bg="rgba(12, 154, 92, 0.08)"
                      borderRadius="$3"
                      p="$3"
                      alignItems="center"
                      borderWidth={1}
                      borderColor="rgba(12, 154, 92, 0.2)"
                    >
                      <View
                        bg="rgb(12, 154, 92)"
                        p="$2"
                        borderRadius="$2"
                        mb="$2"
                      >
                        <Star
                          size={18}
                          color="white"
                        />
                      </View>
                      <Text
                        fontSize="$6"
                        fontWeight="bold"
                        color="rgb(12, 154, 92)"
                      >
                        {profile.rating ? profile.rating.toFixed(1) : '4.8'}
                      </Text>
                      <Text
                        fontSize="$2"
                        color="$colorSubtle"
                        textAlign="center"
                      >
                        Rating
                      </Text>
                      <Text
                        fontSize="$1"
                        color="$colorMuted"
                        textAlign="center"
                        mt="$1"
                      >
                        24 reviews
                      </Text>
                    </YStack>

                    {/* Completion Rate Card */}
                    <YStack
                      flex={1}
                      bg="rgba(59, 130, 246, 0.08)"
                      borderRadius="$3"
                      p="$3"
                      alignItems="center"
                      borderWidth={1}
                      borderColor="rgba(59, 130, 246, 0.2)"
                    >
                      <View
                        bg="rgb(59, 130, 246)"
                        p="$2"
                        borderRadius="$2"
                        mb="$2"
                      >
                        <Award
                          size={18}
                          color="white"
                        />
                      </View>
                      <Text
                        fontSize="$6"
                        fontWeight="bold"
                        color="rgb(59, 130, 246)"
                      >
                        96%
                      </Text>
                      <Text
                        fontSize="$2"
                        color="$colorSubtle"
                        textAlign="center"
                      >
                        Completion
                      </Text>
                      <Text
                        fontSize="$1"
                        color="$colorMuted"
                        textAlign="center"
                        mt="$1"
                      >
                        48/50 jobs
                      </Text>
                    </YStack>

                    {/* Earnings Card */}
                    <YStack
                      flex={1}
                      bg="rgba(245, 158, 11, 0.08)"
                      borderRadius="$3"
                      p="$3"
                      alignItems="center"
                      borderWidth={1}
                      borderColor="rgba(245, 158, 11, 0.2)"
                    >
                      <View
                        bg="rgb(245, 158, 11)"
                        p="$2"
                        borderRadius="$2"
                        mb="$2"
                      >
                        <DollarSign
                          size={18}
                          color="white"
                        />
                      </View>
                      <Text
                        fontSize="$6"
                        fontWeight="bold"
                        color="rgb(245, 158, 11)"
                      >
                        $12.4k
                      </Text>
                      <Text
                        fontSize="$2"
                        color="$colorSubtle"
                        textAlign="center"
                      >
                        Earnings
                      </Text>
                      <Text
                        fontSize="$1"
                        color="$colorMuted"
                        textAlign="center"
                        mt="$1"
                      >
                        All time
                      </Text>
                    </YStack>
                  </XStack>

                  {/* Row 2: Total Bids, Direct Offers, Jobs Completed */}
                  <XStack gap="$2">
                    {/* Total Bids Card */}
                    <YStack
                      flex={1}
                      bg="rgba(139, 92, 246, 0.08)"
                      borderRadius="$3"
                      p="$3"
                      alignItems="center"
                      borderWidth={1}
                      borderColor="rgba(139, 92, 246, 0.2)"
                    >
                      <View
                        bg="rgb(139, 92, 246)"
                        p="$2"
                        borderRadius="$2"
                        mb="$2"
                      >
                        <Send
                          size={18}
                          color="white"
                        />
                      </View>
                      <Text
                        fontSize="$6"
                        fontWeight="bold"
                        color="rgb(139, 92, 246)"
                      >
                        127
                      </Text>
                      <Text
                        fontSize="$2"
                        color="$colorSubtle"
                        textAlign="center"
                      >
                        Total Bids
                      </Text>
                    </YStack>

                    {/* Direct Offers Card */}
                    <YStack
                      flex={1}
                      bg="rgba(239, 68, 68, 0.08)"
                      borderRadius="$3"
                      p="$3"
                      alignItems="center"
                      borderWidth={1}
                      borderColor="rgba(239, 68, 68, 0.2)"
                    >
                      <View
                        bg="rgb(239, 68, 68)"
                        p="$2"
                        borderRadius="$2"
                        mb="$2"
                      >
                        <Target
                          size={18}
                          color="white"
                        />
                      </View>
                      <Text
                        fontSize="$6"
                        fontWeight="bold"
                        color="rgb(239, 68, 68)"
                      >
                        23
                      </Text>
                      <Text
                        fontSize="$2"
                        color="$colorSubtle"
                        textAlign="center"
                      >
                        Offers
                      </Text>
                    </YStack>

                    {/* Jobs Completed Card */}
                    <YStack
                      flex={1}
                      bg="rgba(6, 182, 212, 0.08)"
                      borderRadius="$3"
                      p="$3"
                      alignItems="center"
                      borderWidth={1}
                      borderColor="rgba(6, 182, 212, 0.2)"
                    >
                      <View
                        bg="rgb(6, 182, 212)"
                        p="$2"
                        borderRadius="$2"
                        mb="$2"
                      >
                        <Briefcase
                          size={18}
                          color="white"
                        />
                      </View>
                      <Text
                        fontSize="$6"
                        fontWeight="bold"
                        color="rgb(6, 182, 212)"
                      >
                        48
                      </Text>
                      <Text
                        fontSize="$2"
                        color="$colorSubtle"
                        textAlign="center"
                      >
                        Completed
                      </Text>
                    </YStack>
                  </XStack>

                  {/* Row 3: Response Time, Member Since */}
                  <XStack gap="$2">
                    {/* Response Time Card */}
                    <YStack
                      flex={1}
                      bg="rgba(20, 184, 166, 0.08)"
                      borderRadius="$3"
                      p="$3"
                      alignItems="center"
                      borderWidth={1}
                      borderColor="rgba(20, 184, 166, 0.2)"
                    >
                      <View
                        bg="rgb(20, 184, 166)"
                        p="$2"
                        borderRadius="$2"
                        mb="$2"
                      >
                        <Clock
                          size={18}
                          color="white"
                        />
                      </View>
                      <Text
                        fontSize="$6"
                        fontWeight="bold"
                        color="rgb(20, 184, 166)"
                      >
                        2h
                      </Text>
                      <Text
                        fontSize="$2"
                        color="$colorSubtle"
                        textAlign="center"
                      >
                        Avg Response
                      </Text>
                    </YStack>

                    {/* Member Since Card */}
                    <YStack
                      flex={1}
                      bg="rgba(99, 102, 241, 0.08)"
                      borderRadius="$3"
                      p="$3"
                      alignItems="center"
                      borderWidth={1}
                      borderColor="rgba(99, 102, 241, 0.2)"
                    >
                      <View
                        bg="rgb(99, 102, 241)"
                        p="$2"
                        borderRadius="$2"
                        mb="$2"
                      >
                        <Calendar
                          size={18}
                          color="white"
                        />
                      </View>
                      <Text
                        fontSize="$6"
                        fontWeight="bold"
                        color="rgb(99, 102, 241)"
                      >
                        2023
                      </Text>
                      <Text
                        fontSize="$2"
                        color="$colorSubtle"
                        textAlign="center"
                      >
                        Member Since
                      </Text>
                    </YStack>
                  </XStack>
                </YStack>
              </YStack>

              {/* Personal Details Section */}
              <YStack
                bg="$backgroundStrong"
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
                          color="$success"
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
                  bg="$backgroundStrong"
                  borderRadius={8}
                  height={52}
                  borderWidth={1}
                  borderColor="$backgroundHover"
                  onPress={handleSwitchRole}
                  disabled={activateRoleMutation.isPending}
                  {...PressPresets.secondary}
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
                        Switch to Homeowner Role
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
                  onPress={() => router.push('/(handyman)/profile/edit')}
                  {...PressPresets.primary}
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="row"
                  gap="$2"
                >
                  <Edit3
                    size={18}
                    color="$backgroundStrong"
                  />
                  <Text
                    color="$backgroundStrong"
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
                  {...PressPresets.primary}
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="row"
                  gap="$2"
                >
                  {logoutMutation.isPending ? (
                    <Spinner
                      size="small"
                      color="$backgroundStrong"
                    />
                  ) : (
                    <>
                      <LogOut
                        size={18}
                        color="$backgroundStrong"
                      />
                      <Text
                        color="$backgroundStrong"
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
                  {...PressPresets.primary}
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
                  {...PressPresets.primary}
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
