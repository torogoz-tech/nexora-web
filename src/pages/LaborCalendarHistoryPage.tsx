import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { ArrowLeft, History, RefreshCw } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { parseLaborCalendar } from '../utils/parseLaborCalendar'
import { writeLaborCalendar } from '../services/writeLaborCalendar'
import type { LaborCalendarAction } from '../types/LaborCalendarAction'
import DataMessage from '../components/DataMessage'
import IconButton from '../components/IconButton'
import RowAction from '../components/RowAction'
import LaborCalendarHistory from '../components/LaborCalendarHistory'
import LaborCalendarForm from '../components/LaborCalendarForm'
export default function LaborCalendarHistoryPage() {
 const { t } = useTranslation()
 const { session } = useAuth()
 const [params] = useSearchParams()
 const remote = useApiData('/api/v1/labor-calendar', parseLaborCalendar)
 const mutation = useIntegrationMutation()
 const [action, setAction] = useState<LaborCalendarAction | null>(null)
 const data = remote.data
 return <section className="flex min-w-0 flex-1 flex-col gap-6" aria-label={t('Historial del calendario laboral')}>
  <header className="flex flex-wrap items-start justify-between gap-3"><div><RowAction to="/settings/labor-calendar" label={t('Volver al calendario laboral')}><ArrowLeft size={16}/></RowAction><h1 className="mt-4 flex items-center gap-2 text-xl font-semibold"><History size={21}/>{t('Historial del calendario laboral')}</h1><p className="mt-2 text-sm text-base-content/55">{t('Consulta las vacaciones, permisos y decisiones de cada miembro.')}</p></div><IconButton label={t('Actualizar calendario')} disabled={remote.loading || mutation.busy} onClick={remote.reload}><RefreshCw size={16}/></IconButton></header>
  {!data ? <DataMessage loading={remote.loading} error={t(remote.error)} onRetry={remote.reload}/> : <LaborCalendarHistory data={data} busy={mutation.busy} initialMemberId={params.get('member') ?? session?.actorId} onAction={value => {mutation.clearError();setAction(value)}}/>}
  {action && data && <LaborCalendarForm key={`${action.path}:${action.approved}`} mode={action.mode} directHoliday={data.can_manage} approved={action.approved} busy={mutation.busy} error={mutation.error} country={data.settings.country} onClose={() => setAction(null)} onSubmit={async input => {const ok=await mutation.run({path:action.path,input},async(signal,key)=>{await writeLaborCalendar(action.path,'POST',input,signal,key)});if(ok){setAction(null);remote.reload()}}}/>}
 </section>
}
