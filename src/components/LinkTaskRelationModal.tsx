import { useState } from 'react'
import { Check, ChevronRight, Link, Search, X } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { useTranslation } from '../hooks/useTranslation'
import { parseVisibleTaskPage } from '../utils/parseVisibleTaskPage'
import { mutateTaskRelation } from '../services/mutateTaskRelation'
import IntegrationDialog from './IntegrationDialog'
import DataMessage from './DataMessage'
import TextButton from './TextButton'
import IconButton from './IconButton'
import type { LinkTaskRelationModalProps } from '../types/LinkTaskRelationModalProps'
export default function LinkTaskRelationModal({ task, relations, kind, onClose, onChanged }: LinkTaskRelationModalProps) {
  const { t } = useTranslation(), mutation = useIntegrationMutation()
  const [search, setSearch] = useState(''), [after, setAfter] = useState<string | null>(null), [selectedId, setSelectedId] = useState('')
  const query = new URLSearchParams({ limit: '50', ...(task.project_id ? { project_id: task.project_id } : {}), ...(search.trim() ? { search: search.trim() } : {}), ...(after ? { after } : {}) })
  const data = useApiData(`/api/v1/tasks?${query}`, parseVisibleTaskPage)
  const excluded = new Set([task.id, ...(kind === 'subtask' ? relations.subtasks : kind==='dependent'?relations.blocks:relations.blocked_by).map(item => item.id)])
  const candidates = (data.data?.items ?? []).filter(item => item.project_id === task.project_id && !excluded.has(item.id) && (kind !== 'dependent' || item.lifecycle==='pending') && (kind !== 'subtask' || task.lifecycle !== 'completed' || item.lifecycle === 'completed'))
  const selected = candidates.find(item => item.id === selectedId)
  return <IntegrationDialog title={t(kind === 'subtask' ? 'Vincular subtarea existente' : kind==='dependent'?'Agregar tarea a bloquear':'Agregar requisito previo')} onClose={onClose} busy={mutation.busy}>
    <p className="mb-4 text-sm leading-relaxed text-base-content/60">{t(kind === 'subtask' ? 'La tarea principal solo podrá finalizar cuando todas sus subtareas estén completadas.' : kind==='dependent'?'La tarea seleccionada no se podrá tomar hasta completar esta tarea.':'Esta tarea no se podrá tomar hasta completar el requisito previo.')}</p>
    <label className="input input-sm mb-4 w-full"><Search size={15}/><input aria-label={t('Buscar tareas para vincular')} placeholder={t('Buscar tareas…')} value={search} onChange={event => { setSearch(event.target.value); setAfter(null); setSelectedId('') }}/></label>
    {data.loading || data.error ? <DataMessage loading={data.loading} error={t(data.error)} onRetry={data.reload}/> : <div className="max-h-72 overflow-y-auto overscroll-contain" role="group" aria-label={t('Tareas disponibles')}>
      {candidates.length ? candidates.map(item => <button key={item.id} type="button" aria-pressed={item.id === selectedId} disabled={mutation.busy} className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-base-200 ${item.id === selectedId ? 'bg-base-200' : ''}`} onClick={() => setSelectedId(item.id)}><span className="min-w-0 flex-1"><span className="block break-words font-medium">{item.title}</span><span className="mt-1 block text-xs text-base-content/45">{t(item.lifecycle === 'pending' ? 'Pendiente' : item.lifecycle === 'paused' ? 'En pausa' : item.lifecycle === 'active' ? 'En ejecución' : 'Completada')}</span></span>{item.id === selectedId && <Check size={16}/>}</button>) : <p className="py-8 text-center text-sm text-base-content/45">{t('No hay tareas compatibles en esta página.')}</p>}
    </div>}
    <div className="mt-3 flex justify-end gap-2">{after && <TextButton type="button" label={t('Primeras tareas')} disabled={mutation.busy} onClick={() => { setAfter(null); setSelectedId('') }}/>} {data.data?.next_after && <IconButton label={t('Siguientes tareas')} disabled={mutation.busy} onClick={() => { setAfter(data.data!.next_after!); setSelectedId('') }}><ChevronRight size={16}/></IconButton>}</div>
    {mutation.error && <p role="alert" className="mt-4 text-sm text-error">{t(mutation.error)}</p>}
    <footer className="mt-5 flex justify-end gap-2 border-t border-base-300 pt-4"><TextButton label={t('Cancelar')} disabled={mutation.busy} onClick={onClose}><X size={16}/></TextButton><TextButton label={t('Vincular tarea')} variant="primary" disabled={!selected || data.loading || !!data.error || mutation.busy} onClick={() => { if (selected) void mutation.run({ id: task.id, revision: task.revision, selected: selected.id, childRevision: selected.revision, kind }, async (signal, key) => { await mutateTaskRelation(kind==='dependent'?selected.id:task.id, kind==='dependent'?selected.revision:task.revision, kind==='dependent'?{id:task.id,title:task.title,lifecycle:task.lifecycle,project_id:task.project_id,assignee_id:task.assignee_id,revision:task.revision,relation_id:null,relation_revision:null}:{ id: selected.id, title: selected.title, lifecycle: selected.lifecycle, project_id: selected.project_id, assignee_id: selected.assignee_id, revision: selected.revision, relation_id: null, relation_revision: null }, kind === 'subtask' ? 'subtask' : 'prerequisite', key, signal); onChanged() }) }}><Link size={16}/></TextButton></footer>
  </IntegrationDialog>
}
