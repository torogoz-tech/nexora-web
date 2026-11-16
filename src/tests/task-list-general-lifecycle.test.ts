import { describe, expect, it } from 'vitest'
import { parseVisibleTaskPage } from '../utils/parseVisibleTaskPage'
import { parseTaskDetails } from '../utils/parseTaskDetails'

const general = {
  id: 'general-task', title: 'General work', context: '', created_by: 'member',
  project_id: 'project', project_name: 'Project', workflow_id: null,
  workflow_version_id: null, state_id: null, state_name: null,
  assignee_id: 'member', assignee_name: 'Member', priority: 'medium',
  revision: 3, blocked: false, archived: false, type_code: 'task',
  type_name: 'Task', updated_at: '2026-11-12T15:42:20Z',
}

describe('general task list lifecycle', () => {
  for (const lifecycle of ['active', 'paused', 'completed']) {
    it(`keeps ${lifecycle} general work in a mixed list from the deployed API`, () => {
      const page = parseVisibleTaskPage({ items: [
        { ...general, id: 'pending-task', lifecycle: 'pending' },
        { ...general, lifecycle },
        { ...general, id: 'workflow-task', lifecycle: 'active', purpose: 'implementation', workflow_id: 'workflow', workflow_version_id: 'version', state_id: 'testing', state_name: 'Testing' },
      ], total: 3, next_after: null })
      expect(page.items).toHaveLength(3)
      expect(page.items[1].purpose).toBe('general')
      expect(parseTaskDetails({ ...general, lifecycle }).state_id).toBeNull()
    })
  }
  it('still rejects workflow work without its pinned version and state', () => {
    expect(() => parseVisibleTaskPage({ items: [{ ...general, lifecycle: 'paused', purpose: 'implementation' }], total: 1, next_after: null })).toThrow()
  })
})
