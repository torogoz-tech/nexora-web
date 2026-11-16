import { afterEach, describe, expect, it, vi } from 'vitest'
import { createBoardTask } from '../src/services/createBoardTask'
import { prepareBoardTaskInput } from '../src/utils/prepareBoardTaskInput'
import { parseTaskParticipants } from '../src/utils/parseTaskParticipants'
import { sessionStore } from '../src/app/sessionStore'
describe('task creation from a workflow board', () => {
  const input = {
    projectId: 'p1',
    workflowId: 'w1',
    title: ' Crear ingreso ',
    context: ' Contexto ',
    typeCode: 'task',
    priority: 'medium' as const,
    assigneeId: 'actor1',
    workflowVersionId: 'v1',
  }
  const result = {
    id: 't1',
    project_id: 'p1',
    lifecycle: 'pending',
    workflow_id: null,
    workflow_version_id: null,
    state_id: null,
    assignee_id: 'actor1',
    type_code: 'task',
    title: 'Crear ingreso',
  }
  afterEach(() => {
    sessionStore.current = null
    vi.unstubAllGlobals()
  })
  it('normalizes text and enforces the API byte limits', () => {
    expect(prepareBoardTaskInput(input).title).toBe('Crear ingreso')
    expect(() =>
      prepareBoardTaskInput({ ...input, title: 'é'.repeat(129) }),
    ).toThrow()
    expect(() =>
      prepareBoardTaskInput({ ...input, context: 'é'.repeat(4001) }),
    ).toThrow()
    expect(prepareBoardTaskInput({ ...input, projectId: '', assigneeId: '' })).toMatchObject({ projectId: null, assigneeId: null })
  })
  it('creates pending with optional reservation and no workflow binding', async () => {
    sessionStore.current = null
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(result), { status: 201 }))
    vi.stubGlobal('fetch', fetch)
    const created = await createBoardTask(
      input,
      'stable-task-key',
      new AbortController().signal,
    )
    expect(created.id).toBe('t1')
    const [path, options] = fetch.mock.calls[0]
    expect(path).toBe('/api/v1/tasks')
    expect(new Headers(options.headers).get('Idempotency-Key')).toBe(
      'stable-task-key',
    )
    expect(JSON.parse(options.body)).toEqual({
      project_id: 'p1',
      title: 'Crear ingreso',
      context: 'Contexto',
      type_code: 'task',
      priority: 'medium',
      assignee_id: 'actor1',
      origin: 'web',
      fields: {},
    })
  })
  it('rejects a successful response for another workflow', async () => {
    sessionStore.current = null
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ ...result, workflow_id: 'other' }), {
            status: 201,
          }),
        ),
    )
    await expect(
      createBoardTask(input, 'stable-task-key', new AbortController().signal),
    ).rejects.toThrow('no corresponde')
  })
  it('explains assignment changes without accepting or hiding the failed creation', async () => {
    sessionStore.current = null
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { status: 422 })),
    )
    await expect(
      createBoardTask(input, 'stable-task-key', new AbortController().signal),
    ).rejects.toThrow('responsable')
  })
  it('accepts complete participant totals and rejects duplicate identities or invalid counts', () => {
    expect(
      parseTaskParticipants([{ actor_id: 'a1', name: 'Ana', total: 120 }])[0]
        .total,
    ).toBe(120)
    expect(() =>
      parseTaskParticipants([{ actor_id: 'a1', name: 'Ana', total: 0 }]),
    ).toThrow()
    expect(() =>
      parseTaskParticipants([
        { actor_id: 'a1', name: 'Ana', total: 2 },
        { actor_id: 'a1', name: 'Ana', total: 2 },
      ]),
    ).toThrow()
  })
})
