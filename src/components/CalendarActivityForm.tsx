import { useState } from 'react'
import type { CalendarActivity } from '../types/CalendarActivity'
import { useTranslation } from '../hooks/useTranslation'
import MarkdownEditor from './MarkdownEditor'
export default function CalendarActivityForm({ activity, date, timezone, busy, error, onSubmit }: { activity?: CalendarActivity; date: string; timezone: string; busy: boolean; error: string | null; onClose: () => void; onSubmit: (input: Record<string, unknown>) => Promise<void> }) {
  const { t } = useTranslation()
  const [multipleDays,setMultipleDays] = useState(!!activity && activity.start_date !== activity.end_date)
  const [mode,setMode] = useState<'virtual'|'in_person'>(activity?.mode ?? (activity?.location.startsWith('https://')?'virtual':'in_person'))
  const [attendance,setAttendance] = useState(activity?.attendance_required ?? false)
  const [allDay, setAllDay] = useState(activity?.all_day ?? false)
  const [description,setDescription]=useState(activity?.description??'')
  const [localError, setLocalError] = useState<string | null>(null)
  return <form id="calendar-activity-form" className="space-y-5" onSubmit={event => {
    event.preventDefault(); if (busy) return
    const form = new FormData(event.currentTarget)
    const start = String(form.get('start_date')), end = multipleDays ? String(form.get('end_date')) : start
    const startTime = allDay ? null : String(form.get('start_time')), endTime = allDay ? null : String(form.get('end_time'))
    if (end < start || (!allDay && start === end && endTime! <= startTime!)) { setLocalError('La actividad debe terminar después de su inicio.'); return }
    setLocalError(null)
    void onSubmit({ mode, attendance_required:attendance, title: String(form.get('title')).trim(), description: description.trim(), location: String(form.get('location') || '').trim(), start_date: start, end_date: end, all_day: allDay, start_time: startTime, end_time: endTime, ...(activity ? { expected_revision: activity.revision } : {}) })
  }}><p className="text-xs text-base-content/55">{t('Visible para todo el equipo. El tiempo de asistencia se descuenta de las horas previstas en tareas.')} · {timezone}</p>
    <label className="flex flex-col gap-2 text-sm">{t('Nombre')}<input name="title" required maxLength={200} defaultValue={activity?.title} className="input input-sm w-full" disabled={busy}/></label>
    <label className="flex items-center justify-between text-sm">{t('Varios días')}<input type="checkbox" className="toggle toggle-sm" checked={multipleDays} onChange={e=>setMultipleDays(e.target.checked)} disabled={busy}/></label>
    <label className="flex items-center justify-between text-sm">{t('Todo el día')}<input type="checkbox" className="toggle toggle-sm" checked={allDay} onChange={e => setAllDay(e.target.checked)} disabled={busy}/></label>
    <div className="grid grid-cols-2 gap-3">{(multipleDays ? ['start_date','end_date'] as const : ['start_date'] as const).map((name, index) => <label key={name} className="flex flex-col gap-2 text-sm">{t(multipleDays ? index ? 'Hasta' : 'Desde' : 'Fecha')}<input name={name} type="date" required defaultValue={activity?.[name] ?? date} className="input input-sm w-full" disabled={busy}/></label>)}</div>
    {!allDay && <div className="grid grid-cols-2 gap-3">{(['start_time', 'end_time'] as const).map((name, index) => <label key={name} className="flex flex-col gap-2 text-sm">{t(index ? 'Hora de fin' : 'Hora de inicio')}<input name={name} type="time" required defaultValue={activity?.[name] ?? (index ? '10:00' : '09:00')} className="input input-sm w-full" disabled={busy}/></label>)}</div>}
    <label className="flex items-center justify-between text-sm">{t('Actividad virtual')}<input type="checkbox" className="toggle toggle-sm" checked={mode==='virtual'} onChange={e=>setMode(e.target.checked?'virtual':'in_person')} disabled={busy}/></label>
    <label className="flex flex-col gap-2 text-sm">{t(mode==='virtual'?'Enlace de la reunión':'Ubicación presencial')}<input key={mode} name="location" type={mode==='virtual'?'url':'text'} required maxLength={500} defaultValue={activity?.location} placeholder={mode==='virtual'?'https://…':undefined} className="input input-sm w-full" disabled={busy}/></label>
    <label className="flex items-center justify-between gap-4 text-sm">{t('Requiere confirmar asistencia')}<input type="checkbox" className="toggle toggle-sm" checked={attendance} onChange={e=>setAttendance(e.target.checked)} disabled={busy}/></label>
    <MarkdownEditor label={`${t('Descripción')} · ${t('Opcional')}`} value={description} onChange={setDescription} maxLength={4000} allowImages={false} disabled={busy}/>
    {(error || localError) && <p role="alert" className="text-sm text-error">{t(error || localError)}</p>}

  </form>
}
