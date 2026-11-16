import type { WorkflowState } from './WorkflowState'
import type { CanvasPoint } from './CanvasPoint'
export type WorkflowCanvasNodeLayout = CanvasPoint & { state: WorkflowState }
