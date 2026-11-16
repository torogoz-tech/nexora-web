import {requireRecord} from './requireRecord'
import type {PersonalWorkBlock} from '../types/PersonalWorkBlock'
export function parsePersonalWorkBlocks(value:unknown):{items:PersonalWorkBlock[]} {
 const root=requireRecord(value);if(!Array.isArray(root.items))throw Error('Invalid work blocks')
 return {items:root.items.map(value=>{const v=requireRecord(value);for(const key of ['id','actor_id','title','date','start_time','end_time'])if(typeof v[key]!=='string')throw Error('Invalid work block');if(!Number.isSafeInteger(v.minutes)||Number(v.minutes)<=0||!Number.isSafeInteger(v.revision)||Number(v.revision)<1||!/^\d{4}-\d{2}-\d{2}$/.test(String(v.date))||![v.start_time,v.end_time].every(time=>/^([01]\d|2[0-3]):[0-5]\d$/.test(String(time)))||String(v.end_time)<=String(v.start_time)||['task_id','overtime_request_id','note'].some(key=>v[key]!==null&&typeof v[key]!=='string'))throw Error('Invalid work block');return v as PersonalWorkBlock})}
}
