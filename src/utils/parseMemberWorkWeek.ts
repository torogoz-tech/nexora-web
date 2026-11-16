import {requireRecord} from './requireRecord'
import type {MemberWorkWeek} from '../types/MemberWorkWeek'
export function parseMemberWorkWeek(value:unknown):MemberWorkWeek {
 const v=requireRecord(value)
 if(typeof v.timezone!=='string'||!Array.isArray(v.days)||v.days.length!==7) throw Error('La semana recibida no es válida.')
 const days=v.days.map(item=>{const d=requireRecord(item);if(typeof d.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||!['active_seconds','regular_seconds','overtime_seconds','unapproved_seconds'].every(k=>Number.isSafeInteger(d[k])&&Number(d[k])>=0))throw Error('La semana recibida no es válida.');return {date:d.date,task_seconds:typeof d.task_seconds==='number'?d.task_seconds:undefined,activity_seconds:typeof d.activity_seconds==='number'?d.activity_seconds:undefined,availability:d.availability as MemberWorkWeek['days'][number]['availability'],active_seconds:Number(d.active_seconds),regular_seconds:Number(d.regular_seconds),overtime_seconds:Number(d.overtime_seconds),unapproved_seconds:Number(d.unapproved_seconds)}})
 return {timezone:v.timezone,days}
}
