import { useState } from 'react'
import { Check, Send, X } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { laborRequestInput } from '../utils/laborRequestInput'
import type { LaborCalendarFormProps } from '../types/LaborCalendarFormProps'
import IntegrationDialog from './IntegrationDialog'
import Dropdown from './Dropdown'
import TextButton from './TextButton'
export default function LaborCalendarForm({ mode, busy, error, initialKind = 'vacation', initialDate, approved, directHoliday = false, onClose, onSubmit }: LaborCalendarFormProps) {
  const { t } = useTranslation()
  const [holidayKind, setHolidayKind] = useState('public_holiday')
  const [kind, setKind] = useState<string>(initialKind)
  const [duration, setDuration] = useState('full')
  const [localError, setLocalError] = useState<string | null>(null)
  const title = mode === 'request' ? t('Solicitar ausencia') : mode === 'holiday' ? t(directHoliday ? 'Agregar feriado o asueto' : 'Proponer feriado o asueto') : approved ? t('Aprobar solicitud') : t('Rechazar solicitud')
  return <IntegrationDialog title={title} busy={busy} onClose={onClose}>
    <form className="flex flex-col gap-4" onSubmit={event => {
      event.preventDefault()
      if (busy) return
      setLocalError(null)
      const form = new FormData(event.currentTarget)
      try {
        const input = mode === 'request' ? laborRequestInput(form) : mode === 'holiday' ? { name: String(form.get('name') || '').trim(), date: form.get('date'), kind: holidayKind, reason: String(form.get('reason') || '').trim() } : { approved, reason: String(form.get('reason') || '').trim() }
        void onSubmit(input)
      } catch (failure) { setLocalError(failure instanceof Error ? failure.message : 'Revisa las fechas, la duración y el motivo.') }
    }}>
      {mode === 'request' && <>
        <label className="flex flex-col gap-2 text-sm">{t('Tipo de ausencia')}<Dropdown label={t('Tipo de ausencia')} name="kind" disabled={busy} value={kind} onChange={setKind} options={[{ value: 'vacation', label: t('Vacaciones') }, { value: 'leave', label: t('Permiso') }]} /></label>
        <div className="grid grid-cols-2 gap-3"><label className="flex flex-col gap-2 text-sm">{t('Desde')}<input required type="date" name="start_date" defaultValue={initialDate} className="input input-sm w-full" disabled={busy} /></label><label className="flex flex-col gap-2 text-sm">{t('Hasta')}<input required type="date" name="end_date" defaultValue={initialDate} className="input input-sm w-full" disabled={busy} /></label></div>
        {kind === 'leave' && <><label className="flex flex-col gap-2 text-sm">{t('Duración')}<Dropdown label={t('Duración')} name="duration" disabled={busy} value={duration} onChange={setDuration} options={[{ value: 'full', label: t('Día completo') }, { value: 'hours', label: t('Por horas') }]} /></label>{duration === 'hours' && <label className="flex flex-col gap-2 text-sm">{t('Horas por día')}<input required type="number" name="hours" min="0.25" max="24" step="0.25" className="input input-sm w-full" disabled={busy} /></label>}</>}
        <p className="text-xs text-base-content/55">{t('La solicitud requiere aprobación. Los días no laborables no descuentan tiempo.')}</p>
      </>}
      {mode === 'holiday' && <>
        <label className="flex flex-col gap-2 text-sm">{t('Nombre')}<input required maxLength={150} name="name" className="input input-sm w-full" disabled={busy} /></label>
        <label className="flex flex-col gap-2 text-sm">{t('Tipo de día no laborable')}<Dropdown label={t('Tipo de día no laborable')} value={holidayKind} onChange={setHolidayKind} disabled={busy} options={[{ value: 'public_holiday', label: t('Asueto') }, { value: 'holiday', label: t('Feriado') }]}/></label>
        <label className="flex flex-col gap-2 text-sm">{t('Fecha')}<input required type="date" name="date" defaultValue={initialDate} className="input input-sm w-full" disabled={busy}/></label>
        <p className="text-xs text-base-content/55">{t(directHoliday ? 'El feriado se registrará aprobado en el calendario.' : 'Los feriados se agregan manualmente y requieren aprobación antes de aplicarse.')}</p>
      </>}
      {!(mode === 'request' && kind === 'vacation') && <label className="flex flex-col gap-2 text-sm">{t('Motivo')}{mode === 'holiday' && ` · ${t('Opcional')}`}<textarea name="reason" className="textarea min-h-24 w-full" required={mode !== 'holiday'} maxLength={1000} disabled={busy} /></label>}
      {(error || localError) && <p role="alert" className="text-sm text-error">{t(error || localError)}</p>}
      <div className="flex justify-end gap-2"><TextButton label={t('Cancelar')} type="button" disabled={busy} onClick={onClose}><X size={16} /></TextButton><TextButton label={busy ? t('Guardando…') : title} variant="primary" type="submit" disabled={busy}>{mode === 'decision' ? <Check size={16} /> : <Send size={16} />}</TextButton></div>
    </form>
  </IntegrationDialog>
}
