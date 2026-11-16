import type { ProfileContribution } from '../types/ProfileContribution'
export function profileContributionWeeks(year: number, contributions: ProfileContribution[]) {
 const day = 86400000
 const first = new Date(Date.UTC(year,0,1))
 const end = Date.UTC(year+1,0,1)
 const start = first.getTime()-((first.getUTCDay()+6)%7)*day
 const counts = new Map(contributions.map(value => [value.date,value.count]))
 const weeks: ({date:string;count:number} | null)[][] = []
 for (let week = start; week < end; week += 7*day) {
  weeks.push(Array.from({length:7}, (_,offset) => {
   const timestamp = week+offset*day
   if (timestamp < first.getTime() || timestamp >= end) return null
   const date = new Date(timestamp).toISOString().slice(0,10)
   return {date,count:counts.get(date)??0}
  }))
 }
 return weeks
}
