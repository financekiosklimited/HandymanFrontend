'use client'

import { useCallback, useRef } from 'react'
import { YStack, XStack, Text, Spinner, View, Image } from '@my/ui'
import { GradientBackground } from '@my/ui'
import { useConversationList, useTotalUnreadCount } from '@my/api'
import type { GeneralConversationListItem } from '@my/api'
import { ArrowLeft, MessageCircle, ChevronRight, Inbox } from '@tamagui/lucide-icons'
import { useRouter, useFocusEffect } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { FlatList, Pressable, RefreshControl } from 'react-native'

type ChatRole = 'homeowner' | 'handyman'

interface ConversationListScreenProps {
  chatRole: ChatRole
}

// ========== ConversationItem Component ==========
function ConversationItem({
  conversation,
  onPress,
  isFirst,
  isLast,
}: {
  conversation: GeneralConversationListItem
  onPress: () => void
  isFirst?: boolean
  isLast?: boolean
}) {
  const { other_party, last_message, unread_count, last_message_at } = conversation

  // Format timestamp
  const formatTime = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Truncate message
  const truncateMessage = (message: string | null, maxLength = 36) => {
    if (!message) return 'Start a conversation...'
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + '...'
  }

  const hasUnread = unread_count > 0

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <XStack
          bg={pressed ? 'rgba(12, 154, 92, 0.04)' : 'rgba(255,255,255,0.95)'}
          mx="$md"
          mt={isFirst ? '$md' : '$xs'}
          mb={isLast ? '$md' : 0}
          px="$md"
          py="$sm"
          gap="$md"
          alignItems="center"
          borderRadius={16}
          borderWidth={1}
          borderColor={hasUnread ? 'rgba(12, 154, 92, 0.15)' : 'rgba(0,0,0,0.04)'}
          shadowColor={hasUnread ? '#0C9A5C' : 'black'}
          shadowOffset={{ width: 0, height: hasUnread ? 2 : 1 }}
          shadowOpacity={hasUnread ? 0.08 : 0.03}
          shadowRadius={hasUnread ? 8 : 4}
        >
          {/* Avatar with online indicator styling */}
          <View position="relative">
            <View
              width={56}
              height={56}
              borderRadius={28}
              bg="$primaryBackground"
              overflow="hidden"
              alignItems="center"
              justifyContent="center"
              borderWidth={hasUnread ? 2.5 : 0}
              borderColor={hasUnread ? '$primary' : 'transparent'}
            >
              {other_party.avatar_url ? (
                <Image
                  source={{ uri: other_party.avatar_url }}
                  width={56}
                  height={56}
                  resizeMode="cover"
                />
              ) : (
                <View
                  width={56}
                  height={56}
                  bg="$primaryBackground"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text
                    fontSize={22}
                    fontWeight="700"
                    color="$primary"
                  >
                    {other_party.display_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Content */}
          <YStack
            flex={1}
            gap={3}
          >
            <XStack
              alignItems="center"
              justifyContent="space-between"
            >
              <Text
                fontSize={16}
                fontWeight={hasUnread ? '700' : '600'}
                color="$color"
                numberOfLines={1}
                flex={1}
              >
                {other_party.display_name}
              </Text>
              <XStack
                alignItems="center"
                gap={4}
              >
                <Text
                  fontSize={12}
                  fontWeight={hasUnread ? '600' : '400'}
                  color={hasUnread ? '$primary' : '$colorMuted'}
                >
                  {formatTime(last_message_at)}
                </Text>
              </XStack>
            </XStack>

            <XStack
              alignItems="center"
              justifyContent="space-between"
            >
              <Text
                fontSize={14}
                color={hasUnread ? '$color' : '$colorSubtle'}
                fontWeight={hasUnread ? '500' : '400'}
                numberOfLines={1}
                flex={1}
                mr="$sm"
                opacity={hasUnread ? 1 : 0.8}
              >
                {last_message?.message_type === 'attachment'
                  ? '📎 Attachment'
                  : last_message?.message_type === 'text_with_attachment'
                    ? `📎 ${truncateMessage(last_message.content ?? null)}`
                    : truncateMessage(last_message?.content ?? null)}
              </Text>

              {/* Unread Badge */}
              {hasUnread ? (
                <View
                  bg="$primary"
                  minWidth={22}
                  height={22}
                  borderRadius={11}
                  alignItems="center"
                  justifyContent="center"
                  px={6}
                  shadowColor="#0C9A5C"
                  shadowOffset={{ width: 0, height: 2 }}
                  shadowOpacity={0.25}
                  shadowRadius={4}
                >
                  <Text
                    fontSize={11}
                    fontWeight="700"
                    color="white"
                  >
                    {unread_count > 99 ? '99+' : unread_count}
                  </Text>
                </View>
              ) : (
                <ChevronRight
                  size={18}
                  color="#D1D5DB"
                />
              )}
            </XStack>
          </YStack>
        </XStack>
      )}
    </Pressable>
  )
}

