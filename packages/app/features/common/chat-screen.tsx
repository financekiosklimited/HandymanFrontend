'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { YStack, XStack, ScrollView, Text, Button, Spinner, View, Image, Input } from '@my/ui'
import { GradientBackground, AttachmentGrid, ImageViewer } from '@my/ui'
import { useJobChat, useChatMessages, useSendMessage, useMarkAsRead, chatQueryKeys } from '@my/api'
import type { ChatMessage, ChatConversation, Attachment, AttachmentUpload } from '@my/api'
import {
  ArrowLeft,
  Send,
  Paperclip,
  X,
  CheckCheck,
  Check,
  MessageCircle,
  Lock,
  Briefcase,
  User,
  Calendar,
  Camera,
  Image as ImageLucide,
  Video,
  Play,
  Film,
} from '@tamagui/lucide-icons'
import { useRouter, useFocusEffect } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { useToastController } from '@tamagui/toast'
import * as ImagePicker from 'expo-image-picker'
import * as VideoThumbnails from 'expo-video-thumbnails'
import * as ImageManipulator from 'expo-image-manipulator'
import { FlatList, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'

type ChatRole = 'homeowner' | 'handyman'

interface ChatScreenProps {
  jobId: string
  chatRole: ChatRole
}

// Local attachment state for UI (before upload)
interface LocalAttachment {
  id: string
  uri: string
  name: string
  type: string // MIME type
  file_type: 'image' | 'video'
  file_size?: number
  thumbnail_uri?: string // For videos
  duration_seconds?: number // For videos
}

// Generate unique ID for local attachments
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Generate and compress video thumbnail to ensure it's under 500KB
async function generateVideoThumbnail(videoUri: string): Promise<string | undefined> {
  try {
    // Generate thumbnail from video
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: 1000, // 1 second into the video
      quality: 1, // High quality first, we'll compress with ImageManipulator
    })

    // Compress the thumbnail to ensure it's under 500KB
    // Resize to max 720p width and compress with JPEG quality 0.6
    const compressed = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 720 } }], {
      compress: 0.6,
      format: ImageManipulator.SaveFormat.JPEG,
    })

    return compressed.uri
  } catch (error) {
    console.warn('Failed to generate video thumbnail:', error)
    return undefined
  }
}

// Format duration for display
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Premium icon button colors (WhatsApp-style)
const ICON_COLORS = {
  camera: '#007AFF', // Blue - Take Photo
  gallery: '#34C759', // Green - Choose from Library
  recordVideo: '#FF3B30', // Red - Record Video
  chooseVideo: '#AF52DE', // Purple - Choose Video
}

// Premium icon button component for chat
interface ChatIconButtonProps {
  icon: React.ReactNode
  label: string
  color: string
  onPress: () => void
  disabled?: boolean
}

function ChatIconButton({ icon, label, color, onPress, disabled }: ChatIconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : disabled ? 0.4 : 1,
        alignItems: 'center',
        gap: 4,
      })}
    >
      <View
        width={48}
        height={48}
        borderRadius={14}
        alignItems="center"
        justifyContent="center"
        style={{
          backgroundColor: color,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {icon}
      </View>
      <Text
        fontSize={10}
        color="$colorSubtle"
        fontWeight="500"
        textAlign="center"
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  )
}

