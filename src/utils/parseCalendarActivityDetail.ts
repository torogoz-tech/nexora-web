import {parseCalendarActivities} from './parseCalendarActivities'
import type {CalendarActivityParticipant} from '../types/CalendarActivityParticipant'
export function parseCalendarActivityDetail(value:unknown){
 const activity=parseCalendarActivities({items:[value],next_after:null}).items[0]!
 const participants=(value as {participants?:CalendarActivityParticipant[]}).participants??[]
 if(!Array.isArray(participants)||participants.some(p=>!p||typeof p.actor_id!=='string'||typeof p.name!=='string'||!['attending','declined'].includes(p.response)))throw Error('Las actividades del calendario no son válidas.')
 return {...activity,participants}
}
