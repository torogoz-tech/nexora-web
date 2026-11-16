import {requireRecord} from './requireRecord'
import type {TaskKnowledgeOption} from '../types/TaskKnowledgeOption'
export function parseTaskKnowledgeOptions(value:unknown){
 const v=requireRecord(value)
 if(!Array.isArray(v.items)||v.items.length>20||(v.next_after!==null&&typeof v.next_after!=='string'))throw Error('Las relaciones disponibles no son válidas.')
 return {items:v.items.map(value=>{const x=requireRecord(value);if(typeof x.id!=='string'||typeof x.name!=='string'||!Number.isSafeInteger(x.revision)||Number(x.revision)<1||(x.version_id!==null&&typeof x.version_id!=='string'))throw Error('Las relaciones disponibles no son válidas.');return x as TaskKnowledgeOption}),next_after:v.next_after as string|null}
}
