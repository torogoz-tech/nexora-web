import type { CanvasPoint } from '../types/CanvasPoint'
export function getWorkflowDragPosition(
  start: CanvasPoint,
  delta: CanvasPoint,
  zoom: number,
): CanvasPoint {
  const scale = Number.isFinite(zoom) && zoom > 0 ? zoom : 1
  return {
    x: Math.max(16, Math.min(32000, Math.round(start.x + delta.x / scale))),
    y: Math.max(16, Math.min(32000, Math.round(start.y + delta.y / scale))),
  }
}
