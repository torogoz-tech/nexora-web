import { requireRecord } from './requireRecord'
import type { AnalysisProfileSelectionReport } from '../types/AnalysisProfileSelectionReport'
export function parseAnalysisProfileSelectionReport(value: unknown): AnalysisProfileSelectionReport {
 const v = requireRecord(value)
 const paths = (value: unknown): string[] => {
  if (!Array.isArray(value) || value.length > 100_000 || value.some(path => typeof path !== 'string' || !path)) throw Error('El resultado de selección de perfiles no es válido.')
  return value as string[]
 }
 if (typeof v.policy !== 'string' || !v.policy || !Array.isArray(v.profiles) || v.profiles.length > 1024) throw Error('El resultado de selección de perfiles no es válido.')
 const metadata: Pick<AnalysisProfileSelectionReport, 'status' | 'skipped_files' | 'decoded_files'> = {}
 if (v.status !== undefined || v.skipped_files !== undefined || v.decoded_files !== undefined) {
  if (!['complete', 'partial'].includes(String(v.status)) || !Array.isArray(v.skipped_files) || v.skipped_files.length > 100_000 || !Array.isArray(v.decoded_files) || v.decoded_files.length > 100_000) throw Error('El resultado de selección de perfiles no es válido.')
  metadata.status = v.status as 'complete' | 'partial'
  metadata.skipped_files = v.skipped_files.map(value => {
   const file = requireRecord(value)
   if (typeof file.profile_id !== 'string' || !file.profile_id || typeof file.reason !== 'string' || !file.reason || file.reason.length > 512 || !/^[a-f0-9]{64}$/.test(String(file.checksum))) throw Error('El resultado de selección de perfiles no es válido.')
   return { path: paths([file.path])[0], profile_id: file.profile_id, reason: file.reason, checksum: String(file.checksum) }
  })
  metadata.decoded_files = v.decoded_files.map(value => {
   const file = requireRecord(value)
   if (!['UTF-8-BOM', 'UTF-16LE', 'UTF-16BE'].includes(String(file.encoding)) || !/^[a-f0-9]{64}$/.test(String(file.checksum))) throw Error('El resultado de selección de perfiles no es válido.')
   return { path: paths([file.path])[0], encoding: file.encoding as 'UTF-8-BOM' | 'UTF-16LE' | 'UTF-16BE', checksum: String(file.checksum) }
  })
  if (metadata.skipped_files.length && metadata.status !== 'partial') throw Error('El resultado de selección de perfiles no es válido.')
 }
 return { ...metadata, policy: v.policy, profiles: v.profiles.map(value => {
  const p = requireRecord(value)
  if (!['id', 'key', 'version', 'name', 'language_id', 'checksum'].every(key => typeof p[key] === 'string' && !!p[key]) || !/^\d+\.\d+\.\d+$/.test(String(p.version)) || !/^[a-f0-9]{64}$/.test(String(p.checksum))) throw Error('El resultado de selección de perfiles no es válido.')
  return { id: String(p.id), key: String(p.key), version: String(p.version), name: String(p.name), language_id: String(p.language_id), checksum: String(p.checksum), files: paths(p.files) }
 }), uncovered_files: paths(v.uncovered_files), excluded_files: paths(v.excluded_files), ...(v.excluded_directories === undefined ? {} : { excluded_directories: paths(v.excluded_directories) }) }
}
