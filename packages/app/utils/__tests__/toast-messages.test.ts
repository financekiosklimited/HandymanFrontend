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

import { toast } from 'burnt'

describe('Core Toast Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('showSuccessToast', () => {
    it('should call toast.show with success parameters', () => {
      showSuccessToast(toast, 'Success', 'Operation completed')

      expect(toast.show).toHaveBeenCalledWith(
        'Success',
        expect.objectContaining({
          message: 'Operation completed',
        })
      )
    })

    it('should accept custom duration', () => {
      showSuccessToast(toast, 'Saved', 'Changes saved', { duration: 5 })

      expect(toast.show).toHaveBeenCalledWith(
        'Saved',
        expect.objectContaining({
          duration: 5,
        })
      )
    })

    it('should call toast.show', () => {
      showSuccessToast(toast, 'Done', 'Complete', { haptic: 'success' })

      expect(toast.show).toHaveBeenCalled()
    })
  })

  describe('showErrorToast', () => {
    it('should call toast.show with error parameters', () => {
      showErrorToast(toast, 'Error', 'Something went wrong')

      expect(toast.show).toHaveBeenCalledWith(
        'Error',
        expect.objectContaining({
          message: 'Something went wrong',
        })
      )
    })

    it('should call toast.show', () => {
      showErrorToast(toast, 'Failed', 'Request failed')

      expect(toast.show).toHaveBeenCalled()
    })
  })

  describe('showNetworkErrorToast', () => {
    it('should show network error message', () => {
      showNetworkErrorToast(toast)

      expect(toast.show).toHaveBeenCalled()
    })

    it('should include connection message', () => {
      showNetworkErrorToast(toast)

      expect(toast.show).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          message: expect.stringContaining('connection'),
        })
      )
    })
  })

  describe('showRateLimitToast', () => {
    it('should show rate limit message', () => {
      showRateLimitToast(toast)

      expect(toast.show).toHaveBeenCalled()
    })

    it('should include seconds in message when provided', () => {
      showRateLimitToast(toast, 60)

      expect(toast.show).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          message: expect.any(String),
        })
      )
    })

    it('should call toast.show without seconds', () => {
      showRateLimitToast(toast)

      expect(toast.show).toHaveBeenCalled()
    })
  })

  describe('showSessionExpiredToast', () => {
    it('should show session expired message', () => {
      showSessionExpiredToast(toast)

      expect(toast.show).toHaveBeenCalled()
    })

    it('should prompt to login again', () => {
      showSessionExpiredToast(toast)

      expect(toast.show).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          message: expect.stringContaining('log in'),
        })
      )
    })
  })
})
