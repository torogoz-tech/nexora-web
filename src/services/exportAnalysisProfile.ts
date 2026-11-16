import { apiFetch } from './apiFetch'
import { parseAnalysisProfilePackage } from '../utils/parseAnalysisProfilePackage'
export async function exportAnalysisProfile(id: string, signal: AbortSignal) {
 const response = await apiFetch(`/api/v1/analysis-profiles/${encodeURIComponent(id)}/export`, { signal })
 if (!response.ok) throw Error(response.status === 403 || response.status === 404 ? 'No tienes permiso para exportar este perfil de análisis.' : 'No pudimos exportar el perfil de análisis.')
 return parseAnalysisProfilePackage(await response.json())
}
