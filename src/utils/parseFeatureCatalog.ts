import { requireRecord } from './requireRecord'
import type { FeatureCatalog } from '../types/FeatureCatalog'
export function parseFeatureCatalog(value: unknown): FeatureCatalog {
  const v = requireRecord(value)
  const fail = () => { throw new Error('El catálogo de funcionalidades recibido no es válido.') }
  const string = (value: unknown): string => typeof value === 'string' ? value : fail()
  const nullable = (value: unknown): string | null => value == null ? null : string(value)
  const strings = (value: unknown): string[] => Array.isArray(value) ? value.map(string) : fail()
  const revision = (value: unknown): number => typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : fail()
  if (!Array.isArray(v.items) || !Array.isArray(v.proposals) || !Array.isArray(v.links) || typeof v.can_decide !== 'boolean') return fail()
  if (typeof v.catalog_revision !== 'number' || !Number.isSafeInteger(v.catalog_revision) || v.catalog_revision < 0) return fail()
  return {
    catalog_revision: v.catalog_revision,
    can_decide: v.can_decide,
    can_complete: v.can_complete === true,
    items: v.items.map(value => {
      const item = requireRecord(value)
      if (typeof item.archived !== 'boolean' || (item.status != null && item.status !== 'active' && item.status !== 'completed')) return fail()
      return { id: string(item.id), name: string(item.name), description: string(item.description), revision: revision(item.revision), archived: item.archived, status: item.status === 'completed' ? 'completed' : 'active', completed_at: nullable(item.completed_at), requirement_ids: strings(item.requirement_ids), task_ids: strings(item.task_ids), created_at: string(item.created_at) }
    }),
    links: v.links.map(value => {
      const item = requireRecord(value)
      return { requirement_id: string(item.requirement_id), feature_id: string(item.feature_id), impact: string(item.impact), proposal_id: string(item.proposal_id) }
    }),
    proposals: v.proposals.map(value => {
      const item = requireRecord(value)
      if (!['pending', 'approved', 'rejected'].includes(String(item.status)) || !Array.isArray(item.links) || !Array.isArray(item.tasks)) return fail()
      const result = item.result == null ? null : requireRecord(item.result)
      return {
        result: result ? { feature_ids: strings(result.feature_ids), task_ids: strings(result.task_ids) } : null,
        id: string(item.id), requirement_title: string(item.requirement_title), requirement_id: string(item.requirement_id), requirement_version_id: string(item.requirement_version_id), reason: string(item.reason),
        status: item.status as 'pending' | 'approved' | 'rejected', proposed_by: string(item.proposed_by), decided_by: nullable(item.decided_by), decision_reason: nullable(item.decision_reason), created_at: string(item.created_at), decided_at: nullable(item.decided_at), revision: revision(item.revision),
        links: item.links.map(value => {
          const link = requireRecord(value)
          const feature_id = nullable(link.feature_id), name = nullable(link.name), description = nullable(link.description)
          if (!feature_id && !name?.trim()) return fail()
          return { feature_id, name, description, impact: string(link.impact) }
        }),
        tasks: item.tasks.map(requireRecord),
      }
    }),
  }
}
