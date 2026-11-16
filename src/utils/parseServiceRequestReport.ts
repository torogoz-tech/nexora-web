import { requireRecord } from './requireRecord'
import type { ServiceRequestReport } from '../types/ServiceRequestReport'
export function parseServiceRequestReport(value:unknown):ServiceRequestReport{
 const root=requireRecord(value)
 if(typeof root.total!=='number'||!Array.isArray(root.items)||!Array.isArray(root.products)||!Array.isArray(root.types)||!Array.isArray(root.requesters)||!Array.isArray(root.oldest_pending)||!root.summary)throw Error('El reporte recibido no es válido.')
 return root as ServiceRequestReport
}
