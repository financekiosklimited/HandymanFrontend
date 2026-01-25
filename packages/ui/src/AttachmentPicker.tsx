'use client'

import { useState, useCallback, useMemo } from 'react'
import { Alert, Platform, Pressable } from 'react-native'
import { YStack, XStack, Text, Button, View, Sheet } from 'tamagui'
import { Camera, Image as ImageIcon, Video, FileText, Plus, Film } from '@tamagui/lucide-icons'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import * as VideoThumbnails from 'expo-video-thumbnails'
import * as ImageManipulator from 'expo-image-manipulator'

// Attachment file type
type AttachmentFileType = 'image' | 'video' | 'document'

// Local attachment for UI state
interface LocalAttachment {
  id: string
  uri: string
  name: string
  type: string // MIME type
  file_type: AttachmentFileType
  file_size?: number
  thumbnail_uri?: string // For videos
  duration_seconds?: number // For videos
}

// MIME type helpers
const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
]
const VIDEO_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/x-m4v', 'video/webm', 'video/3gpp']

// Unsupported RAW image formats (DNG, CR2, NEF, ARW, etc.)
const UNSUPPORTED_IMAGE_EXTENSIONS = [
  'dng',   // Adobe Digital Negative
  'raw',   // Generic RAW
  'cr2',   // Canon RAW 2
  'cr3',   // Canon RAW 3
  'nef',   // Nikon Electronic Format
  'arw',   // Sony Alpha RAW
  'orf',   // Olympus RAW Format
  'rw2',   // Panasonic RAW
  'pef',   // Pentax Electronic Format
  'raf',   // Fujifilm RAW
  'srw',   // Samsung RAW
]

const UNSUPPORTED_IMAGE_MIME_TYPES = [
  'image/x-adobe-dng',
  'image/x-dcraw',
  'image/x-canon-cr2',
  'image/x-canon-cr3',
  'image/x-nikon-nef',
  'image/x-sony-arw',
  'image/x-olympus-orf',
  'image/x-panasonic-rw2',
  'image/x-pentax-pef',
  'image/x-fuji-raf',
  'image/x-samsung-srw',
]

/**
 * Check if a file is an unsupported RAW image format
 */
function isUnsupportedImageFormat(fileName: string, mimeType?: string): boolean {
  // Check by extension
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext && UNSUPPORTED_IMAGE_EXTENSIONS.includes(ext)) {
    return true
  }
  // Check by MIME type
  if (mimeType && UNSUPPORTED_IMAGE_MIME_TYPES.some((t) => mimeType.toLowerCase().includes(t))) {
    return true
  }
  return false
}

function getFileTypeFromMime(mimeType: string): AttachmentFileType {
  if (IMAGE_MIME_TYPES.some((t) => mimeType.startsWith(t.split('/')[0] ?? ''))) {
    return 'image'
  }
  if (VIDEO_MIME_TYPES.some((t) => mimeType.startsWith(t.split('/')[0] ?? ''))) {
    return 'video'
  }
  return 'document'
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Allowed file types configuration
interface AllowedTypes {
  images?: boolean
  videos?: boolean
  documents?: boolean
}

interface AttachmentPickerProps {
  /** Current attachments */
  attachments: LocalAttachment[]
  /** Callback when attachments change */
  onAttachmentsChange: (attachments: LocalAttachment[]) => void
  /** Maximum number of attachments allowed */
  maxAttachments?: number
  /** Which file types are allowed */
  allowedTypes?: AllowedTypes
  /** Custom trigger button render */
  renderTrigger?: (props: { onPress: () => void; disabled: boolean }) => React.ReactNode
  /** Whether picker is disabled */
  disabled?: boolean
  /** Error message */
  error?: string
  /** Show inline picker instead of sheet/actionsheet */
  inline?: boolean
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

// Premium icon button colors (WhatsApp-style)
const ICON_COLORS = {
  camera: '#007AFF', // Blue - Take Photo
  gallery: '#34C759', // Green - Choose from Library
  recordVideo: '#FF3B30', // Red - Record Video
  chooseVideo: '#AF52DE', // Purple - Choose Video
  document: '#FF9500', // Orange - Document
}

// Premium icon button component
interface IconButtonProps {
  icon: React.ReactNode
  label: string
  color: string
  onPress: () => void
  disabled?: boolean
}

function IconButton({ icon, label, color, onPress, disabled }: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : disabled ? 0.4 : 1,
        alignItems: 'center',
        gap: 6,
      })}
    >
      <View
        width={56}
        height={56}
        borderRadius={16}
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
        fontSize={11}
        color="$color"
        fontWeight="500"
        textAlign="center"
        numberOfLines={1}
        maxWidth={64}
      >
        {label}
      </Text>
    </Pressable>
  )
}

