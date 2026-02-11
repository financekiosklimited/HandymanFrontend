import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  // Core functions
  showSuccessToast,
  showErrorToast,
  // Job management
  showJobCreatedToast,
  showJobUpdatedToast,
  showJobDeletedToast,
  // Application
  showApplicationSubmittedToast,
  showApplicationWithdrawnToast,
  showApplicationApprovedToast,
  showApplicationRejectedToast,
  // Work session
  showSessionStartedToast,
  showSessionEndedToast,
  // Completion
  showJobCompletedToast,
  showCompletionRejectedToast,
  // Direct offers
  showDirectOfferSentToast,
  showDirectOfferAcceptedToast,
  showDirectOfferDeclinedToast,
  // Network
  showNetworkErrorToast,
  showRateLimitToast,
  showSessionExpiredToast,
  showOfflineToast,
  showBackOnlineToast,
  // Upload
  showUploadProgressToast,
  showUploadCompleteToast,
  // Auth
  showPasswordUpdatedToast,
  showPhoneVerifiedToast,
  showProfileUpdatedToast,
} from '../toast-messages'

// Mock toast controller
const mockToast = {
  show: vi.fn(),
}

describe('Toast Message Patterns - Core Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Success Toast Pattern', () => {
    it('should show success with default duration', () => {
      showSuccessToast(mockToast, 'Saved', 'Data saved successfully')

      expect(mockToast.show).toHaveBeenCalledWith(
        'Saved',
        expect.objectContaining({
          message: 'Data saved successfully',
          customData: expect.objectContaining({
            variant: 'success',
          }),
        })
      )
    })

    it('should accept custom duration', () => {
      showSuccessToast(mockToast, 'Done', 'Complete', { duration: 5000 })

      const call = (mockToast.show as any).mock.calls[0]
      expect(call[1].duration).toBe(5000)
    })

    it('should accept custom icon', () => {
      showSuccessToast(mockToast, 'Success', 'Done', { icon: 'CheckCircle2' })

      const call = (mockToast.show as any).mock.calls[0]
      expect(call[1].customData.icon).toBe('CheckCircle2')
    })

    it('should use success variant by default', () => {
      showSuccessToast(mockToast, 'Title', 'Message')

      const call = (mockToast.show as any).mock.calls[0]
      expect(call[1].customData.variant).toBe('success')
    })

    it('should allow custom variant override', () => {
      showSuccessToast(mockToast, 'Title', 'Message', { variant: 'info' })

      const call = (mockToast.show as any).mock.calls[0]
      expect(call[1].customData.variant).toBe('info')
    })
  })

  describe('Error Toast Pattern', () => {
    it('should show error with longer duration', () => {
      showErrorToast(mockToast, 'Error', 'Something went wrong')

      expect(mockToast.show).toHaveBeenCalledWith(
        'Error',
        expect.objectContaining({
          message: 'Something went wrong',
          customData: expect.objectContaining({
            variant: 'error',
          }),
        })
      )
    })

    it('should use error variant', () => {
      showErrorToast(mockToast, 'Failed', 'Request failed')

      const call = (mockToast.show as any).mock.calls[0]
      expect(call[1].customData.variant).toBe('error')
    })

    it('should accept custom options', () => {
      showErrorToast(mockToast, 'Error', 'Message', { duration: 8000 })

      const call = (mockToast.show as any).mock.calls[0]
      expect(call[1].duration).toBe(8000)
    })

    it('should use extraLong duration by default for errors', () => {
      showErrorToast(mockToast, 'Error', 'Message')

      const call = (mockToast.show as any).mock.calls[0]
      expect(call[1].duration).toBe(6000)
    })
  })
})

describe('Toast Categories - Job Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show job created toast', () => {
    showJobCreatedToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[0]).toContain('Job')
    expect(call[1].customData.icon).toBe('CheckCircle2')
    expect(call[1].customData.variant).toBe('success')
  })

  it('should show job updated toast', () => {
    showJobUpdatedToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[1].customData.icon).toBe('Pencil')
  })

  it('should show job deleted toast', () => {
    showJobDeletedToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[1].customData.icon).toBe('Trash2')
  })
})

describe('Toast Categories - Applications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show application submitted toast', () => {
    showApplicationSubmittedToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[0]).toContain('Application')
  })

  it('should show application withdrawn toast', () => {
    showApplicationWithdrawnToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[1].customData.icon).toBe('XCircle')
  })

  it('should show application approved toast', () => {
    showApplicationApprovedToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[1].customData.variant).toBe('success')
    expect(call[1].customData.icon).toBe('UserCheck')
  })

  it('should show application rejected toast', () => {
    showApplicationRejectedToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[1].customData.icon).toBe('UserX')
  })
})

describe('Toast Categories - Work Sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show session started toast', () => {
    showSessionStartedToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[0]).toContain('session')
    expect(call[1].customData.icon).toBe('Timer')
  })

  it('should show session ended toast', () => {
    showSessionEndedToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[0]).toContain('session')
    expect(call[1].customData.icon).toBe('Timer')
  })
})

describe('Toast Categories - Completion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show job completed toast', () => {
    showJobCompletedToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[0]).toContain('completed')
    expect(call[1].customData.icon).toBe('Award')
  })

  it('should show completion rejected toast', () => {
    showCompletionRejectedToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[1].customData.variant).toBe('success')
    expect(call[1].customData.icon).toBe('X')
  })
})

