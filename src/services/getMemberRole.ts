import { apiFetch } from './apiFetch'
import { parseMemberRoleAssignment } from '../utils/parseMemberRoleAssignment'
export async function getMemberRole(memberId: string, signal: AbortSignal) {
  const response = await apiFetch(`/api/v1/settings/members/${encodeURIComponent(memberId)}/role`, { signal })
  if (response.status === 401) throw Error('La sesión terminó. Inicia sesión de nuevo.')
  if (response.status === 403) throw Error('Solo un superadministrador humano puede administrar los roles de miembros.')
  if (!response.ok) throw Error('No pudimos consultar el rol del miembro. Vuelve a intentarlo.')
  return parseMemberRoleAssignment(await response.json())
}
