import WorkflowStepEditor from './WorkflowStepEditor'
import { useTranslation } from '../hooks/useTranslation'
import IconButton from './IconButton'
import { Trash2, ArrowRight } from 'lucide-react'
import Dropdown from './Dropdown'
import WorkflowGuardEditor from './WorkflowGuardEditor'
import type { WorkflowTransition } from '../types/WorkflowTransition'
import type { WorkflowTransitionEditorProps } from '../types/WorkflowTransitionEditorProps'
export default function WorkflowTransitionEditor({
  graph,
  selectedId,
  disabled,
  taskOnly,
  onChange,
}: WorkflowTransitionEditorProps) {
  const { t } = useTranslation()
  const edge =
    graph.transitions.find((edge) => edge.id === selectedId) ??
    graph.transitions[0]
  const states = graph.states.map((state) => ({
    value: state.id,
    label: state.name || state.id,
  }))
  function change(patch: Partial<WorkflowTransition>) {
    if (edge)
      onChange({
        ...graph,
        transitions: graph.transitions.map((item) =>
          item.id === edge.id ? { ...item, ...patch } : item,
        ),
      })
  }
  return (
    <section className="min-w-0 p-4" aria-label={t('Transiciones')}>
      {edge ? (
        <fieldset disabled={disabled} className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-base-content/60">{t(edge.automatic ? 'Configura las acciones que se ejecutan al completar esta etapa.' : 'Configura las condiciones para avanzar al siguiente estado.')}</p>
            <IconButton type="button" variant="ghost" disabled={disabled}
              onClick={() => onChange({ ...graph, transitions: graph.transitions.filter((item) => item.id !== edge.id) })}
              label={t('Eliminar transición')}>
              <Trash2 size={15} />
            </IconButton>
          </div>
          <div className={`grid min-w-0 items-end gap-2 ${edge.automatic ? 'grid-cols-1' : 'grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]'}`}>
            <label className="flex min-w-0 flex-col gap-2 text-xs">
              {' '}
              {t('Origen')}{' '}
              <Dropdown
                label={t('Estado de origen')}
                value={edge.from}
                options={states}
                disabled={disabled}
                onChange={(from) => change({ from, ...(edge.automatic ? graph.states.some(state => state.id === from && state.terminal) ? {to:from} : {automatic:false} : {}) })}
              />
            </label>
            {!edge.automatic && <><ArrowRight size={14} className="mb-2.5 text-base-content/40" />
            <label className="flex min-w-0 flex-col gap-2 text-xs">
              {' '}
              {t('Destino')}{' '}
              <Dropdown
                label={t('Estado de destino')}
                value={edge.to}
                options={states}
                disabled={disabled||edge.automatic}
                onChange={(to) => change({ to })}
              />
            </label></>}
          </div>
          <label className="flex items-start gap-3 text-xs"><input className="checkbox checkbox-sm" type="checkbox" checked={edge.automatic??false} disabled={disabled||!graph.states.some(state=>state.id===edge.from&&state.terminal)||graph.transitions.some(item=>item.id!==edge.id&&item.from===edge.from&&item.automatic)} onChange={event=>change({automatic:event.target.checked,...(event.target.checked?{to:edge.from}:{})})}/><span>{t('Ejecutar automáticamente al llegar a Fin')}<span className="mt-1 block text-base-content/55">{t('El pipeline final conserva el estado Fin mientras verifica revisión, integración y despliegue.')}</span></span></label>
          <WorkflowGuardEditor
            key={`${edge.id}:guards`}
            guards={edge.guards}
            onChange={(guards) => change({ guards })}
            disabled={disabled}
            taskOnly={taskOnly}
            hasApprovalStep={edge.steps?.some(step => step.kind === 'require_approval')}
          />
          <WorkflowStepEditor key={`${edge.id}:steps`} steps={edge.steps ?? []} automatic={edge.automatic} disabled={disabled} hasApprovalGuard={edge.guards.some(guard => guard.kind === 'human_approval')} onChange={steps => change({ steps })} />
        </fieldset>
      ) : (
        <p className="mt-4 text-sm text-base-content/50">
          {' '}
          {t('Agrega una transición para conectar los estados.')}{' '}
        </p>
      )}
    </section>
  )
}
