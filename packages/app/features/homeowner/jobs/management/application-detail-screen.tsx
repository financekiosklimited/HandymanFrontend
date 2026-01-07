'use client'

import { useState } from 'react'
import { Alert } from 'react-native'
import { YStack, XStack, ScrollView, Text, Button, Spinner, View, Image } from '@my/ui'
import { GradientBackground } from '@my/ui'
import { useHomeownerApplicationDetail, useApproveApplication, useRejectApplication } from '@my/api'
import type { HomeownerApplicationStatus } from '@my/api'
import {
  ArrowLeft,
  Star,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Briefcase,
} from '@tamagui/lucide-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { applicationStatusColors, type ApplicationStatus } from '@my/config'
import { useToastController } from '@tamagui/toast'

function getStatusConfig(status: HomeownerApplicationStatus) {
  const config = applicationStatusColors[status as ApplicationStatus] || applicationStatusColors.pending
  return {
    ...config,
    icon: status === 'pending' ? Clock : status === 'approved' ? CheckCircle : XCircle,
  }
}

export function ApplicationDetailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ id: string }>()
  const insets = useSafeArea()
  const applicationId = params.id || ''
  const toast = useToastController()

  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  // Fetch application detail
  const {
    data: application,
    isLoading,
    error,
  } = useHomeownerApplicationDetail(applicationId)

  // Mutations
  const approveApplication = useApproveApplication()
  const rejectApplication = useRejectApplication()

  const handleApprove = () => {
    Alert.alert(
      'Approve Application',
      `Are you sure you want to approve ${application?.handyman_profile.display_name}'s application? This will assign the job to them and reject all other pending applications.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            setIsApproving(true)
            try {
              await approveApplication.mutateAsync(applicationId)
              toast.show('Application approved successfully!', {
                message: 'The handyman has been assigned to this job.',
                native: false,
                duration: 3000,
                customData: { variant: 'success' },
              })
              router.replace('/(homeowner)/jobs')
            } catch (err) {
              console.error('Error approving application:', err)
              toast.show('Failed to approve', {
                message: 'Please try again later.',
                native: false,
                duration: 3000,
                customData: { variant: 'error' },
              })
            } finally {
              setIsApproving(false)
            }
          },
        },
      ]
    )
  }

  const handleReject = () => {
    Alert.alert(
      'Reject Application',
      `Are you sure you want to reject ${application?.handyman_profile.display_name}'s application?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setIsRejecting(true)
            try {
              await rejectApplication.mutateAsync(applicationId)
              toast.show('Application rejected', {
                message: 'The application has been rejected.',
                native: false,
                duration: 3000,
                customData: { variant: 'success' },
              })
              router.replace('/(homeowner)/jobs')
            } catch (err) {
              console.error('Error rejecting application:', err)
              toast.show('Failed to reject', {
                message: 'Please try again later.',
                native: false,
                duration: 3000,
                customData: { variant: 'error' },
              })
            } finally {
              setIsRejecting(false)
            }
          },
        },
      ]
    )
  }

  if (isLoading) {
    return (
      <GradientBackground>
        <YStack flex={1} pt={insets.top} alignItems="center" justifyContent="center" gap="$md">
          <Spinner size="large" color="$primary" />
          <Text color="$colorSubtle" fontSize="$3">Loading application...</Text>
        </YStack>
      </GradientBackground>
    )
  }

  if (error || !application) {
    return (
      <GradientBackground>
        <YStack flex={1} pt={insets.top}>
          <XStack px="$lg" py="$md" alignItems="center" gap="$md">
            <Button
              unstyled
              onPress={() => router.back()}
              p="$2"
              hitSlop={12}
              pressStyle={{ opacity: 0.7 }}
            >
              <ArrowLeft size={22} color="$color" />
            </Button>
            <Text flex={1} fontSize={17} fontWeight="700" color="$color" textAlign="center">
              Application
            </Text>
            <View width={38} />
          </XStack>
          <YStack flex={1} alignItems="center" justifyContent="center" gap="$md" px="$lg">
            <Briefcase size={48} color="$error" />
            <Text color="$error" fontSize="$4" fontWeight="600">Application Not Found</Text>
            <Text color="$colorSubtle" fontSize="$3" textAlign="center">
              This application may have been removed or is no longer available.
            </Text>
            <Button
              mt="$md"
              bg="$primary"
              borderRadius="$lg"
              px="$xl"
              onPress={() => router.back()}
            >
              <Text color="white" fontWeight="600">Go Back</Text>
            </Button>
          </YStack>
        </YStack>
      </GradientBackground>
    )
  }

  const handyman = application.handyman_profile
  const job = application.job
  const statusConfig = getStatusConfig(application.status)
  const StatusIcon = statusConfig.icon
  const isPending = application.status === 'pending'

  return (
    <GradientBackground>
      <YStack flex={1} pt={insets.top}>
        {/* Header */}
        <XStack px="$lg" py="$md" alignItems="center" gap="$md">
          <Button
            unstyled
            onPress={() => router.back()}
            p="$2"
            hitSlop={12}
            pressStyle={{ opacity: 0.7 }}
          >
            <ArrowLeft size={22} color="$color" />
          </Button>
          <Text flex={1} fontSize={17} fontWeight="700" color="$color" textAlign="center">
            Applicant Details
          </Text>
          <View width={38} />
        </XStack>

        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <YStack px="$lg" pb="$2xl" gap="$lg">
            {/* Status Banner */}
            <XStack
              bg={statusConfig.bg as any}
              borderRadius={12}
              p="$md"
              alignItems="center"
              gap="$sm"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <StatusIcon size={20} color={statusConfig.text as any} />
              <Text fontSize="$3" fontWeight="600" color={statusConfig.text as any}>
                {statusConfig.label}
              </Text>
            </XStack>

            {/* Handyman Profile Card */}
            <YStack
              bg="rgba(255,255,255,0.95)"
              borderRadius={20}
              p="$lg"
              gap="$md"
              borderWidth={1}
              borderColor="rgba(0,0,0,0.05)"
            >
              {/* Avatar & Name */}
              <XStack gap="$md" alignItems="center">
                <View
                  width={72}
                  height={72}
                  borderRadius={36}
                  bg="$backgroundMuted"
                  overflow="hidden"
                  alignItems="center"
                  justifyContent="center"
                  borderWidth={3}
                  borderColor="$primary"
                >
                  {handyman.avatar_url ? (
                    <Image
                      source={{ uri: handyman.avatar_url }}
                      width={72}
                      height={72}
                      resizeMode="cover"
                    />
                  ) : (
                    <User size={32} color="$colorMuted" />
                  )}
                </View>

                <YStack flex={1} gap={4}>
                  <Text fontSize="$6" fontWeight="bold" color="$color">
                    {handyman.display_name}
                  </Text>
                  {handyman.job_title && (
                    <Text fontSize="$3" color="$colorSubtle">
                      {handyman.job_title}
                    </Text>
                  )}
                  <XStack alignItems="center" gap="$sm" mt="$xs">
                    <XStack alignItems="center" gap="$xs">
                      <Star size={14} color="$warning" fill="$warning" />
                      <Text fontSize="$3" fontWeight="600" color="$color">
                        {handyman.rating?.toFixed(1) || 'N/A'}
                      </Text>
                      {handyman.total_reviews && (
                        <Text fontSize="$2" color="$colorSubtle">
                          ({handyman.total_reviews} reviews)
                        </Text>
                      )}
                    </XStack>
                  </XStack>
                </YStack>
              </XStack>

              {/* Hourly Rate */}
              {handyman.hourly_rate && (
                <YStack
                  bg="rgba(12,154,92,0.08)"
                  borderRadius={12}
                  p="$md"
                  alignItems="center"
                >
                  <Text fontSize="$2" color="$colorSubtle">Hourly Rate</Text>
                  <Text fontSize="$7" fontWeight="bold" color="$primary">
                    ${handyman.hourly_rate}/hr
                  </Text>
                </YStack>
              )}

              {/* Bio */}
              {handyman.bio && (
                <YStack gap="$xs">
                  <Text fontSize="$2" fontWeight="600" color="$colorSubtle" textTransform="uppercase">
                    About
                  </Text>
                  <Text fontSize="$3" color="$color" lineHeight={22}>
                    {handyman.bio}
                  </Text>
                </YStack>
              )}

              {/* Categories */}
              {handyman.categories && handyman.categories.length > 0 && (
                <YStack gap="$xs">
                  <Text fontSize="$2" fontWeight="600" color="$colorSubtle" textTransform="uppercase">
                    Expertise
                  </Text>
                  <XStack flexWrap="wrap" gap="$xs">
                    {handyman.categories.map((cat) => (
                      <XStack
                        key={cat.public_id}
                        bg="$backgroundMuted"
                        px="$sm"
                        py="$xs"
                        borderRadius="$full"
                      >
                        <Text fontSize="$2" color="$color" fontWeight="500">
                          {cat.name}
                        </Text>
                      </XStack>
                    ))}
                  </XStack>
                </YStack>
              )}
            </YStack>

            {/* Job Info Card */}
            <YStack
              bg="rgba(255,255,255,0.9)"
              borderRadius={16}
              p="$md"
              gap="$sm"
              borderWidth={1}
              borderColor="rgba(0,0,0,0.05)"
            >
              <Text fontSize="$2" fontWeight="600" color="$colorSubtle" textTransform="uppercase">
                Applied For
              </Text>
              <Text fontSize="$4" fontWeight="600" color="$color">
                {job.title}
              </Text>
            </YStack>

            {/* Application Message */}
            {application.message && (
              <YStack
                bg="rgba(255,255,255,0.9)"
                borderRadius={16}
                p="$md"
                gap="$sm"
                borderWidth={1}
                borderColor="rgba(0,0,0,0.05)"
              >
                <Text fontSize="$2" fontWeight="600" color="$colorSubtle" textTransform="uppercase">
                  Message from Applicant
                </Text>
                <Text fontSize="$3" color="$color" lineHeight={22}>
                  {application.message}
                </Text>
              </YStack>
            )}

            {/* Proposed Rate */}
            {application.proposed_rate && (
              <YStack
                bg="rgba(255,255,255,0.9)"
                borderRadius={16}
                p="$md"
                gap="$sm"
                borderWidth={1}
                borderColor="rgba(0,0,0,0.05)"
              >
                <Text fontSize="$2" fontWeight="600" color="$colorSubtle" textTransform="uppercase">
                  Proposed Rate
                </Text>
                <Text fontSize="$5" fontWeight="bold" color="$primary">
                  ${application.proposed_rate}/hr
                </Text>
              </YStack>
            )}

            {/* Applied Date */}
            <Text fontSize="$2" color="$colorSubtle" textAlign="center">
              Applied on{' '}
              {new Date(application.created_at).toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </Text>
          </YStack>
        </ScrollView>

        {/* Action Buttons - Only for pending applications */}
        {isPending && (
          <XStack
            px="$lg"
            py="$md"
            pb={insets.bottom + 16}
            gap="$md"
            bg="rgba(255,255,255,0.95)"
            borderTopWidth={1}
            borderTopColor="$borderColor"
          >
            <Button
              flex={1}
              onPress={handleReject}
              disabled={isRejecting || isApproving}
              bg="transparent"
              borderWidth={2}
              borderColor="$error"
              borderRadius="$lg"
              py="$md"
              pressStyle={{ opacity: 0.8, bg: 'rgba(255,59,48,0.05)' }}
            >
              {isRejecting ? (
                <Spinner size="small" color="$error" />
              ) : (
                <XStack alignItems="center" gap="$xs">
                  <XCircle size={18} color="$error" />
                  <Text color="$error" fontWeight="600" fontSize="$4">
                    Reject
                  </Text>
                </XStack>
              )}
            </Button>

            <Button
              flex={1}
              onPress={handleApprove}
              disabled={isApproving || isRejecting}
              bg="$primary"
              borderRadius="$lg"
              py="$md"
              pressStyle={{ opacity: 0.8 }}
            >
              {isApproving ? (
                <Spinner size="small" color="white" />
              ) : (
                <XStack alignItems="center" gap="$xs">
                  <CheckCircle size={18} color="white" />
                  <Text color="white" fontWeight="600" fontSize="$4">
                    Approve
                  </Text>
                </XStack>
              )}
            </Button>
          </XStack>
        )}
      </YStack>
    </GradientBackground>
  )
}
