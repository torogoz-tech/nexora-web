import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup as renderMarkup } from 'react-dom/server'
import {MemoryRouter} from 'react-router'
const renderToStaticMarkup=(element:import('react').ReactNode)=>renderMarkup(<MemoryRouter>{element}</MemoryRouter>)
import type { LaborCalendar } from '../types/LaborCalendar'
import type { CalendarActivity } from '../types/CalendarActivity'
import LaborCalendarPage from '../pages/LaborCalendarPage'
import CalendarActivityForm from '../components/CalendarActivityForm'
import CalendarActivityAgenda from '../components/CalendarActivityAgenda'
import LaborCalendarForm from '../components/LaborCalendarForm'
import { calendarActivityOccursOn } from '../utils/calendarActivityOccursOn'
import { parseCalendarActivities } from '../utils/parseCalendarActivities'
const data = { settings: { timezone: 'America/El_Salvador', country: 'SV', workdays: [1,2,3,4,5], daily_minutes: 480, work_start: '08:00', work_end: '17:00', break_minutes: 60, starts_on: '2026-01-01', revision: 0 }, requests: [], holidays: [], members: [], approvers: [], can_manage: false, can_request: true, can_propose_holiday: true, can_create_activity: true } as LaborCalendar
vi.mock('../hooks/useApiData', () => ({ useApiData: (path: string) => ({ data: path.includes("/work-blocks") ? {items: []} : data, loading: false, error: null, reload: vi.fn() }) }))
vi.mock('../hooks/useWorkCatalog', () => ({ useWorkCatalog: () => ({ items: [], loading: false, error: null, reload: vi.fn() }) }))
vi.mock('../hooks/useIntegrationMutation', () => ({ useIntegrationMutation: () => ({ busy: false, error: null, clearError: vi.fn(), run: vi.fn() }) }))
const activity: CalendarActivity = { id: 'evt', created_by: 'actor', creator_name: 'Ana', title: 'Capacitación', description: 'Taller de equipo', location: 'Sala 1', start_date: '2026-11-09', end_date: '2026-11-10', all_day: false, start_time: '23:00', end_time: '00:00', revision: 0, can_edit: false }
describe('team calendar', () => {
  it('offers leave, vacation, holiday and shared activities in the creation menu according to permission', () => {
    const markup = renderToStaticMarkup(<LaborCalendarPage/> )
    for (const text of ['Solicitar permiso', 'Solicitar vacaciones', 'Actividad de equipo', 'Agregar al calendario']) expect(markup).toContain(text)
    data.can_create_activity = false
    expect(renderToStaticMarkup(<LaborCalendarPage/>)).not.toContain('Actividad de equipo')
    data.can_create_activity = true
  })
  it('prefills self leave requests from the selected date', () => {
    const markup = renderToStaticMarkup(<LaborCalendarForm mode="request" initialKind="leave" initialDate="2026-11-10" busy={false} error={null} country="SV" onClose={() => {}} onSubmit={async () => {}}/>)
    expect(markup).toContain('2026-11-10')
    expect(markup).toContain('Permiso')
    expect(markup).not.toContain('name="actor_id"')
  })
  it('uses exclusive midnight ends for timed events but inclusive days for all-day events', () => {
    expect(calendarActivityOccursOn(activity,'2026-11-09')).toBe(true)
    expect(calendarActivityOccursOn(activity,'2026-11-10')).toBe(false)
    expect(calendarActivityOccursOn({...activity,all_day:true},'2026-11-10')).toBe(true)
  })
  it('renders shared details and exposes editing only when the server permits it', () => {
    const props = { activities: [activity], selectedDate: '2026-11-09', onEdit: vi.fn(), onCancel: vi.fn() }
    const markup = renderToStaticMarkup(<CalendarActivityAgenda {...props}/>)
    expect(markup).toContain('Taller de equipo'); expect(markup).toContain('Sala 1'); expect(markup).not.toContain('Editar actividad')
    expect(renderToStaticMarkup(<CalendarActivityAgenda {...props} activities={[{...activity,can_edit:true}]}/>)).toContain('Editar actividad')
  })
  it('keeps cancelling the activity form separate from submitting it', () => {
    const markup = renderToStaticMarkup(<CalendarActivityForm date="2026-11-10" timezone="America/El_Salvador" busy={false} error={null} onClose={() => {}} onSubmit={async () => {}}/>)
    expect(markup).toContain('id="calendar-activity-form"')
    expect(markup).not.toContain('<dialog')
    expect(markup).not.toContain('type="submit"')
    expect(markup).toContain('Editor Markdown')
  })
  it('validates activity pages and retains the cursor', () => {
    expect(parseCalendarActivities({items:[activity],next_after:'evt'}).next_after).toBe('evt')
    expect(() => parseCalendarActivities({items:[{...activity,start_time:'25:00'}],next_after:null})).toThrow()
  })
})
