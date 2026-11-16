import type { WorkflowStep } from '../types/WorkflowStep'
export const workflowStepLabels: Record<WorkflowStep['kind'], string> = {
  generate_contributor_ratings:'Valorar contribuciones del Code Review',
  publish_release:'Publicar release en producción',
  merge_pull_request:'Integrar Pull Request',
  create_branch: 'Crear rama de trabajo',
  create_code_review: 'Revisar código antes de la PR',
  verify_pipeline: 'Verificar pipeline',
  verify_pull_request_merged: 'Esperar integración de la PR',
  verify_deployment: 'Verificar despliegue',
  handoff: 'Entregar a otro workflow',
  require_approval: 'Solicitar aprobación',
  verify_push: 'Verificar commit publicado',
  create_pull_request: 'Crear Pull Request',
  advance_state: 'Cambiar estado automáticamente',
  notify: 'Enviar notificación',
}
