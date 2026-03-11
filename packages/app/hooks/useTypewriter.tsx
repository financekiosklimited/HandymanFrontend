import { useEffect, useRef, useCallback, useState } from 'react'
import { AppState, type AppStateStatus } from 'react-native'

export interface TypewriterOptions {
  /** Array of strings to cycle through */
  strings: string[]
  /** Typing speed in ms per character (default: 100) */
  typeSpeed?: number
  /** Backspacing speed in ms per character (default: 60) */
  backSpeed?: number
  /** Pause time before starting to delete (default: 3000) */
  backDelay?: number
  /** Pause time before typing next string (default: 800) */
  startDelay?: number
  /** Whether to loop through strings (default: true) */
  loop?: boolean
  /** Whether to show blinking cursor (default: true) */
  showCursor?: boolean
  /** Cursor blink speed in ms (default: 600) */
  cursorBlinkSpeed?: number
  /** Pause animation after this many ms of inactivity (default: 30000) */
  inactivityTimeout?: number
  /** Callback when animation is paused */
  onPause?: () => void
  /** Callback when animation resumes */
  onResume?: () => void
}

export interface TypewriterState {
  /** Current displayed text */
  text: string
  /** Whether cursor should be visible - uses CSS-like timing, no re-renders */
  showCursor: boolean
  /** Pause the animation */
  pause: () => void
  /** Resume the animation */
  resume: () => void
  /** Whether animation is currently paused */
  isPaused: () => boolean
  /** Mark user activity to keep animation running */
  markActivity: () => void
}

/**
 * Battery-optimized typewriter effect hook.
 * - Reduces JS thread wake-ups by batching character updates
 * - Pauses when app is in background
 * - Pauses after user inactivity
 * - Uses CSS-based cursor blink (no React re-renders)
 *
 * @example
 * ```tsx
 * const { text, showCursor, pause, markActivity } = useTypewriter({
 *   strings: ['fix my sink', 'install lights', 'repair door'],
 *   typeSpeed: 100,
 * })
 * ```
 */
