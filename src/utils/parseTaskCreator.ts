import { requireRecord } from './requireRecord'
import type { TaskCreator } from '../types/TaskCreator'
export function parseTaskCreator(value: unknown): TaskCreator {
 const v = requireRecord(value)
 if (!['id','name','position'].every(key => typeof v[key] === 'string') || !Number.isSafeInteger(v.avatar_revision) || Number(v.avatar_revision) < 0) throw Error('El creador de la tarea no es válido.')
 return v as TaskCreator
}
