import type { OrganizationProfile } from './OrganizationProfile'
export type OrganizationSettingProps = {
  profile: OrganizationProfile
  onUpdated: (profile: OrganizationProfile) => void
}
