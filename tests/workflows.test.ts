import { afterEach, expect, it, vi } from 'vitest'
import { createWorkflowInput } from '../src/utils/createWorkflowInput'
import { validateWorkflowInput } from '../src/utils/validateWorkflowInput'
import { parseWorkflowGraph } from '../src/utils/parseWorkflowGraph'
import { getWorkflowLayout } from '../src/utils/getWorkflowLayout'
import { getReturnPath } from '../src/utils/getReturnPath'
import { mutateWorkflow } from '../src/services/mutateWorkflow'
import { sessionStore } from '../src/app/sessionStore'
const valid = () => ({
  ...createWorkflowInput(),
  name: 'Entrega',
  purpose: 'Organizar el trabajo',
})
afterEach(() => {
  sessionStore.current = null
  vi.unstubAllGlobals()
})
it('starts with a valid reachable graph and keeps a single initial state', () => {
  const input = valid()
  expect(validateWorkflowInput(input)).toEqual([])
  input.graph.states[1]!.initial = true
  expect(validateWorkflowInput(input).join()).toContain(
    'exactamente un estado inicial',
  )
})
it('rejects orphan states and dangling transition references', () => {
  const input = valid()
  input.graph.states.push({ id: 'orphan', name: 'Aislado' })
  expect(validateWorkflowInput(input).join()).toContain('alcanzables')
  input.graph.transitions[0]!.to = 'missing'
  expect(validateWorkflowInput(input).join()).toContain(
    'estados de las transiciones',
  )
})
it('enforces task-only branch preparation guards and rejects duplicate guards', () => {
  const input = valid()
  input.graph.transitions[0]!.guards = [{ kind: 'working_branch_reported' }]
  expect(validateWorkflowInput(input)).toEqual([])
  input.resource_kinds.push('document')
  expect(validateWorkflowInput(input).join()).toContain('exclusivos de tareas')
  input.graph.transitions[0]!.guards = [
    { kind: 'assignee' },
    { kind: 'assignee' },
  ]
  expect(validateWorkflowInput(input).join()).toContain('repetidas')
})
it('enforces API byte limits and field identifier rules', () => {
  const input = valid()
  input.name = 'é'.repeat(81)
  expect(validateWorkflowInput(input).join()).toContain('160 bytes')
  input.name = 'Entrega'
  input.purpose = 'Primera línea\n\tSegunda línea'
  expect(validateWorkflowInput(input)).toEqual([])
  input.graph.transitions[0]!.guards = [
    { kind: 'required_field', field: 'invalid-field' },
  ]
  expect(validateWorkflowInput(input).join()).toContain('condiciones')
})
it('preserves state colors and publication flags without adding optional legacy properties', () => {
  const graph = valid().graph
  graph.states[1]!.color = '#AA0011'
  graph.states[1]!.publishable = true
  expect(parseWorkflowGraph(graph)).toEqual(graph)
  expect(
    parseWorkflowGraph(createWorkflowInput().graph).states[0],
  ).not.toHaveProperty('color')
  expect(() =>
    parseWorkflowGraph({
      ...graph,
      transitions: [
        { ...graph.transitions[0], guards: [{ kind: 'future_policy' }] },
      ],
    }),
  ).toThrow('condición desconocida')
  expect(() =>
    parseWorkflowGraph({
      ...graph,
      transitions: [
        {
          ...graph.transitions[0],
          guards: [{ kind: 'human_approval', policy: 'future' }],
        },
      ],
    }),
  ).toThrow('propiedades desconocidas')
})
it('lays out cycles and disconnected drafts without looping', () => {
  const graph = valid().graph
  graph.transitions.push({
    id: 'back',
    name: 'Reabrir',
    from: 'done',
    to: 'pending',
    guards: [],
  })
  graph.states.push({ id: 'extra', name: 'Nuevo' })
  const layout = getWorkflowLayout(graph)
  expect(layout.nodes).toHaveLength(3)
  expect(new Set(layout.nodes.map((node) => `${node.x},${node.y}`)).size).toBe(
    3,
  )
})
it('keeps deep workflow routes after authentication', () => {
  expect(getReturnPath('/settings/workflows/new?project=p')).toBe(
    '/settings/workflows/new?project=p',
  )
  expect(getReturnPath('/settings/workflows/wfl_one?project=p')).toBe(
    '/settings/workflows/wfl_one?project=p',
  )
  expect(getReturnPath('/settings/workflows/wfl_one/versions?project=p')).toBe(
    '/settings/workflows/wfl_one/versions?project=p',
  )
  expect(getReturnPath('/settings/workflows/wfl_one/versions/invalid')).toBe(
    '/profile',
  )
})
it('sends exact revision and idempotency keys, keeping graph metadata', async () => {
  const input = valid()
  input.graph.states[0]!.color = '#112233'
  const body = { ...input, expected_revision: 4, reason: 'Ajustar proceso' }
  const fetch = vi.fn().mockResolvedValue(new Response('{}'))
  vi.stubGlobal('fetch', fetch)
  await mutateWorkflow(
    '/api/v1/projects/p/workflows/w',
    'PATCH',
    body,
    'stable-workflow',
    new AbortController().signal,
  )
  const [path, init] = fetch.mock.calls[0]!
  expect(path).toContain('/workflows/w')
  expect(init.method).toBe('PATCH')
  expect(new Headers(init.headers).get('Idempotency-Key')).toBe(
    'stable-workflow',
  )
  expect(JSON.parse(init.body)).toEqual(body)
})
it('reports concurrent changes without exposing the backend response', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response('private error', { status: 409 })),
  )
  await expect(
    mutateWorkflow(
      '/api/v1/projects/p/workflows/w',
      'PATCH',
      {},
      'k',
      new AbortController().signal,
    ),
  ).rejects.toThrow('otra sesión')
})

it('allows an empty optional purpose while keeping its size and content limits', () => {
  const input = valid()
  input.purpose = ''
  expect(validateWorkflowInput(input)).toEqual([])
  input.purpose = '   '
  expect(validateWorkflowInput(input)).toEqual([])
  input.purpose = 'a'.repeat(4001)
  expect(validateWorkflowInput(input).join()).toContain('4000 bytes')
  input.purpose = 'Invalid\u0000text'
  expect(validateWorkflowInput(input).join()).toContain('caracteres de control')
})
