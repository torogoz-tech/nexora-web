import { useState } from 'react'
import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { workflowGuardOptions } from '../app/workflowGuardOptions'
import { workflowGuardDescriptions } from '../app/workflowGuardDescriptions'
import type { WorkflowGuard } from '../types/WorkflowGuard'
import type { WorkflowGuardEditorProps } from '../types/WorkflowGuardEditorProps'
import Dropdown from './Dropdown'
import IconButton from './IconButton'
export default function WorkflowGuardEditor({ guards, onChange, disabled, taskOnly, hasApprovalStep = false }: WorkflowGuardEditorProps) {
  const { t } = useTranslation()
  const [kind, setKind] = useState<WorkflowGuard['kind']>('assignee')
  const [field, setField] = useState('')
  const [selected, setSelected] = useState<number | null>(null)
  const [editedField, setEditedField] = useState('')
  const options = [...workflowGuardOptions, { value: 'required_field' as const, label: 'Campo obligatorio' }].filter(option =>
    (option.value !== 'working_branch_reported' || taskOnly) &&
    (option.value !== 'human_approval' || !hasApprovalStep) &&
    (option.value === 'required_field' || !guards.some(guard => guard.kind === option.value)))
  const selectedKind = options.some(option => option.value === kind) ? kind : options[0]?.value
  const validField = (value: string, except = -1) => /^[A-Za-z0-9_]{1,64}$/.test(value) && !guards.some((guard, index) => index !== except && guard.kind === 'required_field' && guard.field === value)
  const canAdd = !disabled && guards.length < 32 && selectedKind && (selectedKind !== 'required_field' || validField(field))
  function add() {
    if (!canAdd || !selectedKind) return
    onChange([...guards, selectedKind === 'required_field' ? { kind: selectedKind, field } : { kind: selectedKind }])
    setSelected(guards.length); setEditedField(field); setField('')
  }
  return <section className="min-w-0 space-y-3 border-t border-base-300 pt-4" aria-label={t('Condiciones para avanzar')}>
    <header><h3 className="text-sm font-medium">{t('Condiciones para avanzar')} <span className="ml-1 text-xs text-base-content/45">{guards.length}</span></h3><p className="mt-1 text-xs text-base-content/55">{t('Todas las condiciones deben cumplirse antes de cambiar de estado.')}</p></header>
    {!guards.length && <p className="text-xs text-base-content/50">{t('Sin condiciones adicionales.')}</p>}
    <ul className="divide-y divide-base-300/60">{guards.map((guard, index) => {
      const label = guard.kind === 'required_field' ? t('Campo obligatorio') : t(workflowGuardOptions.find(option => option.value === guard.kind)?.label ?? guard.kind)
      const open = selected === index
      return <li key={`${guard.kind}:${index}`} className="py-2">
        <div className="flex items-center gap-2"><button type="button" aria-expanded={open} disabled={disabled} onClick={() => { setSelected(open ? null : index); setEditedField(guard.kind === 'required_field' ? guard.field : '') }} className="flex min-w-0 flex-1 items-center gap-2 text-left text-xs font-medium"><ChevronDown size={14} className={`shrink-0 transition-transform ${open ? '' : '-rotate-90'}`} /><span>{label}{guard.kind === 'required_field' && <span className="ml-2 font-mono text-base-content/55">{guard.field}</span>}</span></button><IconButton label={t('Configurar condición')} disabled={disabled} onClick={() => { setSelected(index); setEditedField(guard.kind === 'required_field' ? guard.field : '') }}><Pencil size={14} /></IconButton><IconButton label={t('Quitar condición')} disabled={disabled} onClick={() => { onChange(guards.filter((_, i) => i !== index)); setSelected(null) }}><Trash2 size={14} /></IconButton></div>
        {open && <div className="ml-6 mt-2 space-y-3 pb-2"><p className="text-xs leading-relaxed text-base-content/60">{t(workflowGuardDescriptions[guard.kind])}</p>{guard.kind === 'required_field' && <div className="flex items-end gap-2"><label className="flex min-w-0 flex-1 flex-col gap-2 text-xs">{t('Nombre del campo')}<input aria-label={t('Nombre del campo')} className="input input-sm w-full" value={editedField} disabled={disabled} maxLength={64} onChange={event => setEditedField(event.target.value)} /></label><button type="button" className="btn btn-sm btn-ghost" disabled={disabled || !validField(editedField, index)} onClick={() => onChange(guards.map((item, i) => i === index ? { kind: 'required_field', field: editedField } : item))}>{t('Aplicar')}</button></div>}</div>}
      </li>
    })}</ul>
    <div className="flex items-end gap-2"><label className="flex min-w-0 flex-1 flex-col gap-2 text-xs">{t('Agregar condición')}<Dropdown label={t('Tipo de condición')} value={selectedKind ?? ''} disabled={disabled || guards.length >= 32 || !options.length} options={options.map(option => ({ value: option.value, label: t(option.label) }))} onChange={value => setKind(value as WorkflowGuard['kind'])} /></label><IconButton label={t('Agregar condición')} disabled={!canAdd} onClick={add}><Plus size={16} /></IconButton></div>
    {selectedKind === 'required_field' && <label className="flex flex-col gap-2 text-xs">{t('Nombre del campo')}<input aria-label={t('Nuevo campo obligatorio')} className="input input-sm w-full" placeholder="assignee_id" maxLength={64} disabled={disabled} value={field} onChange={event => setField(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); add() } }} /></label>}
  </section>
}
