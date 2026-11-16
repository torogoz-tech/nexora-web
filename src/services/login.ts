import { parseBrowserSession } from '../utils/parseBrowserSession'
import { browserHeaders } from './browserHeaders'
export async function login(
  username: string,
  password: string,
  signal: AbortSignal,
) {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
    headers: browserHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify({ username, password }),
  })
  if (response.status === 401)
    throw new Error('El usuario o la contraseña no son correctos.')
  if (response.status === 403)
    throw new Error('El acceso local no está habilitado para esta cuenta.')
  if (response.status === 429)
    throw new Error(
      'Demasiados intentos. Espera un momento y vuelve a intentarlo.',
    )
  if (!response.ok)
    throw new Error('No pudimos iniciar sesión. Inténtalo de nuevo.')
  return { ...parseBrowserSession(await response.json()), displayName: username }
}
