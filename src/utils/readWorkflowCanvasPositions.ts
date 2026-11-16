import type { WorkflowCanvasPositions } from '../types/WorkflowCanvasPositions'
export function readWorkflowCanvasPositions(
  key?: string,
): WorkflowCanvasPositions {
  if (!key) return {}
  try {
    let raw = localStorage.getItem(key)
    const boundary = key.indexOf(':global:')
    if (!raw && boundary >= 0 && !key.endsWith(':new')) {
      const prefix = key.slice(0, boundary) + ':'
      const suffix = key.slice(boundary + ':global'.length)
      const previous = Object.keys(localStorage).filter(
        (candidate) =>
          candidate !== key &&
          candidate.startsWith(prefix) &&
          candidate.endsWith(suffix),
      )
      if (previous.length === 1) {
        raw = localStorage.getItem(previous[0]!)
        if (raw && raw.length <= 32768) localStorage.setItem(key, raw)
      }
    }
    if (!raw || raw.length > 32768) return {}
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
    const result: WorkflowCanvasPositions = Object.create(null)
    for (const [id, point] of Object.entries(value).slice(0, 64)) {
      if (
        !/^[A-Za-z0-9_-]{1,64}$/.test(id) ||
        !point ||
        typeof point !== 'object' ||
        !('x' in point) ||
        !('y' in point)
      )
        continue
      const { x, y } = point
      if (
        typeof x === 'number' &&
        typeof y === 'number' &&
        Number.isFinite(x) &&
        Number.isFinite(y) &&
        x >= 16 &&
        y >= 16 &&
        x <= 32000 &&
        y <= 32000
      )
        result[id] = { x, y }
    }
    return result
  } catch {
    return {}
  }
}
