import type { DailyAnalysisDirectory } from '../types/DailyAnalysisDirectory'
export function parseDailyAnalysisDirectory(value: unknown): DailyAnalysisDirectory {
 if (!value || typeof value !== 'object' || !('items' in value) || !Array.isArray(value.items) || !('latest_date' in value) || typeof value.latest_date !== 'string' || !('timezone' in value) || typeof value.timezone !== 'string') throw new Error('Respuesta de análisis inválida.')
 return value as DailyAnalysisDirectory
}
