'use client'

import { useState, useMemo } from 'react'
import { YStack, XStack, ScrollView, Text, Button, Spinner, View, Image } from '@my/ui'
import { GradientBackground } from '@my/ui'
import { useHandymanApplications } from '@my/api'
import { ArrowLeft, Briefcase, MapPin, ChevronRight, Clock, Play } from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import type { ApplicationStatus, JobApplication } from '@my/api'
import {
  applicationStatusColors,
  type ApplicationStatus as ConfigApplicationStatus,
} from '@my/config'

type TabType = 'applicants' | 'active'

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
      bg="rgba(255,255,255,0.9)"
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

interface ActiveJobCardProps {
  application: JobApplication
  onPress: () => void
}

function ActiveJobCard({ application, onPress }: ActiveJobCardProps) {
  const job = application.job
  const jobImage = (job as any).images?.[0]?.image

  return (
    <Button
      unstyled
      onPress={onPress}
      bg="rgba(255,255,255,0.95)"
      borderRadius={20}
      overflow="hidden"
      borderWidth={1}
      borderColor="rgba(0,0,0,0.08)"
      pressStyle={{ opacity: 0.9, scale: 0.98 }}
      animation="quick"
    >
      <YStack>
        {/* Image */}
        {jobImage ? (
          <Image
            source={{ uri: jobImage }}
            width="100%"
            height={140}
            resizeMode="cover"
          />
        ) : (
          <YStack
            width="100%"
            height={140}
            bg="$primaryBackground"
            alignItems="center"
            justifyContent="center"
          >
            <Briefcase
              size={40}
              color="$primary"
            />
          </YStack>
        )}

        {/* Content */}
        <YStack
          p="$md"
          gap="$sm"
        >
          <Text
            fontSize="$4"
            fontWeight="700"
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
                numberOfLines={1}
              >
                {job.city.name}
              </Text>
            </XStack>
          )}

          {/* Job Status Indicator */}
          <XStack
            alignItems="center"
            justifyContent="space-between"
            mt="$xs"
          >
            <XStack
              bg="$successBackground"
              px="$sm"
              py={4}
              borderRadius="$full"
              alignItems="center"
              gap="$xs"
            >
              <Clock
                size={12}
                color="$success"
              />
              <Text
                fontSize={11}
                fontWeight="600"
                color="$success"
                textTransform="uppercase"
              >
                {job.status === 'in_progress' ? 'In Progress' : 'Active'}
              </Text>
            </XStack>

            <Text
              fontSize="$3"
              fontWeight="700"
              color="$primary"
            >
              ${job.estimated_budget}
            </Text>
          </XStack>

          {/* Action Button */}
          <Button
            mt="$sm"
            bg="$primary"
            borderRadius="$lg"
            py="$sm"
            pressStyle={{ opacity: 0.9 }}
            onPress={(e) => {
              e.stopPropagation()
              onPress()
            }}
          >
            <XStack
              alignItems="center"
              gap="$xs"
            >
              <Play
                size={14}
                color="white"
              />
              <Text
                color="white"
                fontWeight="600"
                fontSize="$3"
              >
                View Dashboard
              </Text>
            </XStack>
          </Button>
        </YStack>
      </YStack>
    </Button>
  )
}

