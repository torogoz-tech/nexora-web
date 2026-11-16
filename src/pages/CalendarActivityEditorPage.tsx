import {ArrowLeft,Save} from 'lucide-react'
import {useNavigate,useSearchParams} from 'react-router'
import {useApiData} from '../hooks/useApiData'
import {useTranslation} from '../hooks/useTranslation'
import {useIntegrationMutation} from '../hooks/useIntegrationMutation'
import {parseLaborCalendar} from '../utils/parseLaborCalendar'
import {parseCalendarActivities} from '../utils/parseCalendarActivities'
import {calendarToday} from '../utils/calendarToday'
import {isCalendarDate} from '../utils/isCalendarDate'
import {writeLaborCalendar} from '../services/writeLaborCalendar'
import CalendarActivityForm from '../components/CalendarActivityForm'
import IconButton from '../components/IconButton'
import DataMessage from '../components/DataMessage'
export default function CalendarActivityEditorPage({id}:{id?:string}){
 const {t}=useTranslation(),navigate=useNavigate(),[params]=useSearchParams(),mutation=useIntegrationMutation()
 const calendar=useApiData('/api/v1/labor-calendar',parseLaborCalendar)
 const remote=useApiData(id?`/api/v1/calendar/activities/${encodeURIComponent(id)}`:null,value=>parseCalendarActivities({items:[value],next_after:null}).items[0]!)
 const activity=remote.data,settings=calendar.data
 const date=params.get('date'),initial=date&&isCalendarDate(date)?date:settings?calendarToday(settings.settings.timezone):''
 const allowed=id?activity?.can_edit:settings?.can_create_activity
 async function save(input:Record<string,unknown>){const path=`/api/v1/calendar/activities${id?`/${encodeURIComponent(id)}`:''}`;if(await mutation.run({path,input},(signal,key)=>writeLaborCalendar(path,id?'PUT':'POST',input,signal,key).then(()=>{})))navigate('/calendar')}
 return <section className="min-w-0 flex-1"><header className="mb-7 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><IconButton label={t('Volver al calendario')} onClick={()=>navigate('/calendar')}><ArrowLeft size={16}/></IconButton><h1 className="text-xl font-semibold">{t(id?'Editar actividad':'Actividad de equipo')}</h1></div><IconButton label={t(id?'Guardar cambios':'Crear actividad')} variant="primary" type="submit" form="calendar-activity-form" disabled={mutation.busy||!allowed}><Save size={16}/></IconButton></header>
 {calendar.loading||(id&&remote.loading)?<DataMessage loading/>:calendar.error||remote.error?<DataMessage error={t(calendar.error??remote.error)} onRetry={()=>{calendar.reload();remote.reload()}}/>:!allowed?<DataMessage error={t('No tienes permiso para realizar esta acción.')}/>:settings&&<CalendarActivityForm key={id??'new'} activity={activity??undefined} date={initial} timezone={settings.settings.timezone} busy={mutation.busy} error={mutation.error} onClose={()=>navigate('/calendar')} onSubmit={save}/>}
 </section>
}
