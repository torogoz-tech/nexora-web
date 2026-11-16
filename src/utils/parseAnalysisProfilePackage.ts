import { requireRecord } from './requireRecord'
import type { AnalysisProfilePackage } from '../types/AnalysisProfilePackage'
export function parseAnalysisProfilePackage(value: unknown): AnalysisProfilePackage {
 const v = requireRecord(value)
 if (v.format !== 'nexora.analysis-profile' || v.schema_version !== 1 || !['key', 'version', 'name', 'language_id'].every(key => typeof v[key] === 'string' && !!String(v[key]).trim()) || !Array.isArray(v.models) || v.models.length < 1 || v.models.length > 64) throw Error('El archivo no es un paquete de perfil de Nexora compatible.')
 return v as AnalysisProfilePackage
}
