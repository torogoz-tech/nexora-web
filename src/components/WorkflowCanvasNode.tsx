import { useTranslation } from '../hooks/useTranslation'
import { Flag, Check, ArrowRight } from 'lucide-react'
import type { WorkflowCanvasNodeProps } from '../types/WorkflowCanvasNodeProps'
export default function WorkflowCanvasNode({
  node,
  selected,
  readOnly,
  connectable,
  moving,
  target,
  onSelect,
  onEdit,
  onDrag,
  onWire,
  onConnector,
  onNudge,
}: WorkflowCanvasNodeProps) {
  const { t } = useTranslation()
  const { state, x, y } = node
  return (
    <div
      data-workflow-state={state.id}
      className="absolute h-20 w-48"
      style={{ left: x, top: y, zIndex: moving ? 20 : 10 }}
    >
      <button
        type="button"
        aria-label={t('Estado {0}', { '0': state.name })}
        aria-pressed={selected}
        title={
          readOnly
            ? state.name
            : t(
                'Arrastra para mover. Doble clic o Enter para abrir las propiedades.',
              )
        }
        aria-haspopup={onEdit && !readOnly ? 'dialog' : undefined}
        onClick={(event) => {
          onSelect(state.id)
          if (event.detail === 0 && !readOnly) onEdit?.(state.id)
        }}
        onDoubleClick={() => {
          if (!readOnly) onEdit?.(state.id)
        }}
        onPointerDown={(event) => onDrag(state.id, 'start', event)}
        onPointerMove={(event) => onDrag(state.id, 'move', event)}
        onPointerUp={(event) => onDrag(state.id, 'end', event)}
        onPointerCancel={(event) => onDrag(state.id, 'cancel', event)}
        onLostPointerCapture={(event) => onDrag(state.id, 'cancel', event)}
        onKeyDown={(event) => {
          if (
            readOnly ||
            !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
              event.key,
            )
          )
            return
          event.preventDefault()
          event.stopPropagation()
          const step = event.shiftKey ? 64 : 16
          onNudge(
            state.id,
            event.key === 'ArrowLeft'
              ? -step
              : event.key === 'ArrowRight'
                ? step
                : 0,
            event.key === 'ArrowUp'
              ? -step
              : event.key === 'ArrowDown'
                ? step
                : 0,
          )
        }}
        className={`flex h-full w-full select-none flex-col justify-center gap-2 rounded-xl border bg-base-100 px-4 text-left shadow-sm outline-offset-4 ${selected || target ? 'border-base-content' : 'border-base-300 hover:border-base-content/50'}`}
        style={{
          cursor: readOnly ? 'pointer' : moving ? 'grabbing' : 'grab',
          touchAction: readOnly ? 'auto' : 'none',
          ...(state.color
            ? { borderLeftColor: state.color, borderLeftWidth: 4 }
            : {}),
        }}
      >
        <span className="truncate text-sm font-medium">
          {state.name || t('Estado sin nombre')}
        </span>
        <span className="flex items-center gap-3 text-[11px] text-base-content/45">
          {state.initial && (
            <span className="inline-flex items-center gap-1">
              <Flag size={11} /> {t('Inicial')}{' '}
            </span>
          )}
          {state.terminal && (
            <span className="inline-flex items-center gap-1">
              <Check size={11} />
              Final
            </span>
          )}
          {!state.initial && !state.terminal && <span>{t('Estado')}</span>}
        </span>
      </button>
      {!readOnly && (
        <>
          <button
            type="button"
            aria-label={`Conectar hacia ${state.name}`}
            title={t('Entrada: recibe una flecha desde otro estado')}
            disabled={!connectable}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              onConnector(state.id, 'input')
            }}
            className={`absolute -left-3 top-7 flex h-6 w-6 items-center justify-center rounded-md border bg-base-200 outline-offset-2 ${target ? 'border-base-content' : 'border-base-content/35'} disabled:opacity-40`}
          >
            <ArrowRight size={11} />
          </button>
          <button
            type="button"
            aria-label={`Conectar desde ${state.name}`}
            title={t('Salida: arrastra hacia otro estado o activa su entrada')}
            disabled={!connectable}
            onPointerDown={(event) => onWire(state.id, 'start', event)}
            onPointerMove={(event) => onWire(state.id, 'move', event)}
            onPointerUp={(event) => onWire(state.id, 'end', event)}
            onPointerCancel={(event) => onWire(state.id, 'cancel', event)}
            onClick={(event) => {
              event.stopPropagation()
              if (event.detail === 0) onConnector(state.id, 'output')
            }}
            className="absolute -right-3 top-7 flex h-6 w-6 cursor-crosshair items-center justify-center rounded-md border border-base-content/35 bg-base-200 outline-offset-2 disabled:opacity-40"
            style={{ touchAction: 'none' }}
          >
            <ArrowRight size={11} />
          </button>
        </>
      )}
    </div>
  )
}
