import { ClipboardList } from 'lucide-react'
import { getTaskTypeIcon } from '../utils/getTaskTypeIcon'
import { describe, expect, it } from 'vitest'
import { parseVisibleTaskTypePage } from '../utils/parseVisibleTaskTypePage'
import { parseVisibleTaskPage } from '../utils/parseVisibleTaskPage'
describe('typed task navigation contracts', () => {
  it('uses a safe fallback for arbitrary configured type codes', () => {
    expect(getTaskTypeIcon('constructor')).toBe(ClipboardList)
  })
  it('preserves server counts including zero-count configured types', () => {
    const result = parseVisibleTaskTypePage({
      total: 3,
      next_after: null,
      items: [
        { code: 'task', name: 'Tareas', color: null, total: 3 },
        { code: 'bug', name: 'Errores', color: '#ff0000', total: 0 },
      ],
    })
    expect(result.total).toBe(3)
    expect(result.items[1].total).toBe(0)
    expect(() =>
      parseVisibleTaskTypePage({
        total: 3,
        next_after: null,
        items: [{ code: 'task', name: 'Tareas', color: null, total: '3' }],
      }),
    ).toThrow()
  })
  it('supports unassigned tasks without inventing an actor and keeps the pagination total', () => {
    const task = {
      id: 't1',
      project_id: 'p1',
      project_name: 'Proyecto',
      title: 'Pendiente de asignación',
      assignee_id: null,
      workflow_version_id: 'v1',
      state_id: 'ready',
      priority: 'medium',
      revision: 1,
      blocked: false,
      type_code: 'task',
      type_name: 'Tareas',
      state_name: 'Pendiente',
      workflow_id: 'w1',
      created_by: 'a1',
      updated_at: '2026-11-06T12:00:00Z',
      assignee_name: null,
      archived: false,
    }
    const result = parseVisibleTaskPage({
      items: [task],
      next_after: 't1',
      total: 120,
    })
    expect(result.items[0].assignee_id).toBeNull()
    expect(result.total).toBe(120)
    expect(result.next_after).toBe('t1')
    expect(() =>
      parseVisibleTaskPage({
        items: [{ ...task, assignee_name: { name: 'invalid' } }],
        next_after: null,
        total: 1,
      }),
    ).toThrow()
  })
})
