import { requireRecord } from './requireRecord'
import type { ReferenceTargetPage } from '../types/ReferenceTargetPage'
export function parseReferenceTargets(value: unknown): ReferenceTargetPage {
  const v = requireRecord(value)
  if (
    !Array.isArray(v.items) ||
    (v.next_after !== null && typeof v.next_after !== 'string')
  )
    throw new Error('No pudimos leer los destinos disponibles.')
  const items = v.items.map((value) => {
    const item = requireRecord(value)
    if (
      typeof item.id !== 'string' ||
      !Number.isSafeInteger(item.revision) ||
      (typeof item.title !== 'string' && typeof item.latest_title !== 'string')
    )
      throw new Error('El destino del vínculo no es válido.')
    return {
      id: item.id,
      label:
        typeof item.latest_title === 'string'
          ? `${typeof item.code === 'string' ? item.code + ' · ' : ''}${item.latest_title} (v${item.latest_version_number})`
          : String(item.title),
      revision: Number(item.revision),
      versionId:
        typeof item.latest_version_id === 'string'
          ? item.latest_version_id
          : null,
    }
  })
  return { items, next_after: v.next_after }
}
