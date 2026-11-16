import type { CanvasPoint } from '../types/CanvasPoint'
import type { WorkflowCurveSegment } from '../types/WorkflowCurveSegment'
export function getWorkflowArrowGeometry(
  from: CanvasPoint,
  to: CanvasPoint,
  self = false,
  index = 0,
) {
  let segments: WorkflowCurveSegment[]
  if (self) {
    const top = Math.max(8, from.y - 96 - (index % 3) * 16)
    segments = [
      {
        from,
        to,
        control1: { x: from.x + 72, y: top },
        control2: { x: Math.max(8, to.x - 56), y: top },
      },
    ]
  } else if (to.x > from.x + 24) {
    const bend = Math.max(40, (to.x - from.x) / 2)
    segments = [
      {
        from,
        to,
        control1: { x: from.x + bend, y: from.y },
        control2: { x: to.x - bend, y: to.y },
      },
    ]
  } else {
    const lane = Math.max(from.y, to.y) + 88 + (index % 4) * 20,
      left = Math.max(8, to.x - 40)
    const a = { x: from.x, y: lane },
      b = { x: left, y: lane }
    segments = [
      {
        from,
        to: a,
        control1: { x: from.x + 56, y: from.y },
        control2: { x: from.x + 56, y: lane },
      },
      { from: a, to: b },
      {
        from: b,
        to,
        control1: { x: Math.max(8, left - 24), y: lane },
        control2: { x: left, y: to.y },
      },
    ]
  }
  const path =
    `M ${from.x} ${from.y} ` +
    segments
      .map((segment) =>
        segment.control1 && segment.control2
          ? `C ${segment.control1.x} ${segment.control1.y}, ${segment.control2.x} ${segment.control2.y}, ${segment.to.x} ${segment.to.y}`
          : `L ${segment.to.x} ${segment.to.y}`,
      )
      .join(' ')
  const points = [{ ...from, length: 0 }]
  let length = 0
  for (const segment of segments) {
    for (let step = 1; step <= 32; step++) {
      const t = step / 32,
        u = 1 - t
      let point: CanvasPoint
      if (segment.control1 && segment.control2) {
        point = {
          x:
            u * u * u * segment.from.x +
            3 * u * u * t * segment.control1.x +
            3 * u * t * t * segment.control2.x +
            t * t * t * segment.to.x,
          y:
            u * u * u * segment.from.y +
            3 * u * u * t * segment.control1.y +
            3 * u * t * t * segment.control2.y +
            t * t * t * segment.to.y,
        }
      } else
        point = {
          x: segment.from.x + (segment.to.x - segment.from.x) * t,
          y: segment.from.y + (segment.to.y - segment.from.y) * t,
        }
      const previous = points.at(-1)!
      length += Math.hypot(point.x - previous.x, point.y - previous.y)
      points.push({ ...point, length })
    }
  }
  const half = length / 2
  const endIndex = Math.max(
    1,
    points.findIndex((point) => point.length >= half),
  )
  const start = points[endIndex - 1]!,
    end = points[endIndex]!
  const ratio =
    end.length === start.length
      ? 0
      : (half - start.length) / (end.length - start.length)
  return {
    path,
    midpoint: {
      x: start.x + (end.x - start.x) * ratio,
      y: start.y + (end.y - start.y) * ratio,
    },
    bounds: {
      right: Math.max(...points.map((point) => point.x)),
      bottom: Math.max(...points.map((point) => point.y)),
    },
  }
}
