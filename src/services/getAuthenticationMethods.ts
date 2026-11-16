import type { AuthenticationMethods } from '../types/AuthenticationMethods'
export async function getAuthenticationMethods(
  signal: AbortSignal,
): Promise<AuthenticationMethods> {
  const response = await fetch('/api/v1/auth/methods', {
    signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
    headers: { Accept: 'application/json' },
  })
  if (!response.ok)
    throw new Error('No pudimos consultar los métodos de acceso.')
  const data: unknown = await response.json()
  if (
    typeof data !== 'object' ||
    data === null ||
    !('local_enabled' in data) ||
    typeof data.local_enabled !== 'boolean' ||
    !('oidc' in data) ||
    !Array.isArray(data.oidc) ||
    !data.oidc.every(
      (provider) =>
        typeof provider === 'object' &&
        provider !== null &&
        typeof provider.id === 'string' &&
        typeof provider.name === 'string' &&
        typeof provider.issuer === 'string',
    )
  )
    throw new Error('La configuración de acceso no es válida.')
  return data as AuthenticationMethods
}
