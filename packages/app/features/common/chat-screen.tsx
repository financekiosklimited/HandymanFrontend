'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { YStack, XStack, ScrollView, Text, Button, Spinner, View, Image, Input } from '@my/ui'
import { GradientBackground } from '@my/ui'
import { useJobChat, useChatMessages, useSendMessage, useMarkAsRead, chatQueryKeys } from '@my/api'
import type { ChatMessage, ChatImage, ChatConversation } from '@my/api'
import {
  ArrowLeft,
  Send,
  ImagePlus,
  X,
  CheckCheck,
  Check,
  MessageCircle,
  Lock,
  Briefcase,
  User,
  MapPin,
  Calendar,
  DollarSign,
} from '@tamagui/lucide-icons'
import { useRouter, useFocusEffect } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { useToastController } from '@tamagui/toast'
import * as ImagePicker from 'expo-image-picker'
import {
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Dimensions,
} from 'react-native'
import { useQueryClient } from '@tanstack/react-query'

type ChatRole = 'homeowner' | 'handyman'

interface ChatScreenProps {
  jobId: string
  chatRole: ChatRole
}

interface RNFile {
  uri: string
  type: string
  name: string
}

// ========== ChatHeader Component ==========
function ChatHeader({
  conversation,
  chatRole,
  onBack,
  isReadOnly,
}: {
  conversation: ChatConversation
  chatRole: ChatRole
  onBack: () => void
  isReadOnly: boolean
}) {
  const otherParty = chatRole === 'homeowner' ? conversation.handyman : conversation.homeowner
  const otherPartyLabel = chatRole === 'homeowner' ? 'Handyman' : 'Homeowner'

  // Format status badge
  const getStatusBadge = () => {
    if (!conversation.job) return null
    const status = conversation.job.status
    if (status === 'completed') {
      return {
        bg: 'rgba(34, 197, 94, 0.1)' as const,
        color: '#22C55E' as const,
        label: 'Completed',
      }
    }
    if (status === 'in_progress') {
      return {
        bg: 'rgba(12, 154, 92, 0.1)' as const,
        color: '#0C9A5C' as const,
        label: 'In Progress',
      }
    }
    if (status === 'pending_completion') {
      return { bg: 'rgba(245, 158, 11, 0.1)' as const, color: '#F59E0B' as const, label: 'Pending' }
    }
    return null
  }

  const statusBadge = getStatusBadge()

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <YStack
      bg="rgba(255,255,255,0.98)"
      borderBottomWidth={1}
      borderBottomColor="rgba(0,0,0,0.06)"
      shadowColor="black"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.03}
      shadowRadius={8}
    >
      {/* Main Header Row */}
      <XStack
        px="$md"
        py="$sm"
        alignItems="center"
        gap="$sm"
      >
        <Pressable
          onPress={onBack}
          style={{ padding: 8 }}
        >
          <ArrowLeft
            size={24}
            color="#1F2937"
          />
        </Pressable>

        {/* Avatar */}
        <View
          width={48}
          height={48}
          borderRadius={24}
          bg="$primaryBackground"
          overflow="hidden"
          alignItems="center"
          justifyContent="center"
          borderWidth={2}
          borderColor="rgba(12, 154, 92, 0.2)"
        >
          {otherParty.avatar_url ? (
            <Image
              source={{ uri: otherParty.avatar_url }}
              width={48}
              height={48}
              resizeMode="cover"
            />
          ) : (
            <Text
              fontSize="$5"
              fontWeight="700"
              color="$primary"
            >
              {otherParty.display_name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        {/* Name and Role */}
        <YStack
          flex={1}
          gap={2}
        >
          <Text
            fontSize="$4"
            fontWeight="700"
            color="$color"
            numberOfLines={1}
          >
            {otherParty.display_name}
          </Text>
          <XStack
            alignItems="center"
            gap="$xs"
          >
            <User
              size={12}
              color="#6B7280"
            />
            <Text
              fontSize="$2"
              color="$colorSubtle"
            >
              {otherPartyLabel}
            </Text>
          </XStack>
        </YStack>

        {/* Status Badge */}
        {statusBadge && (
          <View
            bg={statusBadge.bg}
            px="$sm"
            py="$xs"
            borderRadius={12}
          >
            <Text
              fontSize={11}
              fontWeight="600"
              color={statusBadge.color}
            >
              {statusBadge.label}
            </Text>
          </View>
        )}
      </XStack>

      {/* Job Info Bar - Enhanced */}
      <YStack
        bg="rgba(0,0,0,0.02)"
        px="$md"
        py="$sm"
        gap="$xs"
        borderTopWidth={1}
        borderTopColor="rgba(0,0,0,0.04)"
      >
        {/* Job Title */}
        <XStack
          alignItems="center"
          gap="$xs"
        >
          <Briefcase
            size={14}
            color="#0C9A5C"
          />
          <Text
            fontSize="$3"
            fontWeight="600"
            color="$color"
            numberOfLines={1}
            flex={1}
          >
            {conversation.job?.title ?? 'Job'}
          </Text>
        </XStack>

        {/* Job Meta Row */}
        <XStack
          alignItems="center"
          gap="$md"
        >
          {/* Created Date */}
          <XStack
            alignItems="center"
            gap={4}
          >
            <Calendar
              size={12}
              color="#6B7280"
            />
            <Text
              fontSize={11}
              color="$colorSubtle"
            >
              Started {formatDate(conversation.created_at)}
            </Text>
          </XStack>

          {/* Read Only Badge */}
          {isReadOnly && (
            <XStack
              alignItems="center"
              gap={4}
              ml="auto"
            >
              <Lock
                size={12}
                color="#EF4444"
              />
              <Text
                fontSize={11}
                color="#EF4444"
                fontWeight="600"
              >
                Read Only
              </Text>
            </XStack>
          )}
        </XStack>
      </YStack>
    </YStack>
  )
}

// ========== ChatBubble Component ==========
function ChatBubble({
  message,
  isSent,
  showTimestamp = true,
  onImagePress,
}: {
  message: ChatMessage
  isSent: boolean
  showTimestamp?: boolean
  onImagePress?: (image: ChatImage) => void
}) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <YStack
      alignSelf={isSent ? 'flex-end' : 'flex-start'}
      maxWidth="80%"
      mb="$sm"
    >
      {/* Images */}
      {message.images && message.images.length > 0 && (
        <XStack
          flexWrap="wrap"
          gap="$xs"
          mb={message.content ? '$xs' : 0}
        >
          {message.images.map((img) => (
            <Pressable
              key={img.public_id}
              onPress={() => onImagePress?.(img)}
            >
              <View
                width={message.images.length === 1 ? 200 : 100}
                height={message.images.length === 1 ? 150 : 100}
                borderRadius={16}
                overflow="hidden"
                bg="$backgroundMuted"
              >
                <Image
                  source={{ uri: img.thumbnail_url || img.image_url }}
                  width="100%"
                  height="100%"
                  resizeMode="cover"
                />
              </View>
            </Pressable>
          ))}
        </XStack>
      )}

      {/* Text Content */}
      {message.content && (
        <View
          bg={isSent ? '$primary' : 'rgba(255,255,255,0.98)'}
          px="$md"
          py="$sm"
          borderRadius={20}
          borderTopRightRadius={isSent ? 6 : 20}
          borderTopLeftRadius={isSent ? 20 : 6}
          borderWidth={isSent ? 0 : 1}
          borderColor="rgba(0,0,0,0.06)"
          shadowColor={isSent ? '$primary' : 'black'}
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={isSent ? 0.2 : 0.03}
          shadowRadius={6}
        >
          <Text
            fontSize="$3"
            color={isSent ? 'white' : '$color'}
            lineHeight={22}
          >
            {message.content}
          </Text>
        </View>
      )}

      {/* Timestamp and Read Status */}
      {showTimestamp && (
        <XStack
          alignSelf={isSent ? 'flex-end' : 'flex-start'}
          alignItems="center"
          gap={4}
          mt={4}
          px="$xs"
        >
          <Text
            fontSize={10}
            color="$colorMuted"
          >
            {formatTime(message.created_at)}
          </Text>
          {isSent &&
            (message.is_read ? (
              <CheckCheck
                size={12}
                color="#0C9A5C"
              />
            ) : (
              <Check
                size={12}
                color="#9CA3AF"
              />
            ))}
        </XStack>
      )}
    </YStack>
  )
}

