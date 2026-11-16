import { useState } from 'react'
import { Check, Send, X } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { parseOvertimeEvidence } from '../utils/parseOvertimeEvidence'
import DataMessage from './DataMessage'
import OvertimeEvidencePicker from './OvertimeEvidencePicker'
import { overtimeInput } from '../utils/overtimeInput'
import { workIntervalMinutes } from '../utils/workIntervalMinutes'
import type { OvertimeFormProps } from '../types/OvertimeFormProps'
import IntegrationDialog from './IntegrationDialog'
import TextButton from './TextButton'
export default function OvertimeForm({ busy, error, approved, onClose, onSubmit }: OvertimeFormProps) {
  const { t } = useTranslation()
  const [start, setStart] = useState('17:00')
  const [end, setEnd] = useState('18:00')
  const [nextDay, setNextDay] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const decision = approved !== undefined
  const candidates = useApiData(decision ? null : '/api/v1/overtime/evidence-candidates', parseOvertimeEvidence)
  const [tasks, setTasks] = useState<string[]>([])
  const title = decision ? t(approved ? 'Aprobar horas extras' : 'Rechazar horas extras') : t('Solicitar horas extras')
  const minutes = workIntervalMinutes(start, end, nextDay)
  return <IntegrationDialog title={title} busy={busy} onClose={onClose}>
    <form className="flex flex-col gap-4" onSubmit={event => {
      event.preventDefault()
      if (busy || (!decision && !tasks.length)) return
      setLocalError(null)
      const form = new FormData(event.currentTarget)
      try { void onSubmit(decision ? { approved, reason: String(form.get('reason') || '').trim() } : overtimeInput(form, tasks)) }
      catch (failure) { setLocalError(failure instanceof Error ? failure.message : 'Revisa la fecha, el horario y el motivo de las horas extras.') }
    }}>
      {!decision && <>
        <label className="flex flex-col gap-2 text-sm">{t('Fecha')}<input required type="date" name="date" className="input input-sm w-full" disabled={busy} /></label>
        <div className="grid grid-cols-2 gap-3"><label className="flex flex-col gap-2 text-sm">{t('Hora de inicio')}<input required type="time" name="start_time" value={start} onChange={event => setStart(event.target.value)} className="input input-sm w-full" disabled={busy} /></label><label className="flex flex-col gap-2 text-sm">{t('Hora de fin')}<input required type="time" name="end_time" value={end} onChange={event => setEnd(event.target.value)} className="input input-sm w-full" disabled={busy} /></label></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="next_day" className="checkbox checkbox-sm" checked={nextDay} onChange={event => setNextDay(event.target.checked)} disabled={busy} />{t('Finaliza al día siguiente')}</label>
        <p className={`text-sm ${minutes === null ? 'text-error' : 'text-base-content/60'}`}>{minutes === null ? t('El intervalo debe durar entre 1 minuto y 24 horas.') : t('Duración: {hours} h {minutes} min', { hours: Math.floor(minutes / 60), minutes: minutes % 60 })}</p>
        {!candidates.data ? <DataMessage loading={candidates.loading} error={candidates.error} onRetry={candidates.reload} /> : <OvertimeEvidencePicker data={candidates.data} taskIds={tasks} onTasks={setTasks} busy={busy} />}
        <p className="text-xs text-base-content/50">{t('Selecciona al menos una tarea prevista. Podrás vincular los commits verificados después de realizar el trabajo.')}</p>
        <p className="text-xs text-base-content/50">{t('Tu responsable revisará el registro. Se conserva el historial de cada decisión.')}</p>
      </>}
      {decision && <label className="flex flex-col gap-2 text-sm">{t('Motivo')}<textarea required name="reason" maxLength={1000} className="textarea min-h-24 w-full" disabled={busy} /></label>}
      {(error || localError) && <p role="alert" className="text-sm text-error">{t(error || localError)}</p>}
      <div className="flex justify-end gap-2"><TextButton type="button" label={t('Cancelar')} onClick={onClose} disabled={busy}><X size={16} /></TextButton><TextButton type="submit" label={busy ? t('Guardando…') : title} variant="primary" disabled={busy || (!decision && (minutes === null || !tasks.length || !candidates.data))}>{decision ? <Check size={16} /> : <Send size={16} />}</TextButton></div>
    </form>
  </IntegrationDialog>
}
