import type {TaskRelease} from '../types/TaskRelease'
import {requireRecord} from './requireRecord'
export function parseTaskReleases(value:unknown):{items:TaskRelease[]}{
 const data=requireRecord(value)
 if(!Array.isArray(data.items)||data.items.some(item=>!item||!['id','project_id','version','branch_name','created_at','created_by'].every(key=>typeof item[key]==='string')||!['prepared','published'].includes(item.status)||!Number.isSafeInteger(item.revision)||item.revision<1))throw Error('La publicación recibida no es válida.')
 return {items:data.items as TaskRelease[]}
}
