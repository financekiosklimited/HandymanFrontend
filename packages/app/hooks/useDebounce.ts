import { useState, useEffect } from 'react'

/**
 * Hook to debounce a value.
 * Useful for reducing API calls when user is typing.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 400)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
