import type { OrganizationProfile } from '../types/OrganizationProfile'
import type { OrganizationSettingChange } from '../types/OrganizationSettingChange'
export function canRebaseOrganizationChange(
  before: OrganizationProfile,
  after: OrganizationProfile,
  change: OrganizationSettingChange,
) {
  if (change.field !== 'logo')
    return before[change.field] === after[change.field]
  if (!before.has_logo && !after.has_logo) return true
  return (
    before.has_logo === after.has_logo &&
    after.revision === before.revision + 1 &&
    (['name', 'address', 'phone', 'country_code'] as const).some(
      (field) => before[field] !== after[field],
    )
  )
}
