import { afterEach, expect, it, vi } from 'vitest'
import { parseWorkflowSummary } from '../src/utils/parseWorkflowSummary'
import { parseDeveloperDirectoryPage } from '../src/utils/parseDeveloperDirectoryPage'
import { parseDeveloperBoardPage } from '../src/utils/parseDeveloperBoardPage'
import { assignDeveloperWorkflow } from '../src/services/assignDeveloperWorkflow'
import { reassignDeveloperTask } from '../src/services/reassignDeveloperTask'
import { sessionStore } from '../src/app/sessionStore'
import type { DeveloperBoardTask } from '../src/types/DeveloperBoardTask'
const flow = {
  id: 'workflow',
  project_id: null,
  name: 'Delivery',
  purpose: '',
  resource_kinds: ['task'],
  archived: false,
  revision: 1,
  latest_version_id: null,
  latest_version_number: 0,
}
const task: DeveloperBoardTask = {
  id: 'task',
  title: 'Deliver',
  project_id: 'one',
  project_name: 'Project one',
  assignee_id: 'developer',
  workflow_version_id: 'old-version',
  state_id: 'ready',
  priority: 'medium',
  revision: 3,
  blocked: false,
}
afterEach(() => {
  vi.unstubAllGlobals()
  sessionStore.current = null
})
it('accepts project-independent task workflows and rejects project-owned or document policies', () => {
  expect(parseWorkflowSummary(flow).id).toBe('workflow')
  expect(() =>
    parseWorkflowSummary({ ...flow, project_id: 'project' }),
  ).toThrow()
  expect(() =>
    parseWorkflowSummary({ ...flow, resource_kinds: ['document'] }),
  ).toThrow()
})
it('distinguishes unbound developers from exactly one versioned workflow membership', () => {
  expect(
    parseDeveloperDirectoryPage({
      items: [
        {
          id: 'developer',
          name: 'Developer',
          workflow_id: null,
          workflow_version_id: null,
          assignment_revision: 0,
        },
      ],
      next_after: null,
    }).items[0]!.workflow_id,
  ).toBeNull()
  expect(() =>
    parseDeveloperDirectoryPage({
      items: [
        {
          id: 'developer',
          name: 'Developer',
          workflow_id: 'workflow',
          workflow_version_id: null,
          assignment_revision: 0,
        },
      ],
      next_after: null,
    }),
  ).toThrow()
})
it('keeps source projects on tasks sharing one developer board', () => {
  const page = parseDeveloperBoardPage({
    items: [
      task,
      { ...task, id: 'second', project_id: 'two', project_name: 'Project two' },
    ],
    next_after: null,
  })
  expect(page.items.map((item) => item.project_id)).toEqual(['one', 'two'])
})
it('binds a developer with membership concurrency and a fixed published version, without project scope', async () => {
  const fetch = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        actor_id: 'developer',
        actor_name: 'Developer',
        workflow_id: 'workflow',
        workflow_version_id: 'version',
        revision: 1,
        assigned_by: 'admin',
        updated_at: 'today',
      }),
    ),
  )
  vi.stubGlobal('fetch', fetch)
  await assignDeveloperWorkflow(
    'developer',
    'version',
    0,
    'same-key',
    new AbortController().signal,
  )
  const [path, init] = fetch.mock.calls[0]!
  expect(path).toBe('/api/v1/actors/developer/workflow')
  expect(init.method).toBe('PUT')
  expect(JSON.parse(init.body)).toEqual({
    expected_revision: 0,
    workflow_version_id: 'version',
  })
  expect(new Headers(init.headers).get('Idempotency-Key')).toBe('same-key')
})
it('reassigns without starting or selecting the next execution state', async () => {
  const fetch = vi.fn().mockResolvedValue(new Response('{}'))
  vi.stubGlobal('fetch', fetch)
  await reassignDeveloperTask(
    task,
    'other',
    'target-version',
    'review',
    'Transfer',
    'assignment-key',
    new AbortController().signal,
  )
  const [path, init] = fetch.mock.calls[0]!
  expect(path).toBe('/api/v1/tasks/task')
  expect(JSON.parse(init.body)).toEqual({
    expected_revision: 3,
    assignee_id: 'other',
    reason: 'Transfer',
  })
})
it('accepts an empty successful response when removing a membership', async () => {
  const { removeDeveloperWorkflow } =
    await import('../src/services/removeDeveloperWorkflow')
  const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
  vi.stubGlobal('fetch', fetch)
  await removeDeveloperWorkflow(
    {
      actor_id: 'developer',
      actor_name: 'Developer',
      workflow_id: 'workflow',
      workflow_version_id: 'version',
      revision: 2,
      assigned_by: 'admin',
      updated_at: 'today',
    },
    'No active tasks',
    'remove-key',
    new AbortController().signal,
  )
  const [path, init] = fetch.mock.calls[0]!
  expect(path).toBe('/api/v1/actors/developer/workflow')
  expect(init.method).toBe('DELETE')
  expect(JSON.parse(init.body)).toEqual({
    expected_revision: 2,
    reason: 'No active tasks',
  })
})