/**
 * Universal attachment picker component.
 * Supports picking images, videos, and documents with a unified interface.
 * Premium WhatsApp-style horizontal icon grid design.
 */
export function AttachmentPicker({
  attachments,
  onAttachmentsChange,
  maxAttachments = 10,
  allowedTypes = { images: true, videos: true, documents: true },
  renderTrigger,
  disabled = false,
  error,
  inline = false,
}: AttachmentPickerProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const remainingSlots = maxAttachments - attachments.length
  const canAddMore = remainingSlots > 0 && !disabled

  // Pick images from library
  const pickImages = useCallback(async () => {
    if (!canAddMore) return

    setSheetOpen(false)
    setIsLoading(true)

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
        quality: 0.8,
      })

      if (!result.canceled && result.assets) {
        // Filter out unsupported RAW formats
        const supportedAssets = result.assets.filter((asset) => {
          const fileName = asset.fileName || ''
          if (isUnsupportedImageFormat(fileName, asset.mimeType ?? undefined)) {
            return false
          }
          return true
        })

        // Show alert if some files were filtered out
        if (supportedAssets.length < result.assets.length) {
          const rejectedCount = result.assets.length - supportedAssets.length
          Alert.alert(
            'Unsupported Format',
            `${rejectedCount} image(s) were not added because RAW/DNG formats are not supported. Please use JPEG, PNG, or HEIC images.`
          )
        }

        if (supportedAssets.length > 0) {
          const newAttachments: LocalAttachment[] = supportedAssets.map((asset) => ({
            id: generateId(),
            uri: asset.uri,
            name: asset.fileName || `image_${Date.now()}.jpg`,
            type: asset.mimeType || 'image/jpeg',
            file_type: 'image' as const,
            file_size: asset.fileSize,
          }))
          onAttachmentsChange([...attachments, ...newAttachments])
        }
      }
    } catch (error) {
      console.error('Error picking images:', error)
      Alert.alert('Error', 'Failed to pick images. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [attachments, canAddMore, remainingSlots, onAttachmentsChange])

  // Pick video from library
  const pickVideo = useCallback(async () => {
    if (!canAddMore) return

    setSheetOpen(false)
    setIsLoading(true)

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
        onAttachmentsChange([...attachments, newAttachment])
      }
    } catch (error) {
      console.error('Error picking video:', error)
      Alert.alert('Error', 'Failed to pick video. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [attachments, canAddMore, onAttachmentsChange])

  // Pick document
  const pickDocument = useCallback(async () => {
    if (!canAddMore) return

    setSheetOpen(false)
    setIsLoading(true)

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/plain',
        ],
        copyToCacheDirectory: true,
        multiple: false,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]!
        const newAttachment: LocalAttachment = {
          id: generateId(),
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream',
          file_type: 'document',
          file_size: asset.size,
        }
        onAttachmentsChange([...attachments, newAttachment])
      }
    } catch (error) {
      console.error('Error picking document:', error)
      Alert.alert('Error', 'Failed to pick document. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [attachments, canAddMore, onAttachmentsChange])

  // Take photo with camera
  const takePhoto = useCallback(async () => {
    if (!canAddMore) return

    setSheetOpen(false)
    setIsLoading(true)

    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.')
        setIsLoading(false)
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]!
        const fileName = asset.fileName || ''
        
        // Check for unsupported RAW formats
        if (isUnsupportedImageFormat(fileName, asset.mimeType ?? undefined)) {
          Alert.alert(
            'Unsupported Format',
            'RAW/DNG formats are not supported. Please capture photos in JPEG or HEIC format.'
          )
          setIsLoading(false)
          return
        }

        const newAttachment: LocalAttachment = {
          id: generateId(),
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
          file_type: 'image',
          file_size: asset.fileSize,
        }
        onAttachmentsChange([...attachments, newAttachment])
      }
    } catch (error) {
      console.error('Error taking photo:', error)
      Alert.alert('Error', 'Failed to take photo. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [attachments, canAddMore, onAttachmentsChange])

  // Record video with camera
  const recordVideo = useCallback(async () => {
    if (!canAddMore) return

    setSheetOpen(false)
    setIsLoading(true)

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to record videos.')
        setIsLoading(false)
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
        onAttachmentsChange([...attachments, newAttachment])
      }
    } catch (error) {
      console.error('Error recording video:', error)
      Alert.alert('Error', 'Failed to record video. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [attachments, canAddMore, onAttachmentsChange])

  // Remove attachment
  const removeAttachment = useCallback(
    (id: string) => {
      onAttachmentsChange(attachments.filter((a) => a.id !== id))
    },
    [attachments, onAttachmentsChange]
  )

  // Show picker
  const showPicker = useCallback(() => {
    if (!canAddMore) {
      Alert.alert('Limit Reached', `Maximum ${maxAttachments} attachments allowed.`)
      return
    }
    setSheetOpen(true)
  }, [canAddMore, maxAttachments])

  // Premium icon grid content
  const renderIconGrid = () => (
    <XStack
      justifyContent="center"
      gap="$lg"
      flexWrap="wrap"
      paddingVertical="$md"
    >
      {allowedTypes.images && (
        <>
          <IconButton
            icon={
              <Camera
                size={24}
                color="white"
              />
            }
            label="Camera"
            color={ICON_COLORS.camera}
            onPress={takePhoto}
            disabled={!canAddMore || isLoading}
          />
          <IconButton
            icon={
              <ImageIcon
                size={24}
                color="white"
              />
            }
            label="Gallery"
            color={ICON_COLORS.gallery}
            onPress={pickImages}
            disabled={!canAddMore || isLoading}
          />
        </>
      )}

      {allowedTypes.videos && (
        <>
          <IconButton
            icon={
              <Video
                size={24}
                color="white"
              />
            }
            label="Record"
            color={ICON_COLORS.recordVideo}
            onPress={recordVideo}
            disabled={!canAddMore || isLoading}
          />
          <IconButton
            icon={
              <Film
                size={24}
                color="white"
              />
            }
            label="Video"
            color={ICON_COLORS.chooseVideo}
            onPress={pickVideo}
            disabled={!canAddMore || isLoading}
          />
        </>
      )}

      {allowedTypes.documents && (
        <IconButton
          icon={
            <FileText
              size={24}
              color="white"
            />
          }
          label="Document"
          color={ICON_COLORS.document}
          onPress={pickDocument}
          disabled={!canAddMore || isLoading}
        />
      )}
    </XStack>
  )

  // Default trigger button
  const defaultTrigger = (
    <Button
      onPress={showPicker}
      disabled={!canAddMore || isLoading}
      opacity={!canAddMore || isLoading ? 0.5 : 1}
      icon={<Plus size={20} />}
    >
      Add Attachment
    </Button>
  )

  // Inline mode - render icons directly without sheet
  if (inline) {
    return (
      <YStack gap="$2">
        {renderIconGrid()}

        {/* Counter */}
        <Text
          fontSize="$2"
          color="$colorSubtle"
          textAlign="center"
        >
          {attachments.length} / {maxAttachments} attachments
        </Text>

        {/* Error */}
        {error && (
          <Text
            fontSize="$2"
            color="$red10"
            textAlign="center"
          >
            {error}
          </Text>
        )}
      </YStack>
    )
  }

  return (
    <YStack gap="$2">
      {/* Trigger button */}
      {renderTrigger
        ? renderTrigger({ onPress: showPicker, disabled: !canAddMore || isLoading })
        : defaultTrigger}

      {/* Counter */}
      <Text
        fontSize="$2"
        color="$colorSubtle"
      >
        {attachments.length} / {maxAttachments} attachments
      </Text>

      {/* Error */}
      {error && (
        <Text
          fontSize="$2"
          color="$red10"
        >
          {error}
        </Text>
      )}

      {/* Premium bottom sheet with icon grid */}
      <Sheet
        modal
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        snapPoints={[35]}
        dismissOnSnapToBottom
        zIndex={100000}
      >
        <Sheet.Overlay
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Frame
          padding="$lg"
          paddingBottom="$2xl"
          backgroundColor="$background"
          borderTopLeftRadius={24}
          borderTopRightRadius={24}
        >
          <Sheet.Handle backgroundColor="$colorSubtle" />

          <YStack
            gap="$md"
            paddingTop="$md"
          >
            <Text
              fontSize="$5"
              fontWeight="600"
              textAlign="center"
              color="$color"
            >
              Add Attachment
            </Text>

            {renderIconGrid()}

            <Button
              onPress={() => setSheetOpen(false)}
              chromeless
              marginTop="$sm"
            >
              <Text
                color="$colorSubtle"
                fontWeight="500"
              >
                Cancel
              </Text>
            </Button>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  )
}

// Export types and helpers
export type { LocalAttachment, AllowedTypes, AttachmentFileType }
export { generateId, getFileTypeFromMime, generateVideoThumbnail }

// Helper hook for managing attachments state
export function useAttachmentState(initial: LocalAttachment[] = []) {
  const [attachments, setAttachments] = useState<LocalAttachment[]>(initial)

  const handlers = useMemo(
    () => ({
      add: (newAttachments: LocalAttachment[]) => {
        setAttachments((prev) => [...prev, ...newAttachments])
      },
      remove: (id: string) => {
        setAttachments((prev) => prev.filter((a) => a.id !== id))
      },
      clear: () => {
        setAttachments([])
      },
      set: setAttachments,
    }),
    []
  )

  return [attachments, handlers] as const
}
