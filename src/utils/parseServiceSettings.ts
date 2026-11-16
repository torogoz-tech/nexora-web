import type { ServiceSettings } from '../types/ServiceSettings'
export function parseServiceSettings(value: unknown): ServiceSettings {
  if (!value || typeof value !== 'object')
    throw Error('La configuración recibida no es válida.')
  const v = value as Record<string, unknown>
  if (
    !v.settings ||
    typeof v.settings !== 'object' ||
    Array.isArray(v.settings) ||
    typeof v.has_secret !== 'boolean' ||
    typeof v.managed !== 'boolean' ||
    !Number.isSafeInteger(v.revision) ||
    Number(v.revision) < 1 ||
    !Object.values(v.settings).every((v) =>
      ['string', 'boolean', 'number'].includes(typeof v),
    )
  )
    throw Error('La configuración recibida no es válida.')
  return v as ServiceSettings
}
