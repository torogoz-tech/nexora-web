import { settingsMutationSignature } from '../utils/settingsMutationSignature'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useApiData } from './useApiData'
import { useIntegrationMutation } from './useIntegrationMutation'
import { writeGeneralSettings } from '../services/writeGeneralSettings'
import { readApiJson } from '../services/readApiJson'
export function useSettingsResource<T extends { revision: number }>(
  path: string,
  parse: (value: unknown) => T,
) {
  const remote = useApiData(path, parse),
    mutation = useIntegrationMutation()
  const [confirmed, setConfirmed] = useState<T | null>(null)
  const data =
    confirmed && (!remote.data || confirmed.revision >= remote.data.revision)
      ? confirmed
      : remote.data
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const latest = useRef<T | null>(null)
  useLayoutEffect(() => {
    if (data && (!latest.current || data.revision >= latest.current.revision))
      latest.current = data
  }, [data])
  async function save(input: unknown, method = 'PUT', target = path) {
    if (!mounted.current) return false
    const signature = await settingsMutationSignature(input)
    if (!mounted.current) return false
    const success = await mutation.run(
      { target, signature },
      async (signal, key) => {
        try {
          const next = parse(
            await writeGeneralSettings(target, method, input, signal, key),
          )
          latest.current = next
          setConfirmed(next)
        } catch (error) {
          try {
            const refreshed = parse(await readApiJson(path, signal))
            latest.current = refreshed
            setConfirmed(refreshed)
          } catch {
            /* Keep the last confirmed configuration on network failure. */
          }
          throw error
        }
      },
    )
    return success
  }
  return {
    ...remote,
    data,
    save,
    getCurrent: () => latest.current ?? data,
    busy: mutation.busy,
    error: mutation.error ?? remote.error,
  }
}
