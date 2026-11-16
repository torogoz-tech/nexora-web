import type { PasskeyStatus } from '../types/PasskeyStatus'

export function parsePasskeyStatus(value: unknown): PasskeyStatus {
  if (!value || typeof value !== 'object' || !Array.isArray((value as { credentials?: unknown }).credentials)) throw Error('invalid-passkey-status')
  const source = value as { enabled?: unknown; active_method?: unknown; credentials: unknown[] }
  const credentials = source.credentials.map(item => {
    if (!item || typeof item !== 'object') throw Error('invalid-passkey-status')
    const record = item as Record<string, unknown>
    if (typeof record.id !== 'string' || typeof record.label !== 'string' || typeof record.created_at !== 'string' || (record.last_used_at !== null && typeof record.last_used_at !== 'string')) throw Error('invalid-passkey-status')
    return { id: record.id, label: record.label, created_at: record.created_at, last_used_at: record.last_used_at as string | null }
  })
  const active = source.active_method ?? 'none'
  if (active !== 'none' && active !== 'totp' && active !== 'passkey') throw Error('invalid-passkey-status')
  return { enabled: source.enabled === true, active_method: active, credentials }
}
