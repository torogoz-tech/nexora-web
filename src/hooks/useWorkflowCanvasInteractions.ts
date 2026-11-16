import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { getWorkflowDragPosition } from '../utils/getWorkflowDragPosition'
import type { WorkflowCanvasConnection } from '../types/WorkflowCanvasConnection'
import type { WorkflowCanvasInteractionOptions } from '../types/WorkflowCanvasInteractionOptions'
import type { WorkflowPointerPhase } from '../types/WorkflowPointerPhase'
export function useWorkflowCanvasInteractions({
  nodes,
  zoom,
  world,
  readOnly,
  onSelect,
  onConnect,
  move,
  persist,
}: WorkflowCanvasInteractionOptions) {
  const nodeDrag = useRef<{
    id: string
    x: number
    y: number
    clientX: number
    clientY: number
    worldLeft: number
    worldTop: number
  } | null>(null)
  const wireDrag = useRef<{
    clientX: number
    clientY: number
    moved: boolean
  } | null>(null)
  const pending = useRef<WorkflowCanvasConnection | null>(null)
  const [connection, setConnection] = useState<WorkflowCanvasConnection | null>(
    null,
  )
  const [moving, setMoving] = useState<string | null>(null)
  function update(value: WorkflowCanvasConnection | null) {
    pending.current = value
    setConnection(value)
  }
  function cancelConnection() {
    wireDrag.current = null
    update(null)
  }
  function stateAt(event: PointerEvent) {
    return (
      document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>('[data-workflow-state]')?.dataset
        .workflowState ?? null
    )
  }
  function point(event: PointerEvent) {
    const rect = world.current?.getBoundingClientRect()
    return {
      x: Math.max(8, (event.clientX - (rect?.left ?? 0)) / zoom),
      y: Math.max(8, (event.clientY - (rect?.top ?? 0)) / zoom),
    }
  }
  function dragNode(
    id: string,
    phase: WorkflowPointerPhase,
    event: PointerEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation()
    if (readOnly) return
    if (phase === 'start') {
      if (event.button !== 0) return
      event.preventDefault()
      cancelConnection()
      const node = nodes.find((node) => node.state.id === id)
      if (!node) return
      nodeDrag.current = {
        id,
        x: node.x,
        y: node.y,
        clientX: event.clientX,
        clientY: event.clientY,
        worldLeft: world.current?.getBoundingClientRect().left ?? 0,
        worldTop: world.current?.getBoundingClientRect().top ?? 0,
      }
      event.currentTarget.setPointerCapture(event.pointerId)
      event.currentTarget.focus({ preventScroll: true })
      setMoving(id)
      onSelect(id)
    } else if (phase === 'move' && nodeDrag.current?.id === id) {
      const start = nodeDrag.current
      move(
        id,
        getWorkflowDragPosition(
          start,
          {
            x:
              event.clientX -
              start.clientX +
              start.worldLeft -
              (world.current?.getBoundingClientRect().left ?? 0),
            y:
              event.clientY -
              start.clientY +
              start.worldTop -
              (world.current?.getBoundingClientRect().top ?? 0),
          },
          zoom,
        ),
      )
    } else if (
      (phase === 'end' || phase === 'cancel') &&
      nodeDrag.current?.id === id
    ) {
      nodeDrag.current = null
      setMoving(null)
      persist()
    }
  }
  function dragConnection(
    id: string,
    phase: WorkflowPointerPhase,
    event: PointerEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation()
    if (readOnly || !onConnect) return
    if (phase === 'start') {
      if (event.button !== 0) return
      event.preventDefault()
      wireDrag.current = {
        clientX: event.clientX,
        clientY: event.clientY,
        moved: false,
      }
      event.currentTarget.setPointerCapture(event.pointerId)
      event.currentTarget.focus({ preventScroll: true })
      update({ from: id, ...point(event), target: null })
    } else if (phase === 'move' && pending.current && wireDrag.current) {
      const start = wireDrag.current
      if (
        Math.hypot(
          event.clientX - start.clientX,
          event.clientY - start.clientY,
        ) > 5
      )
        start.moved = true
      update({ ...pending.current, ...point(event), target: stateAt(event) })
    } else if (phase === 'end' && pending.current && wireDrag.current) {
      const source = pending.current.from,
        target = stateAt(event),
        moved = wireDrag.current.moved
      wireDrag.current = null
      if (moved) {
        cancelConnection()
        if (target && nodes.some((node) => node.state.id === target))
          onConnect(source, target)
      }
    } else if (phase === 'cancel' && wireDrag.current) {
      cancelConnection()
    }
  }
  function connectorClick(id: string, side: 'input' | 'output') {
    if (readOnly || !onConnect) return
    if (side === 'input') {
      if (pending.current) {
        const from = pending.current.from
        cancelConnection()
        onConnect(from, id)
      } else onSelect(id)
    } else {
      const node = nodes.find((node) => node.state.id === id)
      if (!node) return
      update(
        pending.current?.from === id
          ? null
          : { from: id, x: node.x + 224, y: node.y + 40, target: null },
      )
    }
  }
  function nudge(id: string, dx: number, dy: number) {
    if (readOnly) return
    const node = nodes.find((node) => node.state.id === id)
    if (!node) return
    cancelConnection()
    onSelect(id)
    move(id, getWorkflowDragPosition(node, { x: dx, y: dy }, 1))
    persist()
  }
  function preview(event: PointerEvent<HTMLDivElement>) {
    if (pending.current && !wireDrag.current)
      update({ ...pending.current, ...point(event), target: stateAt(event) })
  }
  return {
    connection: readOnly ? null : connection,
    moving,
    dragNode,
    dragConnection,
    connectorClick,
    nudge,
    preview,
    cancelConnection,
  }
}
