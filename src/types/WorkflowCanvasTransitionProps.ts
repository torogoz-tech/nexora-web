import type { CanvasPoint } from './CanvasPoint'
import type { WorkflowTransition } from './WorkflowTransition'
export type WorkflowCanvasTransitionProps = {
  transition: WorkflowTransition
  position: CanvasPoint
  selected: boolean
  onSelect?: (id: string) => void
  onEdit?: (id: string) => void
}
