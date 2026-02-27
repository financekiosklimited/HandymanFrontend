'use client'

import { useMemo, useCallback } from 'react'
import { YStack, XStack, ScrollView, Text, Button, Spinner, View, PressPresets } from '@my/ui'
import { NotificationCard, NotificationEmptyState } from '@my/ui'
import {
  useHomeownerNotifications,
  useMarkHomeownerNotificationRead,
  useMarkAllHomeownerNotificationsRead,
} from '@my/api'
import { ArrowLeft, Bell, MoreHorizontal } from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import type { Notification, NotificationType } from '@my/api'
import { useState, useEffect } from 'react'
export function HomeownerUpdatesScreen() {
  const router = useRouter()
  const insets = useSafeArea()

  // Defer heavy rendering until after the purely native navigation slide-in animation is completely finished.
  // The defaultScreenOptions animationDuration is 150ms, so we wait slightly longer to ensure 0 frame drops.
  const [isTransitioning, setIsTransitioning] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 150)
    return () => clearTimeout(timer)
  }, [])

  const {
    data: notificationsData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useHomeownerNotifications()

  const markAsRead = useMarkHomeownerNotificationRead()
  const markAllAsRead = useMarkAllHomeownerNotificationsRead()

  // Flatten paginated data
  const notifications = useMemo(() => {
    return notificationsData?.pages.flatMap((page) => page.results) || []
  }, [notificationsData])

  // Count unread notifications (used by Clear All button)
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length
  }, [notifications])

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read if not already
    if (!notification.is_read) {
      markAsRead.mutate(notification.public_id)
    }

    // Navigate based on notification type and data
    const data = notification.data
    const notificationType = notification.notification_type

    // Handle chat message notifications - redirect to conversation screen
    if (notificationType === ('chat_message_received' as any)) {
      if (data?.conversation_id && data?.other_party_id && data?.other_party_name) {
        const params = new URLSearchParams()
        params.set('otherPartyId', data.other_party_id)
        params.set('otherPartyName', data.other_party_name)
        if (data.other_party_avatar) {
          params.set('otherPartyAvatar', data.other_party_avatar)
        }
        router.push(`/(homeowner)/messages/${data.conversation_id}?${params.toString()}`)
      }
      return
    }

    // Handle direct offer notifications - redirect to jobs with offers tab
    if (notificationType.startsWith('direct_offer_')) {
      router.push('/(homeowner)/jobs?tab=offers')
      return
    }

    if (data?.job_id) {
      // Redirect to jobs menu (management) instead of job detail
      router.push('/(homeowner)/jobs')
    } else if (data?.handyman_id) {
      router.push(`/(homeowner)/handymen/${data.handyman_id}`)
    }
  }

  const handleClearAll = () => {
    if (unreadCount === 0) return
    // Use batch endpoint to mark all as read in a single API call
    markAllAsRead.mutate()
  }

  // Handle scroll to load more
  const handleScroll = useCallback(
    (event: any) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
      const paddingToBottom = 100
      if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  )

  return (
    <YStack
      flex={1}
      bg="$background"
      pt={insets.top}
    >
      {/* Header */}
      <XStack
        px="$6"
        pt="$lg"
        pb="$xl"
        alignItems="center"
        gap="$2.5"
      >
        <Button
          unstyled
          onPress={() => router.back()}
          hitSlop={12}
          {...PressPresets.icon}
        >
          <ArrowLeft
            size={22}
            color="$color"
          />
        </Button>
        <Text
          flex={1}
          fontSize={16}
          fontWeight="700"
          color="$color"
          textAlign="center"
          textTransform="capitalize"
          letterSpacing={-0.08}
        >
          Notifications
        </Text>
        <Button
          unstyled
          hitSlop={12}
          {...PressPresets.icon}
        >
          <MoreHorizontal
            size={24}
            color="$color"
          />
        </Button>
      </XStack>

      <ScrollView
        flex={1}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        <YStack
          px="$6"
          pb="$xl"
          gap="$3"
        >
          {/* Deferred Mount State for Smooth Navigation */}
          {isTransitioning ? (
            <YStack
              py="$xl"
              alignItems="center"
              gap="$md"
            >
              <Spinner
                size="large"
                color="$primary"
              />
            </YStack>
          ) : isLoading ? (
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
                color="$colorMuted"
                fontSize={14}
              >
                Loading notifications...
              </Text>
            </YStack>
          ) : error ? (
            <YStack
              py="$xl"
              alignItems="center"
              bg="$backgroundStrong"
              borderRadius={12}
              gap="$sm"
            >
              <Bell
                size={40}
                color="$error"
              />
              <Text
                color="$error"
                fontSize={16}
                fontWeight="500"
              >
                Failed to load notifications
              </Text>
              <Text
                color="$colorMuted"
                fontSize={14}
                textAlign="center"
              >
                Please try again later
              </Text>
            </YStack>
          ) : notifications.length === 0 ? (
            <YStack
              flex={1}
              minHeight={400}
              justifyContent="center"
            >
              <NotificationEmptyState />
            </YStack>
          ) : (
            <YStack gap="$3">
              {/* Clear All Header */}
              <XStack
                justifyContent="flex-end"
                alignItems="center"
                pb="$xs"
              >
                <Button
                  unstyled
                  onPress={handleClearAll}
                  disabled={unreadCount === 0}
                  {...PressPresets.icon}
                >
                  <Text
                    fontSize={14}
                    fontWeight="500"
                    color={unreadCount > 0 ? '$primary' : '$placeholderColor'}
                  >
                    Clear All
                  </Text>
                </Button>
              </XStack>

              {/* Notification Items */}
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.public_id}
                  notification={notification}
                  onPress={() => handleNotificationPress(notification)}
                />
              ))}

              {/* Loading More Indicator */}
              {isFetchingNextPage && (
                <YStack
                  py="$md"
                  alignItems="center"
                >
                  <Spinner
                    size="small"
                    color="$primary"
                  />
                </YStack>
              )}

              {/* Load More Button (fallback) */}
              {hasNextPage && !isFetchingNextPage && (
                <Button
                  onPress={() => fetchNextPage()}
                  bg="$backgroundStrong"
                  borderRadius={12}
                  py="$sm"
                  mt="$sm"
                >
                  <Text
                    color="$primary"
                    fontSize={14}
                    fontWeight="500"
                  >
                    Load more
                  </Text>
                </Button>
              )}
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
