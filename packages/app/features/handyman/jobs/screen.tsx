'use client'

import { useState, useMemo, useEffect, useCallback, memo } from 'react'
import { RefreshControl, FlatList } from 'react-native'
import { YStack, XStack, Text, Button, Spinner, View, Image, PageHeader } from '@my/ui'
import { GradientBackground, DirectOfferCard } from '@my/ui'
import { PAGE_DESCRIPTIONS } from 'app/constants/page-descriptions'
import {
  useHandymanApplications,
  useHandymanDirectOffers,
  useHandymanPendingOffersCount,
  useHandymanAssignedJobs,
} from '@my/api'
import { Briefcase, MapPin, ChevronRight, Clock, Play, User } from '@tamagui/lucide-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { useToastFromParams } from 'app/hooks/useToastFromParams'
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

// Memoized ApplicationCard to prevent unnecessary re-renders
interface ApplicationCardProps {
  application: JobApplication
  onPress: () => void
}

const ApplicationCard = memo(function ApplicationCard({
  application,
  onPress,
}: ApplicationCardProps) {
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
})

// Memoized ActiveJobCard to prevent unnecessary re-renders
interface ActiveJobCardProps {
  job: HandymanAssignedJob
  onPress: () => void
}

const ActiveJobCard = memo(function ActiveJobCard({ job, onPress }: ActiveJobCardProps) {
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
    <YStack
      bg="$backgroundStrong"
      borderRadius="$md"
      overflow="hidden"
      p="$md"
      gap="$sm"
      onPress={onPress}
      pressStyle={{ opacity: 0.8 }}
      cursor="pointer"
    >
      {/* Header: Status Badge */}
      <XStack
        justifyContent="space-between"
        alignItems="center"
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
      </XStack>

      {/* Title */}
      <Text
        fontSize="$4"
        fontWeight="600"
        color="$color"
        numberOfLines={2}
      >
        {job.title}
      </Text>

      {/* Category */}
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

      {/* Budget */}
      <XStack
        alignItems="center"
        gap={4}
      >
        <Text
          fontSize="$3"
          fontWeight="600"
          color="$primary"
        >
          ${job.estimated_budget.toLocaleString()}
        </Text>
      </XStack>

      {/* Task Progress Section */}
      {job.task_progress && job.task_progress.total > 0 && (
        <YStack gap="$xs">
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
          </XStack>
          <Text
            fontSize="$1"
            color="$colorSubtle"
          >
            {job.task_progress.completed}/{job.task_progress.total} tasks completed
          </Text>
        </YStack>
      )}

      {/* Homeowner Section */}
      {job.homeowner && (
        <XStack
          alignItems="center"
          gap="$sm"
          pt="$sm"
          borderTopWidth={1}
          borderTopColor="$borderColor"
        >
          {job.homeowner.avatar_url ? (
            <Image
              source={{ uri: job.homeowner.avatar_url }}
              width={32}
              height={32}
              borderRadius={16}
            />
          ) : (
            <View
              width={32}
              height={32}
              borderRadius={16}
              bg="$backgroundMuted"
              alignItems="center"
              justifyContent="center"
            >
              <User
                size={16}
                color="$colorMuted"
              />
            </View>
          )}
          <YStack
            flex={1}
            gap={2}
          >
            <XStack
              alignItems="center"
              gap={4}
            >
              <Text
                fontSize={10}
                color="$colorMuted"
              >
                Homeowner:
              </Text>
              <Text
                fontSize="$2"
                fontWeight="500"
                color="$color"
                numberOfLines={1}
              >
                {job.homeowner.display_name || 'Homeowner'}
              </Text>
            </XStack>
            {job.homeowner.rating && job.homeowner.rating > 0 && (
              <XStack
                alignItems="center"
                gap={4}
              >
                <Text
                  fontSize={11}
                  color="$accent"
                >
                  ★
                </Text>
                <Text
                  fontSize={10}
                  color="$colorSubtle"
                >
                  {job.homeowner.rating.toFixed(1)} ({job.homeowner.review_count} reviews)
                </Text>
              </XStack>
            )}
          </YStack>
        </XStack>
      )}
    </YStack>
  )
})

// Empty state components
const EmptyApplicationsState = memo(function EmptyApplicationsState({
  onExplore,
}: { onExplore: () => void }) {
  return (
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
        onPress={onExplore}
      >
        <Text
          color="white"
          fontWeight="600"
        >
          Explore Jobs
        </Text>
      </Button>
    </YStack>
  )
})

const EmptyActiveJobsState = memo(function EmptyActiveJobsState() {
  return (
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
        Jobs you've been approved for will appear here. Keep applying to find your next opportunity!
      </Text>
    </YStack>
  )
})

