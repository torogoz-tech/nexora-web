import { useTranslation } from '../hooks/useTranslation'
import IconButton from './IconButton'
import WorkflowCanvasTransition from './WorkflowCanvasTransition'
import { getWorkflowArrowGeometry } from '../utils/getWorkflowArrowGeometry'
import { useId, useRef, useState } from 'react'
import { ZoomIn, ZoomOut, Maximize2, LayoutGrid } from 'lucide-react'
import { getWorkflowLayout } from '../utils/getWorkflowLayout'
import { getWorkflowArrowPath } from '../utils/getWorkflowArrowPath'
import { useWorkflowCanvasLayout } from '../hooks/useWorkflowCanvasLayout'
import { useWorkflowCanvasInteractions } from '../hooks/useWorkflowCanvasInteractions'
import WorkflowCanvasNode from './WorkflowCanvasNode'
import type { WorkflowCanvasProps } from '../types/WorkflowCanvasProps'
export default function WorkflowCanvas({
  graph,
  selectedId,
  onSelect,
  readOnly = false,
  layoutKey,
  selectedTransitionId,
  onSelectTransition,
  onConnect,
  onEditState,
  onEditTransition,
}: WorkflowCanvasProps) {
  const { t } = useTranslation()
  const viewport = useRef<HTMLDivElement>(null),
    world = useRef<HTMLDivElement>(null)
  const pan = useRef<{
    x: number
    y: number
    left: number
    top: number
  } | null>(null)
  const [panning, setPanning] = useState(false)
  const [zoom, setZoom] = useState(1)
  const positions = useWorkflowCanvasLayout(layoutKey)
  const layout = getWorkflowLayout(graph, positions.positions)
  const marker = useId().replaceAll(':', '')
  const interactions = useWorkflowCanvasInteractions({
    nodes: layout.nodes,
    zoom,
    world,
    readOnly,
    onSelect,
    onConnect,
    move: (id, point) => positions.move(id, point, layout.nodes),
    persist: positions.persist,
  })
  const connection = interactions.connection
  const edges = graph.transitions.flatMap((edge, index) => {
    const from = layout.nodes.find((node) => node.state.id === edge.from),
      to = layout.nodes.find((node) => node.state.id === edge.to)
    return from && to
      ? [
          {
            edge,
            ...(edge.automatic ? {
              path: `M ${from.x + 192} ${from.y + 40} L ${from.x + 232} ${from.y + 40}`,
              midpoint: {x:from.x + 248, y:from.y + 40},
              bounds: {right:from.x + 264, bottom:from.y + 56},
            } : getWorkflowArrowGeometry(
              { x: from.x + 192, y: from.y + 40 },
              { x: to.x - 8, y: to.y + 40 },
              edge.from === edge.to,
              index,
            )),
          },
        ]
      : []
  })
  const width = Math.max(
    layout.width,
    ...edges.map((edge) =>
      Math.max(edge.bounds.right + 32, edge.midpoint.x + 80),
    ),
    connection ? connection.x + 64 : 0,
  )
  const height = Math.max(
    layout.height,
    ...edges.map((edge) =>
      Math.max(edge.bounds.bottom + 32, edge.midpoint.y + 24),
    ),
    connection ? connection.y + 64 : 0,
  )
  const source = connection
    ? layout.nodes.find((node) => node.state.id === connection.from)
    : null
  return (
    <div
      className="min-w-0 rounded-2xl border border-base-300 bg-base-200/30"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && connection) {
          event.preventDefault()
          event.stopPropagation()
          interactions.cancelConnection()
        }
      }}
      onBlurCapture={(event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        )
          interactions.cancelConnection()
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-300 px-4 py-3">
        <p className="text-xs text-base-content/50">
          {graph.states.length} {t('estados ·')} {graph.transitions.length}{' '}
          {t('conexiones')}{' '}
        </p>
        <div className="flex items-center gap-1">
          {!readOnly && (
            <IconButton
              type="button"
              variant="ghost"
              onClick={() => {
                interactions.cancelConnection()
                positions.reset()
              }}
              label={t('Organizar estados automáticamente')}
            >
              <LayoutGrid size={15} />
            </IconButton>
          )}
          <IconButton
            type="button"
            variant="ghost"
            disabled={zoom <= 0.5}
            onClick={() =>
              setZoom((value) =>
                Math.max(0.5, Math.round((value - 0.1) * 10) / 10),
              )
            }
            label={t('Alejar lienzo')}
          >
            <ZoomOut size={15} />
          </IconButton>
          <IconButton
            type="button"
            variant="ghost"
            onClick={() => setZoom(1)}
            label={t('Restablecer zoom')}
          >
            <Maximize2 size={15} />
          </IconButton>
          <IconButton
            type="button"
            variant="ghost"
            disabled={zoom >= 1.5}
            onClick={() =>
              setZoom((value) =>
                Math.min(1.5, Math.round((value + 0.1) * 10) / 10),
              )
            }
            label={t('Acercar lienzo')}
          >
            <ZoomIn size={15} />
          </IconButton>
        </div>
      </div>
      <div
        ref={viewport}
        className="min-h-80 overflow-auto rounded-b-2xl"
        aria-label={t('Lienzo del workflow')}
        tabIndex={0}
        onPointerDown={(event) => {
          if ((event.target as Element).closest('button,[role="button"]'))
            return
          interactions.cancelConnection()
          if (event.pointerType !== 'mouse' || event.button !== 0) return
          pan.current = {
            x: event.clientX,
            y: event.clientY,
            left: event.currentTarget.scrollLeft,
            top: event.currentTarget.scrollTop,
          }
          event.currentTarget.setPointerCapture(event.pointerId)
          setPanning(true)
        }}
        onPointerMove={(event) => {
          interactions.preview(event)
          if (pan.current) {
            event.currentTarget.scrollLeft =
              pan.current.left - (event.clientX - pan.current.x)
            event.currentTarget.scrollTop =
              pan.current.top - (event.clientY - pan.current.y)
          }
        }}
        onPointerUp={() => {
          pan.current = null
          setPanning(false)
        }}
        onPointerCancel={() => {
          pan.current = null
          setPanning(false)
        }}
        style={{
          maxHeight: 520,
          cursor: panning ? 'grabbing' : connection ? 'crosshair' : 'grab',
          backgroundImage:
            'radial-gradient(circle, color-mix(in oklch, var(--color-base-content) 12%, transparent) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        <div style={{ width: width * zoom, height: height * zoom }}>
          <div
            ref={world}
            className="relative origin-top-left"
            style={{ width, height, transform: `scale(${zoom})` }}
          >
            <svg
              width={width}
              height={height}
              className="absolute inset-0 overflow-visible text-base-content/35"
              role="group"
              aria-label={t('Flechas del workflow')}
            >
              <defs>
                <marker
                  id={marker}
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                </marker>
              </defs>
              {edges.map(({ edge, path }) => {
                const selected = edge.id === selectedTransitionId
                return (
                  <g key={edge.id}>
                    <path
                      data-workflow-edge={edge.id}
                      d={path}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={selected ? 2.5 : 1.5}
                      className={
                        selected ? 'text-base-content' : 'text-base-content/35'
                      }
                      markerEnd={edge.automatic ? undefined : `url(#${marker})`}
                      pointerEvents="none"
                    />
                    {!readOnly && onSelectTransition && (
                      <path
                        d={path}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={18}
                        aria-hidden="true"
                        className="cursor-pointer"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={() => onSelectTransition(edge.id)}
                        onDoubleClick={() => onEditTransition?.(edge.id)}
                      />
                    )}
                  </g>
                )
              })}
              {source && connection && (
                <path
                  d={getWorkflowArrowPath(
                    { x: source.x + 192, y: source.y + 40 },
                    { x: connection.x, y: connection.y },
                  )}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  className="pointer-events-none text-base-content/65"
                  aria-hidden="true"
                />
              )}
            </svg>
            {edges.map(({ edge, midpoint }) => (
              <WorkflowCanvasTransition
                key={edge.id}
                transition={edge}
                position={midpoint}
                selected={edge.id === selectedTransitionId}
                onEdit={!readOnly ? onEditTransition : undefined}
                onSelect={
                  onSelectTransition
                    ? (id) => {
                        interactions.cancelConnection()
                        onSelectTransition(id)
                      }
                    : undefined
                }
              />
            ))}
            {layout.nodes.map((node) => (
              <WorkflowCanvasNode
                key={node.state.id}
                node={node}
                selected={selectedId === node.state.id}
                readOnly={readOnly}
                connectable={!!onConnect && graph.transitions.length < 256}
                moving={interactions.moving === node.state.id}
                target={connection?.target === node.state.id}
                onSelect={onSelect}
                onEdit={onEditState}
                onDrag={interactions.dragNode}
                onWire={interactions.dragConnection}
                onConnector={interactions.connectorClick}
                onNudge={interactions.nudge}
              />
            ))}
          </div>
        </div>
      </div>
      {!readOnly && (
        <p className="border-t border-base-300 px-4 py-3 text-[11px] leading-relaxed text-base-content/45">
          {' '}
          {t(
            'Doble clic en un estado o transición para abrir sus propiedades; con el teclado, pulsa Enter. Arrastra los estados para moverlos. Para crear una flecha, arrastra desde la salida derecha hacia otro estado. La disposición se conserva en este navegador.',
          )}{' '}
        </p>
      )}
    </div>
  )
}
