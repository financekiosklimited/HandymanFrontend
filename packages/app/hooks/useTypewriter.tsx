import { useEffect, useRef, useCallback, useState } from 'react'
import type { ViewStyle, TextStyle } from 'react-native'
import Animated from 'react-native-reanimated'

export interface TypewriterOptions {
  /** Array of strings to cycle through */
  strings: string[]
  /** Typing speed in ms per character (default: 80) */
  typeSpeed?: number
  /** Backspacing speed in ms per character (default: 50) */
  backSpeed?: number
  /** Pause time before starting to delete (default: 2000) */
  backDelay?: number
  /** Pause time before typing next string (default: 500) */
  startDelay?: number
  /** Whether to loop through strings (default: true) */
  loop?: boolean
  /** Whether to show blinking cursor (default: true) */
  showCursor?: boolean
  /** Cursor blink speed in ms (default: 530) */
  cursorBlinkSpeed?: number
  /** Callback when animation is paused */
  onPause?: () => void
  /** Callback when animation resumes */
  onResume?: () => void
}

export interface TypewriterState {
  /** Current displayed text - use with animatedProps */
  text: string
  /** Whether cursor should be visible */
  showCursor: boolean
  /** Pause the animation */
  pause: () => void
  /** Resume the animation */
  resume: () => void
  /** Whether animation is currently paused */
  isPaused: () => boolean
}

/**
 * Reanimated-based typewriter effect hook.
 * Uses JS thread for timing logic but shared values for smooth UI updates.
 *
 * @example
 * ```tsx
 * const { text, showCursor, pause } = useTypewriter({
 *   strings: ['fix my sink', 'install lights', 'repair door'],
 *   typeSpeed: 80,
 * })
 *
 * <Text>{text}<Text style={{ opacity: showCursor ? 1 : 0 }}>|</Text></Text>
 * ```
 */
export function useTypewriter(options: TypewriterOptions): TypewriterState {
  const {
    strings,
    typeSpeed = 80,
    backSpeed = 50,
    backDelay = 2000,
    startDelay = 500,
    loop = true,
    showCursor: showCursorOption = true,
    onPause,
    onResume,
  } = options

  // React state for rendering
  const [displayText, setDisplayText] = useState('')
  const [showCursor, setShowCursor] = useState(showCursorOption)

  // Animation control refs (mutable but don't trigger re-renders)
  const isPausedRef = useRef(false)
  const currentStringIndexRef = useRef(0)
  const currentCharIndexRef = useRef(0)
  const isDeletingRef = useRef(false)
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isActiveRef = useRef(true)

  // Main animation loop - runs on JS thread
  useEffect(() => {
    if (strings.length === 0) return

    isActiveRef.current = true

    const animate = () => {
      if (!isActiveRef.current) return

      // Check paused state
      if (isPausedRef.current) {
        timeoutIdRef.current = setTimeout(animate, 100)
        return
      }

      const currentString = strings[currentStringIndexRef.current]

      if (isDeletingRef.current) {
        // Deleting phase
        if (currentCharIndexRef.current > 0) {
          currentCharIndexRef.current--
          const newText = currentString.slice(0, currentCharIndexRef.current)
          setDisplayText(newText)

          timeoutIdRef.current = setTimeout(animate, backSpeed)
        } else {
          // Finished deleting, move to next string
          isDeletingRef.current = false
          currentStringIndexRef.current = loop
            ? (currentStringIndexRef.current + 1) % strings.length
            : Math.min(currentStringIndexRef.current + 1, strings.length - 1)

          timeoutIdRef.current = setTimeout(animate, startDelay)
        }
      } else {
        // Typing phase
        if (currentCharIndexRef.current < currentString.length) {
          currentCharIndexRef.current++
          const newText = currentString.slice(0, currentCharIndexRef.current)
          setDisplayText(newText)

          timeoutIdRef.current = setTimeout(animate, typeSpeed)
        } else {
          // Finished typing, pause before deleting
          isDeletingRef.current = true
          timeoutIdRef.current = setTimeout(animate, backDelay)
        }
      }
    }

    // Start animation after initial delay
    timeoutIdRef.current = setTimeout(animate, startDelay)

    return () => {
      isActiveRef.current = false
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
      }
    }
  }, [strings, typeSpeed, backSpeed, backDelay, startDelay, loop])

  // Cursor blink effect
  useEffect(() => {
    if (!showCursorOption) {
      setShowCursor(false)
      return
    }

    const interval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 530)

    return () => clearInterval(interval)
  }, [showCursorOption])

  // Control functions
  const pause = useCallback(() => {
    isPausedRef.current = true
    onPause?.()
  }, [onPause])

  const resume = useCallback(() => {
    isPausedRef.current = false
    onResume?.()
  }, [onResume])

  const isPaused = useCallback(() => {
    return isPausedRef.current
  }, [])

  return {
    text: displayText,
    showCursor,
    pause,
    resume,
    isPaused,
  }
}

/**
 * Pre-configured animated typewriter component for the search bar.
 * Optimized for smooth performance on the guest home screen.
 */
export function SearchTypewriter({
  strings,
  style,
  textStyle,
  onPress,
}: {
  strings: string[]
  style?: ViewStyle
  textStyle?: TextStyle
  onPress?: () => void
}) {
  const { text, showCursor, pause, resume } = useTypewriter({
    strings,
    typeSpeed: 80,
    backSpeed: 40,
    backDelay: 2000,
    startDelay: 800,
    loop: true,
    showCursor: true,
  })

  const handlePress = useCallback(() => {
    pause()
    onPress?.()
    // Resume after 5 seconds
    setTimeout(() => {
      resume()
    }, 5000)
  }, [pause, resume, onPress])

  return (
    <Animated.View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      <Animated.Text style={textStyle}>{text}</Animated.Text>
      <Animated.Text
        style={[
          textStyle,
          {
            opacity: showCursor ? 1 : 0,
            marginLeft: 1,
          },
        ]}
      >
        |
      </Animated.Text>
    </Animated.View>
  )
}

export default useTypewriter