// ========== ImageViewerModal Component ==========
function ImageViewerModal({
  visible,
  image,
  onClose,
}: {
  visible: boolean
  image: ChatImage | null
  onClose: () => void
}) {
  if (!image) return null

  const { width, height } = Dimensions.get('window')

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        flex={1}
        bg="rgba(0,0,0,0.95)"
        justifyContent="center"
        alignItems="center"
      >
        <Pressable
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 50,
            right: 20,
            zIndex: 10,
            padding: 12,
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 20,
          }}
        >
          <X
            size={24}
            color="white"
          />
        </Pressable>

        <Image
          source={{ uri: image.image_url }}
          width={width}
          height={height * 0.7}
          resizeMode="contain"
        />
      </View>
    </Modal>
  )
}

// ========== Preview Image Modal (for images before sending) ==========
function PreviewImageModal({
  visible,
  imageUri,
  onClose,
}: {
  visible: boolean
  imageUri: string | null
  onClose: () => void
}) {
  if (!imageUri) return null

  const { width, height } = Dimensions.get('window')

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        flex={1}
        bg="rgba(0,0,0,0.95)"
        justifyContent="center"
        alignItems="center"
      >
        <Pressable
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 50,
            right: 20,
            zIndex: 10,
            padding: 12,
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 20,
          }}
        >
          <X
            size={24}
            color="white"
          />
        </Pressable>

        <Image
          source={{ uri: imageUri }}
          width={width}
          height={height * 0.7}
          resizeMode="contain"
        />

        <Text
          color="white"
          fontSize="$2"
          mt="$md"
          opacity={0.7}
        >
          Tap X to close preview
        </Text>
      </View>
    </Modal>
  )
}

