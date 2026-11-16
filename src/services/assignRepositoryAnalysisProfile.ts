import type { AnalysisProfileSelection } from '../types/AnalysisProfileSelection'
import { apiFetch } from './apiFetch'
import { parseAnalysisProfileAssignment } from '../utils/parseAnalysisProfileAssignment'
export async function assignRepositoryAnalysisProfile(project: string, repository: string, revision: number, profile: string | null | AnalysisProfileSelection, key: string, signal: AbortSignal) {
 const response = await apiFetch(`/api/v1/projects/${encodeURIComponent(project)}/repositories/${encodeURIComponent(repository)}/analysis-profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify(typeof profile === 'object' && profile !== null ? { expected_revision: revision, mode: profile.mode, profile_version_ids: profile.profile_version_ids, reason: 'Selección de perfiles de análisis actualizada desde la web.' } : { expected_revision: revision, profile_version_id: profile, reason: profile ? 'Perfil de análisis asignado desde la web.' : 'Asignación de perfil de análisis retirada desde la web.' }), signal })
 if (response.status === 400 || response.status === 422) {
  const problem: unknown = await response.json().catch(() => null)
  const overlap = problem !== null && typeof problem === 'object' && 'title' in problem && typeof problem.title === 'string' && problem.title.includes('selected profiles overlap on a file extension')
  throw Error(overlap ? 'Los perfiles seleccionados cubren las mismas extensiones. Selecciona un único perfil para cada extensión.' : 'Revisa el modo y selecciona entre 1 y 64 perfiles para la asignación manual.')
 }
 if (!response.ok) throw Error(response.status === 409 ? 'La asignación cambió. Actualiza el repositorio antes de continuar.' : response.status === 403 || response.status === 404 ? 'No tienes permiso para asignar este perfil al repositorio.' : 'No pudimos actualizar el perfil de análisis del repositorio.')
 const result = parseAnalysisProfileAssignment(await response.json())
 if (result.repository_id !== repository) throw Error('La asignación no corresponde a este repositorio.')
 return result
}
