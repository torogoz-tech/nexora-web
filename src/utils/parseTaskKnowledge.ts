import { requireRecord } from './requireRecord'
import type { TaskKnowledge } from '../types/TaskKnowledge'
export function parseTaskKnowledge(value: unknown): TaskKnowledge {
  const v = requireRecord(value)
  if (typeof v.can_read !== 'boolean' || typeof v.has_more !== 'boolean' || !Array.isArray(v.documents) || v.documents.length > 100) throw Error('La trazabilidad de la tarea no es válida.')
  const feature = v.feature === null ? null : requireRecord(v.feature)
  if (feature && (typeof feature.id !== 'string' || typeof feature.name !== 'string' || typeof feature.archived !== 'boolean')) throw Error('La trazabilidad de la tarea no es válida.')
  const documents = v.documents.map(value => {
    const d = requireRecord(value)
    if (!['id', 'version_id', 'title', 'kind', 'relation'].every(key => typeof d[key] === 'string')) throw Error('La trazabilidad de la tarea no es válida.')
    return { id: String(d.id), version_id: String(d.version_id), title: String(d.title), kind: String(d.kind), relation: String(d.relation) }
  })
  const features=v.features===undefined?undefined:(Array.isArray(v.features)?v.features.map(value=>{const f=requireRecord(value);if(typeof f.id!=='string'||typeof f.name!=='string'||typeof f.archived!=='boolean')throw Error('La trazabilidad de la tarea no es válida.');return {id:f.id,name:f.name,archived:f.archived}}):(()=>{throw Error('La trazabilidad de la tarea no es válida.')})())
  return { ...(features?{features}:{}), can_read: v.can_read, has_more: v.has_more, feature: feature ? { id: String(feature.id), name: String(feature.name), archived: feature.archived as boolean } : null, documents }
}
