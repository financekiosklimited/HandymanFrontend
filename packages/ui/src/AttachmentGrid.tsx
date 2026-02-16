'use client'

import { useState, useCallback } from 'react'
import { Pressable } from 'react-native'
import { XStack, YStack, Text, View, Image, Button } from 'tamagui'
import { X, Play, FileText } from '@tamagui/lucide-icons'
import { VideoPlayer } from './VideoPlayer'
import { DocumentThumbnail } from './DocumentThumbnail'
import { ImageViewer } from './ImageViewer'
import type { LocalAttachment } from './AttachmentPicker'
import { ICON_BUTTON_PRESS } from './pressAnimations'

// Attachment type from API (matches @my/api Attachment interface)
interface Attachment {
  public_id: string
  file_url: string
  file_type: 'image' | 'video' | 'document'
  file_name: string
  file_size: number
  thumbnail_url: string | null
  duration_seconds: number | null
  order?: number
  created_at?: string
}

// Helper to format duration
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

interface AttachmentGridProps {
  /** Attachments from API */
  attachments?: Attachment[]
  /** Local attachments (for upload preview) */
  localAttachments?: LocalAttachment[]
  /** Item size */
  itemSize?: number
  /** Gap between items */
  gap?: number
  /** Number of columns */
  columns?: number
  /** Show remove button on items */
  showRemove?: boolean
  /** Callback when remove is pressed */
  onRemove?: (id: string) => void
  /** Whether items are removable (shows X button) */
  editable?: boolean
}

/**
 * Grid display for mixed attachments (images, videos, documents).
 * Supports both API attachments and local attachments for upload preview.
 */
