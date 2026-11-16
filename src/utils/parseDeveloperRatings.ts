import { requireRecord } from './requireRecord'
import { safeExternalUrl } from './safeExternalUrl'
import type { DeveloperRatingsData } from '../types/DeveloperRatingsData'
import type { DeveloperRatingEntry } from '../types/DeveloperRatingEntry'
export function parseDeveloperRatings(value: unknown): DeveloperRatingsData {
  const v = requireRecord(value)
  const fail = (): never => { throw Error('El registro de calificaciones no es válido.') }
  const text = (value: unknown): string => typeof value === 'string' ? value : fail()
  const nullable = (value: unknown): string | null => value == null ? null : text(value)
  const score = (value: unknown): number => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 5 ? value : fail()
  const boolean = (value: unknown): boolean => typeof value === 'boolean' ? value : fail()
  const list = (value: unknown) => Array.isArray(value) ? value.map(requireRecord) : fail()
  const year = v.year
  if (typeof year !== 'number' || !Number.isInteger(year) || year < 2000 || year > 9999) return fail()
  const seen = new Set<string>()
  return {
    actor_id: text(v.actor_id), year,
    annual: v.annual === null ? null : score(v.annual),
    can_rate: boolean(v.can_rate),
    weekly: list(v.weekly).map(period => ({ period: text(period.period), score: score(period.score) })),
    monthly: list(v.monthly).map(period => ({ period: text(period.period), score: score(period.score) })),
    daily: list(v.daily).map(day => {
      const date = text(day.date)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !date.startsWith(`${year}-`) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date || seen.has(date)) return fail()
      seen.add(date)
      const excluded = boolean(day.excluded)
      if (excluded && day.score !== null) return fail()
      return {
        date, excluded, push: boolean(day.push), authored: day.authored === undefined ? false : boolean(day.authored), score: day.score === null ? null : score(day.score),
        entries: list(day.entries).map(entry => {
          if (!['activity', 'peer', 'manager', 'ai'].includes(String(entry.source))) return fail()
          return { attachments:entry.attachments===undefined?[]:list(entry.attachments).map(file=>{const id=text(file.id);if(!/^rev_[a-zA-Z0-9_]+$/.test(id)||typeof file.size_bytes!=='number'||!Number.isInteger(file.size_bytes)||file.size_bytes<1||file.size_bytes>20971520)return fail();return {id,name:text(file.name),image:boolean(file.image),size_bytes:file.size_bytes}}), id: text(entry.id), source: entry.source as DeveloperRatingEntry['source'], score: score(entry.score), reason: text(entry.reason), created_by: nullable(entry.created_by), created_by_name: nullable(entry.created_by_name), project_id: nullable(entry.project_id), created_at: text(entry.created_at), evidence_url: entry.evidence_url == null ? null : safeExternalUrl(text(entry.evidence_url)) }
        }),
      }
    }),
  }
}
