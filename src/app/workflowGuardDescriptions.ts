import type { WorkflowGuard } from '../types/WorkflowGuard'
export const workflowGuardDescriptions: Record<WorkflowGuard['kind'], string> = {
  assignee: 'La tarea debe tener una persona responsable antes de avanzar.',
  resolution: 'Se debe indicar una resolución al solicitar el cambio de estado.',
  reason: 'Se debe indicar el motivo al solicitar el cambio de estado.',
  dependencies_satisfied: 'Las tareas bloqueantes y las subtareas deben cumplir los requisitos del estado de destino.',
  evidence_valid: 'La solicitud debe incluir evidencia válida y accesible.',
  approved_document_version: 'La versión del documento vinculada debe estar aprobada.',
  human_approval: 'Requiere una aprobación humana válida. Para solicitarla durante la ejecución, usa el paso Solicitar aprobación.',
  working_branch_reported: 'La tarea debe tener una rama de trabajo reportada en su preparación.',
  required_field: 'El campo indicado debe tener un valor al solicitar el cambio de estado.',
}
