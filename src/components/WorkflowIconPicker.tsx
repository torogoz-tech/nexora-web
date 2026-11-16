import Tooltip from './Tooltip'
import { useState } from 'react'
import { Check, Search } from 'lucide-react'
import { workflowIcons } from '../app/workflowIcons'
import { useTranslation } from '../hooks/useTranslation'
import type { WorkflowIconPickerProps } from '../types/WorkflowIconPickerProps'
import IntegrationDialog from './IntegrationDialog'
import Dropdown from './Dropdown'
import WorkflowSymbol from './WorkflowSymbol'
export default function WorkflowIconPicker({ value, onChange, disabled = false }: WorkflowIconPickerProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState('')
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase()
  const query = normalize(search.trim())
  const options = workflowIcons.filter(option => (!group || option.group === group) && normalize(`${t(option.label)} ${t(option.group)} ${option.value}`).includes(query))
  const groups = [...new Set(workflowIcons.map(option => option.group))]
  const selected = workflowIcons.find(option => option.value === value) ?? workflowIcons.find(option => option.value === 'workflow')!
  return <div className="shrink-0"><p className="mb-2 text-xs">{t('Icono')}</p><Tooltip label={t('Elegir icono del workflow')}><button type="button" className="input flex size-10 items-center justify-center p-0" aria-label={t('Icono del workflow: {0}', { '0': t(selected.label) })} aria-haspopup="dialog" disabled={disabled} onClick={() => { setSearch(''); setGroup(''); setOpen(true) }}><WorkflowSymbol icon={value} size={21}/></button></Tooltip>
    {open && <IntegrationDialog title={t('Icono del workflow')} onClose={() => setOpen(false)} className="flex max-h-[min(640px,85dvh)] flex-col overflow-hidden"><div className="mb-4 flex shrink-0 flex-wrap gap-2"><label className="input input-sm flex min-w-0 flex-1 items-center gap-2"><Search size={16} aria-hidden="true"/><input type="search" className="min-w-0 grow" aria-label={t('Buscar iconos')} placeholder={t('Buscar iconos')} value={search} onChange={event => setSearch(event.target.value)}/></label><Dropdown label={t('Área del workflow')} value={group} options={[{ value: '', label: t('Todas las áreas') }, ...groups.map(value => ({ value, label: t(value) }))]} onChange={setGroup} className="w-full sm:w-48"/></div><div className="min-h-0 overflow-y-auto overscroll-contain pr-1"><div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{options.map(option => <button key={option.value} type="button" aria-pressed={value === option.value} aria-label={t('Icono: {0}', { '0': t(option.label) })} onClick={() => { onChange(option.value); setOpen(false) }} className={`relative flex min-w-0 flex-col items-center gap-2 rounded-xl border px-2 py-4 text-xs transition-colors hover:bg-base-200 ${value === option.value ? 'border-primary bg-primary/10 text-primary' : 'border-base-300 text-base-content/65'}`}><option.icon size={23} aria-hidden="true"/><span className="break-words text-center">{t(option.label)}</span>{value === option.value && <Check size={12} className="absolute right-1.5 top-1.5" aria-hidden="true"/>}</button>)}</div>{options.length === 0 && <p className="py-8 text-center text-sm text-base-content/60" role="status">{t('No se encontraron iconos.')}</p>}</div></IntegrationDialog>}
  </div>
}
