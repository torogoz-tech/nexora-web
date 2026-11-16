import { apiFetch } from './apiFetch'
import { parseAnalysisProfileSummary } from '../utils/parseAnalysisProfileSummary'
import type { AnalysisProfilePackage } from '../types/AnalysisProfilePackage'
export async function importAnalysisProfile(pack: AnalysisProfilePackage, key: string, signal: AbortSignal) {
 const response = await apiFetch('/api/v1/analysis-profiles', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify(pack), signal })
 if (!response.ok) throw Error(response.status === 409 ? 'Esta versión ya existe con otro contenido. Importa una versión diferente.' : response.status === 403 ? 'No tienes permiso para importar perfiles de análisis.' : response.status === 400 || response.status === 422 ? 'El paquete no es compatible. Revisa los modelos y sus dependencias.' : response.status === 413 ? 'El paquete no puede superar 16 MiB.' : 'No pudimos importar el perfil de análisis.')
 const result = parseAnalysisProfileSummary(await response.json())
 if (result.key !== pack.key || result.version !== pack.version || result.language_id !== pack.language_id) throw Error('La respuesta no corresponde al perfil importado.')
 return result
}
