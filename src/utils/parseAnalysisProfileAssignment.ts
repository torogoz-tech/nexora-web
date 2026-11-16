import { requireRecord } from './requireRecord'
import { parseAnalysisProfileSummary } from './parseAnalysisProfileSummary'
import { parseAnalysisProfileSelectionReport } from './parseAnalysisProfileSelectionReport'
import type { AnalysisProfileAssignment } from '../types/AnalysisProfileAssignment'
export function parseAnalysisProfileAssignment(value: unknown): AnalysisProfileAssignment {
 const v = requireRecord(value)
 if (typeof v.repository_id !== 'string' || !v.repository_id || !Number.isSafeInteger(v.revision) || Number(v.revision) < 0 || typeof v.can_manage !== 'boolean') throw Error('La asignación del perfil de análisis no es válida.')
 const profile = v.profile === null ? null : parseAnalysisProfileSummary(v.profile)
 const mode = v.mode === undefined ? profile ? 'manual' : 'legacy' : v.mode
 if (mode !== 'automatic' && mode !== 'manual' && mode !== 'legacy') throw Error('La asignación del perfil de análisis no es válida.')
 if (v.profiles !== undefined && (!Array.isArray(v.profiles) || v.profiles.length > 512)) throw Error('La asignación del perfil de análisis no es válida.')
 const profiles = v.profiles === undefined ? profile ? [profile] : [] : (v.profiles as unknown[]).map(parseAnalysisProfileSummary)
 if (new Set(profiles.map(item => item.id)).size !== profiles.length) throw Error('La asignación del perfil de análisis no es válida.')
 return {...(typeof v.last_source_commit==='string'?{last_source_commit:v.last_source_commit}:{}), repository_id: v.repository_id, revision: Number(v.revision), profile, can_manage: v.can_manage, mode, profiles, last_selection: v.last_selection === undefined || v.last_selection === null ? null : parseAnalysisProfileSelectionReport(v.last_selection) }
}
