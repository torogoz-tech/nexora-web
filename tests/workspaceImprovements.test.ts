import { describe,it,expect } from 'vitest'
import { navigation } from '../src/app/navigation'
import { orderSettingsNavigation } from '../src/utils/orderSettingsNavigation'
import { moveNavigationPath } from '../src/utils/moveNavigationPath'
import { parseNavigationOrder } from '../src/utils/parseNavigationOrder'
import { getReturnPath } from '../src/utils/getReturnPath'
import { currentRatingWeek } from '../src/utils/currentRatingWeek'
import { getMemberImportantDates } from '../src/utils/getMemberImportantDates'
import type { DeveloperRatingDay } from '../src/types/DeveloperRatingDay'
import type { LaborCalendar } from '../src/types/LaborCalendar'
const day=(date:string,score:number|null,excluded=false):DeveloperRatingDay=>({date,score,excluded,push:false,authored:false,entries:[]})
describe('common navigation',()=>{
 it('starts at profile and preserves explicit deep links',()=>{expect(navigation[0]?.id).toBe('profile');expect(getReturnPath(undefined)).toBe('/profile');expect(getReturnPath('/tasks?type=bug')).toBe('/tasks?type=bug')})
 it('reorders without changing identity, dropping new items or mutating defaults',()=>{
  const result=orderSettingsNavigation(navigation,['/settings/accounts','/settings/oidc'])
  expect(result.find(a=>a.id==='settings')!.items.slice(0,2).map(i=>i.path)).toEqual(['/settings/accounts','/settings/oidc'])
  expect(result.find(a=>a.id==='settings')!.items).toHaveLength(navigation.find(a=>a.id==='settings')!.items.length)
  expect(result[0]).toBe(navigation[0]);expect(navigation.find(a=>a.id==='settings')!.items[0]!.path).toBe('/settings')
  expect(moveNavigationPath(['a','b','c'],'a','c')).toEqual(['b','c','a']);expect(moveNavigationPath(['a'],'missing','a')).toEqual(['a'])
 })
 it('keeps team administration grouped outside the settings menu',()=>{
  const team=navigation.find(item=>item.id==='work')!
  const settings=navigation.find(item=>item.id==='settings')!
  expect(team.items.map(item=>item.path)).toEqual(expect.arrayContaining(['/team/projects','/team/members','/settings/labor-calendar','/settings/products']))
  expect(settings.items.map(item=>item.path)).not.toEqual(expect.arrayContaining(['/settings/projects','/settings/members','/settings/labor-calendar','/settings/products']))
 })
 it('rejects duplicate or unsafe orders',()=>{expect(()=>parseNavigationOrder({paths:['/settings','/settings'],revision:0,can_manage:true})).toThrow();expect(()=>parseNavigationOrder({paths:['/secret'],revision:0,can_manage:true})).toThrow()})
})
it('averages daily averages in current Monday-Sunday week, including prior calendar year and exclusions',()=>{
 const result=currentRatingWeek('2027-01-02',[day('2026-12-28',5),day('2026-12-29',0),day('2027-01-01',4),day('2027-01-02',null),day('2026-12-30',1,true),day('2026-12-27',0)])
 expect(result).toMatchObject({start:'2026-12-28',end:'2027-01-03',score:3,count:3});expect(currentRatingWeek('2027-01-02',[]).score).toBeNull()
})
it('important dates never include other members or unapproved requests',()=>{
 const calendar={settings:{country:'SV'},requests:[{id:'own',actor_id:'a',status:'approved',kind:'vacation',start_date:'2026-11-10',end_date:'2026-11-12'},{id:'pending',actor_id:'a',status:'pending',kind:'leave',start_date:'2026-11-09',end_date:'2026-11-09'},{id:'other',actor_id:'b',status:'approved',kind:'vacation',start_date:'2026-11-09',end_date:'2026-11-09'}],holidays:[{id:'holiday',name:'Asueto',status:'approved',date:'2026-11-11',country:'SV'},{id:'foreign',name:'Otro país',status:'approved',date:'2026-11-09',country:'US'}]} as unknown as LaborCalendar
 expect(getMemberImportantDates(calendar,'a','2026-11-08').map(item=>item.id)).toEqual(['own','holiday'])
})
