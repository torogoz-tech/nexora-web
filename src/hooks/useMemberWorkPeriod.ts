import {useEffect,useState} from 'react'
import {readApiJson} from '../services/readApiJson'
import {parseMemberWorkWeek} from '../utils/parseMemberWorkWeek'
import type {MemberWorkWeek} from '../types/MemberWorkWeek'
export function useMemberWorkPeriod(memberId:string,date:string,period:'day'|'week'|'month') {
 const [state,setState]=useState<{key:string;days:MemberWorkWeek['days'];error:string|null}>({key:'',days:[],error:null})
 const key=`${memberId}:${date}:${period}`
 useEffect(()=>{const controller=new AbortController();const starts=period==='month'?Array.from({length:5},(_,index)=>new Date(Date.UTC(Number(date.slice(0,4)),Number(date.slice(5,7))-1,1+index*7)).toISOString().slice(0,10)):[date];void Promise.all(starts.map(start=>readApiJson(`/api/v1/members/${encodeURIComponent(memberId)}/work-week?date=${start}`,controller.signal).then(parseMemberWorkWeek))).then(weeks=>{const days=weeks.flatMap(week=>week.days).filter((day,index,all)=>all.findIndex(item=>item.date===day.date)===index).filter(day=>period!=='month'||day.date.startsWith(date.slice(0,7))).filter(day=>period!=='day'||day.date===date);if(!controller.signal.aborted)setState({key,days,error:null})}).catch(error=>{if(!controller.signal.aborted)setState({key,days:[],error:error instanceof Error?error.message:'No pudimos cargar las horas trabajadas.'})});return()=>controller.abort()},[key,memberId,date,period])
 return {days:state.key===key?state.days:[],loading:state.key!==key,error:state.key===key?state.error:null}
}
