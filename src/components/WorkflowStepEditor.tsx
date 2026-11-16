import { useState } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { workflowStepLabels } from '../app/workflowStepLabels'
import { workflowStepOrderValid } from '../utils/workflowStepOrderValid'
import type { WorkflowStep } from '../types/WorkflowStep'
import Dropdown from './Dropdown'
import IconButton from './IconButton'
import WorkflowStepProperties from './WorkflowStepProperties'
export default function WorkflowStepEditor({ steps, onChange, disabled, hasApprovalGuard = false, automatic = false }: { steps: WorkflowStep[]; onChange: (steps: WorkflowStep[]) => void; disabled?: boolean; hasApprovalGuard?: boolean; automatic?:boolean }) {
  const { t } = useTranslation()
  const [kind, setKind] = useState('require_approval')
  const [selected, setSelected] = useState<number | null>(null)
  const options = Object.entries(workflowStepLabels).filter(([key]) => key !== 'advance_state' && (!['handoff','publish_release'].includes(key)||automatic&&!steps.some(step=>step.kind==='handoff'||step.kind==='publish_release')) && (key !== 'require_approval' || !hasApprovalGuard && !steps.some(step => step.kind === key)))
  const selectedKind = options.some(([key]) => key === kind) ? kind : options[0]?.[0]
  function add() {
    if (disabled || steps.length >= 32 || !selectedKind) return
    const step: WorkflowStep = selectedKind === 'create_pull_request' ? { kind: selectedKind, source_branch: '', source_from_task:true, target_branch: 'develop' } : selectedKind === 'notify' ? { kind: selectedKind, channel: 'email' } : selectedKind === 'create_branch' ? {kind:selectedKind,base_branch:'develop'} : selectedKind==='verify_deployment'?{kind:selectedKind,environment:'production'} : selectedKind==='merge_pull_request'?{kind:selectedKind,target_branch:'develop'} : selectedKind==='publish_release'?{kind:selectedKind} : selectedKind==='handoff'?{kind:selectedKind,workflow_id:''} : ['verify_push','create_code_review','generate_contributor_ratings','verify_pipeline','verify_pull_request_merged','merge_pull_request'].includes(selectedKind)?{kind:selectedKind as 'verify_push'} : { kind: 'require_approval' }
    const next = steps.length ? [...steps] : [{ kind: 'advance_state' as const }]
    const handoff=next.findIndex(item=>item.kind==='handoff'||item.kind==='publish_release')
    const at = (step.kind==='handoff'||step.kind==='publish_release')?next.length:step.kind === 'notify' ? (handoff<0?next.length:handoff) : Math.max(0, next.findIndex(item => item.kind === 'advance_state'))
    next.splice(at, 0, step)
    onChange(next); setSelected(at)
  }
  function reordered(index: number, delta: number) {
    if (index + delta < 0 || index + delta >= steps.length) return null
    const next = [...steps]; [next[index], next[index + delta]] = [next[index + delta]!, next[index]!]
    return workflowStepOrderValid(next) ? next : null
  }
  function move(index: number, delta: number) {
    const next = reordered(index, delta)
    if (disabled || !next) return
    onChange(next); setSelected(index + delta)
  }
  function summary(step: WorkflowStep) {
    if (automatic && step.kind === 'advance_state') return t('Mantiene la etapa completada mientras se ejecutan las acciones finales.')
    if (step.kind === 'create_pull_request') return `${step.source_from_task?t('Rama de la tarea'):step.source_branch} → ${step.target_from_parent?t('Rama de la tarea padre'):step.target_branch}`
    if(step.kind==='create_branch')return `${t('Rama base')}: ${step.base_branch}`
    if(step.kind==='verify_deployment')return `${t('Entorno')}: ${step.environment}`
    if(step.kind==='verify_pipeline')return step.workflow||t('Todos los pipelines del commit')
    if(step.kind==='publish_release')return t('Confirma la publicación en producción del release y completa sus tareas.')
    if(step.kind==='merge_pull_request')return t('Integra la PR aprobada verificando que su commit no cambió.')
    if(step.kind==='handoff')return t('Conserva la tarea y libera el responsable para el siguiente workflow.')
    if(step.kind==='generate_contributor_ratings')return t('Valora de forma privada los cambios de cada colaborador verificado.')
    if(step.kind==='create_code_review')return t('Revisa seguridad y buenas prácticas sobre el commit antes de crear la PR.')
    if(step.kind==='verify_pull_request_merged')return t('Espera la integración confirmada por el proveedor Git.')
    if (step.kind === 'notify') return `${t(step.channel === 'email' ? 'Correo electrónico' : 'Notificación interna')} · ${t(step.audience==='approvers'?'Responsables de aprobación':'Responsable de la tarea')}`
    return t(step.kind === 'require_approval' ? 'Espera una aprobación antes de continuar.' : step.kind === 'verify_push' ? 'Comprueba la evidencia en Git.' : 'Avanza al estado de destino.')
  }
  return <section className="min-w-0 space-y-3 border-t border-base-300 pt-4" aria-label={t('Pasos de la transición')}>
    <header><h3 className="text-sm font-medium">{t('Pasos de la transición')} <span className="ml-1 text-xs text-base-content/45">{steps.length}</span></h3><p className="mt-1 text-xs leading-relaxed text-base-content/55">{t('Se ejecutan en orden. La tarea conserva su estado mientras espera condiciones o aprobación; las notificaciones se envían en la posición indicada.')}</p></header>
    {!steps.length && <p className="text-xs text-base-content/50">{t('Sin pasos adicionales. La conexión cambia el estado al cumplir sus condiciones.')}</p>}
    <ol className="divide-y divide-base-300/60">{steps.map((step, index) => <li key={`${step.kind}:${index}`} className="py-2">
      <div className="flex items-start gap-2"><span className="mt-1 text-xs tabular-nums text-base-content/40">{index + 1}.</span><button type="button" disabled={disabled} aria-expanded={selected === index} onClick={() => setSelected(selected === index ? null : index)} className="min-w-0 flex-1 text-left"><span className="flex items-center gap-2 text-xs font-medium"><ChevronDown size={14} className={`shrink-0 ${selected === index ? '' : '-rotate-90'}`} />{t(automatic && step.kind === 'advance_state' ? 'Conservar estado final' : workflowStepLabels[step.kind])}</span><span className="mt-1 block text-xs text-base-content/55">{summary(step)}</span></button><div className="flex shrink-0 gap-0.5"><IconButton label={t('Configurar paso')} disabled={disabled} onClick={() => setSelected(index)}><Pencil size={14} /></IconButton><IconButton label={t('Subir paso')} disabled={disabled || !reordered(index, -1)} onClick={() => move(index, -1)}><ArrowUp size={14} /></IconButton><IconButton label={t('Bajar paso')} disabled={disabled || !reordered(index, 1)} onClick={() => move(index, 1)}><ArrowDown size={14} /></IconButton><IconButton label={t('Quitar paso')} disabled={disabled || step.kind === 'advance_state'} onClick={() => { onChange(steps.filter((_, i) => i !== index)); setSelected(null) }}><Trash2 size={14} /></IconButton></div></div>
      {selected === index && <div className="ml-6 mt-3 border-l-2 border-base-300 pl-3 pb-2"><WorkflowStepProperties step={step} disabled={disabled} onChange={updated => onChange(steps.map((item, i) => i === index ? updated : item))} /></div>}
    </li>)}</ol>
    <div className="flex items-end gap-2"><label className="flex min-w-0 flex-1 flex-col gap-2 text-xs">{t('Agregar paso')}<Dropdown label={t('Tipo de paso')} value={selectedKind ?? ''} disabled={disabled || steps.length >= 32} options={options.map(([value, label]) => ({ value, label: t(label) }))} onChange={setKind} /></label><IconButton label={t('Agregar paso')} disabled={disabled || steps.length >= 32 || !selectedKind} onClick={add}><Plus size={16} /></IconButton></div>
    {!!steps.length && !steps.some(step => step.kind === 'advance_state') && <button type="button" className="btn btn-sm btn-outline" disabled={disabled} onClick={() => { const next = [...steps]; const notification = next.findIndex(step => step.kind === 'notify'); next.splice(notification < 0 ? next.length : notification, 0, { kind: 'advance_state' }); onChange(next) }}>{t('Agregar cambio de estado')}</button>}
  </section>
}
