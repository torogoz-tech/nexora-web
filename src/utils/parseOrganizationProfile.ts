import type { OrganizationProfile } from '../types/OrganizationProfile'
export function parseOrganizationProfile(value: unknown): OrganizationProfile {
  if (!value || typeof value !== 'object')
    throw Error('La configuración recibida no es válida.')
  const v = value as Record<string, unknown>
  if (
    !['name', 'address', 'phone', 'country_code'].every(
      (key) => typeof v[key] === 'string',
    ) ||
    typeof v.has_logo !== 'boolean' ||
    !Number.isSafeInteger(v.revision) ||
    Number(v.revision) < 1
  )
    throw Error('La configuración recibida no es válida.')
  return v as OrganizationProfile
}
