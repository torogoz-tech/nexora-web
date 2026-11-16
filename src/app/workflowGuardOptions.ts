export const workflowGuardOptions = [
  { value: 'assignee', label: 'Persona asignada' },
  { value: 'resolution', label: 'Resolución' },
  { value: 'reason', label: 'Motivo de la transición' },
  { value: 'dependencies_satisfied', label: 'Dependencias satisfechas' },
  { value: 'evidence_valid', label: 'Evidencia válida' },
  {
    value: 'approved_document_version',
    label: 'Versión de documento aprobada',
  },
  { value: 'human_approval', label: 'Aprobación humana' },
  { value: 'working_branch_reported', label: 'Rama de trabajo reportada' },
] as const
