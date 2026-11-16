export type WorkflowStep =
  | {kind: 'require_approval'}
  | {kind: 'verify_push' | 'create_code_review' | 'generate_contributor_ratings'; repository_id?: string}
  | {kind:'publish_release'}
  | {kind:'merge_pull_request';repository_id?:string;target_branch:string;target_from_parent?:boolean}
  | {kind:'verify_pull_request_merged';repository_id?:string;target_branch?:string;target_from_parent?:boolean}
  | {kind: 'create_branch'; repository_id?: string; base_branch: string}
  | {kind: 'verify_pipeline'; repository_id?: string; workflow?: string}
  | {kind: 'verify_deployment'; repository_id?: string; environment: string;target_branch?:string;target_from_parent?:boolean}
  | {kind: 'handoff'; workflow_id: string}
  | {kind: 'create_pull_request'; repository_id?: string; source_branch: string; target_branch: string;source_from_task?:boolean;target_from_parent?:boolean}
  | {kind: 'advance_state'}
  | {kind: 'notify'; channel: 'email' | 'in_app'; audience?: 'assignee' | 'approvers'}
