import { readFile } from 'node:fs/promises'
import { fileURLToPath, URL as NodeUrl } from 'node:url'
import { describe, expect, it } from 'vitest'

function sourcePath(relativePath: string) {
  return fileURLToPath(new NodeUrl(relativePath, import.meta.url))
}

describe('location refresh API exports', () => {
  it('exports dedicated homeowner, handyman, and guest location refresh hooks', async () => {
    const homeownerHooks = await readFile(sourcePath('../hooks/homeowner/index.ts'), 'utf8')
    const handymanHooks = await readFile(sourcePath('../hooks/handyman/index.ts'), 'utf8')
    const guestHooks = await readFile(sourcePath('../hooks/guest/index.ts'), 'utf8')

    expect(homeownerHooks).toContain('useRefreshHomeownerLocation')

    expect(handymanHooks).toContain('useRefreshHandymanLocation')

    expect(guestHooks).toContain('useRefreshGuestLocation')
  })

  it('defines the shared and role-specific location refresh type contracts', async () => {
    const commonTypes = await readFile(sourcePath('../types/common.ts'), 'utf8')
    const homeownerTypes = await readFile(sourcePath('../types/homeowner.ts'), 'utf8')
    const handymanTypes = await readFile(sourcePath('../types/handyman.ts'), 'utf8')
    const guestTypes = await readFile(sourcePath('../types/guest.ts'), 'utf8')

    expect(commonTypes).toContain('interface CitySummary')
    expect(commonTypes).toContain('interface LocationSnapshot')
    expect(commonTypes).toContain('current_city')

    expect(homeownerTypes).toContain('interface HomeownerLocationRefreshRequest')
    expect(homeownerTypes).toContain('interface HomeownerLocationRefreshResponse')
    expect(homeownerTypes).toContain('city: CitySummary | null')

    expect(handymanTypes).toContain('interface HandymanLocationRefreshRequest')
    expect(handymanTypes).toContain('interface HandymanLocationRefreshResponse')

    expect(guestTypes).toContain('interface GuestLocationRefreshRequest')
    expect(guestTypes).toContain('interface GuestLocationRefreshResponse')
    expect(guestTypes).toContain('city: CitySummary | null')
  })
})
