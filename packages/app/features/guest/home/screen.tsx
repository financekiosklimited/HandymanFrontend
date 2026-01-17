'use client'

import { useState, useEffect, useMemo } from 'react'
import * as Location from 'expo-location'
import { YStack, XStack, ScrollView, Text, Button, Spinner } from '@my/ui'
import { SearchBar, BottomNav, JobCard, HandymanCard, GradientBackground, JobFilters } from '@my/ui'
import { useGuestJobs, useGuestHandymen, useCategories, useCities } from '@my/api'
import {
  Menu,
  Bookmark,
  MessageCircle,
  Plus,
  MapPin,
  Briefcase,
  Users,
} from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'

export function GuestHomeScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined)
  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Fetch categories and cities for filters
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: cities, isLoading: citiesLoading } = useCities()

  // Request location permission and get current location
  useEffect(() => {
    let isMounted = true

    async function getLocation() {
      try {
        const enabled = await Location.hasServicesEnabledAsync()
        if (!enabled) {
          if (isMounted) {
            setLocationError('Location services are disabled')
          }
          console.warn('Location services are disabled')
          return
        }

        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          if (isMounted) {
            setLocationError('Location permission denied')
          }
          console.warn('Location permission denied')
          return
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })

        if (isMounted) {
          setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          })
        }
      } catch (error) {
        console.warn('Error getting location, trying last known:', error)
        try {
          const fallbackLocation = await Location.getLastKnownPositionAsync()
          if (fallbackLocation && isMounted) {
            setLocation({
              latitude: fallbackLocation.coords.latitude,
              longitude: fallbackLocation.coords.longitude,
            })
          } else if (isMounted) {
            setLocationError('Current location unavailable')
          }
        } catch (fallbackError) {
          console.warn('Error getting last known location:', fallbackError)
          if (isMounted) {
            setLocationError('Current location unavailable')
          }
        }
      }
    }

    getLocation()

    return () => {
      isMounted = false
    }
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
    category: selectedCategory,
    city: selectedCity,
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

        {/* Filters */}
        <YStack
          px="$md"
          pb="$sm"
        >
          <JobFilters
            categories={categories}
            cities={cities}
            selectedCategory={selectedCategory}
            selectedCity={selectedCity}
            onCategoryChange={setSelectedCategory}
            onCityChange={setSelectedCity}
            isLoadingCategories={categoriesLoading}
            isLoadingCities={citiesLoading}
          />
        </YStack>

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
                            router.push(`/(guest)/jobs/${job.public_id}`)
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
                    {locationError
                      ? 'Enable location to see jobs near you'
                      : 'Check back later for new opportunities'}
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
                            router.push(`/(guest)/handymen/${handyman.public_id}`)
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

        {/* Bottom Navigation */}
        <BottomNav
          activeRoute="/"
          variant="guest"
          onNavigate={(route) => router.push(route as any)}
        />
      </YStack>
    </GradientBackground>
  )
}
