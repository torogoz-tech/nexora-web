import { requireRecord } from './requireRecord'
import type { AnalysisProfileSummary } from '../types/AnalysisProfileSummary'
export function parseAnalysisProfileSummary(value: unknown): AnalysisProfileSummary {
 const v = requireRecord(value)
 if (!['id', 'key', 'version', 'name', 'language_id', 'checksum', 'created_at'].every(key => typeof v[key] === 'string' && !!v[key]) || !/^\d+\.\d+\.\d+$/.test(String(v.version)) || !/^[a-f0-9]{64}$/.test(String(v.checksum)) || !Number.isFinite(Date.parse(String(v.created_at)))) throw Error('El perfil de análisis recibido no es válido.')
 return { id: String(v.id), key: String(v.key), version: String(v.version), name: String(v.name), language_id: String(v.language_id), checksum: String(v.checksum), created_at: String(v.created_at) }
}
