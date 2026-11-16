import type { RefObject } from 'react'
import type { CanvasPoint } from './CanvasPoint'
import type { WorkflowCanvasNodeLayout } from './WorkflowCanvasNodeLayout'
export type WorkflowCanvasInteractionOptions = {
  nodes: WorkflowCanvasNodeLayout[]
  zoom: number
  world: RefObject<HTMLDivElement | null>
  readOnly: boolean
  onSelect: (id: string) => void
  onConnect?: (from: string, to: string) => void
  move: (id: string, point: CanvasPoint) => void
  persist: () => void
}
