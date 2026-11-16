import { requireRecord } from './requireRecord'
import { parseAnalysisProfileSummary } from './parseAnalysisProfileSummary'
import { parseAnalysisProfilePackage } from './parseAnalysisProfilePackage'
import type { AnalysisProfileDetail } from '../types/AnalysisProfileDetail'
export function parseAnalysisProfileDetail(value: unknown): AnalysisProfileDetail {
 const v = requireRecord(value), summary = parseAnalysisProfileSummary(v), pack = parseAnalysisProfilePackage(v.package)
 if (summary.key !== pack.key || summary.version !== pack.version || summary.language_id !== pack.language_id || summary.name !== pack.name) throw Error('El paquete no corresponde a esta versión del perfil.')
 return { ...summary, package: pack }
}
