import { afterEach, describe, expect, it, vi } from 'vitest'
import { parseTaskRelations } from '../src/utils/parseTaskRelations'
import { taskRelationRestrictions } from '../src/utils/taskRelationRestrictions'
import { mutateTaskRelation } from '../src/services/mutateTaskRelation'
import { parseDeveloperBoardPage } from '../src/utils/parseDeveloperBoardPage'
import { createSubtask } from '../src/services/createSubtask'
const task = { id: 'parent', title: 'Sign in', lifecycle: 'active' as const, project_id: null, assignee_id: 'dev', revision: 3, relation_id: null, relation_revision: null }
const child = { ...task, id: 'child', title: 'OTP', lifecycle: 'pending' as const, assignee_id: null, revision: 1 }
const relations = { task_revision: 3, parent: null, subtasks: [child], blocked_by: [], blocks: [], can_manage: true, can_take: true, can_complete: false, subtasks_total: 1, subtasks_completed: 0, unfinished_subtasks: 1, blocking_count: 0 }
afterEach(() => vi.unstubAllGlobals())
describe('task relations', () => {
  it('parses optional scope and completed children without inventing identifiers', () => {
    expect(parseTaskRelations(relations)).toEqual(relations)
    expect(parseTaskRelations({ ...relations, subtasks: [], unfinished_subtasks: 1 })).toMatchObject({ unfinished_subtasks: 1 })
    expect(() => parseTaskRelations({ ...relations, subtasks: [{ ...child, project_id: 4 }] })).toThrow()
    expect(() => parseTaskRelations({ ...relations, blocking_count: -1 })).toThrow()
    expect(() => parseTaskRelations({ ...relations, can_take: 'true' })).toThrow()
    expect(() => parseTaskRelations({ ...relations, subtasks_completed: 2 })).toThrow()
  })
  it('fails closed until authoritative relations load and uses hidden prerequisite counts', () => {
    expect(taskRelationRestrictions(null, 3)).toMatchObject({ take: true, complete: true })
    expect(taskRelationRestrictions(parseTaskRelations(relations), 3)).toMatchObject({ take: false, complete: true })
    expect(taskRelationRestrictions(parseTaskRelations({ ...relations, blocked_by: [], blocking_count: 1, can_take: false }), 3)).toMatchObject({ take: true })
    expect(taskRelationRestrictions(parseTaskRelations({ ...relations, unfinished_subtasks: 0, subtasks_completed: 1, can_complete: true }), 3)).toMatchObject({ complete: false })
    expect(taskRelationRestrictions(parseTaskRelations(relations), 4)).toMatchObject({ take: true, complete: true, stale: true })
  })
  it('links and detaches with exact endpoint revisions and idempotency', async () => {
    const fetch = vi.fn().mockImplementation(async () => new Response('{}'))
    vi.stubGlobal('fetch', fetch)
    const signal = new AbortController().signal
    await mutateTaskRelation('parent', 3, child, 'subtask', 'link', signal)
    await mutateTaskRelation('parent', 4, child, 'detach', 'detach', signal)
    expect(fetch.mock.calls.map(([path, init]) => [path, JSON.parse(init.body)])).toEqual([
      ['/api/v1/tasks/parent/subtasks/child', { expected_revision: 3, child_revision: 1, reason: 'Subtarea vinculada desde la web.' }],
      ['/api/v1/tasks/parent/subtasks/child/remove', { expected_revision: 4, child_revision: 1, reason: 'Relación de subtarea retirada desde la web.' }],
    ])
    expect(new Headers(fetch.mock.calls[0][1].headers).get('Idempotency-Key')).toBe('link')
  })
  it('uses route task as dependency source and never marks unfinished prerequisites resolved', async () => {
    const fetch = vi.fn().mockImplementation(async () => new Response('{}'))
    vi.stubGlobal('fetch', fetch)
    await mutateTaskRelation('parent', 3, child, 'prerequisite', 'dependency', new AbortController().signal)
    expect(fetch.mock.calls[0][0]).toBe('/api/v1/tasks/parent/dependencies')
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ source_task_id: 'parent', target_task_id: 'child', kind: 'depends_on', source_revision: 3, target_revision: 1, reason: 'Requisito previo vinculado desde la web.' })
  })
  it('creates child pending in inherited scope with an independent optional responsible member', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ...child, workflow_id: null, workflow_version_id: null, state_id: null, type_code: 'task' }), { status: 201 }))
    vi.stubGlobal('fetch', fetch)
    await createSubtask({ id: 'parent', revision: 3, project_id: null }, { title: 'OTP', context: '', typeCode: 'task', priority: 'medium', assigneeId: null }, 'child', new AbortController().signal)
    const [path, init] = fetch.mock.calls[0]
    expect(path).toBe('/api/v1/tasks/parent/subtasks')
    expect(JSON.parse(init.body)).toEqual({ expected_revision: 3, definition: { title: 'OTP', context: '', type_code: 'task', priority: 'medium', assignee_id: null, origin: 'web', fields: {} } })
  })
  it('preserves safe aggregate indicators on pool and board tasks', () => {
    const item = { id: 'task', title: 'Task', lifecycle: 'pending', project_id: null, project_name: null, workflow_version_id: null, state_id: null, assignee_id: null, priority: 'medium', revision: 1, blocked: false, blocking_count: 2, subtasks_total: 3, subtasks_completed: 1 }
    expect(parseDeveloperBoardPage({ items: [item], next_after: null }).items[0]).toMatchObject({ blocking_count: 2, subtasks_total: 3, subtasks_completed: 1 })
    expect(() => parseDeveloperBoardPage({ items: [{ ...item, blocking_count: -1 }], next_after: null })).toThrow()
    expect(() => parseDeveloperBoardPage({ items: [{ ...item, subtasks_completed: 4 }], next_after: null })).toThrow()
  })
  it('reports stale, foreign and cyclic relationships visibly', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 409 })))
    await expect(mutateTaskRelation('parent', 3, child, 'subtask', 'key', new AbortController().signal)).rejects.toThrow('Actualiza')
  })
})
