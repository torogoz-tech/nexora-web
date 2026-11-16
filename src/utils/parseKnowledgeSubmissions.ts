import {parseKnowledgeSubmission} from './parseKnowledgeSubmission'
export function parseKnowledgeSubmissions(value:unknown){
 const d=value as {items:unknown[];next_after:string|null}
 if(!d||!Array.isArray(d.items))throw Error('Respuesta de documentación no válida.')
 return {items:d.items.map(parseKnowledgeSubmission),next_after:d.next_after??null}
}
