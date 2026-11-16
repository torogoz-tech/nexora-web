import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import type { LaborCalendarMonthProps } from '../types/LaborCalendarMonthProps'
import IconButton from './IconButton'
import { calendarActivityOccursOn } from '../utils/calendarActivityOccursOn'
export default function LaborCalendarMonth({ data, selectedDate, onSelectDate, activities = [], offset: controlledOffset, onOffsetChange }: LaborCalendarMonthProps) {
  const { t, dateLocale } = useTranslation()
  const [localOffset, setLocalOffset] = useState(0)
  const offset = controlledOffset ?? localOffset
  const setOffset = (value: number) => { setLocalOffset(value); onOffsetChange?.(value) }
  const [now] = useState(() => new Date())
  const current = new Intl.DateTimeFormat('en-CA', { timeZone: data.settings.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  const part = (name: string) => Number(current.find(item => item.type === name)?.value)
  const today = `${part('year')}-${String(part('month')).padStart(2, '0')}-${String(part('day')).padStart(2, '0')}`
  const first = new Date(Date.UTC(part('year'), part('month') - 1 + offset, 1))
  const year = first.getUTCFullYear(), month = first.getUTCMonth()
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const blanks = (first.getUTCDay() + 6) % 7
  return <section className="min-w-0 overflow-hidden">
    <header className="flex items-center justify-between gap-3 border-b border-base-300 p-4"><h2 className="font-semibold capitalize">{new Intl.DateTimeFormat(dateLocale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(first)}</h2><div className="flex gap-1"><button type="button" className="btn btn-ghost btn-sm" onClick={() => { setOffset(0); onSelectDate?.(today) }}>{t('Hoy')}</button><IconButton label={t('Mes anterior')} onClick={() => setOffset(offset - 1)}><ChevronLeft size={16} /></IconButton><IconButton label={t('Mes siguiente')} onClick={() => setOffset(offset + 1)}><ChevronRight size={16} /></IconButton></div></header>
    <div className="overflow-x-auto"><div className="min-w-[560px]"><div className="grid grid-cols-7 border-b border-base-300">{['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => <div key={day} className="p-2 text-center text-xs text-base-content/55">{t(day)}</div>)}</div><div className="grid grid-cols-7">{Array.from({ length: blanks }, (_, index) => <div key={`blank-${index}`} className="h-[clamp(5rem,10vh,7rem)] border-b border-r border-base-300/50 bg-base-200/30" />)}{Array.from({ length: days }, (_, index) => {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`
      const workday = data.settings.workdays.includes((new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7 + 1)
      const holidays = data.holidays.filter(item => item.date === date && item.status === 'approved' && (!item.country || item.country === data.settings.country))
      const requests = data.requests.filter(item => item.start_date <= date && item.end_date >= date && item.status !== 'rejected')
      return <button type="button" key={date} aria-label={new Intl.DateTimeFormat(dateLocale, { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`))} aria-pressed={date === selectedDate} onClick={() => onSelectDate?.(date)} className={`flex h-[clamp(5rem,10vh,7rem)] flex-col overflow-hidden text-left align-top transition-colors hover:bg-base-200 focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-primary ${date === selectedDate ? 'bg-primary/10 ring-1 ring-inset ring-primary/60' : ''} min-w-0 border-b border-r border-base-300/50 p-2 ${!workday ? 'bg-base-200/50' : ''}`}><time dateTime={date} className={`inline-flex size-6 items-center justify-center rounded-lg text-xs ${date === today ? 'bg-primary font-semibold text-primary-content' : 'text-base-content/65'}`}>{index + 1}</time><div className="mt-1 min-w-0 space-y-1 overflow-hidden">{activities.filter(item => calendarActivityOccursOn(item, date)).map(item => <p key={item.id} className={`rounded-md ${item.work_block?'bg-primary/15':'bg-success/15'} px-1.5 py-1 text-[10px] leading-tight`} title={item.title}>{!item.all_day && `${item.start_time} `}{item.title}</p>)}{holidays.map(item => <p key={item.id} className="rounded-md bg-warning/15 px-1.5 py-1 text-[10px] leading-tight text-base-content" title={item.name}>{item.name}</p>)}{requests.map(item => <p key={item.id} className="rounded-md bg-info/15 px-1.5 py-1 text-[10px] leading-tight" title={`${item.actor_name}: ${item.reason}`}>{item.status === 'pending' && `${t('Pendiente')} · `}{item.actor_name} · {item.kind === 'vacation' ? t('Vacaciones') : item.minutes_per_day ? `${item.minutes_per_day / 60} ${t('h')}` : t('Permiso')}</p>)}</div></button>
    })}</div></div></div>
    <footer className="flex flex-wrap gap-4 p-4 text-xs text-base-content/55"><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-warning" />{t('Feriado o asueto aprobado')}</span><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-info" />{t('Ausencia aprobada')}</span><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-success" />{t('Actividades del equipo')}</span><span>{data.settings.timezone} · {data.settings.daily_minutes / 60} {t('horas por día')}</span></footer>
  </section>
}