// ========== ImagePreviewRow Component ==========
function ImagePreviewRow({
  images,
  onRemove,
  onPreview,
}: {
  images: RNFile[]
  onRemove: (index: number) => void
  onPreview: (uri: string) => void
}) {
  if (images.length === 0) return null

  return (
    <XStack
      gap="$sm"
      px="$md"
      py="$sm"
      bg="rgba(255,255,255,0.95)"
      borderTopWidth={1}
      borderTopColor="rgba(0,0,0,0.06)"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <XStack gap="$sm">
          {images.map((img, index) => (
            <View
              key={index}
              position="relative"
            >
              <Pressable onPress={() => onPreview(img.uri)}>
                <View
                  width={64}
                  height={64}
                  borderRadius={12}
                  overflow="hidden"
                  bg="$backgroundMuted"
                  borderWidth={2}
                  borderColor="rgba(12, 154, 92, 0.3)"
                >
                  <Image
                    source={{ uri: img.uri }}
                    width={64}
                    height={64}
                    resizeMode="cover"
                  />
                </View>
              </Pressable>
              <Pressable
                onPress={() => onRemove(index)}
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: '#EF4444',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                }}
              >
                <X
                  size={12}
                  color="white"
                />
              </Pressable>
            </View>
          ))}
        </XStack>
      </ScrollView>
    </XStack>
  )
}

