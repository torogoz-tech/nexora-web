export type WorkflowGuard =
  | { kind: 'required_field'; field: string }
  | {
      kind:
        | 'assignee'
        | 'resolution'
        | 'reason'
        | 'dependencies_satisfied'
        | 'evidence_valid'
        | 'approved_document_version'
        | 'human_approval'
        | 'working_branch_reported'
    }