describe('Toast Categories - Direct Offers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show direct offer sent toast', () => {
    showDirectOfferSentToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[0]).toContain('Offer')
  })

  it('should show direct offer accepted toast', () => {
    showDirectOfferAcceptedToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[1].customData.icon).toBe('UserCheck')
  })

  it('should show direct offer declined toast', () => {
    showDirectOfferDeclinedToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[1].customData.icon).toBe('XCircle')
  })
})

describe('Toast Categories - Network', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show network error toast', () => {
    showNetworkErrorToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[0]).toContain('Connection')
    expect(call[1].customData.variant).toBe('error')
    expect(call[1].customData.icon).toBe('WifiOff')
  })

  it('should show rate limit toast without seconds', () => {
    showRateLimitToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[0]).toContain('wait')
    expect(call[1].customData.icon).toBe('Timer')
  })

  it('should show rate limit toast with seconds', () => {
    showRateLimitToast(mockToast, 60)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[1].message).toContain('60')
  })

  it('should show session expired toast', () => {
    showSessionExpiredToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[0]).toContain('Session')
    expect(call[1].message).toContain('log in')
    expect(call[1].customData.variant).toBe('error')
  })

  it('should show offline toast', () => {
    showOfflineToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[0]).toContain('offline')
    expect(call[1].customData.icon).toBe('WifiOff')
  })

  it('should show back online toast', () => {
    showBackOnlineToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[0]).toContain('online')
    expect(call[1].customData.icon).toBe('RefreshCw')
  })

  it('should show back online with sync count', () => {
    showBackOnlineToast(mockToast, 5)

    const call = (mockToast.show as any).mock.calls[0]
    expect(call[1].message).toContain('5')
  })
})

describe('Toast Categories - Upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show upload progress at 0%', () => {
    showUploadProgressToast(mockToast, 0)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[1].message).toContain('0%')
    expect(call[1].customData.icon).toBe('Upload')
  })

  it('should show upload progress at 50%', () => {
    showUploadProgressToast(mockToast, 50)

    const call = (mockToast.show as any).mock.calls[0]
    expect(call[1].message).toContain('50%')
  })

  it('should show upload progress at 100%', () => {
    showUploadProgressToast(mockToast, 100)

    const call = (mockToast.show as any).mock.calls[0]
    expect(call[1].message).toContain('100%')
    expect(call[1].customData.icon).toBe('Loader')
  })

  it('should show upload complete', () => {
    showUploadCompleteToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[0]).toContain('Upload')
    expect(call[1].customData.icon).toBe('CheckCircle2')
  })
})

describe('Toast Categories - Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show password updated toast', () => {
    showPasswordUpdatedToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[0]).toContain('Password')
  })

  it('should show phone verified toast', () => {
    showPhoneVerifiedToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[0]).toContain('Phone')
  })

  it('should show profile updated toast', () => {
    showProfileUpdatedToast(mockToast)

    expect(mockToast.show).toHaveBeenCalled()
    const call = (mockToast.show as any).mock.calls[0]
    expect(call[0]).toContain('Profile')
  })
})

describe('Toast Message Consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('all success toasts should use success variant', () => {
    showJobCreatedToast(mockToast)
    showApplicationApprovedToast(mockToast)
    showJobCompletedToast(mockToast)

    const calls = (mockToast.show as any).mock.calls
    calls.forEach((call: any) => {
      expect(call[1].customData.variant).toBe('success')
    })
  })

  it('all error toasts should use error variant', () => {
    showNetworkErrorToast(mockToast)
    showSessionExpiredToast(mockToast)

    const calls = (mockToast.show as any).mock.calls
    calls.forEach((call: any) => {
      expect(call[1].customData.variant).toBe('error')
    })
  })

  it('all toast titles should be non-empty', () => {
    showJobCreatedToast(mockToast)
    showApplicationSubmittedToast(mockToast)
    showSessionStartedToast(mockToast)

    const calls = (mockToast.show as any).mock.calls
    calls.forEach((call: any) => {
      expect(call[0]).toBeTruthy()
      expect(call[0].length).toBeGreaterThan(0)
    })
  })

  it('all toast messages should be non-empty', () => {
    showJobCreatedToast(mockToast)
    showApplicationSubmittedToast(mockToast)
    showSessionStartedToast(mockToast)

    const calls = (mockToast.show as any).mock.calls
    calls.forEach((call: any) => {
      expect(call[1].message).toBeTruthy()
      expect(call[1].message.length).toBeGreaterThan(0)
    })
  })
})

describe('Toast Duration Patterns', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('success toasts should have standard duration', () => {
    showSuccessToast(mockToast, 'Test', 'Message')

    const call = (mockToast.show as any).mock.calls[0]
    expect(call[1].duration).toBeGreaterThan(0)
  })

  it('error toasts should have longer duration', () => {
    showErrorToast(mockToast, 'Test', 'Message')

    const call = (mockToast.show as any).mock.calls[0]
    expect(call[1].duration).toBe(6000)
  })

  it('upload progress should use short duration', () => {
    showUploadProgressToast(mockToast, 50)

    const call = (mockToast.show as any).mock.calls[0]
    expect(call[1].duration).toBe(3000)
  })
})

describe('Toast Native Option', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should default native to false', () => {
    showSuccessToast(mockToast, 'Test', 'Message')

    const call = (mockToast.show as any).mock.calls[0]
    expect(call[1].native).toBe(false)
  })

  it('should allow native to be true', () => {
    showSuccessToast(mockToast, 'Test', 'Message', { native: true })

    const call = (mockToast.show as any).mock.calls[0]
    expect(call[1].native).toBe(true)
  })
})
