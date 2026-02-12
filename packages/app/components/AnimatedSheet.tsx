import { useEffect } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { Sheet } from '@my/ui'

interface AnimatedSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  snapPoints?: number[]
  children: React.ReactNode
  title?: string
}

/**
 * Bottom sheet with spring entrance animation
 * Content staggers in for premium feel
 */
export function AnimatedSheet({
  open,
  onOpenChange,
  snapPoints = [60],
  children,
  title,
}: AnimatedSheetProps) {
  const contentProgress = useSharedValue(0)

  // Animate content when sheet opens
  useEffect(() => {
    if (open) {
      contentProgress.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
        mass: 0.8,
      })
    } else {
      contentProgress.value = 0
    }
  }, [open, contentProgress])

  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentProgress.value,
      transform: [
        {
          translateY: (1 - contentProgress.value) * 20,
        },
      ],
    }
  })

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      dismissOnSnapToBottom
      modal
    >
      <Sheet.Overlay
        animation="100ms"
        opacity={0.5}
      />
      <Sheet.Frame
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
      >
        <Sheet.Handle
          bg="$colorMuted"
          mt="$3"
        />
        <Animated.View style={contentStyle}>{children}</Animated.View>
      </Sheet.Frame>
    </Sheet>
  )
}
