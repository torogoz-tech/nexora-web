import { describe, expect, it, vi } from 'vitest'
import { pendingLaborApprovals } from '../src/utils/pendingLaborApprovals'
import { parseLaborCalendar } from '../src/utils/parseLaborCalendar'
import { getProjectApprovals } from '../src/services/getProjectApprovals'
import { matchesLiveUpdate } from '../src/utils/matchesLiveUpdate'
import * as projects from '../src/services/getProjects'
import * as read from '../src/services/readApiJson'
const signal = () => new AbortController().signal
const access = { actor_id: 'self', role: 'manager' as const, grants: [{ capability: 'approvals:grant', project_id: null }] }
const request = { id: 'a', resource_id: 'task', requested_by: 'other', target_kind: 'task', created_at: '2026-11-10T12:00:00Z', revision: 1, status: 'pending' }
describe('approval inbox', () => {
 it('keeps only pending labor requests and preserves server decision permissions', () => {
  const data = parseLaborCalendar({ settings: { timezone: 'UTC', country: 'SV', workdays: [1], daily_minutes: 480, work_start: '08:00', work_end: '17:00', break_minutes: 60, starts_on: '2026-01-01', revision: 1 }, requests: ['pending', 'approved', 'rejected'].map(status => ({ id: status, actor_id: 'self', actor_name: 'Member', kind: 'vacation', start_date: '2026-11-10', end_date: '2026-11-11', status, minutes_per_day: null, reason: '', can_decide: false })), holidays: [], members: [], approvers: [], can_manage: false })
  const items = pendingLaborApprovals(data, null)
  expect(items).toHaveLength(1)
  expect(items[0]).toMatchObject({ kind: 'vacation', reason: '', canDecide: false })
 })
 it('loads every project and approval page, respects scoped grants and prevents self approval', async () => {
  const list = vi.spyOn(projects, 'getProjects').mockResolvedValueOnce({ items: [{ id: 'p1', name: 'First', description: null, revision: 1, archived: false }], next_cursor: 'p1' }).mockResolvedValueOnce({ items: [{ id: 'p2', name: 'Second', description: null, revision: 1, archived: false }], next_cursor: null })
  const api = vi.spyOn(read, 'readApiJson').mockResolvedValueOnce({ items: [request], next_after: 'a' }).mockResolvedValueOnce({ items: [{ ...request, id: 'b', requested_by: 'self' }], next_after: null })
  try {
   const result = await getProjectApprovals(signal(), { ...access, grants: [{ capability: 'approvals:grant', project_id: 'p1' }] })
   expect(list).toHaveBeenCalledTimes(2)
   expect(api).toHaveBeenCalledTimes(2)
   expect(api.mock.calls[1]?.[0]).toContain('after=a')
   expect(result.map(item => item.canDecide)).toEqual([true, false])
   expect(result.map(item => item.title)).toEqual(['First', 'First'])
  } finally { vi.restoreAllMocks() }
 })
 it('does not query projects without approval authority', async () => {
  const list = vi.spyOn(projects, 'getProjects')
  try { expect(await getProjectApprovals(signal(), { ...access, grants: [] })).toEqual([]); expect(list).not.toHaveBeenCalled() } finally { vi.restoreAllMocks() }
 })
 it('rejects malformed approval responses', async () => {
  vi.spyOn(projects, 'getProjects').mockResolvedValue({ items: [{ id: 'p1', name: 'First', description: null, revision: 1, archived: false }], next_cursor: null })
  vi.spyOn(read, 'readApiJson').mockResolvedValue({ items: [{ ...request, revision: '1' }], next_after: null })
  try { await expect(getProjectApprovals(signal(), access)).rejects.toThrow('no válida') } finally { vi.restoreAllMocks() }
 })
 it('refreshes approvals after a server approval event', () => {
  expect(matchesLiveUpdate('/api/v1/approval-inbox', { projectId: 'p1', topics: ['approvals'] })).toBe(true)
 })
})
