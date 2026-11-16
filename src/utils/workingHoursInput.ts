import { workIntervalMinutes } from './workIntervalMinutes'
export function workingHoursInput(form: FormData, workdays: number[], revision: number) {
  const work_start = String(form.get('work_start') || '')
  const work_end = String(form.get('work_end') || '')
  const break_minutes = Number(form.get('break_minutes'))
  const span = workIntervalMinutes(work_start, work_end, work_end <= work_start)
  if (span === null || !Number.isInteger(break_minutes) || break_minutes < 0 || break_minutes >= span || !workdays.length || workdays.some(day => !Number.isInteger(day) || day < 1 || day > 7)) throw Error('Revisa el horario, el descanso y los días laborables.')
  return { work_start, work_end, break_minutes, workdays: [...new Set(workdays)].sort(), expected_revision: revision }
}
