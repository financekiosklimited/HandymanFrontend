import { useCallback } from 'react'
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'

interface TaskAnimationState {
  opacity: number
  translateX: number
  translateY: number
  scale: number
}

interface UseTaskAnimationsOptions {
  onRemoveComplete?: (taskId: string) => void
}

/**
 * Hook for task item entrance and exit animations
 * Uses spring physics for natural, premium feel
 */
export function useTaskAnimations(taskId: string, options: UseTaskAnimationsOptions = {}) {
  const { onRemoveComplete } = options

  // Entrance animation state
  const entranceProgress = useSharedValue(0)

  // Exit animation state
  const exitProgress = useSharedValue(1)

  // Initialize entrance animation
  const animateEntrance = useCallback(() => {
    entranceProgress.value = withSpring(1, {
      damping: 12,
      stiffness: 200,
      mass: 0.6,
      velocity: 0.5,
    })
  }, [entranceProgress])

  // Animate exit with callback
  const animateExit = useCallback(() => {
    exitProgress.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished && onRemoveComplete) {
        runOnJS(onRemoveComplete)(taskId)
      }
    })
  }, [exitProgress, taskId, onRemoveComplete])

  // Combined animated style
  const animatedStyle = useAnimatedStyle(() => {
    // Entrance: slide in from right
    const entranceTranslateX = entranceProgress.value * 20 - 20 // -20 to 0

    // Exit: slide left and fade
    const exitTranslateX = (1 - exitProgress.value) * -100 // 0 to -100
    const exitOpacity = exitProgress.value

    return {
      opacity: exitOpacity,
      transform: [
        {
          translateX: entranceTranslateX + exitTranslateX,
        },
        {
          scale: exitProgress.value,
        },
      ],
    }
  })

  return {
    animatedStyle,
    animateEntrance,
    animateExit,
  }
}

/**
 * Hook for managing a list of animated tasks
 */
export function useAnimatedTaskList<T extends { id: string }>() {
  const taskAnimations = new Map<string, ReturnType<typeof useTaskAnimations>>()

  const registerTask = useCallback(
    (taskId: string, animation: ReturnType<typeof useTaskAnimations>) => {
      taskAnimations.set(taskId, animation)
    },
    [taskAnimations]
  )

  const removeTask = useCallback(
    (taskId: string) => {
      const animation = taskAnimations.get(taskId)
      if (animation) {
        animation.animateExit()
        return true
      }
      return false
    },
    [taskAnimations]
  )

  return {
    registerTask,
    removeTask,
  }
}
