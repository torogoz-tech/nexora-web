import type {TaskWorkLog} from '../types/TaskWorkLog'
import {isCalendarDate} from './isCalendarDate'
export function parseTaskWorkLogs(value:unknown):TaskWorkLog[]{
 if(!Array.isArray(value)||value.some(item=>!item||typeof item!=='object'||!['id','task_id','actor_id','created_at','updated_at'].every(key=>typeof item[key]==='string')||!isCalendarDate(item.date)||!Number.isSafeInteger(item.minutes)||item.minutes<1||item.minutes>1440||!Number.isSafeInteger(item.revision)||item.revision<1||(item.note!==null&&typeof item.note!=='string')||(item.overtime_request_id!==null&&typeof item.overtime_request_id!=='string')))throw Error('El registro de trabajo no es válido.')
 return value as TaskWorkLog[]
}
