import {requireRecord} from './requireRecord'
import type {TaskHistory} from '../types/TaskHistory'
export function parseTaskHistory(value:unknown):TaskHistory{const v=requireRecord(value);if(!Array.isArray(v.items)||(v.next_after!==null&&!Number.isSafeInteger(v.next_after)))throw Error('El historial no es válido.');for(const item of v.items){const e=requireRecord(item);if(!['id','operation','actor_id','created_at'].every(k=>typeof e[k]==='string')||!Number.isSafeInteger(e.revision))throw Error('El historial no es válido.')}return v as TaskHistory}
