import type { DailyDeveloperAnalysis } from '../types/DailyDeveloperAnalysis'
export function parseDailyDeveloperAnalysis(value: unknown): DailyDeveloperAnalysis {
 if (!value || typeof value !== 'object' || !('status' in value) || !('date' in value) || !('member_id' in value)) throw new Error('Respuesta de análisis inválida.')
 return value as DailyDeveloperAnalysis
}
