import type { GitProvider } from '../types/GitProvider'
export function gitCallbackUrl(
  value: string,
  provider: GitProvider,
  origin: string,
): URL {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error('La URL de retorno no es válida.')
  }
  if (
    url.origin !== origin ||
    url.pathname !== `/api/v1/git/${provider}/callback` ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  )
    throw new Error(
      'La URL de retorno debe usar el mismo dominio que esta web. Revisa la configuración del proveedor y el dominio público de Nexora.',
    )
  return url
}
