import type { WorkflowCanvasPositions } from '../types/WorkflowCanvasPositions'
import type { WorkflowGraph } from '../types/WorkflowGraph'
export function getWorkflowLayout(
  graph: WorkflowGraph,
  positions: WorkflowCanvasPositions = {},
) {
  const levels = new Map<string, number>()
  const start = graph.states.find((state) => state.initial) ?? graph.states[0]
  if (start) {
    levels.set(start.id, 0)
    const queue = [start.id]
    for (let i = 0; i < queue.length; i++) {
      const from = queue[i]!
      for (const edge of graph.transitions.filter(
        (edge) => edge.from === from,
      )) {
        if (
          !levels.has(edge.to) &&
          graph.states.some((state) => state.id === edge.to)
        ) {
          levels.set(edge.to, levels.get(from)! + 1)
          queue.push(edge.to)
        }
      }
    }
  }
  const missing = Math.max(0, ...levels.values()) + 1
  const rows = new Map<number, number>()
  const nodes = graph.states.map((state) => {
    const level = levels.get(state.id) ?? missing
    const row = rows.get(level) ?? 0
    rows.set(level, row + 1)
    return {
      state,
      ...((Object.hasOwn(positions, state.id)
        ? positions[state.id]
        : undefined) ?? { x: 32 + level * 344, y: 64 + row * 124 }),
    }
  })
  return {
    nodes,
    width: Math.max(480, ...nodes.map((node) => node.x + 288)),
    height: Math.max(240, ...nodes.map((node) => node.y + 168)),
  }
}
