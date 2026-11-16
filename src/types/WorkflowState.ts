export type WorkflowState = {
  id: string
  name: string
  color?: string
  initial?: boolean
  terminal?: boolean
  required_base_branch?: string
  progress_order?: number
  prevent_backtracking?: boolean
  publishable?: boolean
}