// ========== ChatInput Component ==========
function ChatInput({
  onSend,
  isSending,
  disabled,
}: {
  onSend: (content: string, images: RNFile[]) => void
  isSending: boolean
  disabled?: boolean
}) {
  const [text, setText] = useState('')
  const [images, setImages] = useState<RNFile[]>([])
  const [previewUri, setPreviewUri] = useState<string | null>(null)
  const toast = useToastController()

  const handlePickImage = async () => {
    if (images.length >= 5) {
      toast.show('Maximum 5 images allowed', { native: false })
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      quality: 0.8,
    })

    if (!result.canceled && result.assets) {
      const newImages: RNFile[] = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || `image_${Date.now()}.jpg`,
      }))
      setImages([...images, ...newImages].slice(0, 5))
    }
  }

  const handleSend = () => {
    const trimmedText = text.trim()
    if (!trimmedText && images.length === 0) return

    onSend(trimmedText, images)
    setText('')
    setImages([])
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const canSend = (text.trim() || images.length > 0) && !isSending && !disabled

  if (disabled) {
    return (
      <XStack
        bg="rgba(239, 68, 68, 0.08)"
        px="$lg"
        py="$md"
        alignItems="center"
        justifyContent="center"
        gap="$sm"
        borderTopWidth={1}
        borderTopColor="rgba(239, 68, 68, 0.15)"
      >
        <Lock
          size={16}
          color="#EF4444"
        />
        <Text
          fontSize="$3"
          color="#EF4444"
          fontWeight="500"
        >
          Chat is closed for completed jobs
        </Text>
      </XStack>
    )
  }

  return (
    <YStack
      bg="rgba(255,255,255,0.98)"
      borderTopWidth={1}
      borderTopColor="rgba(0,0,0,0.06)"
    >
      <ImagePreviewRow
        images={images}
        onRemove={removeImage}
        onPreview={setPreviewUri}
      />

      <XStack
        px="$md"
        py="$sm"
        alignItems="flex-end"
        gap="$sm"
      >
        {/* Image Picker Button */}
        <Pressable
          onPress={handlePickImage}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: pressed ? 'rgba(12,154,92,0.15)' : 'rgba(12,154,92,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <ImagePlus
            size={22}
            color="#0C9A5C"
          />
        </Pressable>

        {/* Text Input */}
        <View
          flex={1}
          bg="$backgroundMuted"
          borderRadius={24}
          borderWidth={1.5}
          borderColor="rgba(0,0,0,0.08)"
          px="$md"
        >
          <Input
            placeholder="Type a message..."
            placeholderTextColor="$colorMuted"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={2000}
            borderWidth={0}
            bg="transparent"
            py={8}
            px={0}
            minHeight={44}
            color="$color"
          />
        </View>

        {/* Send Button */}
        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: canSend
              ? pressed
                ? 'rgba(12,154,92,0.9)'
                : '#0C9A5C'
              : 'rgba(0,0,0,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: canSend ? '#0C9A5C' : 'transparent',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: canSend ? 0.3 : 0,
            shadowRadius: 6,
          })}
        >
          {isSending ? (
            <Spinner
              size="small"
              color="white"
            />
          ) : (
            <Send
              size={20}
              color={canSend ? 'white' : '#9CA3AF'}
            />
          )}
        </Pressable>
      </XStack>

      {/* Preview Modal */}
      <PreviewImageModal
        visible={!!previewUri}
        imageUri={previewUri}
        onClose={() => setPreviewUri(null)}
      />
    </YStack>
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
      gap="$md"
    >
      <View
        width={80}
        height={80}
        borderRadius={40}
        bg="$primaryBackground"
        alignItems="center"
        justifyContent="center"
      >
        <MessageCircle
          size={36}
          color="#0C9A5C"
        />
      </View>
      <Text
        fontSize="$5"
        fontWeight="700"
        color="$color"
        textAlign="center"
      >
        Start the Conversation
      </Text>
      <Text
        fontSize="$3"
        color="$colorSubtle"
        textAlign="center"
        lineHeight={22}
      >
        Send a message to start chatting about this job
      </Text>
    </YStack>
  )
}