export function AttachmentGrid({
  attachments = [],
  localAttachments = [],
  itemSize = 100,
  gap = 8,
  columns = 3,
  showRemove = false,
  onRemove,
  editable = false,
}: AttachmentGridProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<{ uri: string; thumbnail?: string } | null>(
    null
  )

  // Combine API attachments and local attachments
  const allAttachments = [
    ...attachments.map((a) => ({
      id: a.public_id,
      uri: a.file_url,
      name: a.file_name,
      type: '',
      file_type: a.file_type,
      file_size: a.file_size,
      thumbnail_uri: a.thumbnail_url || undefined,
      duration_seconds: a.duration_seconds || undefined,
      isLocal: false,
    })),
    ...localAttachments.map((a) => ({
      ...a,
      isLocal: true,
    })),
  ]

  // Get all images for the image viewer
  const imageAttachments = allAttachments.filter((a) => a.file_type === 'image')
  const imageUrls = imageAttachments.map((a) => a.uri)

  // Handle image press - open in viewer
  const handleImagePress = useCallback(
    (attachment: (typeof allAttachments)[0]) => {
      const imageIndex = imageAttachments.findIndex((a) => a.id === attachment.id)
      if (imageIndex >= 0) {
        setSelectedImageIndex(imageIndex)
      }
    },
    [imageAttachments]
  )

  // Handle video press - open in player
  const handleVideoPress = useCallback((attachment: (typeof allAttachments)[0]) => {
    setSelectedVideo({
      uri: attachment.uri,
      thumbnail: attachment.thumbnail_uri,
    })
  }, [])

  // Render single attachment item
  const renderAttachment = (attachment: (typeof allAttachments)[0], index: number) => {
    const { id, uri, name, file_type, file_size, thumbnail_uri, duration_seconds, isLocal } =
      attachment

    const removeButton = (showRemove || editable) && onRemove && (
      <Button
        unstyled
        position="absolute"
        top={-6}
        right={-6}
        zIndex={10}
        bg="$red10"
        borderRadius="$full"
        width={20}
        height={20}
        alignItems="center"
        justifyContent="center"
        onPress={() => onRemove(id)}
        pressStyle={ICON_BUTTON_PRESS}
      >
        <X
          size={12}
          color="white"
        />
      </Button>
    )

    if (file_type === 'image') {
      return (
        <View
          key={id}
          width={itemSize}
          height={itemSize}
          position="relative"
        >
          {removeButton}
          <Pressable onPress={() => handleImagePress(attachment)}>
            <Image
              source={{ uri }}
              width={itemSize}
              height={itemSize}
              borderRadius={8}
              resizeMode="cover"
            />
          </Pressable>
        </View>
      )
    }

    if (file_type === 'video') {
      return (
        <View
          key={id}
          width={itemSize}
          height={itemSize}
          position="relative"
        >
          {removeButton}
          <Pressable onPress={() => handleVideoPress(attachment)}>
            <View
              width={itemSize}
              height={itemSize}
              borderRadius={8}
              overflow="hidden"
              backgroundColor="$backgroundHover"
            >
              {thumbnail_uri ? (
                <Image
                  source={{ uri: thumbnail_uri }}
                  width={itemSize}
                  height={itemSize}
                  resizeMode="cover"
                />
              ) : (
                <View
                  flex={1}
                  justifyContent="center"
                  alignItems="center"
                  backgroundColor="$backgroundHover"
                >
                  <Play
                    size={32}
                    color="$color"
                  />
                </View>
              )}

              {/* Play overlay */}
              <View
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                justifyContent="center"
                alignItems="center"
                backgroundColor="rgba(0, 0, 0, 0.3)"
              >
                <View
                  backgroundColor="rgba(0, 0, 0, 0.6)"
                  borderRadius="$full"
                  padding="$2"
                >
                  <Play
                    size={20}
                    color="white"
                    fill="white"
                  />
                </View>
              </View>

              {/* Duration badge */}
              {duration_seconds !== undefined && duration_seconds > 0 && (
                <View
                  position="absolute"
                  bottom={4}
                  right={4}
                  backgroundColor="rgba(0, 0, 0, 0.7)"
                  px="$1"
                  py={2}
                  borderRadius={4}
                >
                  <Text
                    color="white"
                    fontSize={10}
                    fontWeight="600"
                  >
                    {formatDuration(duration_seconds)}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        </View>
      )
    }

    if (file_type === 'document') {
      return (
        <View
          key={id}
          width={itemSize}
          height={itemSize}
          position="relative"
        >
          {removeButton}
          <DocumentThumbnail
            fileUrl={uri}
            fileName={name}
            fileSize={file_size}
            width={itemSize}
            height={itemSize}
            compact
          />
        </View>
      )
    }

    return null
  }

  if (allAttachments.length === 0) {
    return null
  }

  return (
    <>
      <XStack
        flexWrap="wrap"
        gap={gap}
      >
        {allAttachments.map((attachment, index) => renderAttachment(attachment, index))}
      </XStack>

      {/* Image viewer modal */}
      <ImageViewer
        images={imageUrls}
        initialIndex={selectedImageIndex || 0}
        visible={selectedImageIndex !== null}
        onClose={() => setSelectedImageIndex(null)}
      />

      {/* Video player modal */}
      {selectedVideo && (
        <VideoPlayer
          uri={selectedVideo.uri}
          thumbnailUri={selectedVideo.thumbnail}
          visible={true}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </>
  )
}

/**
 * Compact attachment preview - shows first few with count badge
 */
interface AttachmentPreviewProps {
  attachments: Attachment[]
  maxVisible?: number
  itemSize?: number
  onPress?: () => void
}

export function AttachmentPreview({
  attachments,
  maxVisible = 3,
  itemSize = 60,
  onPress,
}: AttachmentPreviewProps) {
  const visibleAttachments = attachments.slice(0, maxVisible)
  const remainingCount = attachments.length - maxVisible

  if (attachments.length === 0) {
    return null
  }

  return (
    <Pressable onPress={onPress}>
      <XStack
        gap="$1"
        alignItems="center"
      >
        {visibleAttachments.map((attachment) => {
          if (attachment.file_type === 'image') {
            return (
              <Image
                key={attachment.public_id}
                source={{ uri: attachment.thumbnail_url || attachment.file_url }}
                width={itemSize}
                height={itemSize}
                borderRadius={6}
                resizeMode="cover"
              />
            )
          }

          if (attachment.file_type === 'video') {
            return (
              <View
                key={attachment.public_id}
                width={itemSize}
                height={itemSize}
                borderRadius={6}
                overflow="hidden"
                backgroundColor="$backgroundHover"
              >
                {attachment.thumbnail_url && (
                  <Image
                    source={{ uri: attachment.thumbnail_url }}
                    width={itemSize}
                    height={itemSize}
                    resizeMode="cover"
                  />
                )}
                <View
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  justifyContent="center"
                  alignItems="center"
                  backgroundColor="rgba(0, 0, 0, 0.3)"
                >
                  <Play
                    size={16}
                    color="white"
                    fill="white"
                  />
                </View>
              </View>
            )
          }

          if (attachment.file_type === 'document') {
            return (
              <View
                key={attachment.public_id}
                width={itemSize}
                height={itemSize}
                borderRadius={6}
                backgroundColor="$background"
                borderWidth={1}
                borderColor="$borderColor"
                justifyContent="center"
                alignItems="center"
              >
                <FileText
                  size={24}
                  color="$color"
                />
              </View>
            )
          }

          return null
        })}

        {/* Remaining count badge */}
        {remainingCount > 0 && (
          <View
            width={itemSize}
            height={itemSize}
            borderRadius={6}
            backgroundColor="$backgroundHover"
            justifyContent="center"
            alignItems="center"
          >
            <Text
              fontSize="$4"
              fontWeight="600"
              color="$color"
            >
              +{remainingCount}
            </Text>
          </View>
        )}
      </XStack>
    </Pressable>
  )
}

/**
 * Single attachment row - shows icon, name, size inline
 */
interface AttachmentRowProps {
  attachment: Attachment | LocalAttachment
  onPress?: () => void
  onRemove?: () => void
  showRemove?: boolean
}

export function AttachmentRow({
  attachment,
  onPress,
  onRemove,
  showRemove = false,
}: AttachmentRowProps) {
  const isApiAttachment = 'public_id' in attachment
  const fileType = isApiAttachment ? attachment.file_type : attachment.file_type
  const fileName = isApiAttachment ? attachment.file_name : attachment.name
  const fileSize = isApiAttachment ? attachment.file_size : attachment.file_size

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
  }

  const getIcon = () => {
    switch (fileType) {
      case 'video':
        return (
          <Play
            size={20}
            color="$blue10"
          />
        )
      case 'document':
        return (
          <FileText
            size={20}
            color="orange"
          />
        )
      default:
        return null
    }
  }

  return (
    <Pressable onPress={onPress}>
      <XStack
        alignItems="center"
        gap="$2"
        padding="$2"
        borderRadius="$2"
        backgroundColor="$backgroundHover"
      >
        {/* Thumbnail or icon */}
        {fileType === 'image' ? (
          <Image
            source={{
              uri: isApiAttachment
                ? (attachment as Attachment).thumbnail_url || (attachment as Attachment).file_url
                : (attachment as LocalAttachment).uri,
            }}
            width={40}
            height={40}
            borderRadius={4}
            resizeMode="cover"
          />
        ) : (
          <View
            width={40}
            height={40}
            borderRadius={4}
            backgroundColor="$background"
            justifyContent="center"
            alignItems="center"
          >
            {getIcon()}
          </View>
        )}

        {/* File info */}
        <YStack flex={1}>
          <Text
            fontSize="$3"
            fontWeight="500"
            numberOfLines={1}
          >
            {fileName}
          </Text>
          {fileSize && (
            <Text
              fontSize="$1"
              color="$colorSubtle"
            >
              {formatFileSize(fileSize)}
            </Text>
          )}
        </YStack>

        {/* Remove button */}
        {showRemove && onRemove && (
          <Button
            unstyled
            onPress={onRemove}
            padding="$2"
          >
            <X
              size={16}
              color="$red10"
            />
          </Button>
        )}
      </XStack>
    </Pressable>
  )
}
