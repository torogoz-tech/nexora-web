import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import * as apiData from '../src/hooks/useApiData'
import OvertimePage from '../src/pages/OvertimePage'
import WorkingHoursForm from '../src/components/WorkingHoursForm'
import LaborCalendarSettings from '../src/components/LaborCalendarSettings'
import { parseOvertime } from '../src/utils/parseOvertime'
import { parseOvertimeEvidence } from '../src/utils/parseOvertimeEvidence'
import { overtimeInput } from '../src/utils/overtimeInput'
import { workingHoursInput } from '../src/utils/workingHoursInput'
import { parseLaborCalendar } from '../src/utils/parseLaborCalendar'
const item = { id: 'overtime-1', actor_id: 'dev', actor_name: 'Ana', date: '2026-11-08', start_time: '22:00', end_time: '01:30', next_day: true, minutes: 210, reason: 'Support release', status: 'pending', decision_reason: null, decided_by_name: null, decided_at: null, created_at: '2026-11-07T12:00:00Z', can_decide: false, can_attach_evidence: false, tasks: [{ id: 'task-1', project_id: 'project', title: 'Resolve incident' }], commits: [] }
const settings = { timezone: 'America/El_Salvador', country: 'SV', workdays: [1, 2, 3, 4, 5], daily_minutes: 480, work_start: '09:00', work_end: '18:00', break_minutes: 60, starts_on: '2026-01-01', revision: 2 }
afterEach(() => vi.restoreAllMocks())
describe('overtime requests and evidence', () => {
  it('requires a real date, positive duration and at least one planned task', () => {
    const form = new FormData()
    Object.entries({ date: '2026-11-08', start_time: '22:00', end_time: '01:30', next_day: 'on', reason: 'Support release' }).forEach(([key, value]) => form.set(key, value))
    expect(overtimeInput(form, ['task-1'])).toEqual({ date: '2026-11-08', start_time: '22:00', end_time: '01:30', next_day: true, task_ids: ['task-1'] })
    expect(() => overtimeInput(form, [])).toThrow()
    form.delete('next_day')
    expect(() => overtimeInput(form, ['task-1'])).toThrow()
    form.set('date', '2026-02-30')
    expect(() => overtimeInput(form, ['task-1'])).toThrow()
  })
  it('rejects fabricated provenance and inconsistent durations', () => {
    expect(() => parseOvertime({ items: [{ ...item, minutes: 15 }], total_approved_minutes: 0 })).toThrow()
    expect(() => parseOvertimeEvidence({ tasks: [], commits: [{ source_event_id: 'event', repository_id: 'repo', repository_name: 'Repository', project_id: 'project', sha: 'a'.repeat(40), occurred_at: '2026-11-08T22:30:00Z', provenance: 'manual' }] })).toThrow()
    expect(parseOvertimeEvidence({ tasks: [], commits: [] }).can_attach_evidence).toBe(false)
  })
  it('shows linked tasks and exposes only permitted request and decision actions', () => {
    const data = parseOvertime({ items: [item], can_request: false, can_manage: false, total_approved_minutes: 0 })
    const hook = vi.spyOn(apiData, 'useApiData').mockReturnValue({ data, loading: false, error: null, reload: vi.fn() })
    const html = renderToStaticMarkup(<OvertimePage />)
    expect(html).toContain('Resolve incident')
    expect(html).toContain('3 h 30 min')
    expect(html).not.toContain('aria-label="Solicitar horas extras"')
    expect(html).not.toContain('aria-label="Aprobar horas extras"')
    expect(html).not.toContain('aria-label="Vincular evidencias"')
    hook.mockReturnValue({ data: { ...data, can_request: true, items: [{ ...data.items[0]!, can_decide: true, can_attach_evidence: true }] }, loading: false, error: null, reload: vi.fn() })
    const allowed = renderToStaticMarkup(<OvertimePage />)
    expect(allowed).toContain('aria-label="Solicitar horas extras"')
    expect(allowed).toContain('aria-label="Aprobar horas extras"')
    expect(allowed).toContain('aria-label="Vincular evidencias"')
  })
})
describe('working hours settings', () => {
  it('normalizes the initial unset country and derives a net overnight workday', () => {
    const data = parseLaborCalendar({ settings: { ...settings, country: null, work_start: '22:00', work_end: '07:00' }, holidays: [], requests: [], members: [], approvers: [], can_manage: true })
    expect(data.settings.country).toBe('')
    const html = renderToStaticMarkup(<WorkingHoursForm settings={data.settings} busy={false} onError={vi.fn()} onSave={vi.fn()} />)
    expect(html).toContain('Jornada neta: 8 h 0 min')
    expect(html).toContain('type="text" inputMode="numeric"')
    expect(html).not.toContain('Guardar jornada laboral')
    expect(html).toContain('al día siguiente')
  })
  it('writes only edited schedule fields and preserves timezone and country by omission', () => {
    const form = new FormData()
    Object.entries({ work_start: '22:00', work_end: '07:00', break_minutes: '60' }).forEach(([key, value]) => form.set(key, value))
    expect(workingHoursInput(form, [1, 2], 2)).toEqual({ work_start: '22:00', work_end: '07:00', break_minutes: 60, workdays: [1, 2], expected_revision: 2 })
    expect(() => workingHoursInput(form, [], 2)).toThrow()
    form.set('break_minutes', '540')
    expect(() => workingHoursInput(form, [1], 2)).toThrow()
  })
  it('uses General for country and timezone and explains the ratings start date', () => {
    const data = parseLaborCalendar({ settings, holidays: [], requests: [], members: [], approvers: [], can_manage: true })
    const html = renderToStaticMarkup(<MemoryRouter><LaborCalendarSettings data={data} busy={false} onSave={vi.fn()} /></MemoryRouter>)
    expect(html).not.toContain('País')
    expect(html).not.toContain('Zona horaria')
    expect(html).toContain('Los días anteriores no se califican.')
    expect(html).toContain('type="date"')
    expect(html).not.toContain('name="timezone"')
    expect(html).not.toContain('name="daily_minutes"')
    expect(html).not.toContain('Guardar calendario')
  })
})
