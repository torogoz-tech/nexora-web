import { requireRecord } from './requireRecord'
import type { GithubConsent } from '../types/GithubConsent'
export function parseGithubConsent(value: unknown): GithubConsent {
  const v = requireRecord(value)
  if (
    !['id', 'remote_login', 'expires_at'].every((k) => typeof v[k] === 'string')
  )
    throw new Error(
      'GitHub no completó la autorización. Vuelve a conectar la cuenta.',
    )
  return {
    id: String(v.id),
    remote_login: String(v.remote_login),
    expires_at: String(v.expires_at),
  }
}
