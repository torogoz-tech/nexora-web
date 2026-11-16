import type { DeveloperRatingDay } from '../types/DeveloperRatingDay'
export function currentRatingWeek(today:string,days:DeveloperRatingDay[]){
 const day=new Date(`${today}T12:00:00Z`)
 const monday=new Date(day);monday.setUTCDate(day.getUTCDate()-((day.getUTCDay()+6)%7))
 const sunday=new Date(monday);sunday.setUTCDate(monday.getUTCDate()+6)
 const start=monday.toISOString().slice(0,10),end=sunday.toISOString().slice(0,10)
 const byDate=new Map(days.filter(item=>item.date>=start&&item.date<=today&&!item.excluded&&item.score!==null).map(item=>[item.date,item.score!]))
 const values=[...byDate.values()]
 return {start,end,score:values.length?values.reduce((a,b)=>a+b,0)/values.length:null,count:values.length}
}
