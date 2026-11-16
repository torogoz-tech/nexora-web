import type {KnowledgeSubmission} from '../types/KnowledgeSubmission'
export function parseKnowledgeSubmission(value:unknown):KnowledgeSubmission {
 if(!value||typeof value!=='object')throw Error('Respuesta de documentación no válida.')
 const d=value as KnowledgeSubmission
 if(typeof d.id!=='string'||typeof d.title!=='string'||!Number.isInteger(d.revision)||typeof d.status!=='string')throw Error('Respuesta de documentación no válida.')
 return d
}
