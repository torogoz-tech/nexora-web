import type { PointerEvent } from 'react'
import type { WorkflowCanvasNodeLayout } from './WorkflowCanvasNodeLayout'
import type { WorkflowPointerPhase } from './WorkflowPointerPhase'
export type WorkflowCanvasNodeProps = {
  node: WorkflowCanvasNodeLayout
  selected: boolean
  readOnly: boolean
  connectable: boolean
  moving: boolean
  target: boolean
  onSelect: (id: string) => void
  onDrag: (
    id: string,
    phase: WorkflowPointerPhase,
    event: PointerEvent<HTMLButtonElement>,
  ) => void
  onWire: (
    id: string,
    phase: WorkflowPointerPhase,
    event: PointerEvent<HTMLButtonElement>,
  ) => void
  onConnector: (id: string, side: 'input' | 'output') => void
  onNudge: (id: string, dx: number, dy: number) => void
  onEdit?: (id: string) => void
}
