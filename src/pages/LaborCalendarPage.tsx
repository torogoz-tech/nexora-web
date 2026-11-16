import PersonalWorkBlockModal from '../components/PersonalWorkBlockModal'
import {parsePersonalWorkBlocks} from '../utils/parsePersonalWorkBlocks'
import type {PersonalWorkBlock} from '../types/PersonalWorkBlock'
import CalendarTimeGrid from '../components/CalendarTimeGrid'
import {useNavigate} from 'react-router'
import { useState } from 'react'
import { CalendarDays, Palmtree, Plus, RefreshCw, CalendarPlus, Clock, History } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { parseLaborCalendar } from '../utils/parseLaborCalendar'
import { writeLaborCalendar } from '../services/writeLaborCalendar'
import type { LaborCalendarPageProps } from '../types/LaborCalendarPageProps'
import type { LaborCalendarAction } from '../types/LaborCalendarAction'
import { useWorkCatalog } from '../hooks/useWorkCatalog'
import { parseCalendarActivities } from '../utils/parseCalendarActivities'
import type { CalendarActivity } from '../types/CalendarActivity'
import IntegrationDialog from '../components/IntegrationDialog'
import TextButton from '../components/TextButton'
import DataMessage from '../components/DataMessage'
import IconButton from '../components/IconButton'
import LaborCalendarAgenda from '../components/LaborCalendarAgenda'
import { calendarToday } from '../utils/calendarToday'
import LaborCalendarForm from '../components/LaborCalendarForm'
import LaborCalendarMonth from '../components/LaborCalendarMonth'
import LaborCalendarSettings from '../components/LaborCalendarSettings'
import RowAction from '../components/RowAction'
export default function LaborCalendarPage({ settingsView = false }: LaborCalendarPageProps) {
  const { t } = useTranslation()
  const remote = useApiData('/api/v1/labor-calendar', parseLaborCalendar)
  const [workBlock,setWorkBlock]=useState<PersonalWorkBlock|null|undefined>(undefined)
  const [view,setView]=useState<'month'|'week'|'day'>('month')
  const [monthOffset, setMonthOffset] = useState(0)
  const [focusDate,setFocusDate]=useState<string|null>(null)
  const navigate=useNavigate()
  const [cancelActivity, setCancelActivity] = useState<CalendarActivity | null>(null)
  const mutation = useIntegrationMutation()
  const [action, setAction] = useState<LaborCalendarAction | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null | undefined>(undefined)
  const [confirmedSettings, setConfirmedSettings] = useState<ReturnType<typeof parseLaborCalendar>['settings'] | null>(null)
  const data = remote.data && confirmedSettings && confirmedSettings.revision >= remote.data.settings.revision ? { ...remote.data, settings: confirmedSettings } : remote.data
  const day = selectedDate === undefined && data ? calendarToday(data.settings.timezone) : selectedDate ?? null
  const today = data ? calendarToday(data.settings.timezone) : null
  const first = today ? new Date(Date.UTC(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1 + monthOffset, 1)) : null
  const anchor=day??focusDate??today
  const weekStart=anchor?new Date(Date.parse(anchor+'T12:00:00Z')-((new Date(anchor+'T12:00:00Z').getUTCDay()+6)%7)*86400000).toISOString().slice(0,10):null
  const from = view==='month'?first?.toISOString().slice(0, 10):view==='week'?weekStart:anchor
  const to = view==='month'&&first?new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).toISOString().slice(0,10):view==='week'&&weekStart?new Date(Date.parse(weekStart+'T12:00:00Z')+6*86400000).toISOString().slice(0,10):anchor
  const blocks=useApiData(!settingsView&&from&&to?`/api/v1/calendar/work-blocks?from=${from}&to=${to}`:null,parsePersonalWorkBlocks)
  const events = useWorkCatalog(!settingsView && from && to ? `/api/v1/calendar/activities?from=${from}&to=${to}` : null, parseCalendarActivities)
  const refresh = () => { remote.reload(); events.reload() }
  const openActivity = (item: CalendarActivity | 'new') => navigate(item==='new'?`/calendar/activities/new?date=${day??today}`:`/calendar/activities/${encodeURIComponent(item.id)}/edit`)
  async function saveActivity(input: Record<string, unknown>, cancelling = false) {
    const target = cancelActivity
    const path = `/api/v1/calendar/activities${target ? `/${target.id}${cancelling ? '/cancel' : ''}` : ''}`
    const confirmed = await mutation.run({ path, input }, async (signal, key) => { await writeLaborCalendar(path, target && !cancelling ? 'PUT' : 'POST', input, signal, key) })
    if (confirmed) { setCancelActivity(null); events.reload() }
  }
  async function respondActivity(item:CalendarActivity,response:'attending'|'declined') {
    const path=`/api/v1/calendar/activities/${encodeURIComponent(item.id)}/attendance`
    const input={response,expected_revision:item.revision}
    const confirmed=await mutation.run({path,input},async(signal,key)=>{await writeLaborCalendar(path,'PUT',input,signal,key)})
    if(confirmed)events.reload()
  }
  const open = (next: LaborCalendarAction) => { mutation.clearError(); setAction(next) }
  async function save(path: string, input: Record<string, unknown>, method: 'PUT' | 'POST' = 'PUT') {
    const settingsOnly = path === '/api/v1/settings/labor-calendar'
    const confirmed = await mutation.run({ path, input }, async (signal, key) => { const result = await writeLaborCalendar(path, method, input, signal, key); if (settingsOnly && data) setConfirmedSettings(parseLaborCalendar({ ...data, settings: result }).settings) })
    if (confirmed) { setAction(null); if (!settingsOnly) remote.reload() }
    return confirmed
  }
  return <section className={`flex min-w-0 flex-1 flex-col gap-6 ${settingsView ? '' : 'p-4 sm:p-6'}`}>
    <header className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="flex items-center gap-2 text-xl font-semibold"><CalendarDays size={22} className="text-primary" />{settingsView ? t('Configuración del calendario laboral') : t('Calendario laboral')}</h1><p className="mt-2 text-sm text-base-content/55">{settingsView ? t('Administra los feriados, asuetos y responsables de aprobación.') : t('Organiza tus vacaciones, permisos y días laborables.')}</p></div><div className="flex flex-wrap items-center gap-2">{settingsView && data?.can_manage && <RowAction to="/settings/labor-calendar/history" label={t('Ver historial por miembro')}><History size={16}/></RowAction>}{data && !settingsView &&<div role="tablist" aria-label={t('Vista del calendario')} className="tabs tabs-box tabs-sm shrink-0">{(['month','week','day'] as const).map(mode=><button key={mode} type="button" role="tab" aria-selected={view===mode} className={`tab ${view===mode?'tab-active':''}`} onClick={()=>{if(mode==='month'&&anchor&&today)setMonthOffset((Number(anchor.slice(0,4))-Number(today.slice(0,4)))*12+Number(anchor.slice(5,7))-Number(today.slice(5,7)));if(view==='month'&&mode!=='month'&&selectedDate===null&&from)setSelectedDate(from);setView(mode)}}>{t(mode==='month'?'Mes':mode==='week'?'Semana':'Día')}</button>)}</div>}<IconButton label={t('Actualizar calendario')} disabled={remote.loading || mutation.busy} onClick={()=>{refresh();blocks.reload()}}><RefreshCw size={16} /></IconButton>{data && !settingsView && <details className="dropdown dropdown-end"><summary className="btn btn-primary btn-sm btn-square" aria-label={t('Agregar al calendario')} title={t('Agregar al calendario')}><Plus size={16}/></summary><ul className="dropdown-content menu z-20 mt-2 w-60 rounded-xl border border-base-300 bg-base-100 p-2 shadow-lg" onClick={event => event.currentTarget.closest('details')?.removeAttribute('open')}>
      <li><button type="button" onClick={()=>setWorkBlock(null)}><Clock size={16}/>{t('Actividad laboral')}</button></li>{data.can_request && <><li><button type="button" onClick={() => open({ mode: 'request', initialKind: 'leave', path: '/api/v1/labor-calendar/requests' })}><Clock size={16}/>{t('Solicitar permiso')}</button></li><li><button type="button" onClick={() => open({ mode: 'request', initialKind: 'vacation', path: '/api/v1/labor-calendar/requests' })}><Palmtree size={16}/>{t('Solicitar vacaciones')}</button></li></>}
      {data.can_create_activity && <li><button type="button" onClick={() => openActivity('new')}><CalendarPlus size={16}/>{t('Actividad de equipo')}</button></li>}
      {data.can_propose_holiday && <li><button type="button" onClick={() => open({ mode: 'holiday', path: '/api/v1/labor-calendar/holidays' })}><CalendarDays size={16}/>{t(data.can_manage ? 'Agregar feriado o asueto' : 'Proponer feriado o asueto')}</button></li>}
    </ul></details>}{settingsView && data?.can_manage && <IconButton label={t('Agregar feriado o asueto')} onClick={() => open({ mode: 'holiday', path: '/api/v1/labor-calendar/holidays' })}><Plus size={16}/></IconButton>}</div></header>
    {!data ? <DataMessage loading={remote.loading} error={remote.error} onRetry={remote.reload} /> : settingsView && !data.can_manage ? <p role="alert" className="text-sm text-error">{t('No tienes permiso para realizar esta acción.')}</p> : <>
      {settingsView ? <><LaborCalendarSettings data={data} busy={mutation.busy} onSave={save}/></> : <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">{view!=='month'&&from&&today?<CalendarTimeGrid onWorkBlock={id=>setWorkBlock(blocks.data?.items.find(b=>b.id===id))} start={from} days={view==='week'?7:1} activities={[...events.items,...(blocks.data?.items??[]).map(block=>({id:block.id,created_by:block.actor_id,creator_name:'',title:block.title,description:block.note??'',location:'',start_date:block.date,end_date:block.date,all_day:false,start_time:block.start_time,end_time:block.end_time,revision:block.revision,can_edit:true,work_block:true}))]} data={data} today={today} onDate={value=>{setFocusDate(value);setSelectedDate(value)}}/>:<LaborCalendarMonth data={data} activities={[...events.items,...(blocks.data?.items??[]).map(block=>({id:block.id,created_by:block.actor_id,creator_name:'',title:block.title,description:block.note??'',location:'',start_date:block.date,end_date:block.date,all_day:false,start_time:block.start_time,end_time:block.end_time,revision:block.revision,can_edit:true,work_block:true}))]} offset={monthOffset} onOffsetChange={value => { setMonthOffset(value); setSelectedDate(null) }} selectedDate={day} onSelectDate={value=>{setFocusDate(value);setSelectedDate(value)}}/>}<div className="min-w-0 space-y-5">{blocks.error&&<DataMessage error={blocks.error} onRetry={blocks.reload}/>}<section><h2 className="mb-3 text-sm font-semibold">{t('Mis actividades laborales')}</h2>{blocks.data?.items.filter(block=>!day||block.date===day).map(block=><button type="button" key={block.id} className="mb-2 block w-full border-l-2 border-primary px-3 py-2 text-left text-sm hover:bg-base-200" onClick={()=>setWorkBlock(block)}><strong className="block">{block.title}</strong><span className="text-xs text-base-content/60">{block.date} · {block.start_time}–{block.end_time}</span></button>)}</section>{events.error && <DataMessage error={events.error} onRetry={events.reload}/>}<LaborCalendarAgenda activities={events.items} onEditActivity={openActivity} onCancelActivity={item=>{mutation.clearError();setCancelActivity(item)}} onRespondActivity={(item,response)=>void respondActivity(item,response)} data={data} busy={mutation.busy} selectedDate={day} onShowAll={() => setSelectedDate(null)} onAction={open}/></div></div>}

    </>}
    {workBlock!==undefined&&today&&<PersonalWorkBlockModal block={workBlock} date={day??today} onClose={()=>setWorkBlock(undefined)} onChanged={()=>{setWorkBlock(undefined);blocks.reload();remote.reload()}}/>}
    {!action && !cancelActivity && mutation.error && <p role="alert" className="text-sm text-error">{t(mutation.error)}</p>}
    {cancelActivity && <IntegrationDialog title={t('Cancelar actividad')} busy={mutation.busy} onClose={() => setCancelActivity(null)}><p className="mb-4 text-sm">{cancelActivity.title}</p><p className="mb-4 text-sm text-base-content/60">{t('La actividad dejará de aparecer en el calendario de todo el equipo.')}</p>{mutation.error && <p role="alert" className="text-error">{t(mutation.error)}</p>}<footer className="flex justify-end gap-2"><TextButton label={t('Volver')} onClick={() => setCancelActivity(null)} disabled={mutation.busy}/><TextButton label={t('Cancelar actividad')} variant="primary" disabled={mutation.busy} onClick={() => void saveActivity({ expected_revision: cancelActivity.revision }, true)}/></footer></IntegrationDialog>}
    {action && data && <LaborCalendarForm key={`${action.path}:${action.approved}`} mode={action.mode} initialKind={action.initialKind} initialDate={day ?? undefined} directHoliday={data.can_manage} approved={action.approved} busy={mutation.busy} error={mutation.error} country={data.settings.country} onClose={() => setAction(null)} onSubmit={async input => { await save(action.path, input, 'POST') }} />}
  </section>
}
