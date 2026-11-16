import type { CanvasPoint } from '../types/CanvasPoint'
import { getWorkflowArrowGeometry } from './getWorkflowArrowGeometry'
export function getWorkflowArrowPath(
  from: CanvasPoint,
  to: CanvasPoint,
  self = false,
  index = 0,
): string {
  return getWorkflowArrowGeometry(from, to, self, index).path
}
