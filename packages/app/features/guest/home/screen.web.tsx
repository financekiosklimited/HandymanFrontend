'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  ScrollView,
  Spinner,
  Text,
  XStack,
  YStack,
} from '@my/ui'
import { BottomNav, GradientBackground, HandymanCard, JobCard, SearchBar } from '@my/ui'
import { useGuestHandymen, useGuestJobs } from '@my/api'
import { Bookmark, Briefcase, Menu, MessageCircle, Plus, Users } from '@tamagui/lucide-icons'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'

function normalizeExpoRouteToNextPath(route: string) {
  // Expo Router uses route groups like "/(guest)/jobs/123" which aren't valid URL paths for Next.
  return route.replace(/^\/\([^/]+\)/, '')
}

export function GuestHomeScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Request location permission and get current location (Web)
  useEffect(() => {
    if (typeof navigator === 'undefined') return
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        })
      },
      (err) => {
        setLocationError(err?.message || 'Failed to get location')
      },
      {
        enableHighAccuracy: false,
        timeout: 10_000,
        maximumAge: 60_000,
      },
    )
  }, [])

  // Fetch jobs and handymen with location (or without if location not available)
  const {
    data: jobsData,
    isLoading: jobsLoading,
    error: jobsError,
    fetchNextPage: fetchNextJobs,
    hasNextPage: hasMoreJobs,
    isFetchingNextPage: isFetchingMoreJobs,
  } = useGuestJobs({
    search: searchQuery || undefined,
    ...(location && {
      latitude: location.latitude,
      longitude: location.longitude,
    }),
  })

  const {
    data: handymenData,
    isLoading: handymenLoading,
    error: handymenError,
    fetchNextPage: fetchNextHandymen,
    hasNextPage: hasMoreHandymen,
    isFetchingNextPage: isFetchingMoreHandymen,
  } = useGuestHandymen({
    ...(location && {
      latitude: location.latitude,
      longitude: location.longitude,
      radius_km: 6378,
    }),
  })

  // Flatten paginated data
  const jobs = useMemo(() => {
    return jobsData?.pages.flatMap((page) => page.results) || []
  }, [jobsData])

  const handymen = useMemo(() => {
    return handymenData?.pages.flatMap((page) => page.results) || []
  }, [handymenData])

  return (
    <GradientBackground>
      <YStack flex={1} pt={insets.top}>
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
              // TODO: Navigate to bookmarks
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
              // TODO: Navigate to messages
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
            pt="$sm"
          >
            {/* Job List Section */}
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
                    Job List
                  </Text>
                </XStack>
                <Button
                  unstyled
                  onPress={() => {
                    // TODO: Navigate to create job
                  }}
                  bg="$primary"
                  borderRadius="$full"
                  width={28}
                  height={28}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Plus
                    size={16}
                    color="white"
                  />
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
                  <Text
                    color="$colorMuted"
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
                            router.push(normalizeExpoRouteToNextPath(`/(guest)/jobs/${job.public_id}`))
                          }}
                        />
                      </YStack>
                    ))}
                  </XStack>

                  {/* Load More Jobs Button */}
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
                  <Briefcase
                    size={32}
                    color="$colorMuted"
                  />
                  <Text
                    color="$colorSubtle"
                    fontSize="$4"
                    fontWeight="500"
                  >
                    No jobs available
                  </Text>
                  <Text
                    color="$colorMuted"
                    fontSize="$2"
                    textAlign="center"
                    px="$md"
                  >
                    {locationError ? 'Enable location to see jobs near you' : 'Check back later for new opportunities'}
                  </Text>
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
                  <Text
                    color="$colorMuted"
                    fontSize="$2"
                    mt="$xs"
                  >
                    {handymenError instanceof Error ? handymenError.message : 'Please try again'}
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
                            router.push(normalizeExpoRouteToNextPath(`/(guest)/handymen/${handyman.public_id}`))
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
                    {locationError ? 'Enable location to find handymen near you' : 'No handymen available in your area yet'}
                  </Text>
                </YStack>
              )}
            </YStack>
          </YStack>
        </ScrollView>

        {/* Bottom Navigation */}
        <BottomNav
          activeRoute="/"
          variant="guest"
          onNavigate={(route) => router.push(normalizeExpoRouteToNextPath(route))}
        />
      </YStack>
    </GradientBackground>
  )
}

