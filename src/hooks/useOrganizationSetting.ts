import { useEffect, useRef } from 'react'
import { useIntegrationMutation } from './useIntegrationMutation'
import { writeOrganizationSetting } from '../services/writeOrganizationSetting'
import { readApiJson } from '../services/readApiJson'
import { parseOrganizationProfile } from '../utils/parseOrganizationProfile'
import { settingsMutationSignature } from '../utils/settingsMutationSignature'
import type { OrganizationSettingProps } from '../types/OrganizationSettingProps'
import type { OrganizationSettingChange } from '../types/OrganizationSettingChange'
export function useOrganizationSetting({
  profile,
  onUpdated,
}: OrganizationSettingProps) {
  const mutation = useIntegrationMutation()
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  async function save(change: OrganizationSettingChange) {
    const signature = await settingsMutationSignature({
      revision: profile.revision,
      change,
    })
    if (!mounted.current) return false
    return mutation.run(signature, async (signal, key) => {
      try {
        const result = await writeOrganizationSetting(
          profile,
          change,
          signal,
          key,
        )
        if (!signal.aborted) {
          onUpdated(result)
          window.dispatchEvent(new CustomEvent('nexora:branding', { detail: { name: result.name, has_logo: result.has_logo, revision: result.revision } }))
        }
      } catch (error) {
        try {
          const latest = parseOrganizationProfile(
            await readApiJson('/api/v1/settings/organization', signal),
          )
          if (!signal.aborted) onUpdated(latest)
        } catch {
          /* Keep existing values if the refresh fails. */
        }
        throw error
      }
    })
  }
  return { save, busy: mutation.busy, error: mutation.error }
}
