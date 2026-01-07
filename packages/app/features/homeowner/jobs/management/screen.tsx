'use client'

import { useState, useMemo, useCallback } from 'react'
import { YStack, XStack, ScrollView, Text, Button, Spinner, View, Image } from '@my/ui'
import { GradientBackground, SearchBar } from '@my/ui'
import { useHomeownerJobs, useHomeownerApplications } from '@my/api'
import type { HomeownerJob, HomeownerApplication, HomeownerJobStatus } from '@my/api'
import {
  ArrowLeft,
  Briefcase,
  ChevronDown,
  ChevronUp,
  MapPin,
  Star,
  Users,
  Filter,
  Eye,
} from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { jobStatusColors, type JobStatus, applicationStatusColors, type ApplicationStatus } from '@my/config'

const statusLabels: Record<HomeownerJobStatus, string> = {
  draft: 'Draft',
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  pending_completion: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

interface ApplicantCardProps {
  application: HomeownerApplication
  onPress: () => void
}

function ApplicantCard({ application, onPress }: ApplicantCardProps) {
  const handyman = application.handyman_profile
  const statusStyle = applicationStatusColors[application.status as ApplicationStatus] || applicationStatusColors.pending

  return (
    <Button
      unstyled
      onPress={onPress}
      bg="rgba(255,255,255,0.95)"
      borderRadius={12}
      p="$sm"
      borderWidth={1}
      borderColor="rgba(0,0,0,0.05)"
      pressStyle={{ opacity: 0.8, scale: 0.98 }}
      animation="quick"
    >
      <XStack gap="$sm" alignItems="center">
        {/* Avatar */}
        <View
          width={44}
          height={44}
          borderRadius={22}
          bg="$backgroundMuted"
          overflow="hidden"
          alignItems="center"
          justifyContent="center"
        >
          {handyman.avatar_url ? (
            <Image
              source={{ uri: handyman.avatar_url }}
              width={44}
              height={44}
              resizeMode="cover"
            />
          ) : (
            <Text fontSize="$4" fontWeight="600" color="$colorMuted">
              {handyman.display_name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        {/* Info */}
        <YStack flex={1} gap={2}>
          <Text fontSize="$3" fontWeight="600" color="$color" numberOfLines={1}>
            {handyman.display_name}
          </Text>
          {handyman.job_title && (
            <Text fontSize="$2" color="$colorSubtle" numberOfLines={1}>
              {handyman.job_title}
            </Text>
          )}
          <XStack alignItems="center" gap="$xs">
            <Star size={12} color="$warning" fill="$warning" />
            <Text fontSize="$2" color="$colorSubtle">
              {handyman.rating?.toFixed(1) || 'N/A'}
            </Text>
            {handyman.hourly_rate && (
              <>
                <Text fontSize="$2" color="$colorMuted">•</Text>
                <Text fontSize="$2" color="$primary" fontWeight="500">
                  ${handyman.hourly_rate}/hr
                </Text>
              </>
            )}
          </XStack>
        </YStack>

        {/* Status Badge */}
        <XStack
          bg={statusStyle.bg as any}
          px="$xs"
          py={3}
          borderRadius="$full"
        >
          <Text
            fontSize={10}
            fontWeight="600"
            color={statusStyle.text as any}
            textTransform="uppercase"
          >
            {statusStyle.label}
          </Text>
        </XStack>
      </XStack>
    </Button>
  )
}

interface ExpandableJobCardProps {
  job: HomeownerJob
  isExpanded: boolean
  onToggle: () => void
  onApplicationPress: (applicationId: string) => void
}

function ExpandableJobCard({ job, isExpanded, onToggle, onApplicationPress }: ExpandableJobCardProps) {
  const router = useRouter()
  const statusStyle = jobStatusColors[job.status as JobStatus] || jobStatusColors.draft
  const jobImage = job.images?.[0]?.image

  // Fetch applications for this job when expanded
  const {
    data: applicationsData,
    isLoading: applicationsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useHomeownerApplications({ job_id: isExpanded ? job.public_id : undefined })

  const applications = useMemo(() => {
    if (!isExpanded) return []
    return applicationsData?.pages.flatMap((page) => page.results) || []
  }, [applicationsData, isExpanded])

  return (
    <YStack
      bg="rgba(255,255,255,0.9)"
      borderRadius={16}
      overflow="hidden"
      borderWidth={isExpanded ? 2 : 1}
      borderColor={isExpanded ? '$primary' : 'rgba(255,255,255,0.5)'}
      animation="quick"
    >
      {/* Job Header - Clickable to expand */}
      <Button
        unstyled
        onPress={onToggle}
        p="$md"
        pressStyle={{ opacity: 0.9 }}
      >
        <XStack gap="$md" alignItems="flex-start">
          {/* Job Image */}
          <View
            width={80}
            height={80}
            borderRadius={12}
            bg="$backgroundMuted"
            overflow="hidden"
          >
            {jobImage ? (
              <Image
                source={{ uri: jobImage }}
                width={80}
                height={80}
                resizeMode="cover"
              />
            ) : (
              <YStack flex={1} alignItems="center" justifyContent="center">
                <Briefcase size={24} color="$colorMuted" />
              </YStack>
            )}
          </View>

          {/* Job Info */}
          <YStack flex={1} gap="$xs">
            <Text fontSize="$4" fontWeight="600" color="$color" numberOfLines={2}>
              {job.title}
            </Text>
            
            {job.city && (
              <XStack alignItems="center" gap="$xs">
                <MapPin size={12} color="$colorSubtle" />
                <Text fontSize="$2" color="$colorSubtle">
                  {job.city.name}
                </Text>
              </XStack>
            )}

            <XStack justifyContent="space-between" alignItems="center" mt="$xs">
              <Text fontSize="$3" fontWeight="bold" color="$primary">
                {'$'}{job.estimated_budget}
              </Text>
              <XStack gap="$xs" alignItems="center">
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
                    {statusLabels[job.status] || job.status}
                  </Text>
                </XStack>
                <Button
                  unstyled
                  onPress={(e) => {
                    e.stopPropagation()
                    router.push(`/(homeowner)/jobs/${job.public_id}`)
                  }}
                  bg="rgba(0,0,0,0.05)"
                  borderRadius="$full"
                  px="$sm"
                  py={4}
                  pressStyle={{ opacity: 0.7 }}
                >
                  <XStack gap="$xs" alignItems="center">
                    <Eye size={12} color="$colorSubtle" />
                    <Text fontSize={11} fontWeight="600" color="$colorSubtle">
                      DETAILS
                    </Text>
                  </XStack>
                </Button>
              </XStack>
            </XStack>
          </YStack>
        </XStack>

        {/* Expand indicator */}
        <XStack
          mt="$sm"
          pt="$sm"
          borderTopWidth={1}
          borderTopColor="rgba(0,0,0,0.05)"
          alignItems="center"
          justifyContent="center"
          gap="$xs"
        >
          <Users size={14} color="$primary" />
          <Text fontSize="$2" color="$primary" fontWeight="500">
            {job.applicant_count || 0} {job.applicant_count === 1 ? 'Applicant' : 'Applicants'}
          </Text>
          {isExpanded ? (
            <ChevronUp size={16} color="$primary" />
          ) : (
            <ChevronDown size={16} color="$primary" />
          )}
        </XStack>
      </Button>

      {/* Expanded Applications List */}
      {isExpanded && (
        <YStack
          px="$md"
          pb="$md"
          gap="$sm"
          bg="rgba(12,154,92,0.03)"
          borderTopWidth={1}
          borderTopColor="rgba(12,154,92,0.1)"
        >
          {applicationsLoading ? (
            <YStack py="$md" alignItems="center">
              <Spinner size="small" color="$primary" />
              <Text fontSize="$2" color="$colorSubtle" mt="$xs">
                Loading applicants...
              </Text>
            </YStack>
          ) : applications.length === 0 ? (
            <YStack py="$md" alignItems="center">
              <Users size={24} color="$colorMuted" />
              <Text fontSize="$3" color="$colorSubtle" mt="$xs">
                No applications yet
              </Text>
            </YStack>
          ) : (
            <>
              {applications.map((application) => (
                <ApplicantCard
                  key={application.public_id}
                  application={application}
                  onPress={() => onApplicationPress(application.public_id)}
                />
              ))}

              {/* Load More Applications */}
              {hasNextPage && (
                <Button
                  onPress={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  bg="rgba(255,255,255,0.8)"
                  borderRadius="$md"
                  py="$xs"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  {isFetchingNextPage ? (
                    <XStack alignItems="center" gap="$xs">
                      <Spinner size="small" color="$primary" />
                      <Text fontSize="$2" color="$colorSubtle">Loading...</Text>
                    </XStack>
                  ) : (
                    <Text fontSize="$2" color="$primary" fontWeight="500">
                      Load more applicants
                    </Text>
                  )}
                </Button>
              )}
            </>
          )}
        </YStack>
      )}
    </YStack>
  )
}

export function JobManagementScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)

  // Fetch jobs with filters
  const {
    data: jobsData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useHomeownerJobs({
    search: searchQuery || undefined,
    status: statusFilter || undefined,
  })

  // Flatten paginated data
  const jobs = useMemo(() => {
    return jobsData?.pages.flatMap((page) => page.results) || []
  }, [jobsData])

  const handleToggleJob = useCallback((jobId: string) => {
    setExpandedJobId((prev) => (prev === jobId ? null : jobId))
  }, [])

  const handleApplicationPress = useCallback((applicationId: string) => {
    router.push({
      pathname: '/(homeowner)/jobs/applications/[id]',
      params: { id: applicationId },
    } as any)
  }, [router])

  const selectedStatusLabel = statusOptions.find((s) => s.value === statusFilter)?.label || 'All Status'

  return (
    <GradientBackground>
      <YStack flex={1} pt={insets.top}>
        {/* Header */}
        <XStack
          px="$lg"
          py="$md"
          alignItems="center"
          gap="$md"
        >
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
            Job Management
          </Text>
          <View width={38} />
        </XStack>

        {/* Search and Filter */}
        <XStack px="$lg" pb="$md" gap="$sm" alignItems="center">
          <View flex={1}>
            <SearchBar
              placeholder="Search jobs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          {/* Status Filter Dropdown */}
          <Button
            onPress={() => setShowStatusDropdown(!showStatusDropdown)}
            bg="rgba(255,255,255,0.9)"
            borderRadius="$md"
            px="$sm"
            py="$sm"
            borderWidth={1}
            borderColor="rgba(0,0,0,0.1)"
            pressStyle={{ opacity: 0.8 }}
          >
            <XStack alignItems="center" gap="$xs">
              <Filter size={16} color="$colorSubtle" />
              <ChevronDown size={14} color="$colorSubtle" />
            </XStack>
          </Button>
        </XStack>

        {/* Status Dropdown */}
        {showStatusDropdown && (
          <YStack
            position="absolute"
            top={insets.top + 110}
            right={16}
            bg="$backgroundStrong"
            borderRadius={12}
            borderWidth={1}
            borderColor="$borderColor"
            overflow="hidden"
            zIndex={100}
            elevation={5}
            shadowColor="$shadowColor"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.15}
            shadowRadius={8}
          >
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                unstyled
                onPress={() => {
                  setStatusFilter(option.value)
                  setShowStatusDropdown(false)
                }}
                px="$md"
                py="$sm"
                bg={statusFilter === option.value ? '$primary' : 'transparent'}
                pressStyle={{ bg: '$backgroundMuted' }}
              >
                <Text
                  fontSize="$3"
                  color={statusFilter === option.value ? 'white' : '$color'}
                  fontWeight={statusFilter === option.value ? '600' : '400'}
                >
                  {option.label}
                </Text>
              </Button>
            ))}
          </YStack>
        )}

        {/* Content */}
        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
        >
          <YStack px="$lg" pb="$xl" gap="$md">
            {/* Section Header */}
            <YStack gap="$xs" mb="$xs" py="$xl">
              <Text fontSize="$6" fontWeight="bold" color="$color">
                Your Jobs
              </Text>
              <Text fontSize="$3" color="$colorSubtle">
                Manage your job listings and review applicants
              </Text>
            </YStack>

            {/* Filter indicator */}
            {statusFilter && (
              <XStack alignItems="center" gap="$xs">
                <Text fontSize="$2" color="$colorSubtle">Filtering by:</Text>
                <Button
                  unstyled
                  onPress={() => setStatusFilter('')}
                  bg="$primary"
                  px="$sm"
                  py={4}
                  borderRadius="$full"
                  pressStyle={{ opacity: 0.8 }}
                >
                  <XStack alignItems="center" gap="$xs">
                    <Text fontSize="$2" color="white" fontWeight="500">
                      {selectedStatusLabel}
                    </Text>
                    <Text fontSize="$2" color="white">×</Text>
                  </XStack>
                </Button>
              </XStack>
            )}

            {/* Loading State */}
            {isLoading ? (
              <YStack py="$xl" alignItems="center" gap="$md">
                <Spinner size="large" color="$primary" />
                <Text color="$colorSubtle" fontSize="$3">
                  Loading your jobs...
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
                <Briefcase size={40} color="$error" />
                <Text color="$error" fontSize="$4" fontWeight="500">
                  Failed to load jobs
                </Text>
                <Text color="$colorSubtle" fontSize="$2" textAlign="center">
                  Please try again later
                </Text>
              </YStack>
            ) : jobs.length === 0 ? (
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
                  <Briefcase size={36} color="$primary" />
                </YStack>
                <Text color="$color" fontSize="$5" fontWeight="600">
                  {statusFilter || searchQuery ? 'No Jobs Found' : 'No Jobs Yet'}
                </Text>
                <Text color="$colorSubtle" fontSize="$3" textAlign="center">
                  {statusFilter || searchQuery
                    ? 'Try adjusting your filters or search query.'
                    : 'Post your first job to start receiving applications from skilled handymen.'}
                </Text>
                {!statusFilter && !searchQuery && (
                  <Button
                    mt="$sm"
                    bg="$primary"
                    color="white"
                    borderRadius="$lg"
                    px="$xl"
                    onPress={() => router.push('/(homeowner)/jobs/add')}
                  >
                    <Text color="white" fontWeight="600">
                      Post a Job
                    </Text>
                  </Button>
                )}
              </YStack>
            ) : (
              <YStack gap="$md">
                {jobs.map((job) => (
                  <ExpandableJobCard
                    key={job.public_id}
                    job={job}
                    isExpanded={expandedJobId === job.public_id}
                    onToggle={() => handleToggleJob(job.public_id)}
                    onApplicationPress={handleApplicationPress}
                  />
                ))}

                {/* Load More Jobs */}
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
                      <XStack alignItems="center" gap="$sm">
                        <Spinner size="small" color="$primary" />
                        <Text color="$colorSubtle" fontSize="$3">Loading...</Text>
                      </XStack>
                    ) : (
                      <Text color="$primary" fontSize="$3" fontWeight="500">
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
