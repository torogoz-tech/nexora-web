import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import TaskRelationsPanel from '../src/components/TaskRelationsPanel'
import KanbanTaskCard from '../src/components/KanbanTaskCard'
import type { TaskRelations } from '../src/types/TaskRelations'
vi.mock('../src/hooks/useAuth', () => ({ useAuth: () => ({ session: { actorId: 'dev' } }) }))
const task = { id: 'task', project_id: null, title: 'Authentication', lifecycle: 'active' as const, assignee_id: 'dev', workflow_id: 'flow', workflow_version_id: 'version', state_id: 'doing', context: '', created_by: 'creator', revision: 2 }
const child = { id: 'child', title: 'Add OTP', lifecycle: 'pending' as const, assignee_id: null, project_id: null, revision: 1, relation_id: null, relation_revision: null }
const relations: TaskRelations = { task_revision: 2, parent: null, subtasks: [child], blocked_by: [{ ...child, id: 'blocker', title: 'Approve requirements', relation_id: 'dep', relation_revision: 1 }], blocks: [], can_manage: true, can_take: false, can_complete: false, subtasks_total: 2, subtasks_completed: 1, unfinished_subtasks: 1, blocking_count: 1 }
const props = { task, relations, loading: false, error: null, busy: false, onRetry: () => {}, onChanged: () => {}, onOpen: () => {} }
describe('task relation presentation', () => {
  it('shows progress, prerequisite titles and the distinction between start and finish', () => {
    const html = renderToStaticMarkup(<MemoryRouter><TaskRelationsPanel {...props}/></MemoryRouter>)
    expect(html).toContain('Add OTP')
    expect(html).toContain('Approve requirements')
    expect(html).toContain('Bloqueada por')
    expect(html).toContain('Esta tarea bloquea a')
    expect(html).toContain('value="1" max="2"')
    expect(html).toContain('Puedes iniciar la tarea principal')
    expect(html).toContain('aria-label="Crear subtarea"')
  })
  it('keeps hidden prerequisite names private while explaining authoritative blocking', () => {
    const html = renderToStaticMarkup(<MemoryRouter><TaskRelationsPanel {...props} relations={{ ...relations, blocked_by: [], subtasks: [] }}/></MemoryRouter>)
    expect(html).not.toContain('Approve requirements')
    expect(html).not.toContain('Add OTP')
    expect(html).toContain('Hay requisitos pendientes fuera de tu alcance de lectura.')
    expect(html).toContain('Hay subtareas fuera de tu alcance de lectura.')
  })
  it('shows effective prerequisite blocking and subtask progress on kanban cards', () => {
    const html = renderToStaticMarkup(<KanbanTaskCard task={{ ...task, project_name: null, priority: 'medium', blocked: false, blocking_count: 1, subtasks_total: 3, subtasks_completed: 2 }} onReassign={() => {}}/>)
    expect(html).toContain('Bloqueada')
    expect(html).toContain('Subtareas')
    expect(html).toContain('2/3')
  })
  it('hides relation editing when authority is absent or task revisions are stale', () => {
    for (const data of [{ ...relations, can_manage: false }, { ...relations, task_revision: 1 }]) {
      const html = renderToStaticMarkup(<MemoryRouter><TaskRelationsPanel {...props} relations={data}/></MemoryRouter>)
      expect(html).not.toContain('aria-label="Crear subtarea"')
      expect(html).not.toContain('aria-label="Vincular subtarea existente"')
      expect(html).not.toContain('aria-label="Desvincular Add OTP"')
      expect(html).toContain('Add OTP')
    }
  })
})
