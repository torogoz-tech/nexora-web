import type { WorkflowCanvasPositions } from '../types/WorkflowCanvasPositions'
export function writeWorkflowCanvasPositions(
  key: string | undefined,
  positions: WorkflowCanvasPositions,
) {
  if (!key) return
  try {
    if (Object.keys(positions).length)
      localStorage.setItem(key, JSON.stringify(positions))
    else localStorage.removeItem(key)
  } catch {
    /* Canvas preferences may be unavailable; graph editing still works. */
  }
}
