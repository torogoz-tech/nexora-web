import { describe, expect, it } from 'vitest'
import { calendarAgendaItems } from './calendarAgendaItems'
import { calendarToday } from './calendarToday'
import type { LaborCalendar } from '../types/LaborCalendar'
describe('calendar daily agenda', () => {
  const data = { settings: { country: 'SV' }, requests: [{ id: 'leave', start_date: '2026-11-02', end_date: '2026-11-04', status: 'pending' }], holidays: [{ id: 'local', date: '2026-11-03', country: 'SV', status: 'approved' }, { id: 'other', date: '2026-11-03', country: 'US', status: 'approved' }] } as LaborCalendar
  it('includes overlapping leave and local holidays, retaining pending approvals', () => {
    expect(calendarAgendaItems(data, '2026-11-03', 'all', 'all').map(item => item.id)).toEqual(['leave', 'local'])
    expect(calendarAgendaItems(data, '2026-11-03', 'all', 'approved').map(item => item.id)).toEqual(['local'])
    expect(calendarAgendaItems(data, '2026-11-05', 'all', 'all')).toEqual([])
    expect(calendarAgendaItems(data, null, 'requests', 'all').map(item => item.id)).toEqual(['leave'])
  })
  it('selects today in the organization timezone at a UTC date boundary', () => {
    expect(calendarToday('America/El_Salvador', new Date('2026-11-08T02:00:00Z'))).toBe('2026-11-07')
  })
})