// ========== ChatHeader Component ==========
function ChatHeader({
  conversation,
  chatRole,
  onBack,
  isReadOnly,
  onProfilePress,
}: {
  conversation: ChatConversation
  chatRole: ChatRole
  onBack: () => void
  isReadOnly: boolean
  onProfilePress?: () => void
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

  const ProfileContent = (
    <XStack
      alignItems="center"
      gap="$sm"
      flex={1}
    >
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

        {onProfilePress ? (
          <Pressable
            onPress={onProfilePress}
            style={({ pressed }) => ({
              flex: 1,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            {ProfileContent}
          </Pressable>
        ) : (
          ProfileContent
        )}

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
}: {
  message: ChatMessage
  isSent: boolean
  showTimestamp?: boolean
}) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Determine attachment item size based on count
  const getItemSize = () => {
    if (!message.attachments || message.attachments.length === 0) return 100
    if (message.attachments.length === 1) return 200
    return 100
  }

  return (
    <YStack
      alignSelf={isSent ? 'flex-end' : 'flex-start'}
      maxWidth="80%"
      mb="$sm"
    >
      {/* Attachments (images/videos) */}
      {message.attachments && message.attachments.length > 0 && (
        <View mb={message.content ? '$xs' : 0}>
          <AttachmentGrid
            attachments={message.attachments}
            itemSize={getItemSize()}
            gap={4}
          />
        </View>
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

// ========== AttachmentPreviewRow Component ==========
function AttachmentPreviewRow({
  attachments,
  onRemove,
}: {
  attachments: LocalAttachment[]
  onRemove: (id: string) => void
}) {
  if (attachments.length === 0) return null

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
          {attachments.map((attachment) => (
            <View
              key={attachment.id}
              position="relative"
            >
              <View
                width={64}
                height={64}
                borderRadius={12}
                overflow="hidden"
                bg="$backgroundMuted"
                borderWidth={2}
                borderColor="rgba(12, 154, 92, 0.3)"
              >
                {attachment.file_type === 'image' ? (
                  <Image
                    source={{ uri: attachment.uri }}
                    width={64}
                    height={64}
                    resizeMode="cover"
                  />
                ) : (
                  // Video preview with thumbnail
                  <View
                    width={64}
                    height={64}
                  >
                    {attachment.thumbnail_uri ? (
                      <Image
                        source={{ uri: attachment.thumbnail_uri }}
                        width={64}
                        height={64}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        flex={1}
                        bg="$backgroundMuted"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Video
                          size={24}
                          color="#0C9A5C"
                        />
                      </View>
                    )}
                    {/* Play icon overlay */}
                    <View
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      alignItems="center"
                      justifyContent="center"
                      bg="rgba(0,0,0,0.3)"
                    >
                      <Play
                        size={20}
                        color="white"
                        fill="white"
                      />
                    </View>
                    {/* Duration badge */}
                    {attachment.duration_seconds !== undefined && (
                      <View
                        position="absolute"
                        bottom={2}
                        right={2}
                        bg="rgba(0,0,0,0.7)"
                        px={4}
                        py={1}
                        borderRadius={4}
                      >
                        <Text
                          fontSize={8}
                          color="white"
                          fontWeight="600"
                        >
                          {formatDuration(attachment.duration_seconds)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
              {/* Remove button */}
              <Pressable
                onPress={() => onRemove(attachment.id)}
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
  onSend: (content: string, attachments: LocalAttachment[]) => void
  isSending: boolean
  disabled?: boolean
}) {
  const [text, setText] = useState('')
  const [attachments, setAttachments] = useState<LocalAttachment[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const toast = useToastController()

  const MAX_ATTACHMENTS = 5 // Chat limit

  // Pick images from library
  const handlePickImages = async () => {
    if (attachments.length >= MAX_ATTACHMENTS) {
      toast.show(`Maximum ${MAX_ATTACHMENTS} attachments allowed`, { native: false })
      return
    }

    setShowPicker(false)
    setIsProcessing(true)

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: MAX_ATTACHMENTS - attachments.length,
        quality: 0.8,
      })

      if (!result.canceled && result.assets) {
        const newAttachments: LocalAttachment[] = result.assets.map((asset) => ({
          id: generateId(),
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
          file_type: 'image' as const,
          file_size: asset.fileSize,
        }))
        setAttachments((prev) => [...prev, ...newAttachments].slice(0, MAX_ATTACHMENTS))
      }
    } catch (error) {
      console.error('Error picking images:', error)
      toast.show('Failed to pick images', { native: false })
    } finally {
      setIsProcessing(false)
    }
  }

  // Pick video from library
  const handlePickVideo = async () => {
    if (attachments.length >= MAX_ATTACHMENTS) {
      toast.show(`Maximum ${MAX_ATTACHMENTS} attachments allowed`, { native: false })
      return
    }

    setShowPicker(false)
    setIsProcessing(true)

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsMultipleSelection: false,
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]!
        const thumbnailUri = await generateVideoThumbnail(asset.uri)

        const newAttachment: LocalAttachment = {
          id: generateId(),
          uri: asset.uri,
          name: asset.fileName || `video_${Date.now()}.mp4`,
          type: asset.mimeType || 'video/mp4',
          file_type: 'video',
          file_size: asset.fileSize,
          thumbnail_uri: thumbnailUri,
          duration_seconds: asset.duration ? Math.round(asset.duration / 1000) : undefined,
        }
        setAttachments((prev) => [...prev, newAttachment])
      }
    } catch (error) {
      console.error('Error picking video:', error)
      toast.show('Failed to pick video', { native: false })
    } finally {
      setIsProcessing(false)
    }
  }

  // Take photo with camera
  const handleTakePhoto = async () => {
    if (attachments.length >= MAX_ATTACHMENTS) {
      toast.show(`Maximum ${MAX_ATTACHMENTS} attachments allowed`, { native: false })
      return
    }

    setShowPicker(false)
    setIsProcessing(true)

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.')
        setIsProcessing(false)
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]!
        const newAttachment: LocalAttachment = {
          id: generateId(),
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
          file_type: 'image',
          file_size: asset.fileSize,
        }
        setAttachments((prev) => [...prev, newAttachment])
      }
    } catch (error) {
      console.error('Error taking photo:', error)
      toast.show('Failed to take photo', { native: false })
    } finally {
      setIsProcessing(false)
    }
  }

  // Record video with camera
  const handleRecordVideo = async () => {
    if (attachments.length >= MAX_ATTACHMENTS) {
      toast.show(`Maximum ${MAX_ATTACHMENTS} attachments allowed`, { native: false })
      return
    }

    setShowPicker(false)
    setIsProcessing(true)

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to record videos.')
        setIsProcessing(false)
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        quality: 0.8,
        videoMaxDuration: 60, // 60 seconds max
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]!
        const thumbnailUri = await generateVideoThumbnail(asset.uri)

        const newAttachment: LocalAttachment = {
          id: generateId(),
          uri: asset.uri,
          name: asset.fileName || `video_${Date.now()}.mp4`,
          type: asset.mimeType || 'video/mp4',
          file_type: 'video',
          file_size: asset.fileSize,
          thumbnail_uri: thumbnailUri,
          duration_seconds: asset.duration ? Math.round(asset.duration / 1000) : undefined,
        }
        setAttachments((prev) => [...prev, newAttachment])
      }
    } catch (error) {
      console.error('Error recording video:', error)
      toast.show('Failed to record video', { native: false })
    } finally {
      setIsProcessing(false)
    }
  }

  // Toggle attachment picker visibility
  const togglePicker = useCallback(() => {
    if (attachments.length >= MAX_ATTACHMENTS) {
      toast.show(`Maximum ${MAX_ATTACHMENTS} attachments allowed`, { native: false })
      return
    }
    setShowPicker((prev) => !prev)
  }, [attachments.length, toast])

  // Remove attachment
  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  // Handle send
  const handleSend = () => {
    const trimmedText = text.trim()
    if (!trimmedText && attachments.length === 0) return

    onSend(trimmedText, attachments)
    setText('')
    setAttachments([])
    setShowPicker(false)
  }

  const canSend =
    (text.trim() || attachments.length > 0) && !isSending && !disabled && !isProcessing
  const canAddMore = attachments.length < MAX_ATTACHMENTS

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
      {/* Premium Inline Attachment Picker */}
      {showPicker && (
        <XStack
          justifyContent="center"
          gap="$md"
          paddingVertical="$md"
          paddingHorizontal="$lg"
          bg="rgba(0,0,0,0.02)"
          borderBottomWidth={1}
          borderBottomColor="rgba(0,0,0,0.04)"
        >
          <ChatIconButton
            icon={
              <Camera
                size={22}
                color="white"
              />
            }
            label="Camera"
            color={ICON_COLORS.camera}
            onPress={handleTakePhoto}
            disabled={!canAddMore || isProcessing}
          />
          <ChatIconButton
            icon={
              <ImageLucide
                size={22}
                color="white"
              />
            }
            label="Gallery"
            color={ICON_COLORS.gallery}
            onPress={handlePickImages}
            disabled={!canAddMore || isProcessing}
          />
          <ChatIconButton
            icon={
              <Video
                size={22}
                color="white"
              />
            }
            label="Record"
            color={ICON_COLORS.recordVideo}
            onPress={handleRecordVideo}
            disabled={!canAddMore || isProcessing}
          />
          <ChatIconButton
            icon={
              <Film
                size={22}
                color="white"
              />
            }
            label="Video"
            color={ICON_COLORS.chooseVideo}
            onPress={handlePickVideo}
            disabled={!canAddMore || isProcessing}
          />
        </XStack>
      )}

      <AttachmentPreviewRow
        attachments={attachments}
        onRemove={removeAttachment}
      />

      <XStack
        px="$md"
        py="$sm"
        alignItems="flex-end"
        gap="$sm"
      >
        {/* Attachment Picker Toggle Button */}
        <Pressable
          onPress={togglePicker}
          disabled={isProcessing}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: showPicker
              ? '#0C9A5C'
              : pressed
                ? 'rgba(12,154,92,0.15)'
                : 'rgba(12,154,92,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isProcessing ? 0.5 : 1,
          })}
        >
          {isProcessing ? (
            <Spinner
              size="small"
              color={showPicker ? 'white' : '#0C9A5C'}
            />
          ) : showPicker ? (
            <X
              size={22}
              color="white"
            />
          ) : (
            <Paperclip
              size={22}
              color="#0C9A5C"
            />
          )}
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
      if (conversation?.public_id && !markAsReadMutation.isPending) {
        markAsReadMutation.mutate(conversation.public_id)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversation?.public_id])
  )

  // Handle send message - convert LocalAttachment to AttachmentUpload
  const handleSend = useCallback(
    async (content: string, localAttachments: LocalAttachment[]) => {
      if (!conversation?.public_id) return

      try {
        // Convert LocalAttachment[] to AttachmentUpload[]
        const attachments: AttachmentUpload[] = localAttachments.map((attachment) => {
          const file = {
            uri: attachment.uri,
            type: attachment.type,
            name: attachment.name,
          }

          if (attachment.file_type === 'video') {
            // Video requires thumbnail and duration
            return {
              file,
              thumbnail: attachment.thumbnail_uri
                ? {
                    uri: attachment.thumbnail_uri,
                    type: 'image/jpeg',
                    name: `${attachment.name}_thumb.jpg`,
                  }
                : undefined,
              duration_seconds: attachment.duration_seconds,
            }
          }

          // Image - just the file
          return { file }
        })

        await sendMessageMutation.mutateAsync({
          conversationId: conversation.public_id,
          content: content || undefined,
          attachments: attachments.length > 0 ? attachments : undefined,
        })
        // Scroll to bottom after sending
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true })
        }, 200)
      } catch (error: any) {
        toast.show('Failed to send message', { native: false })
      }
    },
    [conversation?.public_id, toast]
    // Note: sendMessageMutation excluded from deps to prevent unnecessary callback recreation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  )

  // Handle loading older messages (scroll to top)
  const handleLoadOlder = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      setIsLoadingOlder(true)
      fetchNextPage().finally(() => setIsLoadingOlder(false))
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Handle profile press - navigate to handyman profile (only for homeowner)
  const handleProfilePress = useCallback(() => {
    if (chatRole === 'homeowner' && conversation?.handyman?.public_id) {
      router.push(`/(homeowner)/handymen/${conversation.handyman.public_id}`)
    }
  }, [chatRole, conversation?.handyman?.public_id, router])

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
            onProfilePress={chatRole === 'homeowner' ? handleProfilePress : undefined}
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
      </YStack>
    </GradientBackground>
  )
}

export default ChatScreen
