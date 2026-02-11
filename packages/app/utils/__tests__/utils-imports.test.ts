import { describe, it, expect } from 'vitest'

describe('Toast Messages Utilities', () => {
  it('should import toast message functions', async () => {
    const toastMessages = await import('app/utils/toast-messages')
    expect(toastMessages.showSuccessToast).toBeDefined()
    expect(toastMessages.showErrorToast).toBeDefined()
    expect(toastMessages.showJobCreatedToast).toBeDefined()
    expect(toastMessages.showJobUpdatedToast).toBeDefined()
  })
})

describe('Onboarding Storage Utilities', () => {
  it('should import onboarding storage functions', async () => {
    const onboarding = await import('app/utils/onboarding-storage')
    expect(onboarding.hasSeenOnboarding).toBeDefined()
    expect(onboarding.shouldShowOnboarding).toBeDefined()
    expect(onboarding.markOnboardingSeen).toBeDefined()
    expect(onboarding.resetAllOnboarding).toBeDefined()
    expect(onboarding.resetOnboarding).toBeDefined()
  })
})

describe('Notification Toast Storage Utilities', () => {
  it('should import notification toast storage functions', async () => {
    const notifications = await import('app/utils/notification-toast-storage')
    expect(notifications.hasNotificationToastBeenShown).toBeDefined()
    expect(notifications.markNotificationToastAsShown).toBeDefined()
    expect(notifications.clearNotificationToastTracking).toBeDefined()
  })
})

describe('Dev Flags Utilities', () => {
  it('should import dev flags functions', async () => {
    const devFlags = await import('app/utils/dev-flags')
    expect(devFlags.isDevFlagEnabled).toBeDefined()
    expect(devFlags.setDevFlag).toBeDefined()
  })
})
