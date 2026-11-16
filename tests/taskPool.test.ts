import { afterEach, describe, expect, it, vi } from 'vitest'
import { parseVisibleTaskPage } from '../src/utils/parseVisibleTaskPage'
import { parseTaskDetails } from '../src/utils/parseTaskDetails'
import { parseTaskPoolOptions } from '../src/utils/parseTaskPoolOptions'
import { activeBoardTasks } from '../src/utils/activeBoardTasks'
import { taskPoolActions } from '../src/utils/taskPoolActions'
import { mutatePoolTask } from '../src/services/mutatePoolTask'
import { createBoardTask } from '../src/services/createBoardTask'
import { transitionPoolTask } from '../src/services/transitionPoolTask'
import { matchesLiveUpdate } from '../src/utils/matchesLiveUpdate'
import { canOpenWorkspacePath } from '../src/utils/canOpenWorkspacePath'
import type { MemberRole } from '../src/types/MemberRole'
const pending = {
  id: 'task', lifecycle: 'pending' as const, project_id: null, project_name: null,
  title: 'Task', context: '', assignee_id: null, assignee_name: null,
  workflow_id: null, workflow_version_id: null, state_id: null, state_name: null,
  priority: 'medium' as const, revision: 1, blocked: false, type_code: 'task',
  type_name: 'Task', created_by: 'human', updated_at: 'today', archived: false,
}
const active = { ...pending, lifecycle: 'active' as const, assignee_id: 'dev', workflow_id: 'flow', workflow_version_id: 'version', state_id: 'doing', state_name: 'Doing' }
afterEach(() => vi.unstubAllGlobals())
describe('task pool lifecycle', () => {
  it('parses projectless unassigned pending tasks without inventing execution state', () => {
    const page = parseVisibleTaskPage({ items: [pending], total: 1, next_after: null })
    expect(page.items[0]).toMatchObject(pending)
    expect(parseTaskDetails(pending)).toMatchObject({ project_id: null, lifecycle: 'pending', workflow_id: null, state_id: null })
    expect(() => parseVisibleTaskPage({ items: [{ ...pending, state_id: 'doing' }], total: 1, next_after: null })).toThrow()
    expect(() => parseTaskDetails({ ...pending, workflow_id: 'invented' })).toThrow()
    expect(() => parseVisibleTaskPage({ items: [{ ...active, lifecycle: 'unknown' }], total: 1, next_after: null })).toThrow()
    expect(() => parseVisibleTaskPage({ items: [{ ...active, workflow_id: null }], total: 1, next_after: null })).toThrow()
  })
  it('excludes pending and completed tasks from kanban even if the server returns them', () => {
    expect(activeBoardTasks([pending, active, { ...active, lifecycle: 'completed' }])).toEqual([active])
  })
  it('allows all five human roles to see Tareas and reserve, and only developers or leads to take', () => {
    const roles: MemberRole[] = ['developer', 'technical_lead', 'pmo', 'manager', 'super_admin']
    for (const role of roles) {
      expect(canOpenWorkspacePath('/tasks', { actor_id: 'me', role, grants: [] })).toBe(true)
      expect(taskPoolActions(pending, 'me', role)).toMatchObject({ reserve: true, take: true })
    }
    expect(taskPoolActions({ ...pending, assignee_id: 'other' }, 'me', 'developer')).toMatchObject({ reserve: false, take: false })
    expect(taskPoolActions({ ...pending, assignee_id: 'me' }, 'me', 'developer')).toMatchObject({ reserve: false, take: true })
    expect(taskPoolActions(active, 'me', 'developer')).toMatchObject({ reserve: false, take: false })
    expect(taskPoolActions(pending, undefined, null)).toMatchObject({ reserve: false, take: false })
    expect(canOpenWorkspacePath('/tasks', { actor_id: 'key', role: null, grants: [] })).toBe(false)
  })
  it('limits assignment and execution to authorized actors and scopes', () => {
    expect(taskPoolActions(pending, 'stranger', 'developer')).toMatchObject({ assign: false })
    expect(taskPoolActions(pending, 'human', 'developer')).toMatchObject({ assign: true })
    expect(taskPoolActions(pending, 'coordinator', 'pmo')).toMatchObject({ assign: true })
    expect(taskPoolActions(active, 'dev', 'developer')).toMatchObject({ transition: true })
    expect(taskPoolActions(active, 'stranger', 'technical_lead')).toMatchObject({ transition: false })
    const scoped = { ...pending, project_id: 'private' }
    expect(taskPoolActions(scoped, 'dev', 'developer')).toMatchObject({ reserve: false, take: false, assign: false })
    expect(taskPoolActions(scoped, 'dev', 'developer', [{ capability: 'tasks:write', project_id: 'other' }])).toMatchObject({ reserve: false, assign: false })
    expect(taskPoolActions(scoped, 'dev', 'developer', [{ capability: 'tasks:write', project_id: 'private' }, { capability: 'tasks:transition', project_id: 'private' }])).toMatchObject({ reserve: true, take: true, assign: true })
  })
  it('creates pending without a project, owner or workflow and preserves idempotency', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(pending), { status: 201 }))
    vi.stubGlobal('fetch', fetch)
    await createBoardTask({ title: 'Task', context: '', typeCode: 'task', priority: 'medium' }, 'create', new AbortController().signal)
    const [path, init] = fetch.mock.calls[0]
    expect(path).toBe('/api/v1/tasks')
    expect(JSON.parse(init.body)).toEqual({ project_id: null, assignee_id: null, title: 'Task', context: '', type_code: 'task', priority: 'medium', origin: 'web', fields: {} })
    expect(new Headers(init.headers).get('Idempotency-Key')).toBe('create')
  })
  it('keeps reserve, clear assignment and atomic take requests separate', async () => {
    const fetch = vi.fn().mockImplementation(async () => new Response('{}'))
    vi.stubGlobal('fetch', fetch)
    const signal = new AbortController().signal
    await mutatePoolTask(pending, 'reserve', 'me', 'reserve', signal)
    await mutatePoolTask(pending, 'take', 'me', 'take', signal)
    await mutatePoolTask(active, 'assign', null, 'clear', signal)
    expect(fetch.mock.calls.map(([path, init]) => [path, init.method, JSON.parse(init.body)])).toEqual([
      ['/api/v1/tasks/task', 'PATCH', { expected_revision: 1, assignee_id: 'me', reason: 'Responsabilidad asumida sin iniciar ejecución.' }],
      ['/api/v1/tasks/task/take', 'POST', { expected_revision: 1 }],
      ['/api/v1/tasks/task', 'PATCH', { expected_revision: 1, clear_assignee: true, reason: 'Responsable de la tarea retirado.' }],
    ])
  })
  it('preserves explicit assignment reasons and supplies factual defaults when omitted', async () => {
    const fetch = vi.fn().mockImplementation(async () => new Response('{}'))
    vi.stubGlobal('fetch', fetch)
    const signal = new AbortController().signal
    await mutatePoolTask(active, 'assign', 'other', 'default', signal)
    await mutatePoolTask(active, 'assign', 'other', 'custom', signal, ' Transferencia acordada ')
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ expected_revision: 1, assignee_id: 'other', reason: 'Responsable de la tarea actualizado.' })
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ expected_revision: 1, assignee_id: 'other', reason: 'Transferencia acordada' })
  })
  it('uses the chosen published transition and never supplies a fabricated approval', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{}'))
    vi.stubGlobal('fetch', fetch)
    await transitionPoolTask(parseTaskDetails(active), 'finish', ' Reviewed ', ' Done ', 'transition', new AbortController().signal)
    const [path, init] = fetch.mock.calls[0]
    expect(path).toBe('/api/v1/tasks/task/transitions/finish')
    expect(JSON.parse(init.body)).toEqual({ expected_revision: 1, reason: 'Reviewed', resolution: 'Done' })
  })
  it('rejects stale writes with a visible refresh message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 409 })))
    await expect(mutatePoolTask(pending, 'take', 'me', 'key', new AbortController().signal)).rejects.toThrow('Actualiza')
  })
  it('refreshes root pool and cross-project boards when task state changes', () => {
    for (const path of ['/api/v1/tasks?limit=50', '/api/v1/tasks/task', '/api/v1/me/tasks?workflow_id=flow', '/api/v1/me/workflow-tasks?lifecycle=active']) expect(matchesLiveUpdate(path, { projectId: null, topics: ['tasks'] })).toBe(true)
    expect(matchesLiveUpdate('/api/v1/settings/general', { projectId: null, topics: ['tasks'] })).toBe(false)
  })
  it('reads the authenticated minimal options without requiring published workflows', () => {
    expect(parseTaskPoolOptions({ types: [{ code: 'task', name: 'Task' }], assignees: [{ actor_id: 'pmo', name: 'PMO' }] }).assignees[0].actor_id).toBe('pmo')
    expect(() => parseTaskPoolOptions({ types: [], assignees: [{ actor_id: 1, name: 'Invalid' }] })).toThrow()
  })
})
