import { requireRecord } from './requireRecord'
import { parseAnalysisProfileSummary } from './parseAnalysisProfileSummary'
import type { AnalysisProfilePage } from '../types/AnalysisProfilePage'
export function parseAnalysisProfilePage(value: unknown): AnalysisProfilePage {
 const v = requireRecord(value)
 if (!Array.isArray(v.items) || (v.next_after !== null && (typeof v.next_after !== 'string' || !v.next_after))) throw Error('El catálogo de perfiles de análisis no es válido.')
 return { items: v.items.map(parseAnalysisProfileSummary), next_after: v.next_after as string | null }
}