export function HandymanJobsScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const [activeTab, setActiveTab] = useState<TabType>('applicants')

  // Fetch pending/all applications for "Job Applicants" tab
  const {
    data: applicationsData,
    isLoading: applicationsLoading,
    error: applicationsError,
    fetchNextPage: fetchMoreApplications,
    hasNextPage: hasMoreApplications,
    isFetchingNextPage: isFetchingMoreApplications,
  } = useHandymanApplications()

  // Fetch approved applications for "Active Jobs" tab
  const {
    data: activeJobsData,
    isLoading: activeJobsLoading,
    error: activeJobsError,
    fetchNextPage: fetchMoreActiveJobs,
    hasNextPage: hasMoreActiveJobs,
    isFetchingNextPage: isFetchingMoreActiveJobs,
  } = useHandymanApplications({ status: 'approved' })

  // Flatten paginated data
  const allApplications = useMemo(() => {
    return applicationsData?.pages.flatMap((page) => page.results) || []
  }, [applicationsData])

  // Filter to show only non-approved applications in Job Applicants tab
  const pendingApplications = useMemo(() => {
    return allApplications.filter((app) => app.status !== 'approved')
  }, [allApplications])

  const activeJobs = useMemo(() => {
    return activeJobsData?.pages.flatMap((page) => page.results) || []
  }, [activeJobsData])

  const handleApplicationPress = (application: JobApplication) => {
    router.push({
      pathname: '/(handyman)/my-jobs/[id]',
      params: {
        id: application.public_id,
        jobId: application.job.public_id,
      },
    } as any)
  }

  const handleActiveJobPress = (application: JobApplication) => {
    router.push({
      pathname: '/(handyman)/jobs/ongoing/[id]',
      params: {
        id: application.job.public_id,
        applicationId: application.public_id,
      },
    } as any)
  }

  const isLoading = activeTab === 'applicants' ? applicationsLoading : activeJobsLoading
  const error = activeTab === 'applicants' ? applicationsError : activeJobsError

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

        {/* Tabs */}
        <XStack
          px="$lg"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Button
            unstyled
            flex={1}
            pb="$md"
            borderBottomWidth={3}
            borderBottomColor={activeTab === 'applicants' ? '$primary' : 'transparent'}
            marginBottom={-1}
            onPress={() => setActiveTab('applicants')}
          >
            <Text
              fontSize="$4"
              fontWeight={activeTab === 'applicants' ? '600' : '500'}
              color={activeTab === 'applicants' ? '$primary' : '$colorSubtle'}
              textAlign="center"
            >
              Job Applicants
            </Text>
          </Button>
          <Button
            unstyled
            flex={1}
            pb="$md"
            borderBottomWidth={3}
            borderBottomColor={activeTab === 'active' ? '$primary' : 'transparent'}
            marginBottom={-1}
            onPress={() => setActiveTab('active')}
          >
            <Text
              fontSize="$4"
              fontWeight={activeTab === 'active' ? '600' : '500'}
              color={activeTab === 'active' ? '$primary' : '$colorSubtle'}
              textAlign="center"
            >
              Active Jobs
            </Text>
          </Button>
        </XStack>

        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
        >
          <YStack
            px="$lg"
            py="$lg"
            gap="$md"
          >
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
                  {activeTab === 'applicants'
                    ? 'Loading applications...'
                    : 'Loading active jobs...'}
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
                  Failed to load {activeTab === 'applicants' ? 'applications' : 'jobs'}
                </Text>
                <Text
                  color="$colorSubtle"
                  fontSize="$2"
                  textAlign="center"
                >
                  Please try again later
                </Text>
              </YStack>
            ) : activeTab === 'applicants' ? (
              // Job Applicants Tab Content
              pendingApplications.length === 0 ? (
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
                    No Pending Applications
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
                  {pendingApplications.map((application) => (
                    <ApplicationCard
                      key={application.public_id}
                      application={application}
                      onPress={() => handleApplicationPress(application)}
                    />
                  ))}

                  {/* Load More Button */}
                  {hasMoreApplications && (
                    <Button
                      onPress={() => fetchMoreApplications()}
                      disabled={isFetchingMoreApplications}
                      bg="rgba(255,255,255,0.7)"
                      borderRadius="$md"
                      py="$sm"
                      mt="$sm"
                      borderWidth={1}
                      borderColor="$borderColor"
                    >
                      {isFetchingMoreApplications ? (
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
              )
            ) : // Active Jobs Tab Content
            activeJobs.length === 0 ? (
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
                  <Play
                    size={36}
                    color="$primary"
                  />
                </YStack>
                <Text
                  color="$color"
                  fontSize="$5"
                  fontWeight="600"
                >
                  No Active Jobs
                </Text>
                <Text
                  color="$colorSubtle"
                  fontSize="$3"
                  textAlign="center"
                >
                  Jobs you've been approved for will appear here. Keep applying to find your next
                  opportunity!
                </Text>
              </YStack>
            ) : (
              <YStack gap="$md">
                {activeJobs.map((application) => (
                  <ActiveJobCard
                    key={application.public_id}
                    application={application}
                    onPress={() => handleActiveJobPress(application)}
                  />
                ))}

                {/* Load More Button */}
                {hasMoreActiveJobs && (
                  <Button
                    onPress={() => fetchMoreActiveJobs()}
                    disabled={isFetchingMoreActiveJobs}
                    bg="rgba(255,255,255,0.7)"
                    borderRadius="$md"
                    py="$sm"
                    mt="$sm"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    {isFetchingMoreActiveJobs ? (
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
                        Load more jobs
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
