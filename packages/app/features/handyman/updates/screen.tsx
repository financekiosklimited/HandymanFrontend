'use client'

import { useMemo, useCallback } from 'react'
import { YStack, XStack, ScrollView, Text, Button, Spinner, View } from '@my/ui'
import { NotificationCard, NotificationEmptyState } from '@my/ui'
import { useHandymanNotifications, useMarkHandymanNotificationRead } from '@my/api'
import { ArrowLeft, Bell, MoreHorizontal } from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import type { Notification } from '@my/api'

export function HandymanUpdatesScreen() {
  const router = useRouter()
  const insets = useSafeArea()

  const {
    data: notificationsData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useHandymanNotifications()

  const markAsRead = useMarkHandymanNotificationRead()

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
    if (data?.job_id) {
      // Redirect to jobs menu (dashboard) instead of job detail
      router.push('/(handyman)/my-jobs')
    } else if (data?.application_id) {
      // Redirect to jobs menu (dashboard) instead of application detail
      router.push('/(handyman)/my-jobs')
    }
  }

  const handleClearAll = () => {
    if (unreadCount === 0) return
    // Mark all unread notifications as read
    notifications.forEach((n) => {
      if (!n.is_read) {
        markAsRead.mutate(n.public_id)
      }
    })
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
          pressStyle={{ opacity: 0.7 }}
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
          pressStyle={{ opacity: 0.7 }}
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
              bg="white"
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
                  pressStyle={{ opacity: 0.7 }}
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
                  bg="white"
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
