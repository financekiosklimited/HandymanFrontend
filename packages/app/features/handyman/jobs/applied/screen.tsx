'use client'

import { useMemo } from 'react'
import { YStack, XStack, ScrollView, Text, Button, Spinner, View } from '@my/ui'
import { GradientBackground } from '@my/ui'
import { useHandymanApplications } from '@my/api'
import { ArrowLeft, Briefcase, MapPin, ChevronRight } from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import type { ApplicationStatus, JobApplication } from '@my/api'
import {
  applicationStatusColors,
  type ApplicationStatus as ConfigApplicationStatus,
} from '@my/config'

const getStatusColor = (status: ApplicationStatus) => {
  return (
    applicationStatusColors[status as ConfigApplicationStatus] || applicationStatusColors.pending
  )
}

const getStatusLabel = (status: ApplicationStatus) => {
  const statusInfo = applicationStatusColors[status as ConfigApplicationStatus]
  return statusInfo?.label || status
}

interface ApplicationCardProps {
  application: JobApplication
  onPress: () => void
}

function ApplicationCard({ application, onPress }: ApplicationCardProps) {
  const statusStyle = getStatusColor(application.status)
  const job = application.job

  return (
    <Button
      unstyled
      onPress={onPress}
      bg="rgba(255,255,255,0.8)"
      borderRadius={16}
      p="$md"
      borderWidth={1}
      borderColor="rgba(255,255,255,0.5)"
      pressStyle={{ opacity: 0.8, scale: 0.98 }}
      animation="quick"
    >
      <YStack gap="$sm">
        {/* Header Row */}
        <XStack
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <YStack
            flex={1}
            gap="$xs"
          >
            <Text
              fontSize="$4"
              fontWeight="600"
              color="$color"
              numberOfLines={2}
            >
              {job.title}
            </Text>
            {job.category && (
              <XStack
                alignItems="center"
                gap="$xs"
              >
                <View
                  width={6}
                  height={6}
                  borderRadius={3}
                  bg="$primary"
                />
                <Text
                  fontSize="$2"
                  color="$colorSubtle"
                >
                  {job.category.name}
                </Text>
              </XStack>
            )}
          </YStack>
          <ChevronRight
            size={20}
            color="$colorSubtle"
          />
        </XStack>

        {/* Location */}
        {job.city && (
          <XStack
            alignItems="center"
            gap="$xs"
          >
            <MapPin
              size={14}
              color="$colorSubtle"
            />
            <Text
              fontSize="$2"
              color="$colorSubtle"
            >
              {job.city.name}
              {job.city.province_code ? `, ${job.city.province_code}` : ''}
            </Text>
          </XStack>
        )}

        {/* Footer Row */}
        <XStack
          justifyContent="space-between"
          alignItems="center"
          mt="$xs"
        >
          {/* Budget */}
          <Text
            fontSize="$3"
            fontWeight="600"
            color="$primary"
          >
            ${job.estimated_budget}
          </Text>

          {/* Status Badge */}
          <XStack
            bg={statusStyle.bg as any}
            px="$sm"
            py={4}
            borderRadius="$full"
          >
            <Text
              fontSize={11}
              fontWeight="600"
              color={statusStyle.text as any}
              textTransform="uppercase"
            >
              {getStatusLabel(application.status)}
            </Text>
          </XStack>
        </XStack>

        {/* Applied Date */}
        <Text
          fontSize="$1"
          color="$placeholderColor"
        >
          Applied{' '}
          {new Date(application.created_at).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </Text>
      </YStack>
    </Button>
  )
}

export function MyJobsScreen() {
  const router = useRouter()
  const insets = useSafeArea()

  const {
    data: applicationsData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useHandymanApplications()

  // Flatten paginated data
  const applications = useMemo(() => {
    return applicationsData?.pages.flatMap((page) => page.results) || []
  }, [applicationsData])

  const handleApplicationPress = (application: JobApplication) => {
    router.push({
      pathname: '/(handyman)/my-jobs/[id]',
      params: {
        id: application.public_id,
        jobId: application.job.public_id,
      },
    } as any)
  }

  return (
    <GradientBackground>
      <YStack
        flex={1}
        pt={insets.top}
      >
        {/* Header */}
        <XStack
          px="$5"
          py="$4"
          alignItems="center"
          gap="$3"
        >
          <Button
            unstyled
            onPress={() => router.back()}
            p="$2"
            hitSlop={12}
            pressStyle={{ opacity: 0.7 }}
          >
            <ArrowLeft
              size={22}
              color="$color"
            />
          </Button>
          <Text
            flex={1}
            fontSize={17}
            fontWeight="700"
            color="$color"
            textAlign="center"
          >
            My Jobs
          </Text>
          <View width={38} />
        </XStack>

        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
        >
          <YStack
            px="$lg"
            pb="$xl"
            gap="$md"
          >
            {/* Section Header */}
            <YStack
              gap="$xs"
              mb="$sm"
            >
              <Text
                fontSize="$6"
                fontWeight="bold"
                color="$color"
              >
                Job Applications
              </Text>
              <Text
                fontSize="$3"
                color="$colorSubtle"
              >
                Track the status of your job applications
              </Text>
            </YStack>

            {/* Loading State */}
            {isLoading ? (
              <YStack
                py="$xl"
                alignItems="center"
                gap="$md"
              >
                <Spinner
                  size="large"
                  color="$primary"
                />
                <Text
                  color="$colorSubtle"
                  fontSize="$3"
                >
                  Loading applications...
                </Text>
              </YStack>
            ) : error ? (
              <YStack
                py="$xl"
                alignItems="center"
                bg="rgba(255,255,255,0.7)"
                borderRadius={20}
                gap="$sm"
              >
                <Briefcase
                  size={40}
                  color="$error"
                />
                <Text
                  color="$error"
                  fontSize="$4"
                  fontWeight="500"
                >
                  Failed to load applications
                </Text>
                <Text
                  color="$colorSubtle"
                  fontSize="$2"
                  textAlign="center"
                >
                  Please try again later
                </Text>
              </YStack>
            ) : applications.length === 0 ? (
              <YStack
                py="$2xl"
                alignItems="center"
                bg="rgba(255,255,255,0.7)"
                borderRadius={20}
                gap="$md"
                px="$lg"
              >
                <YStack
                  width={80}
                  height={80}
                  borderRadius="$full"
                  bg="rgba(12,154,92,0.1)"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Briefcase
                    size={36}
                    color="$primary"
                  />
                </YStack>
                <Text
                  color="$color"
                  fontSize="$5"
                  fontWeight="600"
                >
                  No Applications Yet
                </Text>
                <Text
                  color="$colorSubtle"
                  fontSize="$3"
                  textAlign="center"
                >
                  Start exploring jobs and apply to opportunities that match your skills.
                </Text>
                <Button
                  mt="$sm"
                  bg="$primary"
                  color="white"
                  borderRadius="$lg"
                  px="$xl"
                  onPress={() => router.push('/(handyman)/')}
                >
                  <Text
                    color="white"
                    fontWeight="600"
                  >
                    Explore Jobs
                  </Text>
                </Button>
              </YStack>
            ) : (
              <YStack gap="$sm">
                {applications.map((application) => (
                  <ApplicationCard
                    key={application.public_id}
                    application={application}
                    onPress={() => handleApplicationPress(application)}
                  />
                ))}

                {/* Load More Button */}
                {hasNextPage && (
                  <Button
                    onPress={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    bg="rgba(255,255,255,0.7)"
                    borderRadius="$md"
                    py="$sm"
                    mt="$sm"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    {isFetchingNextPage ? (
                      <XStack
                        alignItems="center"
                        gap="$sm"
                      >
                        <Spinner
                          size="small"
                          color="$primary"
                        />
                        <Text
                          color="$colorSubtle"
                          fontSize="$3"
                        >
                          Loading...
                        </Text>
                      </XStack>
                    ) : (
                      <Text
                        color="$primary"
                        fontSize="$3"
                        fontWeight="500"
                      >
                        Load more applications
                      </Text>
                    )}
                  </Button>
                )}
              </YStack>
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </GradientBackground>
  )
}
