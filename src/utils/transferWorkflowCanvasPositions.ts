import { readWorkflowCanvasPositions } from './readWorkflowCanvasPositions'
import { writeWorkflowCanvasPositions } from './writeWorkflowCanvasPositions'
export function transferWorkflowCanvasPositions(from: string, to: string) {
  const positions = readWorkflowCanvasPositions(from)
  writeWorkflowCanvasPositions(to, positions)
  writeWorkflowCanvasPositions(from, {})
}
