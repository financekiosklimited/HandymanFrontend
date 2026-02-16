'use client'

import { useState } from 'react'
import { YStack, XStack, Text, Button, View, Sheet, ScrollView } from 'tamagui'
import { ArrowLeft, HelpCircle, X } from '@tamagui/lucide-icons'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ICON_BUTTON_PRESS, PRIMARY_BUTTON_PRESS } from './pressAnimations'

interface PageHeaderProps {
  title: string
  description: string
  showBack?: boolean
  onBack?: () => void
  rightElement?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  showBack = true,
  onBack,
  rightElement,
}: PageHeaderProps) {
  const router = useRouter()
  const [helpOpen, setHelpOpen] = useState(false)
  const insets = useSafeAreaInsets()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <>
      <XStack
        px="$4"
        py="$3"
        alignItems="center"
        justifyContent="space-between"
        gap="$3"
      >
        {/* Back Button */}
        {showBack ? (
          <Button
            unstyled
            onPress={handleBack}
            p="$2"
            hitSlop={12}
            pressStyle={ICON_BUTTON_PRESS}
            width={38}
            alignItems="flex-start"
          >
            <ArrowLeft
              size={24}
              color="$color"
            />
          </Button>
        ) : (
          <View width={38} />
        )}

        {/* Title */}
        <Text
          flex={1}
          fontSize={17}
          fontWeight="700"
          color="$color"
          textAlign="center"
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* Help Button or Custom Right Element */}
        {rightElement ? (
          <View
            width={38}
            alignItems="flex-end"
          >
            {rightElement}
          </View>
        ) : (
          <Button
            unstyled
            onPress={() => setHelpOpen(true)}
            p="$2"
            hitSlop={12}
            pressStyle={ICON_BUTTON_PRESS}
            width={38}
            alignItems="flex-end"
          >
            <HelpCircle
              size={22}
              color="$primary"
            />
          </Button>
        )}
      </XStack>

      {/* Help Sheet */}
      <Sheet
        open={helpOpen}
        onOpenChange={setHelpOpen}
        snapPoints={[40]}
        dismissOnSnapToBottom
        modal
      >
        <Sheet.Overlay
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Frame
          borderTopLeftRadius="$6"
          borderTopRightRadius="$6"
          bg="$backgroundStrong"
        >
          <Sheet.Handle
            bg="$colorMuted"
            mt="$3"
          />

          <YStack
            pt="$4"
            px="$4"
            pb={insets.bottom ? insets.bottom + 16 : '$4'}
            gap="$4"
            flex={1}
          >
            {/* Header */}
            <XStack
              alignItems="center"
              justifyContent="space-between"
            >
              <Text
                fontSize="$6"
                fontWeight="bold"
                color="$color"
              >
                About This Page
              </Text>
              <Button
                unstyled
                onPress={() => setHelpOpen(false)}
                p="$2"
                hitSlop={12}
                pressStyle={ICON_BUTTON_PRESS}
              >
                <X
                  size={24}
                  color="$colorMuted"
                />
              </Button>
            </XStack>

            {/* Content */}
            <ScrollView
              flex={1}
              showsVerticalScrollIndicator={false}
            >
              <Text
                fontSize="$4"
                color="$colorSubtle"
                lineHeight={24}
              >
                {description}
              </Text>
            </ScrollView>

            {/* Close Button */}
            <Button
              bg="$primary"
              borderRadius="$4"
              py="$3"
              onPress={() => setHelpOpen(false)}
              pressStyle={PRIMARY_BUTTON_PRESS}
            >
              <Text
                color="white"
                fontSize="$4"
                fontWeight="600"
              >
                Got it
              </Text>
            </Button>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
