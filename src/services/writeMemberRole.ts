import { apiFetch } from './apiFetch'
import type { MemberRoleUpdate } from '../types/MemberRoleUpdate'
export async function writeMemberRole(memberId: string, body: MemberRoleUpdate, signal: AbortSignal, key: string) {
  const response = await apiFetch(`/api/v1/settings/members/${encodeURIComponent(memberId)}/role`, {
    method: 'PUT', signal,
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
    body: JSON.stringify(body),
  })
  if (response.status === 401) throw Error('La sesión terminó. Inicia sesión de nuevo.')
  if (response.status === 403) throw Error('Solo un superadministrador humano puede administrar los roles de miembros.')
  if (response.status === 409) throw Error('El rol cambió. Cierra y vuelve a abrir la configuración antes de guardar.')
  if (response.status === 422) throw Error('Revisa el rol y los proyectos seleccionados.')
  if (!response.ok) throw Error('No pudimos guardar el rol del miembro. Vuelve a intentarlo.')
}
