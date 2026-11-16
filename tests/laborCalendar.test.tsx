import { afterEach, describe, expect, it, vi } from 'vitest'
import * as apiData from '../src/hooks/useApiData'
import { renderToStaticMarkup as renderMarkup } from 'react-dom/server'
import {MemoryRouter} from 'react-router'
const renderToStaticMarkup=(element:import('react').ReactNode)=>renderMarkup(<MemoryRouter>{element}</MemoryRouter>)
import LaborCalendarForm from '../src/components/LaborCalendarForm'
import LaborCalendarPage from '../src/pages/LaborCalendarPage'
import { parseLaborCalendar } from '../src/utils/parseLaborCalendar'
import { laborRequestInput } from '../src/utils/laborRequestInput'
import LaborCalendarMonth from '../src/components/LaborCalendarMonth'

const calendar = {
  settings: { timezone: 'America/El_Salvador', country: 'SV', workdays: [1, 2, 3, 4, 5], daily_minutes: 480, work_start: '09:00', work_end: '17:00', break_minutes: 0, starts_on: '2026-01-01', revision: 1 },
  holidays: [], requests: [], members: [], approvers: [], can_manage: false, can_request: false, can_propose_holiday: false,
}
describe('labor calendar', () => {
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers() })
  it('fails closed on missing action permissions', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-02T18:00:00Z'))
    const parsed = parseLaborCalendar({ ...calendar, can_request: undefined, holidays: [{ id: 'h', name: 'Holiday', date: '2026-11-01', status: 'pending' }], requests: [{ id: 'r', actor_name: 'Developer', kind: 'leave', minutes_per_day: null, start_date: '2026-11-02', end_date: '2026-11-03', status: 'pending' }] })
    expect(parsed.can_request).toBe(false)
    expect(parsed.can_propose_holiday).toBe(false)
    expect(parsed.holidays[0]?.can_decide).toBe(false)
    expect(parsed.requests[0]?.can_decide).toBe(false)
    const hook = vi.spyOn(apiData, 'useApiData').mockReturnValue({ data: {...parsed,items: []}, error: null, loading: false, reload: vi.fn() })
    const html = renderToStaticMarkup(<LaborCalendarPage />)
    expect(html).not.toContain('aria-label="Solicitar ausencia"')
    expect(html).not.toContain('aria-label="Aprobar solicitud"')
    expect(html).not.toContain('aria-label="Proponer feriado o asueto"')
    hook.mockReturnValue({ data: { ...parsed, items: [], can_request: true, can_propose_holiday: true, requests: parsed.requests.map(item => ({ ...item, can_decide: true })) }, error: null, loading: false, reload: vi.fn() })
    const permitted = renderToStaticMarkup(<LaborCalendarPage />)
    expect(permitted).toContain('Solicitar permiso')
    expect(permitted).toContain('Solicitar vacaciones')
    expect(permitted).toContain('Proponer feriado o asueto')
    expect(permitted).toContain('aria-label="Aprobar solicitud"')
  })
  it('does not ask for a vacation reason but requires it for leave', () => {
    const props = { country: 'SV', busy: false, error: null, onClose: vi.fn(), onSubmit: vi.fn() }
    expect(renderToStaticMarkup(<LaborCalendarForm {...props} mode="request" initialKind="vacation" />)).not.toContain('name="reason"')
    expect(renderToStaticMarkup(<LaborCalendarForm {...props} mode="request" initialKind="leave" />)).toContain('name="reason"')
  })
  it('rejects malformed settings instead of silently accepting invalid workdays', () => {
    expect(() => parseLaborCalendar({ ...calendar, settings: { ...calendar.settings, workdays: [0, 8] } })).toThrow()
    expect(() => parseLaborCalendar({ ...calendar, settings: { ...calendar.settings, timezone: 'Invalid/Zone' } })).toThrow()
    expect(() => parseLaborCalendar({ ...calendar, settings: { ...calendar.settings, starts_on: '2026-02-30' } })).toThrow()
    expect(() => parseLaborCalendar({ ...calendar, requests: [{ kind: 'unknown' }] })).toThrow()
  })
  it('serializes hourly leave as minutes and full days as null', () => {
    const form = new FormData()
    Object.entries({ kind: 'leave', duration: 'hours', hours: '1.5', start_date: '2026-11-09', end_date: '2026-11-09', reason: 'Appointment' }).forEach(([name, value]) => form.set(name, value))
    expect(laborRequestInput(form)).toEqual({ kind: 'leave', start_date: '2026-11-09', end_date: '2026-11-09', minutes_per_day: 90, reason: 'Appointment' })
    form.set('duration', 'full')
    expect(laborRequestInput(form).minutes_per_day).toBeNull()
    form.set('kind', 'vacation')
    form.delete('reason')
    expect(laborRequestInput(form).reason).toBe('')
    form.set('kind', 'leave')
    expect(() => laborRequestInput(form)).toThrow()
    form.set('kind', 'vacation')
    form.set('duration', 'hours')
    expect(laborRequestInput(form).minutes_per_day).toBeNull()
    form.set('start_date', '2026-02-30')
    expect(() => laborRequestInput(form)).toThrow()
    form.set('start_date', '2026-11-09')
    form.set('end_date', '2026-11-08')
    expect(() => laborRequestInput(form)).toThrow()
  })
  it('renders approved calendar entries and keeps pending and rejected entries out', () => {
    const now = new Date(), year = now.getUTCFullYear(), month = String(now.getUTCMonth() + 1).padStart(2, '0')
    const data = parseLaborCalendar({ ...calendar, settings: { ...calendar.settings, timezone: 'UTC' }, holidays: ['approved', 'pending', 'rejected'].map(status => ({ id: status, name: `${status}-holiday`, date: `${year}-${month}-15`, country: 'SV', status })) })
    const html = renderToStaticMarkup(<LaborCalendarMonth data={data} />)
    expect(html).toContain('approved-holiday')
    expect(html).not.toContain('pending-holiday')
    expect(html).not.toContain('rejected-holiday')
  })
})
