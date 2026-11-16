import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { DebouncedFieldSave } from '../utils/DebouncedFieldSave'
import { useTranslation } from '../hooks/useTranslation'
import { workingHoursInput } from '../utils/workingHoursInput'
import { workIntervalMinutes } from '../utils/workIntervalMinutes'
import type { WorkingHoursFormProps } from '../types/WorkingHoursFormProps'
export default function WorkingHoursForm({ settings, busy, onError, onSave }: WorkingHoursFormProps) {
  const { t } = useTranslation()
  const [workdays, setWorkdays] = useState(settings.workdays)
  const [start, setStart] = useState(settings.work_start)
  const [end, setEnd] = useState(settings.work_end)
  const [rest, setRest] = useState(String(settings.break_minutes))
  const interval = workIntervalMinutes(start, end, end <= start)
  const daily = interval === null || rest === '' || !Number.isInteger(Number(rest)) || Number(rest) < 0 || Number(rest) >= interval ? null : interval - Number(rest)
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  const worker = useRef<DebouncedFieldSave | null>(null)
  const latest = useRef({ onSave, onError, revision: settings.revision })
  const baseline = useRef(JSON.stringify([settings.work_start, settings.work_end, String(settings.break_minutes), [...settings.workdays].sort()]))
  useLayoutEffect(() => { latest.current = { onSave, onError, revision: Math.max(latest.current.revision, settings.revision) } }, [onSave, onError, settings.revision])
  useEffect(() => {
    const controller = new DebouncedFieldSave({
      shouldSave: value => value !== baseline.current,
      isValid: () => true,
      onSaving: () => {},
      onSaved: value => { baseline.current = value },
      onError: () => latest.current.onError('No pudimos guardar los cambios. Vuelve a intentarlo.'),
      onCommit: async value => {
        const [work_start, work_end, pause, days] = JSON.parse(value) as [string, string, string, number[]]
        if (!pause) return false
        const form = new FormData()
        form.set('work_start', work_start); form.set('work_end', work_end); form.set('break_minutes', pause)
        try {
          const input = workingHoursInput(form, days, latest.current.revision)
          const saved = await latest.current.onSave(input)
          if (saved) { latest.current.revision = input.expected_revision + 1; baseline.current = value }
          return saved
        } catch (failure) { latest.current.onError(failure instanceof Error ? failure.message : 'Revisa el horario, el descanso y los días laborables.'); return false }
      },
    }, 800)
    worker.current = controller
    return () => { controller.dispose(); worker.current = null }
  }, [])
  function edit(nextStart: string, nextEnd: string, nextRest: string, nextDays: number[], immediate = false) {
    worker.current?.edit(JSON.stringify([nextStart, nextEnd, nextRest, [...nextDays].sort()]))
    if (immediate) worker.current?.flush()
  }
  return <form onSubmit={event => { event.preventDefault(); worker.current?.flush() }} onBlur={() => worker.current?.flush()} aria-busy={busy}>
    <section className="grid gap-5 border-b border-base-300 pb-6 md:grid-cols-[1fr_1.4fr]"><div><h2 className="font-semibold">{t('Horario de trabajo')}</h2><p className="mt-2 text-sm text-base-content/55">{t('La jornada neta se calcula descontando el descanso del intervalo de trabajo.')}</p></div><div className="space-y-4"><div className="grid grid-cols-2 gap-3"><label className="flex flex-col gap-2 text-sm">{t('Hora de inicio')}<input required type="time" name="work_start" value={start} onChange={event => { setStart(event.target.value); edit(event.target.value, end, rest, workdays) }} className="input input-sm w-full" /></label><label className="flex flex-col gap-2 text-sm">{t('Hora de fin')}<input required type="time" name="work_end" value={end} onChange={event => { setEnd(event.target.value); edit(start, event.target.value, rest, workdays) }} className="input input-sm w-full" /></label></div><label className="flex flex-col gap-2 text-sm">{t('Descanso en minutos')}<input required type="text" inputMode="numeric" pattern="[0-9]+" maxLength={4} name="break_minutes" value={rest} onChange={event => { const raw = event.target.value; if (!/^\d*$/.test(raw)) return; const value = raw.replace(/^0+(?=\d)/, ''); setRest(value); edit(start, end, value, workdays) }} className="input input-sm w-full" /></label><p className="text-xs text-base-content/55">{t('Si el fin es anterior al inicio, la jornada termina al día siguiente. Horas iguales representan 24 horas.')}</p><p className={`text-sm ${daily === null ? 'text-error' : 'text-primary'}`}>{daily === null ? t('El descanso debe ser menor que la jornada.') : t('Jornada neta: {hours} h {minutes} min', { hours: Math.floor(daily / 60), minutes: daily % 60 })}</p></div></section>
    <section className="grid gap-5 py-6 md:grid-cols-[1fr_1.4fr]"><div><h2 className="font-semibold">{t('Días laborables')}</h2><p className="mt-2 text-sm text-base-content/55">{t('Selecciona los días habituales de trabajo. Los feriados se administran en el calendario laboral.')}</p></div><fieldset><legend className="sr-only">{t('Días laborables')}</legend><div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{days.map((day, index) => <label key={day} className="flex items-center gap-2 text-sm"><input type="checkbox" className="checkbox checkbox-sm" checked={workdays.includes(index + 1)} onChange={event => { const next = event.target.checked ? [...workdays, index + 1] : workdays.filter(value => value !== index + 1); setWorkdays(next); edit(start, end, rest, next, true) }} />{t(day)}</label>)}</div>{!workdays.length && <p className="mt-3 text-sm text-error">{t('Selecciona al menos un día laborable.')}</p>}</fieldset></section>

  </form>
}
