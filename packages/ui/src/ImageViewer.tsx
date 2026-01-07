'use client'

import { useState, useRef, useCallback } from 'react'
import { Modal, Dimensions, FlatList, Pressable, Platform } from 'react-native'
import { YStack, XStack, Text, Button, Image, View } from 'tamagui'
import { X, ChevronLeft, ChevronRight } from '@tamagui/lucide-icons'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

interface ImageViewerProps {
  images: string[]
  initialIndex?: number
  visible: boolean
  onClose: () => void
}

export function ImageViewer({ images, initialIndex = 0, visible, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const flatListRef = useRef<FlatList>(null)

  // Reset to initial index when opening
  const handleShow = useCallback(() => {
    setCurrentIndex(initialIndex)
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false })
    }, 100)
  }, [initialIndex])

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x
    const index = Math.round(offsetX / SCREEN_WIDTH)
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index)
    }
  }

  const scrollToImage = (index: number) => {
    if (index >= 0 && index < images.length) {
      flatListRef.current?.scrollToIndex({ index, animated: true })
      setCurrentIndex(index)
    }
  }

  if (!visible || images.length === 0) {
    return null
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onShow={handleShow}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        flex={1}
        bg="rgba(0, 0, 0, 0.95)"
      >
        {/* Header */}
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
          {/* Image counter */}
          {images.length > 1 && (
            <View
              bg="rgba(0, 0, 0, 0.5)"
              px="$3"
              py="$2"
              borderRadius="$4"
            >
              <Text
                color="white"
                fontSize="$4"
                fontWeight="600"
              >
                {currentIndex + 1} / {images.length}
              </Text>
            </View>
          )}
          {images.length === 1 && <View />}

          {/* Close button */}
          <Button
            unstyled
            bg="rgba(0, 0, 0, 0.5)"
            p="$3"
            borderRadius="$full"
            onPress={onClose}
            pressStyle={{ opacity: 0.7 }}
          >
            <X
              size={24}
              color="white"
            />
          </Button>
        </XStack>

        {/* Image list */}
        <FlatList
          ref={flatListRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          renderItem={({ item }) => (
            <Pressable
              onPress={onClose}
              style={{
                width: SCREEN_WIDTH,
                height: SCREEN_HEIGHT,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Image
                source={{ uri: item }}
                width={SCREEN_WIDTH}
                height={SCREEN_HEIGHT * 0.7}
                resizeMode="contain"
              />
            </Pressable>
          )}
          keyExtractor={(item, index) => `${item}-${index}`}
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            {currentIndex > 0 && (
              <Button
                unstyled
                position="absolute"
                left="$4"
                top="50%"
                y={-20}
                bg="rgba(0, 0, 0, 0.5)"
                borderRadius="$full"
                p="$3"
                onPress={() => scrollToImage(currentIndex - 1)}
                pressStyle={{ opacity: 0.8 }}
              >
                <ChevronLeft
                  size={24}
                  color="white"
                />
              </Button>
            )}
            {currentIndex < images.length - 1 && (
              <Button
                unstyled
                position="absolute"
                right="$4"
                top="50%"
                y={-20}
                bg="rgba(0, 0, 0, 0.5)"
                borderRadius="$full"
                p="$3"
                onPress={() => scrollToImage(currentIndex + 1)}
                pressStyle={{ opacity: 0.8 }}
              >
                <ChevronRight
                  size={24}
                  color="white"
                />
              </Button>
            )}
          </>
        )}

        {/* Pagination dots */}
        {images.length > 1 && images.length <= 10 && (
          <XStack
            position="absolute"
            bottom={Platform.OS === 'ios' ? 60 : 40}
            left={0}
            right={0}
            justifyContent="center"
            gap="$2"
          >
            {images.map((_, index) => (
              <Pressable
                key={index}
                onPress={() => scrollToImage(index)}
              >
                <View
                  width={index === currentIndex ? 24 : 8}
                  height={8}
                  borderRadius="$full"
                  bg={index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.4)'}
                />
              </Pressable>
            ))}
          </XStack>
        )}
      </View>
    </Modal>
  )
}
