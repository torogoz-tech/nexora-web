// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react'
import TaskQuickAssignment from '../components/TaskQuickAssignment'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import type { EffectivePermissions } from '../types/EffectivePermissions'
import type { VisibleTask } from '../types/VisibleTask'
import { mutatePoolTask } from '../services/mutatePoolTask'
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ session: { actorId: 'me' } }),
}))
vi.mock('../services/mutatePoolTask', () => ({ mutatePoolTask: vi.fn() }))
vi.mock('../components/ReassignDeveloperTaskModal', () => ({
  default: () => <div role="dialog">Assignment</div>,
}))
vi.mock('../components/TakeTaskWorkflowModal', () => ({
  default: () => <div role="dialog">Workflow choice</div>,
}))
const task = {
  id: 'tsk_1',
  lifecycle: 'pending',
  project_id: null,
  assignee_id: null,
  revision: 4,
  archived: false,
  blocked: false,
} as VisibleTask
function show(role: string, overrides = {}) {
  return render(
    <WorkspacePermissionsContext
      value={{ role, grants: [] } as unknown as EffectivePermissions}
    >
      <TaskQuickAssignment
        task={{ ...task, ...overrides }}
        onChanged={() => {}}
      />
    </WorkspacePermissionsContext>,
  )
}
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
it('lets a developer prepare task branches without assigning others', async () => {
  show('developer')
  expect(screen.queryByRole('button', { name: 'Asignar' })).toBeNull()
  fireEvent.click(
    screen.getByRole('button', { name: 'Tomar tarea e iniciar workflow' }),
  )
  expect(screen.getByRole('dialog').textContent).toBe('Workflow choice')
  expect(mutatePoolTask).not.toHaveBeenCalled()
})
it('offers both assignment and workflow selection to a technical lead', () => {
  show('technical_lead')
  fireEvent.click(screen.getByRole('button', { name: 'Asignar' }))
  expect(screen.getByRole('dialog').textContent).toBe('Assignment')
  cleanup()
  show('technical_lead')
  fireEvent.click(
    screen.getByRole('button', { name: 'Tomar tarea e iniciar workflow' }),
  )
  expect(screen.getByRole('dialog').textContent).toBe('Workflow choice')
})
it('does not allow a blocked task to be taken', () => {
  show('developer', { blocked: true })
  expect(
    (
      screen.getByRole('button', {
        name: 'Tomar tarea e iniciar workflow',
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true)
})
