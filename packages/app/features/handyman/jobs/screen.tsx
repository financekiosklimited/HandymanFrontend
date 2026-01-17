'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { RefreshControl } from 'react-native'
import { YStack, XStack, ScrollView, Text, Button, Spinner, View, Image } from '@my/ui'
import { GradientBackground, DirectOfferCard } from '@my/ui'
import {
  useHandymanApplications,
  useHandymanDirectOffers,
  useHandymanPendingOffersCount,
  useHandymanAssignedJobs,
} from '@my/api'
import { ArrowLeft, Briefcase, MapPin, ChevronRight, Clock, Play } from '@tamagui/lucide-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import type { ApplicationStatus, JobApplication, HandymanAssignedJob } from '@my/api'
import {
  applicationStatusColors,
  type ApplicationStatus as ConfigApplicationStatus,
} from '@my/config'

type TabType = 'applicants' | 'active' | 'offers'

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
  job: HandymanAssignedJob
  onPress: () => void
}

function ActiveJobCard({ job, onPress }: ActiveJobCardProps) {
  const attachments = job.attachments
  const firstAttachment = attachments?.[0]
  const isVideoAttachment = firstAttachment?.file_type === 'video'
  const isImageAttachment = firstAttachment?.file_type === 'image'
  const previewImage = isVideoAttachment
    ? firstAttachment?.thumbnail_url
    : isImageAttachment
      ? firstAttachment?.file_url
      : undefined

  // Get status display info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'in_progress':
        return { label: 'In Progress', bg: '$successBackground', color: '$success' }
      case 'pending_completion':
        return { label: 'Pending Completion', bg: '$warningBackground', color: '$warning' }
      case 'completed':
        return { label: 'Completed', bg: '$primaryBackground', color: '$primary' }
      case 'disputed':
        return { label: 'Disputed', bg: '$errorBackground', color: '$error' }
      default:
        return { label: 'Active', bg: '$successBackground', color: '$success' }
    }
  }

  const statusInfo = getStatusInfo(job.status)

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
        {previewImage ? (
          <Image
            source={{ uri: previewImage }}
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
            {isVideoAttachment ? (
              <Play
                size={32}
                color="$primary"
              />
            ) : (
              <Briefcase
                size={40}
                color="$primary"
              />
            )}
          </YStack>
        )}

        {isVideoAttachment && previewImage && (
          <View
            position="absolute"
            top={0}
            left={0}
            right={0}
            height={140}
            alignItems="center"
            justifyContent="center"
          >
            <View
              bg="rgba(0, 0, 0, 0.45)"
              borderRadius="$full"
              p="$2"
            >
              <Play
                size={22}
                color="white"
                fill="white"
              />
            </View>
          </View>
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
              bg={statusInfo.bg as any}
              px="$sm"
              py={4}
              borderRadius="$full"
              alignItems="center"
              gap="$xs"
            >
              <Clock
                size={12}
                color={statusInfo.color as any}
              />
              <Text
                fontSize={11}
                fontWeight="600"
                color={statusInfo.color as any}
                textTransform="uppercase"
              >
                {statusInfo.label}
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

          {/* Task Progress */}
          {job.task_progress && job.task_progress.total > 0 && (
            <XStack
              alignItems="center"
              gap="$xs"
            >
              <View
                flex={1}
                height={4}
                bg="$borderColor"
                borderRadius="$full"
                overflow="hidden"
              >
                <View
                  width={`${job.task_progress.percentage}%`}
                  height="100%"
                  bg="$primary"
                  borderRadius="$full"
                />
              </View>
              <Text
                fontSize="$1"
                color="$colorSubtle"
              >
                {job.task_progress.completed}/{job.task_progress.total}
              </Text>
            </XStack>
          )}

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
  const { tab } = useLocalSearchParams<{ tab?: string }>()
  const [activeTab, setActiveTab] = useState<TabType>('applicants')
  const [refreshing, setRefreshing] = useState(false)

  // Set initial tab from query param
  useEffect(() => {
    if (tab === 'offers' || tab === 'active' || tab === 'applicants') {
      setActiveTab(tab)
    }
  }, [tab])

  // Fetch pending/all applications for "Job Applicants" tab
  const {
    data: applicationsData,
    isLoading: applicationsLoading,
    error: applicationsError,
    fetchNextPage: fetchMoreApplications,
    hasNextPage: hasMoreApplications,
    isFetchingNextPage: isFetchingMoreApplications,
    refetch: refetchApplications,
  } = useHandymanApplications()

  // Fetch approved applications for "Active Jobs" tab
  const {
    data: activeJobsData,
    isLoading: activeJobsLoading,
    error: activeJobsError,
    fetchNextPage: fetchMoreActiveJobs,
    hasNextPage: hasMoreActiveJobs,
    isFetchingNextPage: isFetchingMoreActiveJobs,
    refetch: refetchActiveJobs,
  } = useHandymanAssignedJobs()

  // Fetch direct offers for "Direct Offers" tab
  const {
    data: offersData,
    isLoading: offersLoading,
    error: offersError,
    fetchNextPage: fetchMoreOffers,
    hasNextPage: hasMoreOffers,
    isFetchingNextPage: isFetchingMoreOffers,
    refetch: refetchOffers,
  } = useHandymanDirectOffers()

  // Get pending offers count for tab badge
  const { data: pendingOffersCount = 0, refetch: refetchPendingCount } =
    useHandymanPendingOffersCount()

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      if (activeTab === 'applicants') {
        await refetchApplications()
      } else if (activeTab === 'active') {
        await refetchActiveJobs()
      } else {
        await Promise.all([refetchOffers(), refetchPendingCount()])
      }
    } finally {
      setRefreshing(false)
    }
  }, [activeTab, refetchApplications, refetchActiveJobs, refetchOffers, refetchPendingCount])

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

  const offers = useMemo(() => {
    return offersData?.pages.flatMap((page) => page.results) || []
  }, [offersData])

  const handleApplicationPress = (application: JobApplication) => {
    router.push({
      pathname: '/(handyman)/my-jobs/[id]',
      params: {
        id: application.public_id,
        jobId: application.job.public_id,
      },
    } as any)
  }

  const handleActiveJobPress = (job: HandymanAssignedJob) => {
    router.push({
      pathname: '/(handyman)/jobs/ongoing/[id]',
      params: {
        id: job.public_id,
      },
    } as any)
  }

  const handleOfferPress = (offerId: string) => {
    router.push({
      pathname: '/(handyman)/direct-offers/[id]',
      params: { id: offerId },
    } as any)
  }

  const isLoading =
    activeTab === 'applicants'
      ? applicationsLoading
      : activeTab === 'active'
        ? activeJobsLoading
        : offersLoading
  const error =
    activeTab === 'applicants'
      ? applicationsError
      : activeTab === 'active'
        ? activeJobsError
        : offersError

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
              fontSize="$3"
              fontWeight={activeTab === 'applicants' ? '600' : '500'}
              color={activeTab === 'applicants' ? '$primary' : '$colorSubtle'}
              textAlign="center"
            >
              Applications
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
              fontSize="$3"
              fontWeight={activeTab === 'active' ? '600' : '500'}
              color={activeTab === 'active' ? '$primary' : '$colorSubtle'}
              textAlign="center"
            >
              Active Jobs
            </Text>
          </Button>
          <Button
            unstyled
            flex={1}
            pb="$md"
            borderBottomWidth={3}
            borderBottomColor={activeTab === 'offers' ? '$primary' : 'transparent'}
            marginBottom={-1}
            onPress={() => setActiveTab('offers')}
          >
            <XStack
              alignItems="center"
              justifyContent="center"
              gap="$xs"
            >
              <Text
                fontSize="$3"
                fontWeight={activeTab === 'offers' ? '600' : '500'}
                color={activeTab === 'offers' ? '$primary' : '$colorSubtle'}
                textAlign="center"
              >
                Offers
              </Text>
              {pendingOffersCount > 0 && (
                <View
                  bg="$primary"
                  borderRadius="$full"
                  minWidth={18}
                  height={18}
                  alignItems="center"
                  justifyContent="center"
                  px={5}
                >
                  <Text
                    fontSize={10}
                    fontWeight="700"
                    color="white"
                  >
                    {pendingOffersCount}
                  </Text>
                </View>
              )}
            </XStack>
          </Button>
        </XStack>

        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0C9A5C"
              colors={['#0C9A5C']}
            />
          }
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
                    : activeTab === 'active'
                      ? 'Loading active jobs...'
                      : 'Loading offers...'}
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
                  Failed to load{' '}
                  {activeTab === 'applicants'
                    ? 'applications'
                    : activeTab === 'active'
                      ? 'jobs'
                      : 'offers'}
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
            activeTab === 'active' ? (
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
                  {activeJobs.map((job) => (
                    <ActiveJobCard
                      key={job.public_id}
                      job={job}
                      onPress={() => handleActiveJobPress(job)}
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
              )
            ) : // Direct Offers Tab Content
            offers.length === 0 ? (
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
                  No Direct Offers
                </Text>
                <Text
                  color="$colorSubtle"
                  fontSize="$3"
                  textAlign="center"
                >
                  When homeowners send you private job offers, they'll appear here.
                </Text>
              </YStack>
            ) : (
              <YStack gap="$md">
                {offers.map((offer) => (
                  <DirectOfferCard
                    key={offer.public_id}
                    offer={offer}
                    variant="handyman"
                    onPress={() => handleOfferPress(offer.public_id)}
                  />
                ))}

                {/* Load More Button */}
                {hasMoreOffers && (
                  <Button
                    onPress={() => fetchMoreOffers()}
                    disabled={isFetchingMoreOffers}
                    bg="rgba(255,255,255,0.7)"
                    borderRadius="$md"
                    py="$sm"
                    mt="$sm"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    {isFetchingMoreOffers ? (
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
                        Load more offers
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
