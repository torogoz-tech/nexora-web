import { afterEach, expect, it, vi } from 'vitest'
import { getWorkflowDragPosition } from '../src/utils/getWorkflowDragPosition'
import { getWorkflowLayout } from '../src/utils/getWorkflowLayout'
import { getWorkflowArrowPath } from '../src/utils/getWorkflowArrowPath'
import { getWorkflowCanvasKey } from '../src/utils/getWorkflowCanvasKey'
import { readWorkflowCanvasPositions } from '../src/utils/readWorkflowCanvasPositions'
import { writeWorkflowCanvasPositions } from '../src/utils/writeWorkflowCanvasPositions'
import { transferWorkflowCanvasPositions } from '../src/utils/transferWorkflowCanvasPositions'
import { createWorkflowInput } from '../src/utils/createWorkflowInput'
afterEach(() => vi.unstubAllGlobals())
it('converts screen movement into canvas coordinates at different zooms', () => {
  expect(
    getWorkflowDragPosition({ x: 100, y: 100 }, { x: 40, y: 20 }, 0.5),
  ).toEqual({ x: 180, y: 140 })
  expect(
    getWorkflowDragPosition({ x: 100, y: 100 }, { x: -1000, y: -1000 }, 1),
  ).toEqual({ x: 16, y: 16 })
})
it('preserves moved state positions while editing graph labels and transitions', () => {
  const input = createWorkflowInput()
  const positions = { pending: { x: 160, y: 320 }, done: { x: 480, y: 160 } }
  input.graph.states[0]!.name = 'Nuevo nombre'
  input.graph.transitions.push({
    id: 'back',
    name: 'Reabrir',
    from: 'done',
    to: 'pending',
    guards: [],
  })
  expect(
    getWorkflowLayout(input.graph, positions).nodes.map(({ x, y }) => ({
      x,
      y,
    })),
  ).toEqual([positions.pending, positions.done])
  expect(getWorkflowArrowPath({ x: 352, y: 360 }, { x: 472, y: 200 })).not.toBe(
    getWorkflowArrowPath({ x: 224, y: 104 }, { x: 272, y: 104 }),
  )
  expect(input.graph.states[0]).not.toHaveProperty('position')
})
it('isolates browser layout preferences by actor, project and workflow and transfers creation layouts', () => {
  const values = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  })
  const source = getWorkflowCanvasKey('actor', 'project', 'new'),
    destination = getWorkflowCanvasKey('actor', 'project', 'saved')
  expect(source).not.toBe(getWorkflowCanvasKey('other', 'project', 'new'))
  expect(source).not.toBe(getWorkflowCanvasKey('actor', 'other', 'new'))
  writeWorkflowCanvasPositions(source, { pending: { x: 48, y: 96 } })
  transferWorkflowCanvasPositions(source, destination)
  expect(readWorkflowCanvasPositions(destination)).toEqual({
    pending: { x: 48, y: 96 },
  })
  expect(readWorkflowCanvasPositions(source)).toEqual({})
})
it('ignores invalid or oversized stored geometry and treats identifiers as data', () => {
  vi.stubGlobal('localStorage', {
    getItem: () =>
      JSON.stringify({
        valid: { x: 32, y: 64 },
        bad: { x: -1, y: 2 },
        huge: { x: 900000, y: 20 },
      }),
  })
  expect(readWorkflowCanvasPositions('key')).toEqual({
    valid: { x: 32, y: 64 },
  })
  const graph = createWorkflowInput().graph
  graph.states[0]!.id = 'constructor'
  graph.transitions[0]!.from = 'constructor'
  expect(getWorkflowLayout(graph).nodes[0]!.x).toBe(32)
})

it('places a transition object halfway along a straight connector', async () => {
  const { getWorkflowArrowGeometry } =
    await import('../src/utils/getWorkflowArrowGeometry')
  const geometry = getWorkflowArrowGeometry(
    { x: 224, y: 104 },
    { x: 368, y: 104 },
  )
  expect(geometry.midpoint.x).toBeCloseTo(296, 3)
  expect(geometry.midpoint.y).toBeCloseTo(104, 3)
})
it('keeps transition objects on the routed portion of backwards arrows and loops', async () => {
  const { getWorkflowArrowGeometry } =
    await import('../src/utils/getWorkflowArrowGeometry')
  const reverse = getWorkflowArrowGeometry(
    { x: 568, y: 228 },
    { x: 368, y: 104 },
  )
  expect(reverse.midpoint.y).toBeGreaterThan(228)
  const loop = getWorkflowArrowGeometry(
    { x: 224, y: 104 },
    { x: 24, y: 104 },
    true,
  )
  expect(loop.midpoint.y).toBeLessThan(104)
  expect(loop.bounds.right).toBeGreaterThan(224)
})
it('leaves room for a transition object between automatically arranged states', () => {
  const layout = getWorkflowLayout(createWorkflowInput().graph)
  expect(
    layout.nodes[1]!.x - 8 - (layout.nodes[0]!.x + 192),
  ).toBeGreaterThanOrEqual(144)
})
