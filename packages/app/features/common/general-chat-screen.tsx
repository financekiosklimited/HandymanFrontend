'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { YStack, XStack, ScrollView, Text, Button, Spinner, View, Image, Input } from '@my/ui'
import { GradientBackground } from '@my/ui'
import {
  useChatMessages,
  useSendMessage,
  useMarkAsRead,
  useConversationList,
  apiClient,
} from '@my/api'
import type { ChatMessage, ChatImage, GeneralConversationListItem } from '@my/api'
import {
  ArrowLeft,
  Send,
  ImagePlus,
  X,
  CheckCheck,
  Check,
  MessageCircle,
  User,
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

interface GeneralChatScreenProps {
  conversationId?: string
  recipientId?: string
  recipientName?: string
  recipientAvatar?: string
  userRole: ChatRole
}

interface RNFile {
  uri: string
  type: string
  name: string
}

// ========== GeneralChatHeader Component ==========
function GeneralChatHeader({
  otherParty,
  role,
  onBack,
}: {
  otherParty: { display_name: string; avatar_url: string | null }
  role: ChatRole
  onBack: () => void
}) {
  const otherPartyLabel = role === 'homeowner' ? 'Handyman' : 'Homeowner'

  return (
    <XStack
      bg="rgba(255,255,255,0.98)"
      px="$md"
      py="$sm"
      alignItems="center"
      gap="$md"
      borderBottomWidth={1}
      borderBottomColor="rgba(0,0,0,0.06)"
      shadowColor="black"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.03}
      shadowRadius={8}
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
    </XStack>
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

// ========== PreviewImageModal ==========
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
}: {
  onSend: (content: string, images: RNFile[]) => void
  isSending: boolean
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

  const canSend = (text.trim() || images.length > 0) && !isSending

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
        Send a message to start chatting
      </Text>
    </YStack>
  )
}

// ========== Main ChatScreen Component ==========
export function GeneralChatScreen({
  conversationId: initialConversationId,
  recipientId,
  recipientName,
  recipientAvatar,
  userRole: role,
}: GeneralChatScreenProps) {
  const router = useRouter()
  const safeArea = useSafeArea()
  const toast = useToastController()
  const queryClient = useQueryClient()
  const flatListRef = useRef<FlatList>(null)

  const [conversationId, setConversationId] = useState(initialConversationId)
  const [viewerImage, setViewerImage] = useState<ChatImage | null>(null)
  const [isLoadingOlder, setIsLoadingOlder] = useState(false)
  const hasScrolledToEnd = useRef(false)

  // Sync state if prop changes (e.g. from redirect)
  useEffect(() => {
    if (initialConversationId) {
      setConversationId(initialConversationId)
    }
  }, [initialConversationId])

  // Get conversation list to find this conversation info
  const { data: conversations } = useConversationList(role)

  const conversation = useMemo(() => {
    if (!conversationId) return null
    return conversations?.find((c) => c.public_id === conversationId)
  }, [conversations, conversationId])

  const otherPartyInfo = useMemo(() => {
    if (conversation) {
      return {
        display_name: conversation.other_party.display_name,
        avatar_url: conversation.other_party.avatar_url,
      }
    }
    return {
      display_name: recipientName || 'Chat',
      avatar_url: recipientAvatar || null,
    }
  }, [conversation, recipientName, recipientAvatar])

  // API Hooks
  const {
    data: messagesData,
    isLoading: messagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchMessages,
  } = useChatMessages(role, conversationId)

  const sendMessageMutation = useSendMessage(role)
  const markAsReadMutation = useMarkAsRead(role)

  // Flatten messages from pages
  const messages = useMemo(() => {
    if (!messagesData?.pages) return []
    const allPages = [...messagesData.pages].reverse()
    return allPages.flatMap((page) => page.messages)
  }, [messagesData])

  // Use state to prevent double creation
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)

  // Handle send message
  const handleSend = useCallback(
    async (content: string, files: RNFile[]) => {
      let activeConvId = conversationId

      // If no conversation yet, create it first
      if (!activeConvId) {
        if (!recipientId) return
        setIsCreatingConversation(true)
        try {
          const response = await apiClient
            .get(`${role}/users/${recipientId}/chat/`)
            .json<{ data: { public_id: string } }>()

          activeConvId = response.data.public_id
          setConversationId(activeConvId)

          // Replace route so back button and refresh work correctly
          router.setParams({ id: activeConvId })
        } catch (err) {
          toast.show('Could not start conversation', { native: false })
          setIsCreatingConversation(false)
          return
        } finally {
          setIsCreatingConversation(false)
        }
      }

      if (!activeConvId) return

      try {
        await sendMessageMutation.mutateAsync({
          conversationId: activeConvId,
          content: content || undefined,
          images: files.length > 0 ? files : undefined,
        })
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true })
        }, 200)
      } catch (err) {
        toast.show('Failed to send message', { native: false })
      }
    },
    [conversationId, recipientId, sendMessageMutation, toast, role, router]
  )

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
      if (conversationId) {
        markAsReadMutation.mutate(conversationId)
      }
    }, [conversationId, markAsReadMutation])
  )

  // Handle loading older messages
  const handleLoadOlder = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      setIsLoadingOlder(true)
      fetchNextPage().finally(() => setIsLoadingOlder(false))
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

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
          <GeneralChatHeader
            otherParty={otherPartyInfo}
            role={role}
            onBack={() => router.back()}
          />

          {/* Messages List */}
          <YStack
            flex={1}
            bg="$background"
          >
            {messagesLoading && !conversationId ? (
              <YStack
                flex={1}
                alignItems="center"
                justifyContent="center"
              >
                <Spinner
                  size="large"
                  color="$primary"
                />
              </YStack>
            ) : messages.length === 0 ? (
              <EmptyState />
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.public_id}
                renderItem={({ item }) => (
                  <ChatBubble
                    message={item}
                    isSent={item.sender_role === role}
                    onImagePress={setViewerImage}
                  />
                )}
                contentContainerStyle={{
                  padding: 16,
                  paddingBottom: 8,
                  flexGrow: 1,
                }}
                style={{ flex: 1 }}
                onScroll={(event) => {
                  const { contentOffset } = event.nativeEvent
                  if (contentOffset.y < 50 && hasNextPage && !isFetchingNextPage) {
                    handleLoadOlder()
                  }
                }}
                scrollEventThrottle={100}
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
          </YStack>

          {/* Input */}
          <ChatInput
            onSend={handleSend}
            isSending={sendMessageMutation.isPending || isCreatingConversation}
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

export default GeneralChatScreen
