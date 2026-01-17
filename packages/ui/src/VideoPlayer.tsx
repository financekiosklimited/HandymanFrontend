'use client'

import { useState, useCallback } from 'react'
import { Modal, Dimensions, Platform, StyleSheet, ActivityIndicator } from 'react-native'
import { YStack, XStack, Text, Button, View, Image } from 'tamagui'
import { X, Play, Pause, RotateCcw } from '@tamagui/lucide-icons'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useEvent } from 'expo'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Helper to format duration
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

interface VideoPlayerProps {
  /** Video URL to play */
  uri: string
  /** Optional thumbnail URL to show before playing */
  thumbnailUri?: string
  /** Whether the player modal is visible */
  visible: boolean
  /** Callback when player is closed */
  onClose: () => void
  /** Optional title to display */
  title?: string
}

/**
 * Fullscreen video player component using expo-video.
 * Shows a thumbnail initially, then plays video fullscreen when opened.
 */
export function VideoPlayer({ uri, thumbnailUri, visible, onClose, title }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(true)

  // Create video player instance
  const player = useVideoPlayer(uri, (player) => {
    player.loop = false
  })

  // Subscribe to player status
  const { status } = useEvent(player, 'statusChange', { status: player.status })
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing })

  // Handle status changes
  const handleStatusChange = useCallback(() => {
    if (status === 'readyToPlay') {
      setIsLoading(false)
      setError(null)
    } else if (status === 'error') {
      setIsLoading(false)
      setError('Failed to load video')
    } else if (status === 'loading') {
      setIsLoading(true)
    }
  }, [status])

  // Update loading state when status changes
  if (status === 'readyToPlay' && isLoading) {
    setIsLoading(false)
  }
  if (status === 'error' && !error) {
    setError('Failed to load video')
    setIsLoading(false)
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      player.pause()
    } else {
      player.play()
    }
  }

  const handleReplay = () => {
    player.replay()
  }

  const toggleControls = () => {
    setShowControls((prev) => !prev)
  }

  const handleClose = () => {
    player.pause()
    onClose()
  }

  // Auto-play when modal becomes visible
  const handleShow = useCallback(() => {
    setIsLoading(true)
    setError(null)
    // Give a small delay for the video to load
    setTimeout(() => {
      player.play()
    }, 300)
  }, [player])

  if (!visible) {
    return null
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onShow={handleShow}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View
        flex={1}
        bg="black"
        onPress={toggleControls}
      >
        {/* Header with close button */}
        {showControls && (
          <XStack
            position="absolute"
            top={Platform.OS === 'ios' ? 60 : 40}
            left={0}
            right={0}
            zIndex={100}
            px="$4"
            justifyContent="space-between"
            alignItems="center"
          >
            {/* Title */}
            {title ? (
              <View
                bg="rgba(0, 0, 0, 0.5)"
                px="$3"
                py="$2"
                borderRadius="$4"
                maxWidth="70%"
              >
                <Text
                  color="white"
                  fontSize="$4"
                  fontWeight="600"
                  numberOfLines={1}
                >
                  {title}
                </Text>
              </View>
            ) : (
              <View />
            )}

            {/* Close button */}
            <Button
              unstyled
              bg="rgba(0, 0, 0, 0.5)"
              p="$3"
              borderRadius="$full"
              onPress={handleClose}
              pressStyle={{ opacity: 0.7 }}
            >
              <X
                size={24}
                color="white"
              />
            </Button>
          </XStack>
        )}

        {/* Video View */}
        <View
          flex={1}
          justifyContent="center"
          alignItems="center"
        >
          <VideoView
            style={styles.video}
            player={player}
            fullscreenOptions={{ enable: false }}
            allowsPictureInPicture={false}
            nativeControls={false}
          />

          {/* Loading indicator */}
          {isLoading && (
            <View
              position="absolute"
              justifyContent="center"
              alignItems="center"
            >
              <ActivityIndicator
                size="large"
                color="white"
              />
              <Text
                color="white"
                marginTop="$2"
              >
                Loading...
              </Text>
            </View>
          )}

          {/* Error state */}
          {error && (
            <View
              position="absolute"
              justifyContent="center"
              alignItems="center"
              bg="rgba(0, 0, 0, 0.7)"
              p="$4"
              borderRadius="$4"
            >
              <Text
                color="$red10"
                fontSize="$5"
                fontWeight="600"
              >
                {error}
              </Text>
              <Button
                marginTop="$3"
                onPress={handleReplay}
              >
                Try Again
              </Button>
            </View>
          )}
        </View>

        {/* Playback controls */}
        {showControls && !error && (
          <XStack
            position="absolute"
            bottom={Platform.OS === 'ios' ? 60 : 40}
            left={0}
            right={0}
            justifyContent="center"
            alignItems="center"
            gap="$4"
          >
            {/* Replay button */}
            <Button
              unstyled
              bg="rgba(0, 0, 0, 0.5)"
              p="$3"
              borderRadius="$full"
              onPress={handleReplay}
              pressStyle={{ opacity: 0.7 }}
            >
              <RotateCcw
                size={24}
                color="white"
              />
            </Button>

            {/* Play/Pause button */}
            <Button
              unstyled
              bg="rgba(255, 255, 255, 0.2)"
              p="$4"
              borderRadius="$full"
              onPress={handlePlayPause}
              pressStyle={{ opacity: 0.7 }}
            >
              {isPlaying ? (
                <Pause
                  size={32}
                  color="white"
                />
              ) : (
                <Play
                  size={32}
                  color="white"
                />
              )}
            </Button>
          </XStack>
        )}
      </View>
    </Modal>
  )
}