const EmptyOffersState = memo(function EmptyOffersState() {
  return (
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
  )
})

// Loading skeleton component
const LoadingSkeleton = memo(function LoadingSkeleton({ message }: { message: string }) {
  return (
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
        {message}
      </Text>
    </YStack>
  )
})

// Error state component
const ErrorState = memo(function ErrorState({ message }: { message: string }) {
  return (
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
        Failed to load {message}
      </Text>
      <Text
        color="$colorSubtle"
        fontSize="$2"
        textAlign="center"
      >
        Please try again later
      </Text>
    </YStack>
  )
})

// Load more button component
const LoadMoreButton = memo(function LoadMoreButton({
  onPress,
  isLoading,
  label,
}: {
  onPress: () => void
  isLoading: boolean
  label: string
}) {
  return (
    <Button
      onPress={onPress}
      disabled={isLoading}
      bg="rgba(255,255,255,0.7)"
      borderRadius="$md"
      py="$sm"
      mt="$sm"
      borderWidth={1}
      borderColor="$borderColor"
    >
      {isLoading ? (
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
          {label}
        </Text>
      )}
    </Button>
  )
})

export function HandymanJobsScreen() {
  useToastFromParams()
  const router = useRouter()
  const insets = useSafeArea()
  const { tab } = useLocalSearchParams<{ tab?: string }>()
  const [activeTab, setActiveTab] = useState<TabType>('applicants')
  const [refreshing, setRefreshing] = useState(false)

  // Track which tabs have been loaded to enable lazy loading
  const [loadedTabs, setLoadedTabs] = useState<Set<TabType>>(new Set(['applicants']))

  // Set initial tab from query param
  useEffect(() => {
    if (tab === 'offers' || tab === 'active' || tab === 'applicants') {
      setActiveTab(tab)
      setLoadedTabs((prev) => new Set([...prev, tab]))
    }
  }, [tab])

  // Handle tab change with lazy loading
  const handleTabChange = useCallback((newTab: TabType) => {
    setActiveTab(newTab)
    setLoadedTabs((prev) => new Set([...prev, newTab]))
  }, [])

  // Fetch pending/all applications for "Job Applicants" tab - LAZY LOADED
  const {
    data: applicationsData,
    isLoading: applicationsLoading,
    error: applicationsError,
    fetchNextPage: fetchMoreApplications,
    hasNextPage: hasMoreApplications,
    isFetchingNextPage: isFetchingMoreApplications,
    refetch: refetchApplications,
  } = useHandymanApplications({}, { enabled: loadedTabs.has('applicants') })

  // Fetch approved applications for "Active Jobs" tab - LAZY LOADED
  const {
    data: activeJobsData,
    isLoading: activeJobsLoading,
    error: activeJobsError,
    fetchNextPage: fetchMoreActiveJobs,
    hasNextPage: hasMoreActiveJobs,
    isFetchingNextPage: isFetchingMoreActiveJobs,
    refetch: refetchActiveJobs,
  } = useHandymanAssignedJobs({}, { enabled: loadedTabs.has('active') })

  // Fetch direct offers for "Direct Offers" tab - LAZY LOADED
  const {
    data: offersData,
    isLoading: offersLoading,
    error: offersError,
    fetchNextPage: fetchMoreOffers,
    hasNextPage: hasMoreOffers,
    isFetchingNextPage: isFetchingMoreOffers,
    refetch: refetchOffers,
  } = useHandymanDirectOffers({}, { enabled: loadedTabs.has('offers') })

  // Get pending offers count for tab badge - always fetch but with delay
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

  // Flatten paginated data - only compute for loaded tabs
  const allApplications = useMemo(() => {
    if (!loadedTabs.has('applicants')) return []
    return applicationsData?.pages.flatMap((page) => page.results) || []
  }, [applicationsData, loadedTabs])

  // Filter to show only non-approved applications in Job Applicants tab
  const pendingApplications = useMemo(() => {
    return allApplications.filter((app) => app.status !== 'approved')
  }, [allApplications])

  const activeJobs = useMemo(() => {
    if (!loadedTabs.has('active')) return []
    return activeJobsData?.pages.flatMap((page) => page.results) || []
  }, [activeJobsData, loadedTabs])

  const offers = useMemo(() => {
    if (!loadedTabs.has('offers')) return []
    return offersData?.pages.flatMap((page) => page.results) || []
  }, [offersData, loadedTabs])

  // Memoized event handlers
  const handleApplicationPress = useCallback(
    (application: JobApplication) => {
      router.push({
        pathname: '/(handyman)/my-jobs/[id]',
        params: {
          id: application.public_id,
          jobId: application.job.public_id,
        },
      } as any)
    },
    [router]
  )

  const handleActiveJobPress = useCallback(
    (job: HandymanAssignedJob) => {
      router.push({
        pathname: '/(handyman)/jobs/ongoing/[id]',
        params: {
          id: job.public_id,
        },
      } as any)
    },
    [router]
  )

  const handleOfferPress = useCallback(
    (offerId: string) => {
      router.push({
        pathname: '/(handyman)/direct-offers/[id]',
        params: { id: offerId },
      } as any)
    },
    [router]
  )

  const handleExplorePress = useCallback(() => {
    router.push('/(handyman)/')
  }, [router])

  // Get current tab state
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

  // FlatList render item functions
  const renderApplicationItem = useCallback(
    ({ item }: { item: JobApplication }) => (
      <ApplicationCard
        application={item}
        onPress={() => handleApplicationPress(item)}
      />
    ),
    [handleApplicationPress]
  )

  const renderActiveJobItem = useCallback(
    ({ item }: { item: HandymanAssignedJob }) => (
      <ActiveJobCard
        job={item}
        onPress={() => handleActiveJobPress(item)}
      />
    ),
    [handleActiveJobPress]
  )

  const renderOfferItem = useCallback(
    ({ item }: { item: any }) => (
      <DirectOfferCard
        offer={item}
        variant="handyman"
        onPress={() => handleOfferPress(item.public_id)}
      />
    ),
    [handleOfferPress]
  )

  const keyExtractor = useCallback((item: any) => item.public_id, [])

  // Get current data and config based on active tab
  const getCurrentTabConfig = () => {
    switch (activeTab) {
      case 'applicants':
        return {
          data: pendingApplications,
          isLoading: applicationsLoading,
          error: applicationsError,
          emptyComponent: <EmptyApplicationsState onExplore={handleExplorePress} />,
          hasMore: hasMoreApplications,
          fetchMore: fetchMoreApplications,
          isFetchingMore: isFetchingMoreApplications,
          loadMoreLabel: 'Load more applications',
          loadingMessage: 'Loading applications...',
          errorMessage: 'applications',
          renderItem: renderApplicationItem,
        }
      case 'active':
        return {
          data: activeJobs,
          isLoading: activeJobsLoading,
          error: activeJobsError,
          emptyComponent: <EmptyActiveJobsState />,
          hasMore: hasMoreActiveJobs,
          fetchMore: fetchMoreActiveJobs,
          isFetchingMore: isFetchingMoreActiveJobs,
          loadMoreLabel: 'Load more jobs',
          loadingMessage: 'Loading active jobs...',
          errorMessage: 'jobs',
          renderItem: renderActiveJobItem,
        }
      case 'offers':
        return {
          data: offers,
          isLoading: offersLoading,
          error: offersError,
          emptyComponent: <EmptyOffersState />,
          hasMore: hasMoreOffers,
          fetchMore: fetchMoreOffers,
          isFetchingMore: isFetchingMoreOffers,
          loadMoreLabel: 'Load more offers',
          loadingMessage: 'Loading offers...',
          errorMessage: 'offers',
          renderItem: renderOfferItem,
        }
    }
  }

  const currentConfig = getCurrentTabConfig()

  return (
    <GradientBackground>
      <YStack
        flex={1}
        pt={insets.top}
      >
        <PageHeader
          title="My Jobs"
          description={PAGE_DESCRIPTIONS['find-jobs']}
        />

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
            onPress={() => handleTabChange('applicants')}
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
            onPress={() => handleTabChange('active')}
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
            onPress={() => handleTabChange('offers')}
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

        {/* Content with FlatList for virtualization */}
        {currentConfig.isLoading ? (
          <YStack
            flex={1}
            px="$lg"
            py="$lg"
          >
            <LoadingSkeleton message={currentConfig.loadingMessage} />
          </YStack>
        ) : currentConfig.error ? (
          <YStack
            flex={1}
            px="$lg"
            py="$lg"
          >
            <ErrorState message={currentConfig.errorMessage} />
          </YStack>
        ) : currentConfig.data.length === 0 ? (
          <YStack
            flex={1}
            px="$lg"
            py="$lg"
          >
            {currentConfig.emptyComponent}
          </YStack>
        ) : (
          <FlatList
            data={currentConfig.data as any[]}
            renderItem={currentConfig.renderItem as any}
            keyExtractor={keyExtractor}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={true}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#0C9A5C"
                colors={['#0C9A5C']}
              />
            }
            ListFooterComponent={
              currentConfig.hasMore ? (
                <LoadMoreButton
                  onPress={currentConfig.fetchMore}
                  isLoading={currentConfig.isFetchingMore}
                  label={currentConfig.loadMoreLabel}
                />
              ) : null
            }
          />
        )}
      </YStack>
    </GradientBackground>
  )
}
