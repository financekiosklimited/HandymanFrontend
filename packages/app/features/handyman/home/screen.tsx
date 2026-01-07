'use client'

import { useState, useEffect, useMemo } from 'react'
import * as Location from 'expo-location'
import { YStack, XStack, ScrollView, Text, Button, Spinner } from '@my/ui'
import { SearchBar, JobCard, GradientBackground, WelcomeHeader } from '@my/ui'
import { useHandymanJobsForYou, useAuthStore, useHandymanProfile } from '@my/api'
import { Menu, Bookmark, MessageCircle } from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'

type TabType = 'top-picks' | 'nearby'

export function HandymanHomeScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const user = useAuthStore((state) => state.user)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('top-picks')
  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

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

  // Determine params based on active tab
  const jobsParams = useMemo(() => {
    const baseParams: {
      search?: string
      latitude?: number
      longitude?: number
    } = {
      search: searchQuery || undefined,
    }

    // Only include location for 'nearby' tab
    if (activeTab === 'nearby' && location) {
      baseParams.latitude = location.latitude
      baseParams.longitude = location.longitude
    }

    return baseParams
  }, [searchQuery, activeTab, location])

  const {
    data: jobsData,
    isLoading: jobsLoading,
    error: jobsError,
    fetchNextPage: fetchNextJobs,
    hasNextPage: hasMoreJobs,
    isFetchingNextPage: isFetchingMoreJobs,
    refetch: refetchJobs,
  } = useHandymanJobsForYou(jobsParams)

  // Flatten paginated data
  const jobs = useMemo(() => {
    return jobsData?.pages.flatMap((page) => page.results) || []
  }, [jobsData])

  // Refetch when tab changes
  useEffect(() => {
    refetchJobs()
  }, [activeTab, refetchJobs])

  // Fetch profile to get display name
  const { data: profile } = useHandymanProfile()
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Handyman'

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
              router.push('/(handyman)/bookmarks')
            }}
          >
            <Bookmark
              size={20}
              color="$color"
            />
          </Button>

          <Button
            unstyled
            onPress={() => {
              router.push('/(handyman)/messages')
            }}
          >
            <MessageCircle
              size={20}
              color="$color"
            />
          </Button>
        </XStack>

        {/* Content */}
        <ScrollView flex={1}>
          <YStack
            gap="$xl"
            px="$md"
            pb="$xl"
            pt="$2xl"
          >
            {/* Welcome Section */}
            <WelcomeHeader
              displayName={displayName}
              subtitle="Ready to rise and shine?"
            />

            {/* Tabs */}
            <XStack
              borderBottomWidth={1}
              borderBottomColor="$borderColor"
            >
              <Button
                unstyled
                flex={1}
                pb="$md"
                borderBottomWidth={3}
                borderBottomColor={activeTab === 'top-picks' ? '$primary' : 'transparent'}
                marginBottom={-1}
                onPress={() => setActiveTab('top-picks')}
              >
                <Text
                  fontSize="$4"
                  fontWeight={activeTab === 'top-picks' ? '600' : '500'}
                  color={activeTab === 'top-picks' ? '$primary' : '$colorSubtle'}
                >
                  Top picks
                </Text>
              </Button>
              <Button
                unstyled
                flex={1}
                pb="$md"
                borderBottomWidth={3}
                borderBottomColor={activeTab === 'nearby' ? '$primary' : 'transparent'}
                marginBottom={-1}
                onPress={() => setActiveTab('nearby')}
              >
                <Text
                  fontSize="$4"
                  fontWeight={activeTab === 'nearby' ? '600' : '500'}
                  color={activeTab === 'nearby' ? '$primary' : '$colorSubtle'}
                >
                  Nearby
                </Text>
              </Button>
            </XStack>

            {/* Jobs Grid */}
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
                <Text
                  color="$placeholderColor"
                  fontSize="$2"
                  mt="$xs"
                >
                  {jobsError instanceof Error ? jobsError.message : 'Please try again'}
                </Text>
              </YStack>
            ) : jobs.length > 0 ? (
              <YStack gap="$sm">
                <XStack
                  flexWrap="wrap"
                  mx={-4}
                >
                  {jobs.map((job) => (
                    <YStack
                      key={job.public_id}
                      width="50%"
                      p={4}
                    >
                      <JobCard
                        job={job}
                        showCategory
                        onPress={() => {
                          router.push(`/(handyman)/jobs/${job.public_id}`)
                        }}
                      />
                    </YStack>
                  ))}
                </XStack>

                {/* Load More Button */}
                {hasMoreJobs && (
                  <Button
                    onPress={() => fetchNextJobs()}
                    disabled={isFetchingMoreJobs}
                    bg="$backgroundMuted"
                    borderRadius="$md"
                    py="$sm"
                    mt="$xs"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    {isFetchingMoreJobs ? (
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
            ) : (
              <YStack
                py="$xl"
                alignItems="center"
                bg="$backgroundMuted"
                borderRadius="$md"
                gap="$sm"
              >
                <Text
                  color="$colorSubtle"
                  fontSize="$4"
                  fontWeight="500"
                >
                  No jobs available
                </Text>
                <Text
                  color="$placeholderColor"
                  fontSize="$2"
                  textAlign="center"
                  px="$md"
                >
                  {activeTab === 'nearby' && locationError
                    ? 'Enable location to see jobs near you'
                    : 'Check back later for new opportunities'}
                </Text>
              </YStack>
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </GradientBackground>
  )
}
