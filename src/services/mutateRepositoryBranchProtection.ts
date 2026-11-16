import { apiFetch } from './apiFetch'
import { parseRepositoryBranchProtection } from '../utils/parseRepositoryBranchProtection'
export async function mutateRepositoryBranchProtection(path: string, action: 'preview' | 'apply', body: { required_checks: string[] } | { expected_revision: number }, signal: AbortSignal) {
 const response = await apiFetch(`${path}/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal }, 60000)
 if (response.status === 409) {
  const problem: unknown = await response.json().catch(() => null)
  if (problem && typeof problem === 'object' && 'title' in problem && typeof problem.title === 'string' && problem.title.includes('All four base branches must exist')) throw Error('Crea las ramas faltantes en el proveedor y prepara una nueva vista previa. Nexora no crea ramas automáticamente.')
 }
 if (!response.ok) throw Error(response.status === 409 ? 'La protección cambió. Actualiza y prepara una nueva vista previa.' : response.status === 403 ? 'Solo Manager y Superadmin pueden configurar la protección de ramas.' : 'No pudimos confirmar la protección de ramas. Consulta el estado antes de volver a intentarlo.')
 return parseRepositoryBranchProtection(await response.json())
}