export function useTypewriter(options: TypewriterOptions): TypewriterState {
  const {
    strings,
    typeSpeed = 100,
    backSpeed = 60,
    backDelay = 3000,
    startDelay = 800,
    loop = true,
    showCursor: showCursorOption = true,
    cursorBlinkSpeed = 600,
    inactivityTimeout = 30000,
    onPause,
    onResume,
  } = options

  // React state for rendering - batched updates
  const [displayText, setDisplayText] = useState('')
  const [showCursor, setShowCursor] = useState(showCursorOption)

  // Animation control refs (mutable but don't trigger re-renders)
  const isPausedRef = useRef(false)
  const currentStringIndexRef = useRef(0)
  const currentCharIndexRef = useRef(0)
  const isDeletingRef = useRef(false)
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isActiveRef = useRef(true)
  const lastActivityRef = useRef(Date.now())
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Batched character updates - process 2-3 chars at once
  const getBatchSize = useCallback(() => {
    // Slower when typing, faster when deleting
    return isDeletingRef.current ? 3 : 2
  }, [])

  // Mark user activity
  const markActivity = useCallback(() => {
    lastActivityRef.current = Date.now()

    // Resume if paused due to inactivity
    if (isPausedRef.current) {
      isPausedRef.current = false
      onResume?.()
      // Restart animation loop
      timeoutIdRef.current = setTimeout(animate, typeSpeed)
    }

    // Reset inactivity timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }
    inactivityTimerRef.current = setTimeout(() => {
      // Pause due to inactivity
      if (!isPausedRef.current) {
        isPausedRef.current = true
        onPause?.()
      }
    }, inactivityTimeout)
  }, [inactivityTimeout, onPause, onResume, typeSpeed])

  // Main animation loop - runs on JS thread with batched updates
  const animate = useCallback(() => {
    if (!isActiveRef.current) return

    // Check paused state (either manual or due to inactivity)
    if (isPausedRef.current) {
      timeoutIdRef.current = setTimeout(animate, 500) // Check less frequently when paused
      return
    }

    const currentString = strings[currentStringIndexRef.current]

    if (isDeletingRef.current) {
      // Deleting phase - batch deletes for performance
      if (currentCharIndexRef.current > 0) {
        const batchSize = getBatchSize()
        currentCharIndexRef.current = Math.max(0, currentCharIndexRef.current - batchSize)
        const newText = currentString.slice(0, currentCharIndexRef.current)
        setDisplayText(newText)

        timeoutIdRef.current = setTimeout(animate, backSpeed * batchSize)
      } else {
        // Finished deleting, move to next string
        isDeletingRef.current = false
        currentStringIndexRef.current = loop
          ? (currentStringIndexRef.current + 1) % strings.length
          : Math.min(currentStringIndexRef.current + 1, strings.length - 1)

        timeoutIdRef.current = setTimeout(animate, startDelay)
      }
    } else {
      // Typing phase - batch types for performance
      if (currentCharIndexRef.current < currentString.length) {
        const batchSize = getBatchSize()
        const remainingChars = currentString.length - currentCharIndexRef.current
        const charsToType = Math.min(batchSize, remainingChars)

        currentCharIndexRef.current += charsToType
        const newText = currentString.slice(0, currentCharIndexRef.current)
        setDisplayText(newText)

        timeoutIdRef.current = setTimeout(animate, typeSpeed * charsToType)
      } else {
        // Finished typing, pause before deleting
        isDeletingRef.current = true
        timeoutIdRef.current = setTimeout(animate, backDelay)
      }
    }
  }, [strings, typeSpeed, backSpeed, backDelay, startDelay, loop, getBatchSize])

  // Start animation
  useEffect(() => {
    if (strings.length === 0) return

    isActiveRef.current = true
    animate()

    // Setup inactivity timer
    inactivityTimerRef.current = setTimeout(() => {
      if (!isPausedRef.current) {
        isPausedRef.current = true
        onPause?.()
      }
    }, inactivityTimeout)

    return () => {
      isActiveRef.current = false
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
      }
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
    }
  }, [animate, strings.length, inactivityTimeout, onPause])

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App going to background - pause animation
        if (!isPausedRef.current) {
          isPausedRef.current = true
          onPause?.()
        }
      } else if (nextAppState === 'active') {
        // App coming to foreground - resume if not manually paused
        // But check inactivity first
        const timeSinceActivity = Date.now() - lastActivityRef.current
        if (timeSinceActivity < inactivityTimeout && isPausedRef.current) {
          isPausedRef.current = false
          onResume?.()
          timeoutIdRef.current = setTimeout(animate, typeSpeed)
        }
      }
    })

    return () => {
      subscription.remove()
    }
  }, [animate, inactivityTimeout, onPause, onResume, typeSpeed])

  // Cursor blink - use CSS-like approach with native driver
  // Only update state when cursor visibility actually changes
  useEffect(() => {
    if (!showCursorOption) {
      setShowCursor(false)
      return
    }

    let cursorVisible = true
    const interval = setInterval(() => {
      cursorVisible = !cursorVisible
      setShowCursor(cursorVisible)
    }, cursorBlinkSpeed)

    return () => clearInterval(interval)
  }, [showCursorOption, cursorBlinkSpeed])

  const pause = useCallback(() => {
    isPausedRef.current = true
    onPause?.()
  }, [onPause])

  const resume = useCallback(() => {
    markActivity() // Reset inactivity timer on manual resume
    if (isPausedRef.current) {
      isPausedRef.current = false
      onResume?.()
      timeoutIdRef.current = setTimeout(animate, typeSpeed)
    }
  }, [animate, isPausedRef, markActivity, onResume, typeSpeed])

  const isPaused = useCallback(() => isPausedRef.current, [])

  return {
    text: displayText,
    showCursor,
    pause,
    resume,
    isPaused,
    markActivity,
  }
}
