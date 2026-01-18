'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import * as Location from 'expo-location'
import { YStack, XStack, ScrollView, Text, Button, Spinner, View } from '@my/ui'
import {
  useHomeownerJobs,
  useNearbyHandymen,
  useAuthStore,
  useHomeownerProfile,
  useTotalUnreadCount,
} from '@my/api'
import type { HomeownerJobStatus } from '@my/api'
import { SearchBar, JobCard, HandymanCard, GradientBackground, WelcomeHeader } from '@my/ui'
import { Menu, Bookmark, MessageCircle, Plus, Briefcase, Users } from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { Alert } from 'react-native'
import { jobStatusColors, type JobStatus } from '@my/config'
import { useDebounce } from 'app/hooks'

const statusLabels: Record<HomeownerJobStatus, string> = {
  draft: 'Draft',
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  pending_completion: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

// Message button with unread badge
function MessageBadgeButton({
  chatRole,
  onPress,
}: { chatRole: 'homeowner' | 'handyman'; onPress: () => void }) {
  const { data: unreadCount } = useTotalUnreadCount(chatRole)
  const hasUnread = (unreadCount ?? 0) > 0

  return (
    <Button
      unstyled
      onPress={onPress}
      position="relative"
    >
      <MessageCircle
        size={20}
        color="$color"
      />
      {hasUnread && (
        <View
          position="absolute"
          top={-4}
          right={-4}
          bg="$primary"
          minWidth={16}
          height={16}
          borderRadius={8}
          alignItems="center"
          justifyContent="center"
          borderWidth={2}
          borderColor="white"
        >
          <Text
            fontSize={9}
            fontWeight="700"
            color="white"
          >
            {(unreadCount ?? 0) > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </Button>
  )
}

export function HomeownerHomeScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const user = useAuthStore((state) => state.user)
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Debounce search query for handymen API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 400)

  // Request location permission and get current location
  useEffect(() => {
    async function getLocation() {
      try {
        const enabled = await Location.hasServicesEnabledAsync()
        if (!enabled) {
          setLocationError('Location services are disabled')
          return
        }

        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          setLocationError('Location permission denied')
          return
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })

        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        })
      } catch (error) {
        console.error('Error getting location:', error)
        setLocationError('Failed to get location')
      }
    }

    getLocation()
  }, [])

  // Fetch homeowner's jobs
  const {
    data: jobsData,
    isLoading: jobsLoading,
    error: jobsError,
    fetchNextPage: fetchNextJobs,
    hasNextPage: hasMoreJobs,
    isFetchingNextPage: isFetchingMoreJobs,
  } = useHomeownerJobs({
    search: searchQuery || undefined,
  })

  // Fetch nearby handymen
  const {
    data: handymenData,
    isLoading: handymenLoading,
    error: handymenError,
    fetchNextPage: fetchNextHandymen,
    hasNextPage: hasMoreHandymen,
    isFetchingNextPage: isFetchingMoreHandymen,
  } = useNearbyHandymen({
    search: debouncedSearchQuery || undefined,
    latitude: location?.latitude,
    longitude: location?.longitude,
  })

  // Flatten paginated data
  const jobs = useMemo(() => {
    return jobsData?.pages.flatMap((page) => page.results) || []
  }, [jobsData])

  const handymen = useMemo(() => {
    return handymenData?.pages.flatMap((page) => page.results) || []
  }, [handymenData])

  // Fetch profile to get display name and phone verification status
  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useHomeownerProfile()
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Homeowner'
  const [isCheckingPhone, setIsCheckingPhone] = useState(false)

  /**
   * Handle Add Job button press - check phone verification first
   */
  const handleAddJobPress = useCallback(async () => {
    setIsCheckingPhone(true)

    try {
      // Refetch profile to get latest phone verification status
      const { data: freshProfile } = await refetchProfile()

      if (freshProfile?.is_phone_verified) {
        // Phone verified, proceed to add job
        router.push('/(homeowner)/jobs/add')
      } else {
        // Phone not verified, show alert and redirect
        Alert.alert(
          'Phone Verification Required',
          'Please verify your phone number before posting a job.',
          [
            {
              text: 'Verify Now',
              onPress: () => router.push('/user/phone/send'),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        )
      }
    } catch (error) {
      console.error('Error checking phone verification:', error)
      // On error, still allow navigation but warn
      Alert.alert(
        'Could Not Verify Status',
        'Unable to check phone verification status. Would you like to verify your phone?',
        [
          {
            text: 'Verify Phone',
            onPress: () => router.push('/user/phone/send'),
          },
          {
            text: 'Try Again',
            onPress: () => router.push('/(homeowner)/jobs/add'),
          },
        ]
      )
    } finally {
      setIsCheckingPhone(false)
    }
  }, [refetchProfile, router])

  return (
    <GradientBackground>
      <YStack
        flex={1}
        pt={insets.top}
      >
        {/* Header */}
        <XStack
          px="$md"
          pt="$md"
          pb="$sm"
          gap="$sm"
          alignItems="center"
          bg="transparent"
        >
          <Button
            unstyled
            onPress={() => {
              // TODO: Open menu drawer
            }}
          >
            <Menu
              size={20}
              color="$color"
            />
          </Button>

          <SearchBar
            placeholder="Search SolutionBank"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <Button
            unstyled
            onPress={() => {
              router.push('/(homeowner)/bookmarks')
            }}
          >
            <Bookmark
              size={20}
              color="$color"
            />
          </Button>

          <MessageBadgeButton
            chatRole="homeowner"
            onPress={() => router.push('/(homeowner)/messages')}
          />
        </XStack>

        {/* Content */}
        <ScrollView flex={1}>
          <YStack
            gap="$xl"
            px="$md"
            pb="$xl"
            pt="$sm"
          >
            {/* Welcome Section */}
            <WelcomeHeader
              displayName={displayName}
              subtitle="What can we help you with today?"
            />

            {/* My Jobs Section */}
            <YStack gap="$md">
              <XStack
                justifyContent="space-between"
                alignItems="center"
              >
                <XStack
                  alignItems="center"
                  gap="$sm"
                >
                  <Briefcase
                    size={18}
                    color="$primary"
                  />
                  <Text
                    fontSize="$6"
                    fontWeight="bold"
                    color="$color"
                  >
                    My Jobs
                  </Text>
                </XStack>
                <Button
                  unstyled
                  onPress={handleAddJobPress}
                  disabled={isCheckingPhone}
                  bg="$primary"
                  borderRadius="$full"
                  width={28}
                  height={28}
                  alignItems="center"
                  justifyContent="center"
                  opacity={isCheckingPhone ? 0.6 : 1}
                >
                  {isCheckingPhone ? (
                    <Spinner
                      size="small"
                      color="white"
                    />
                  ) : (
                    <Plus
                      size={16}
                      color="white"
                    />
                  )}
                </Button>
              </XStack>

              {jobsLoading ? (
                <YStack
                  py="$lg"
                  alignItems="center"
                >
                  <Spinner
                    size="small"
                    color="$primary"
                  />
                  <Text
                    color="$colorSubtle"
                    mt="$sm"
                    fontSize="$3"
                  >
                    Loading jobs...
                  </Text>
                </YStack>
              ) : jobsError ? (
                <YStack
                  py="$lg"
                  alignItems="center"
                  bg="$backgroundMuted"
                  borderRadius="$md"
                >
                  <Text
                    color="$error"
                    fontSize="$3"
                  >
                    Failed to load jobs
                  </Text>
                </YStack>
              ) : jobs.length > 0 ? (
                <YStack gap="$sm">
                  <XStack
                    flexWrap="wrap"
                    mx={-4}
                  >
                    {jobs.slice(0, 4).map((job) => {
                      const statusStyle =
                        jobStatusColors[job.status as JobStatus] || jobStatusColors.draft
                      return (
                        <YStack
                          key={job.public_id}
                          width="50%"
                          p={4}
                        >
                          <JobCard
                            job={job}
                            statusLabel={
                              statusLabels[job.status as HomeownerJobStatus] || job.status
                            }
                            statusColor={statusStyle.bg}
                            statusTextColor={statusStyle.text}
                            onPress={() => {
                              router.push(`/(homeowner)/jobs/${job.public_id}`)
                            }}
                          />
                        </YStack>
                      )
                    })}
                  </XStack>

                  {jobs.length > 4 && (
                    <Button
                      onPress={() => router.push('/(homeowner)/jobs')}
                      bg="$backgroundMuted"
                      borderRadius="$md"
                      py="$sm"
                      borderWidth={1}
                      borderColor="$borderColor"
                    >
                      <Text
                        color="$primary"
                        fontSize="$3"
                        fontWeight="500"
                      >
                        View all jobs ({jobs.length})
                      </Text>
                    </Button>
                  )}
                </YStack>
              ) : (
                <YStack
                  py="$xl"
                  alignItems="center"
                  bg="$backgroundMuted"
                  borderRadius="$md"
                  gap="$sm"
                >
                  <Briefcase
                    size={32}
                    color="$colorMuted"
                  />
                  <Text
                    color="$colorSubtle"
                    fontSize="$4"
                    fontWeight="500"
                  >
                    No jobs yet
                  </Text>
                  <Button
                    onPress={handleAddJobPress}
                    disabled={isCheckingPhone}
                    bg="$primary"
                    borderRadius="$md"
                    px="$md"
                    py="$sm"
                    mt="$sm"
                    opacity={isCheckingPhone ? 0.6 : 1}
                  >
                    {isCheckingPhone ? (
                      <XStack
                        gap="$2"
                        alignItems="center"
                      >
                        <Spinner
                          size="small"
                          color="white"
                        />
                        <Text
                          color="white"
                          fontSize="$3"
                          fontWeight="500"
                        >
                          Checking...
                        </Text>
                      </XStack>
                    ) : (
                      <Text
                        color="white"
                        fontSize="$3"
                        fontWeight="500"
                      >
                        Post your first job
                      </Text>
                    )}
                  </Button>
                </YStack>
              )}
            </YStack>

            {/* Hire Handymen Section */}
            <YStack gap="$md">
              <XStack
                alignItems="center"
                gap="$sm"
              >
                <Users
                  size={18}
                  color="$primary"
                />
                <Text
                  fontSize="$6"
                  fontWeight="bold"
                  color="$color"
                >
                  Hire handymen near you
                </Text>
              </XStack>

              {handymenLoading ? (
                <YStack
                  py="$lg"
                  alignItems="center"
                >
                  <Spinner
                    size="small"
                    color="$primary"
                  />
                  <Text
                    color="$colorSubtle"
                    mt="$sm"
                    fontSize="$3"
                  >
                    Loading handymen...
                  </Text>
                </YStack>
              ) : handymenError ? (
                <YStack
                  py="$lg"
                  alignItems="center"
                  bg="$backgroundMuted"
                  borderRadius="$md"
                >
                  <Text
                    color="$error"
                    fontSize="$3"
                  >
                    Failed to load handymen
                  </Text>
                </YStack>
              ) : handymen.length > 0 ? (
                <YStack gap="$sm">
                  <XStack
                    flexWrap="wrap"
                    mx={-4}
                  >
                    {handymen.map((handyman) => (
                      <YStack
                        key={handyman.public_id}
                        width="50%"
                        p={4}
                      >
                        <HandymanCard
                          handyman={handyman}
                          onPress={() => {
                            router.push(`/(homeowner)/handymen/${handyman.public_id}`)
                          }}
                        />
                      </YStack>
                    ))}
                  </XStack>

                  {/* Load More Handymen Button */}
                  {hasMoreHandymen && (
                    <Button
                      onPress={() => fetchNextHandymen()}
                      disabled={isFetchingMoreHandymen}
                      bg="$backgroundMuted"
                      borderRadius="$md"
                      py="$sm"
                      mt="$xs"
                      borderWidth={1}
                      borderColor="$borderColor"
                    >
                      {isFetchingMoreHandymen ? (
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
                          Load more handymen
                        </Text>
                      )}
                    </Button>
                  )}
                </YStack>
              ) : (
                <YStack
                  py="$xl"
                  alignItems="center"
                  bg="$backgroundMuted"
                  borderRadius="$md"
                  gap="$sm"
                >
                  <Users
                    size={32}
                    color="$colorMuted"
                  />
                  <Text
                    color="$colorSubtle"
                    fontSize="$4"
                    fontWeight="500"
                  >
                    No handymen nearby
                  </Text>
                  <Text
                    color="$colorMuted"
                    fontSize="$2"
                    textAlign="center"
                    px="$md"
                  >
                    {locationError
                      ? 'Enable location to find handymen near you'
                      : 'No handymen available in your area yet'}
                  </Text>
                </YStack>
              )}
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>
    </GradientBackground>
  )
}
