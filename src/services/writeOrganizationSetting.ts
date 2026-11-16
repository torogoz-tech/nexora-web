import { apiFetch } from './apiFetch'
import { readApiJson } from './readApiJson'
import { readGeneralSettingsResponse } from './readGeneralSettingsResponse'
import { parseOrganizationProfile } from '../utils/parseOrganizationProfile'
import { canRebaseOrganizationChange } from '../utils/canRebaseOrganizationChange'
import type { OrganizationProfile } from '../types/OrganizationProfile'
import type { OrganizationSettingChange } from '../types/OrganizationSettingChange'
export async function writeOrganizationSetting(
  before: OrganizationProfile,
  change: OrganizationSettingChange,
  signal: AbortSignal,
  key: string,
) {
  const base = '/api/v1/settings/organization',
    logo = change.field === 'logo',
    path = logo ? `${base}/logo` : base
  let revision = before.revision
  for (let attempt = 0; attempt < 2; attempt++) {
    const body = {
      expected_revision: revision,
      ...(logo
        ? { data_base64: change.value }
        : { [change.field]: change.value }),
    }
    const response = await apiFetch(path, {
      method: logo ? 'PUT' : 'PATCH',
      signal,
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': attempt === 0 ? key : `${key}:rebase`,
      },
      body: JSON.stringify(body),
    })
    if (response.status === 409 && attempt === 0) {
      const latest = parseOrganizationProfile(await readApiJson(base, signal))
      if (canRebaseOrganizationChange(before, latest, change)) {
        revision = latest.revision
        continue
      }
    }
    return parseOrganizationProfile(
      await readGeneralSettingsResponse(response, path),
    )
  }
  throw Error(
    'La configuración cambió en otra sesión. Revisa los datos actualizados y vuelve a intentarlo.',
  )
}
