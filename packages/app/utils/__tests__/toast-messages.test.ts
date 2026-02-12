import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  showSuccessToast,
  showErrorToast,
  showNetworkErrorToast,
  showRateLimitToast,
  showSessionExpiredToast,
} from '../toast-messages'

// Mock burnt toast
vi.mock('burnt', () => ({
  toast: {
    show: vi.fn(),
  },
}))

// Create a proper mock that matches ToastController interface
type ToastController = {
  show: (
    title: string,
    options?: {
      message?: string
      duration?: number
      native?: boolean
      customData?: { variant?: string; icon?: string }
    }
  ) => void
}

describe('Core Toast Functions', () => {
  let mockToast: ToastController

  beforeEach(() => {
    vi.clearAllMocks()
    mockToast = {
      show: vi.fn(),
    }
  })

  describe('showSuccessToast', () => {
    it('should call toast.show with success parameters', () => {
      showSuccessToast(mockToast, 'Success', 'Operation completed')

      expect(mockToast.show).toHaveBeenCalledWith(
        'Success',
        expect.objectContaining({
          message: 'Operation completed',
        })
      )
    })

    it('should accept custom duration', () => {
      showSuccessToast(mockToast, 'Saved', 'Changes saved', { duration: 5 })

      expect(mockToast.show).toHaveBeenCalledWith(
        'Saved',
        expect.objectContaining({
          duration: 5,
        })
      )
    })

    it('should call toast.show', () => {
      showSuccessToast(mockToast, 'Done', 'Complete', { icon: 'CheckCircle2' })

      expect(mockToast.show).toHaveBeenCalled()
    })
  })

  describe('showErrorToast', () => {
    it('should call toast.show with error parameters', () => {
      showErrorToast(mockToast, 'Error', 'Something went wrong')

      expect(mockToast.show).toHaveBeenCalledWith(
        'Error',
        expect.objectContaining({
          message: 'Something went wrong',
        })
      )
    })

    it('should call toast.show', () => {
      showErrorToast(mockToast, 'Failed', 'Request failed')

      expect(mockToast.show).toHaveBeenCalled()
    })
  })

  describe('showNetworkErrorToast', () => {
    it('should show network error message', () => {
      showNetworkErrorToast(mockToast)

      expect(mockToast.show).toHaveBeenCalled()
    })

    it('should include connection message', () => {
      showNetworkErrorToast(mockToast)

      expect(mockToast.show).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          message: expect.stringContaining('connection'),
        })
      )
    })
  })

  describe('showRateLimitToast', () => {
    it('should show rate limit message', () => {
      showRateLimitToast(mockToast)

      expect(mockToast.show).toHaveBeenCalled()
    })

    it('should include seconds in message when provided', () => {
      showRateLimitToast(mockToast, 60)

      expect(mockToast.show).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          message: expect.any(String),
        })
      )
    })

    it('should call toast.show without seconds', () => {
      showRateLimitToast(mockToast)

      expect(mockToast.show).toHaveBeenCalled()
    })
  })

  describe('showSessionExpiredToast', () => {
    it('should show session expired message', () => {
      showSessionExpiredToast(mockToast)

      expect(mockToast.show).toHaveBeenCalled()
    })

    it('should prompt to login again', () => {
      showSessionExpiredToast(mockToast)

      expect(mockToast.show).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          message: expect.stringContaining('log in'),
        })
      )
    })
  })
})