// ========== Main ChatScreen Component ==========
export function ChatScreen({ jobId, chatRole }: ChatScreenProps) {
  const router = useRouter()
  const safeArea = useSafeArea()
  const toast = useToastController()
  const queryClient = useQueryClient()
  const flatListRef = useRef<FlatList>(null)
  const hasScrolledToEnd = useRef(false)

  const [viewerImage, setViewerImage] = useState<ChatImage | null>(null)
  const [isLoadingOlder, setIsLoadingOlder] = useState(false)

  // API Hooks
  const {
    data: conversation,
    isLoading: conversationLoading,
    error: conversationError,
  } = useJobChat(chatRole, jobId)

  const {
    data: messagesData,
    isLoading: messagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchMessages,
  } = useChatMessages(chatRole, conversation?.public_id)

  const sendMessageMutation = useSendMessage(chatRole)
  const markAsReadMutation = useMarkAsRead(chatRole)

  // Flatten messages from pages - API returns oldest first, which is what we want
  // Messages should be: [oldest, ..., newest] - oldest at top, newest at bottom
  const messages = useMemo(() => {
    if (!messagesData?.pages) return []
    // Pages are in reverse order (newest page first), so we need to reverse and flatten
    const allPages = [...messagesData.pages].reverse()
    return allPages.flatMap((page) => page.messages)
  }, [messagesData])

  // Determine if chat is read-only (completed job)
  const isReadOnly = conversation?.job?.status === 'completed'

  // Scroll to end when messages first load
  useEffect(() => {
    if (messages.length > 0 && !hasScrolledToEnd.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false })
        hasScrolledToEnd.current = true
      }, 100)
    }
  }, [messages.length])

  // Mark as read when screen opens
  useFocusEffect(
    useCallback(() => {
      if (conversation?.public_id) {
        markAsReadMutation.mutate(conversation.public_id)
      }
    }, [conversation?.public_id])
  )

  // Handle send message
  const handleSend = useCallback(
    async (content: string, images: RNFile[]) => {
      if (!conversation?.public_id) return

      try {
        await sendMessageMutation.mutateAsync({
          conversationId: conversation.public_id,
          content: content || undefined,
          images: images.length > 0 ? images : undefined,
        })
        // Scroll to bottom after sending
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true })
        }, 200)
      } catch (error: any) {
        toast.show('Failed to send message', { native: false })
      }
    },
    [conversation?.public_id, sendMessageMutation, toast]
  )

  // Handle loading older messages (scroll to top)
  const handleLoadOlder = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      setIsLoadingOlder(true)
      fetchNextPage().finally(() => setIsLoadingOlder(false))
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Loading state - using GradientBackground as wrapper like other screens
  if (conversationLoading || (messagesLoading && !messagesData)) {
    return (
      <GradientBackground>
        <YStack
          flex={1}
          pt={safeArea.top}
          alignItems="center"
          justifyContent="center"
          gap="$md"
        >
          <Spinner
            size="large"
            color="$primary"
          />
          <Text color="$colorSubtle">Loading chat...</Text>
        </YStack>
      </GradientBackground>
    )
  }

  // Error state
  if (conversationError || !conversation) {
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
          <Text
            fontSize="$5"
            fontWeight="700"
            color="$error"
          >
            Unable to load chat
          </Text>
          <Text
            fontSize="$3"
            color="$colorSubtle"
            textAlign="center"
          >
            {(conversationError as any)?.message || 'Chat is only available for jobs in progress'}
          </Text>
          <Button
            bg="$primary"
            borderRadius={12}
            onPress={() => router.back()}
            mt="$md"
          >
            <Text
              color="white"
              fontWeight="600"
            >
              Go Back
            </Text>
          </Button>
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
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <ChatHeader
            conversation={conversation}
            chatRole={chatRole}
            onBack={() => router.back()}
            isReadOnly={isReadOnly}
          />

          {/* Messages List */}
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.public_id}
              renderItem={({ item }) => (
                <ChatBubble
                  message={item}
                  isSent={item.sender_role === chatRole}
                  onImagePress={setViewerImage}
                />
              )}
              contentContainerStyle={{
                padding: 16,
                paddingBottom: 8,
                flexGrow: 1,
              }}
              style={{ flex: 1 }}
              // Load older messages when scrolling to TOP
              onScroll={(event) => {
                const { contentOffset } = event.nativeEvent
                // If near top (within 50px), load older messages
                if (contentOffset.y < 50 && hasNextPage && !isFetchingNextPage) {
                  handleLoadOlder()
                }
              }}
              scrollEventThrottle={100}
              // Show loading indicator at TOP when loading older
              ListHeaderComponent={
                isFetchingNextPage ? (
                  <YStack
                    py="$md"
                    alignItems="center"
                  >
                    <Spinner
                      size="small"
                      color="$primary"
                    />
                    <Text
                      fontSize="$2"
                      color="$colorSubtle"
                      mt="$xs"
                    >
                      Loading older messages...
                    </Text>
                  </YStack>
                ) : hasNextPage ? (
                  <Pressable onPress={handleLoadOlder}>
                    <YStack
                      py="$md"
                      alignItems="center"
                    >
                      <Text
                        fontSize="$2"
                        color="$primary"
                        fontWeight="500"
                      >
                        Load older messages
                      </Text>
                    </YStack>
                  </Pressable>
                ) : null
              }
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
              }}
            />
          )}

          {/* Input - No extra padding, directly at bottom */}
          <ChatInput
            onSend={handleSend}
            isSending={sendMessageMutation.isPending}
            disabled={isReadOnly}
          />
        </KeyboardAvoidingView>

        {/* Image Viewer Modal */}
        <ImageViewerModal
          visible={!!viewerImage}
          image={viewerImage}
          onClose={() => setViewerImage(null)}
        />
      </YStack>
    </GradientBackground>
  )
}

export default ChatScreen