// ========== EmptyState Component ==========
function EmptyState() {
  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      px="$xl"
      gap="$lg"
    >
      {/* Icon Container with Gradient Effect */}
      <View
        width={100}
        height={100}
        borderRadius={50}
        bg="$primaryBackground"
        alignItems="center"
        justifyContent="center"
        shadowColor="#0C9A5C"
        shadowOffset={{ width: 0, height: 8 }}
        shadowOpacity={0.15}
        shadowRadius={20}
      >
        <View
          width={70}
          height={70}
          borderRadius={35}
          bg="rgba(12, 154, 92, 0.15)"
          alignItems="center"
          justifyContent="center"
        >
          <Inbox
            size={32}
            color="#0C9A5C"
          />
        </View>
      </View>

      <YStack
        alignItems="center"
        gap="$sm"
      >
        <Text
          fontSize={22}
          fontWeight="700"
          color="$color"
          textAlign="center"
        >
          No Messages Yet
        </Text>
        <Text
          fontSize={15}
          color="$colorSubtle"
          textAlign="center"
          lineHeight={22}
          maxWidth={280}
        >
          Start chatting by visiting a handyman's profile and tapping the chat button
        </Text>
      </YStack>

      {/* Decorative Element */}
      <View
        width={60}
        height={4}
        borderRadius={2}
        bg="$primaryBackground"
        mt="$md"
      />
    </YStack>
  )
}

// ========== Main ConversationListScreen Component ==========
export function ConversationListScreen({ chatRole }: ConversationListScreenProps) {
  const router = useRouter()
  const safeArea = useSafeArea()

  const {
    data: conversations,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useConversationList(chatRole)

  const { data: totalUnread } = useTotalUnreadCount(chatRole)

  // Track if we've already refetched on this focus to prevent duplicate calls
  const hasFetchedOnFocus = useRef(false)

  // Refetch on focus - empty deps, use ref to prevent re-running
  useFocusEffect(
    useCallback(() => {
      hasFetchedOnFocus.current = false
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        if (!hasFetchedOnFocus.current) {
          hasFetchedOnFocus.current = true
          refetch()
        }
      }, 100)
      return () => clearTimeout(timer)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  )

  const handleConversationPress = (conversation: GeneralConversationListItem) => {
    const params = new URLSearchParams()
    params.set('otherPartyName', conversation.other_party.display_name)
    if (conversation.other_party.avatar_url) {
      params.set('otherPartyAvatar', conversation.other_party.avatar_url)
    }
    router.push(`/(${chatRole})/messages/${conversation.public_id}?${params.toString()}`)
  }

  // Loading state
  if (isLoading && !conversations) {
    return (
      <GradientBackground>
        <YStack
          flex={1}
          pt={safeArea.top}
          alignItems="center"
          justifyContent="center"
          gap="$md"
        >
          <View
            width={60}
            height={60}
            borderRadius={30}
            bg="$primaryBackground"
            alignItems="center"
            justifyContent="center"
          >
            <Spinner
              size="large"
              color="$primary"
            />
          </View>
          <Text
            color="$colorSubtle"
            fontSize={15}
          >
            Loading messages...
          </Text>
        </YStack>
      </GradientBackground>
    )
  }

  // Error state
  if (error) {
    return (
      <GradientBackground>
        <YStack
          flex={1}
          pt={safeArea.top}
          alignItems="center"
          justifyContent="center"
          px="$xl"
          gap="$md"
        >
          <View
            width={70}
            height={70}
            borderRadius={35}
            bg="$errorBackground"
            alignItems="center"
            justifyContent="center"
          >
            <MessageCircle
              size={32}
              color="$error"
            />
          </View>
          <Text
            fontSize={18}
            fontWeight="700"
            color="$color"
            textAlign="center"
          >
            Couldn't Load Messages
          </Text>
          <Text
            fontSize={14}
            color="$colorSubtle"
            textAlign="center"
          >
            Pull down to try again
          </Text>
        </YStack>
      </GradientBackground>
    )
  }

  return (
    <GradientBackground>
      <YStack
        flex={1}
        pt={safeArea.top}
      >
        {/* Premium Header */}
        <YStack
          bg="rgba(255,255,255,0.98)"
          borderBottomWidth={1}
          borderBottomColor="rgba(0,0,0,0.04)"
          shadowColor="black"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.04}
          shadowRadius={12}
        >
          <XStack
            px="$md"
            py="$sm"
            alignItems="center"
            gap="$md"
          >
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({
                padding: 10,
                borderRadius: 12,
                backgroundColor: pressed ? 'rgba(0,0,0,0.04)' : 'transparent',
              })}
            >
              <ArrowLeft
                size={22}
                color="#1F2937"
              />
            </Pressable>

            <YStack flex={1}>
              <Text
                fontSize={20}
                fontWeight="700"
                color="$color"
              >
                Messages
              </Text>
              {(totalUnread ?? 0) > 0 && (
                <Text
                  fontSize={12}
                  color="$primary"
                  fontWeight="500"
                >
                  {totalUnread} unread
                </Text>
              )}
            </YStack>

            {/* Message Count Badge */}
            {conversations && conversations.length > 0 && (
              <View
                bg="$primaryBackground"
                px="$sm"
                py="$xs"
                borderRadius={12}
              >
                <Text
                  fontSize={12}
                  fontWeight="600"
                  color="$primary"
                >
                  {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
                </Text>
              </View>
            )}
          </XStack>
        </YStack>

        {/* Conversation List */}
        {!conversations || conversations.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.public_id}
            renderItem={({ item, index }) => (
              <ConversationItem
                conversation={item}
                onPress={() => handleConversationPress(item)}
                isFirst={index === 0}
                isLast={index === conversations.length - 1}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#0C9A5C"
                colors={['#0C9A5C']}
              />
            }
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </YStack>
    </GradientBackground>
  )
}

export default ConversationListScreen
