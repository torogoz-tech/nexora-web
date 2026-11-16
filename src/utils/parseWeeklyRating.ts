import { requireRecord } from './requireRecord'
export function parseWeeklyRating(value: unknown) {
 const data = requireRecord(value)
 if (typeof data.start !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.start) || typeof data.end !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.end) || (data.score !== null && (typeof data.score !== 'number' || !Number.isFinite(data.score) || data.score < 0 || data.score > 5))) throw Error('El registro de calificaciones no es válido.')
 return { start: data.start, end: data.end, score: data.score as number | null }
}
