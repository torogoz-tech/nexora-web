import { requireRecord } from './requireRecord'
import type { GitProvider } from '../types/GitProvider'
import type { GitProviderConfiguration } from '../types/GitProviderConfiguration'
export function parseGitConfiguration(
  value: unknown,
  provider: GitProvider,
): GitProviderConfiguration {
  const v = requireRecord(value)
  if (
    !['client_id', 'redirect_uri', 'host', 'origin'].every(
      (k) => typeof v[k] === 'string',
    ) ||
    typeof v.enabled !== 'boolean' ||
    !Number.isSafeInteger(v.revision) ||
    Number(v.revision) < 1 ||
    (provider === 'github' &&
      !['app_id', 'slug'].every((k) => typeof v[k] === 'string'))
  )
    throw new Error('La configuración del proveedor no es válida.')
  let callback: URL
  try {
    callback = new URL(String(v.redirect_uri))
  } catch {
    throw new Error('La URL de retorno no es válida.')
  }
  if (
    !['http:', 'https:'].includes(callback.protocol) ||
    callback.username ||
    callback.password
  )
    throw new Error('La URL de retorno no es válida.')
  return {
    provider,
    client_id: String(v.client_id),
    redirect_uri: String(v.redirect_uri),
    host: String(v.host),
    origin: String(v.origin),
    enabled: v.enabled,
    revision: Number(v.revision),
    ...(provider === 'github'
      ? { app_id: String(v.app_id), slug: String(v.slug) }
      : {}),
  }
}
