import type { WorkflowIcon } from './WorkflowIcon'
export type ServiceRequest = {
  criticality?: 'low' | 'medium' | 'high' | 'critical';
  first_attention_at?: string | null; resolved_at?: string | null;
  sla?: { clock: 'business' | 'continuous'; response_due_at: string; resolution_due_at: string; response_status: 'running' | 'met' | 'breached'; resolution_status: 'running' | 'met' | 'breached' } | null;
  id: string; number: number; title: string; body: string; status: 'new' | 'in_progress' | 'completed';
  product_id?:string|null;product_name?:string|null;
  type_icon?: WorkflowIcon; type_color?: string;
  type_id: string; type_name?: string; requester_name?: string; revision: number; created_at: string; can_manage?: boolean;
  comments?: { id: string; body: string; author_name: string; created_at: string }[];
  attachments?: { id: string; name: string; media_type: string; size: number }[];
  history?: { action: string; author_name: string; created_at: string; detail: { status?: string; type_id?: string } }[];
  links?: { kind: 'task' | 'feature'; target_id: string; project_id: string | null }[];
}
