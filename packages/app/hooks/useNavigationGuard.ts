import { useCallback, useRef, useState } from 'react'
import { useRouter, usePathname, type Href } from 'expo-router'

interface NavigationOptions {
  /** Delay in ms before allowing next navigation (default: 500ms) */
  delay?: number
  /** Whether to show loading state during navigation */
  trackLoading?: boolean
}

/**
 * Hook to prevent double navigation when buttons are pressed rapidly
 * or when navigation is triggered multiple times from effects
 *
 * The issue: "screen pops up instantly, then animation plays, showing the same screen"
 * happens because navigation is triggered multiple times before the first animation completes.
 *
 * Usage:
 * const { navigate, push, replace, isNavigating } = useNavigationGuard()
 *
 * <Button
 *   onPress={() => navigate('/(homeowner)/jobs')}
 *   disabled={isNavigating}
 * >
 *   Go to Jobs
 * </Button>
 */
export function useNavigationGuard(options: NavigationOptions = {}) {
  const { delay = 500, trackLoading = true } = options
  const router = useRouter()
  const currentPathname = usePathname()

  // Track if we're currently navigating
  const isNavigatingRef = useRef(false)
  const [isNavigating, setIsNavigating] = useState(false)

  // Store timeout to clear it if needed
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const setNavigating = useCallback(
    (value: boolean) => {
      isNavigatingRef.current = value
      if (trackLoading) {
        setIsNavigating(value)
      }
    },
    [trackLoading]
  )

  const clearNavigationLock = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setNavigating(false)
    }, delay)
  }, [delay, setNavigating])

  /**
   * Navigate to a route - prevents double navigation
   * Uses router.navigate() which doesn't add duplicate screens to stack
   */
  const navigate = useCallback(
    (href: Href) => {
      // Prevent navigation if already navigating
      if (isNavigatingRef.current) {
        return
      }

      // Don't navigate if we're already on this screen
      const targetPath = typeof href === 'string' ? href : href.pathname
      if (targetPath === currentPathname) {
        return
      }

      setNavigating(true)

      try {
        router.navigate(href)
        clearNavigationLock()
      } catch (error) {
        setNavigating(false)
        throw error
      }
    },
    [router, currentPathname, setNavigating, clearNavigationLock]
  )

  /**
   * Push a route onto the stack - prevents double navigation
   * Uses router.push() which adds a new screen even if it exists in stack
   */
  const push = useCallback(
    (href: Href) => {
      if (isNavigatingRef.current) {
        return
      }

      setNavigating(true)

      try {
        router.push(href)
        clearNavigationLock()
      } catch (error) {
        setNavigating(false)
        throw error
      }
    },
    [router, setNavigating, clearNavigationLock]
  )

  /**
   * Replace current route - prevents double navigation
   * Uses router.replace() which replaces current screen in stack
   */
  const replace = useCallback(
    (href: Href) => {
      if (isNavigatingRef.current) {
        return
      }

      setNavigating(true)

      try {
        router.replace(href)
        clearNavigationLock()
      } catch (error) {
        setNavigating(false)
        throw error
      }
    },
    [router, setNavigating, clearNavigationLock]
  )

  /**
   * Go back - prevents double navigation
   */
  const back = useCallback(() => {
    if (isNavigatingRef.current) {
      return
    }

    setNavigating(true)

    try {
      router.back()
      clearNavigationLock()
    } catch (error) {
      setNavigating(false)
      throw error
    }
  }, [router, setNavigating, clearNavigationLock])

  /**
   * Dismiss modal - prevents double navigation
   */
  const dismiss = useCallback(() => {
    if (isNavigatingRef.current) {
      return
    }

    setNavigating(true)

    try {
      // @ts-ignore - dismiss might not be available in all router versions
      if (router.dismiss) {
        router.dismiss()
      } else {
        router.back()
      }
      clearNavigationLock()
    } catch (error) {
      setNavigating(false)
      throw error
    }
  }, [router, setNavigating, clearNavigationLock])

  return {
    navigate,
    push,
    replace,
    back,
    dismiss,
    isNavigating,
    /**
     * Raw router for advanced use cases
     * Use with caution - prefer the guarded methods above
     */
    router,
  }
}
