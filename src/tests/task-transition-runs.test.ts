import { describe, expect, it } from 'vitest'
import { parseTaskTransitionRuns } from '../utils/parseTaskTransitionRuns'

describe('parseTaskTransitionRuns', () => {
  it('accepts transitions waiting for the knowledge worker', () => {
    const result = parseTaskTransitionRuns({
      items: [{
        id: 'run-1',
        task_id: 'task-1',
        transition_id: 'review',
        task_revision: 3,
        actor_id: 'actor-1',
        parameters: {},
        status: 'waiting_knowledge',
        next_step: 0,
        advanced: false,
        outcomes: [],
      }],
    })

    expect(result[0].status).toBe('waiting_knowledge')
  })
})
