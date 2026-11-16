import { isCalendarDate } from './isCalendarDate'
import { workIntervalMinutes } from './workIntervalMinutes'
export function overtimeInput(form: FormData, taskIds: string[]) {
  const date = String(form.get('date') || '')
  const start_time = String(form.get('start_time') || '')
  const end_time = String(form.get('end_time') || '')
  const next_day = form.get('next_day') === 'on'
  if (!taskIds.length || taskIds.some(id => !id.trim()) || !isCalendarDate(date) || workIntervalMinutes(start_time, end_time, next_day) === null) throw Error('Revisa la fecha, el horario y las tareas vinculadas de las horas extras.')
  return { date, start_time, end_time, next_day, task_ids: [...new Set(taskIds)] }
}
