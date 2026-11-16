import { parseAnalysisProfilePackage } from '../utils/parseAnalysisProfilePackage'
import type { AnalysisProfilePackage } from '../types/AnalysisProfilePackage'
export async function readAnalysisProfileFile(file: File): Promise<AnalysisProfilePackage> {
 const limit = 16 * 1024 * 1024
 if (file.size > limit) throw Error('El paquete no puede superar 16 MiB.')
 const text = await file.text()
 if (new TextEncoder().encode(text).length > limit) throw Error('El paquete no puede superar 16 MiB.')
 let value: unknown
 try { value = JSON.parse(text) } catch { throw Error('El archivo no contiene JSON válido.') }
 return parseAnalysisProfilePackage(value)
}
