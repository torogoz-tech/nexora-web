import { describe, expect, it } from 'vitest'
import { parseOrganizationTimezone } from '../utils/parseOrganizationTimezone'
import { organizationTimezoneOptions } from '../utils/organizationTimezoneOptions'
describe('organization timezone configuration', () => {
  it('preserves the shared revision without retaining unrelated settings', () => {
    expect(parseOrganizationTimezone({ timezone: 'America/El_Salvador', revision: 3, daily_minutes: 480 })).toEqual({ timezone: 'America/El_Salvador', revision: 3 })
  })
  it('rejects unsupported timezones and unusable revisions', () => {
    for (const value of [{ timezone: 'Wrong/Timezone', revision: 1 }, { timezone: 'UTC', revision: 0 }, { timezone: 'UTC', revision: 1.5 }, { timezone: 6, revision: 1 }]) expect(() => parseOrganizationTimezone(value)).toThrow()
  })
  it('includes UTC and the current zone exactly once in the dropdown', () => {
    const options = organizationTimezoneOptions('America/El_Salvador')
    expect(options.filter(o => o.value === 'America/El_Salvador')).toHaveLength(1)
    expect(options.filter(o => o.value === 'UTC')).toHaveLength(1)
  })
})
