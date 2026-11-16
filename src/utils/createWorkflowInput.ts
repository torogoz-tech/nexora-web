import type { WorkflowInput } from '../types/WorkflowInput'
export function createWorkflowInput(): WorkflowInput {
  return {
    name: '',
    icon: 'workflow',
    color: '',
    purpose: '',
    resource_kinds: ['task'],
    graph: {
      states: [
        { id: 'pending', name: 'Pendiente', initial: true },
        { id: 'done', name: 'Finalizado', terminal: true },
      ],
      transitions: [
        {
          id: 'finish',
          name: '',
          from: 'pending',
          to: 'done',
          guards: [],
        },
      ],
    },
  }
}
