import type { CanvasPoint } from './CanvasPoint'
export type WorkflowCurveSegment = {
  from: CanvasPoint
  to: CanvasPoint
  control1?: CanvasPoint
  control2?: CanvasPoint
}
