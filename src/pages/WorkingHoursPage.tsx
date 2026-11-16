import { useState } from 'react'
import { Clock3 } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { parseLaborCalendar } from '../utils/parseLaborCalendar'
import { writeLaborCalendar } from '../services/writeLaborCalendar'
import DataMessage from '../components/DataMessage'
import WorkingHoursForm from '../components/WorkingHoursForm'
export default function WorkingHoursPage() {
  const { t } = useTranslation()
  const remote = useApiData('/api/v1/labor-calendar', parseLaborCalendar)
  const mutation = useIntegrationMutation()
  const [confirmed, setConfirmed] = useState<ReturnType<typeof parseLaborCalendar> | null>(null)
  const data = confirmed && (!remote.data || confirmed.settings.revision >= remote.data.settings.revision) ? confirmed : remote.data
  const [localError, setLocalError] = useState<string | null>(null)
  return <section className="flex min-w-0 flex-1 flex-col gap-6">
    <header><h1 className="flex items-center gap-2 text-xl font-semibold"><Clock3 size={22} className="text-primary" />{t('Horas y días laborales')}</h1><p className="mt-2 text-sm text-base-content/55">{t('Define el horario habitual y los días de trabajo de la organización.')}</p></header>
    {!data ? <DataMessage loading={remote.loading} error={remote.error} onRetry={remote.reload} /> : !data.can_manage ? <p role="alert" className="text-sm text-error">{t('No tienes permiso para realizar esta acción.')}</p> : <>
      <WorkingHoursForm settings={data.settings} busy={mutation.busy} onError={setLocalError} onSave={async input => { setLocalError(null); const ok = await mutation.run(input, async (signal, key) => { const settings = await writeLaborCalendar('/api/v1/settings/labor-calendar', 'PUT', input, signal, key); setConfirmed(parseLaborCalendar({ ...data, settings })) }); return ok }} />
    </>}
    {(localError || mutation.error) && <p role="alert" className="text-sm text-error">{t(localError || mutation.error)}</p>}
  </section>
}
