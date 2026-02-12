import { useEffect, useRef, useCallback } from 'react'
import Animated from 'react-native-reanimated'
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'

interface AnimatedTaskItemProps {
  taskId: string
  children: React.ReactNode
  onRemove: (taskId: string) => void
  index: number
}

/**
 * Animated wrapper for task items
 * Provides spring entrance from right and slide-out-left exit
 */
export function AnimatedTaskItem({ taskId, children, onRemove, index }: AnimatedTaskItemProps) {
  const entranceProgress = useSharedValue(0)
  const exitProgress = useSharedValue(1)
  const isExiting = useRef(false)

  // Entrance animation - staggered based on index
  useEffect(() => {
    const delay = index * 50 // Small stagger for list items
    const timeout = setTimeout(() => {
      entranceProgress.value = withSpring(1, {
        damping: 12,
        stiffness: 200,
        mass: 0.6,
        velocity: 0.5,
      })
    }, delay)

    return () => clearTimeout(timeout)
  }, [index, entranceProgress])

  // Exit animation handler
  const handleRemove = useCallback(() => {
    if (isExiting.current) return
    isExiting.current = true

    exitProgress.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished) {
        runOnJS(onRemove)(taskId)
      }
    })
  }, [exitProgress, onRemove, taskId])

  // Combined animated style
  const animatedStyle = useAnimatedStyle(() => {
    // Entrance: slide from right
    const entranceX = (1 - entranceProgress.value) * 50

    // Exit: slide left
    const exitX = (1 - exitProgress.value) * -100
    const exitOpacity = exitProgress.value

    return {
      opacity: exitOpacity,
      transform: [
        {
          translateX: entranceX + exitX,
        },
        {
          scale: 0.95 + entranceProgress.value * 0.05, // 0.95 -> 1.0
        },
      ],
    }
  })

  return <Animated.View style={animatedStyle}>{children}</Animated.View>
}
