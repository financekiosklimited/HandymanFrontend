import { describe, it, expect } from 'vitest'

describe('Auth Hooks', () => {
  it('should import useLogin', async () => {
    const { useLogin } = await import('@my/api/hooks/auth')
    expect(useLogin).toBeDefined()
  })

  it('should import useRegister', async () => {
    const { useRegister } = await import('@my/api/hooks/auth')
    expect(useRegister).toBeDefined()
  })

  it('should import useLogout', async () => {
    const { useLogout } = await import('@my/api/hooks/auth')
    expect(useLogout).toBeDefined()
  })

  it('should import useRefreshToken', async () => {
    const { useRefreshToken } = await import('@my/api/hooks/auth')
    expect(useRefreshToken).toBeDefined()
  })

  it('should import useAuthRole', async () => {
    const { useAuthRole } = await import('@my/api/hooks/auth')
    expect(useAuthRole).toBeDefined()
  })
})

describe('Guest Hooks', () => {
  it('should import useGuestJobs', async () => {
    const { useGuestJobs } = await import('@my/api/hooks/guest')
    expect(useGuestJobs).toBeDefined()
  })

  it('should import useGuestHandymen', async () => {
    const { useGuestHandymen } = await import('@my/api/hooks/guest')
    expect(useGuestHandymen).toBeDefined()
  })

  it('should import useReimbursementCategories', async () => {
    const { useReimbursementCategories } = await import('@my/api/hooks/guest')
    expect(useReimbursementCategories).toBeDefined()
  })
})

describe('Homeowner Hooks', () => {
  it('should import useHomeownerJobs', async () => {
    const { useHomeownerJobs } = await import('@my/api/hooks/homeowner')
    expect(useHomeownerJobs).toBeDefined()
  })

  it('should import useCreateJob', async () => {
    const { useCreateJob } = await import('@my/api/hooks/homeowner')
    expect(useCreateJob).toBeDefined()
  })

  it('should import useUpdateJob', async () => {
    const { useUpdateJob } = await import('@my/api/hooks/homeowner')
    expect(useUpdateJob).toBeDefined()
  })

  it('should import useDeleteJob', async () => {
    const { useDeleteJob } = await import('@my/api/hooks/homeowner')
    expect(useDeleteJob).toBeDefined()
  })

  it('should import useHomeownerNotifications', async () => {
    const { useHomeownerNotifications } = await import('@my/api/hooks/homeowner')
    expect(useHomeownerNotifications).toBeDefined()
  })

  it('should import useHomeownerDirectOffers', async () => {
    const { useHomeownerDirectOffers } = await import('@my/api/hooks/homeowner')
    expect(useHomeownerDirectOffers).toBeDefined()
  })
})

describe('Handyman Hooks', () => {
  it('should import useHandymanJobsForYou', async () => {
    const { useHandymanJobsForYou } = await import('@my/api/hooks/handyman')
    expect(useHandymanJobsForYou).toBeDefined()
  })

  it('should import useApplyForJob', async () => {
    const { useApplyForJob } = await import('@my/api/hooks/handyman')
    expect(useApplyForJob).toBeDefined()
  })

  it('should import useHandymanProfile', async () => {
    const { useHandymanProfile } = await import('@my/api/hooks/handyman')
    expect(useHandymanProfile).toBeDefined()
  })

  it('should import useHandymanDirectOffers', async () => {
    const { useHandymanDirectOffers } = await import('@my/api/hooks/handyman')
    expect(useHandymanDirectOffers).toBeDefined()
  })

  it('should import useAcceptDirectOffer', async () => {
    const { useAcceptDirectOffer } = await import('@my/api/hooks/handyman')
    expect(useAcceptDirectOffer).toBeDefined()
  })
})

describe('Common Hooks', () => {
  it('should import useCategories', async () => {
    const { useCategories } = await import('@my/api/hooks/common')
    expect(useCategories).toBeDefined()
  })

  it('should import useCities', async () => {
    const { useCities } = await import('@my/api/hooks/common')
    expect(useCities).toBeDefined()
  })

  it('should import useChatMessages', async () => {
    const { useChatMessages } = await import('@my/api/hooks/common')
    expect(useChatMessages).toBeDefined()
  })

  it('should import useSendMessage', async () => {
    const { useSendMessage } = await import('@my/api/hooks/common')
    expect(useSendMessage).toBeDefined()
  })

  it('should import useJobChat', async () => {
    const { useJobChat } = await import('@my/api/hooks/common')
    expect(useJobChat).toBeDefined()
  })
})
