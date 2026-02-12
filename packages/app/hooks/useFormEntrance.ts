import { useEffect } from 'react'
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  interpolate,
} from 'react-native-reanimated'

interface UseFormEntranceOptions {
  delay?: number
  duration?: number
  staggerDelay?: number
}

interface AnimatedSection {
  opacity: number
  translateY: number
}

/**
 * Hook for form entrance stagger animations
 * Returns animated styles for each form section
 */
export function useFormEntrance(sectionCount: number, options: UseFormEntranceOptions = {}) {
  const { delay = 0, staggerDelay = 100 } = options

  // Create shared values for each section
  const progressValues = Array.from({ length: sectionCount }, () => useSharedValue(0))

  useEffect(() => {
    progressValues.forEach((progress, index) => {
      const sectionDelay = delay + index * staggerDelay
      progress.value = withDelay(
        sectionDelay,
        withSpring(1, {
          damping: 15,
          stiffness: 150,
          mass: 0.8,
        })
      )
    })
  }, [delay, staggerDelay, progressValues])

  // Generate animated styles for each section
  const getSectionStyle = (index: number) => {
    return useAnimatedStyle(() => {
      const progress = progressValues[index]?.value ?? 0
      return {
        opacity: interpolate(progress, [0, 1], [0, 1]),
        transform: [
          {
            translateY: interpolate(progress, [0, 1], [20, 0]),
          },
        ],
      }
    })
  }

  return { getSectionStyle }
}

/**
 * Hook for individual element entrance animation
 */
export function useElementEntrance(delay = 0) {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withSpring(1, {
        damping: 15,
        stiffness: 150,
        mass: 0.8,
      })
    )
  }, [delay, progress])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 1], [0, 1]),
      transform: [
        {
          translateY: interpolate(progress.value, [0, 1], [20, 0]),
        },
      ],
    }
  })

  return animatedStyle
}
