import { useRef, useState } from 'react'
import { readWorkflowCanvasPositions } from '../utils/readWorkflowCanvasPositions'
import { writeWorkflowCanvasPositions } from '../utils/writeWorkflowCanvasPositions'
import type { CanvasPoint } from '../types/CanvasPoint'
import type { WorkflowCanvasNodeLayout } from '../types/WorkflowCanvasNodeLayout'
import type { WorkflowCanvasPositions } from '../types/WorkflowCanvasPositions'
export function useWorkflowCanvasLayout(key?: string) {
  const [positions, setPositions] = useState(() =>
    readWorkflowCanvasPositions(key),
  )
  const current = useRef(positions)
  function move(
    id: string,
    point: CanvasPoint,
    nodes: WorkflowCanvasNodeLayout[],
  ) {
    const next: WorkflowCanvasPositions = Object.create(null)
    for (const node of nodes)
      next[node.state.id] = (Object.hasOwn(current.current, node.state.id)
        ? current.current[node.state.id]
        : undefined) ?? { x: node.x, y: node.y }
    next[id] = point
    current.current = next
    setPositions(next)
  }
  function persist() {
    writeWorkflowCanvasPositions(key, current.current)
  }
  function reset() {
    current.current = {}
    setPositions({})
    writeWorkflowCanvasPositions(key, {})
  }
  return { positions, move, persist, reset }
}