/**
 * Video thumbnail component that opens the fullscreen player when tapped.
 * Use this to display video previews in grids or lists.
 */
interface VideoThumbnailProps {
  /** Video URL */
  videoUri: string
  /** Thumbnail image URL */
  thumbnailUri: string
  /** Optional video duration in seconds */
  durationSeconds?: number
  /** Width of the thumbnail */
  width?: number
  /** Height of the thumbnail */
  height?: number
  /** Border radius */
  borderRadius?: number
  /** Optional onPress override - if not provided, opens fullscreen player */
  onPress?: () => void
}

export function VideoThumbnail({
  videoUri,
  thumbnailUri,
  durationSeconds,
  width = 100,
  height = 100,
  borderRadius = 8,
  onPress,
}: VideoThumbnailProps) {
  const [playerVisible, setPlayerVisible] = useState(false)

  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      setPlayerVisible(true)
    }
  }

  return (
    <>
      <Button
        unstyled
        onPress={handlePress}
        pressStyle={{ opacity: 0.8 }}
      >
        <View
          width={width}
          height={height}
          borderRadius={borderRadius}
          overflow="hidden"
          backgroundColor="$backgroundHover"
        >
          <Image
            source={{ uri: thumbnailUri }}
            width={width}
            height={height}
            resizeMode="cover"
          />

          {/* Play icon overlay */}
          <View
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            justifyContent="center"
            alignItems="center"
            bg="rgba(0, 0, 0, 0.3)"
          >
            <View
              bg="rgba(0, 0, 0, 0.6)"
              borderRadius="$full"
              p="$2"
            >
              <Play
                size={24}
                color="white"
                fill="white"
              />
            </View>
          </View>

          {/* Duration badge */}
          {durationSeconds !== undefined && durationSeconds > 0 && (
            <View
              position="absolute"
              bottom="$1"
              right="$1"
              bg="rgba(0, 0, 0, 0.7)"
              px="$2"
              py="$1"
              borderRadius="$2"
            >
              <Text
                color="white"
                fontSize="$1"
                fontWeight="600"
              >
                {formatDuration(durationSeconds)}
              </Text>
            </View>
          )}
        </View>
      </Button>

      {/* Fullscreen player modal */}
      {!onPress && (
        <VideoPlayer
          uri={videoUri}
          thumbnailUri={thumbnailUri}
          visible={playerVisible}
          onClose={() => setPlayerVisible(false)}
        />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
})
