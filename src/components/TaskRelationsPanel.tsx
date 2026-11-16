import { useState } from 'react'
import { ChevronUp, GitBranch, Link, ListTree, LockKeyhole, Plus, RefreshCw, Unlink, X } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { mutateTaskRelation } from '../services/mutateTaskRelation'
import IntegrationDialog from './IntegrationDialog'
import { useLocation, useNavigate } from 'react-router'
import LinkTaskRelationModal from './LinkTaskRelationModal'
import TaskRelationList from './TaskRelationList'
import DataMessage from './DataMessage'
import IconButton from './IconButton'
import TextButton from './TextButton'
import type { TaskRelationsPanelProps } from '../types/TaskRelationsPanelProps'
import type { TaskRelationSummary } from '../types/TaskRelationSummary'
import type { TaskRelationOperation } from '../types/TaskRelationOperation'
export default function TaskRelationsPanel({ task, relations, loading, error, busy, onRetry, onChanged, onOpen }: TaskRelationsPanelProps) {
  const { t } = useTranslation(), mutation = useIntegrationMutation()
  const navigate = useNavigate(), location = useLocation()
  const [linking, setLinking] = useState<'subtask' | 'prerequisite' | 'dependent' | null>(null)
  const [removing, setRemoving] = useState<{ target: TaskRelationSummary; operation: TaskRelationOperation } | null>(null)
  const fresh = relations?.task_revision === task.revision, editable = fresh && relations?.can_manage && !busy
  const changed = () => { setLinking(null); setRemoving(null); onChanged() }
  return <section className="mt-6 border-t border-base-300 pt-4" aria-label={t('Subtareas y dependencias')}>
    <header className="mb-3 flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">{t('Subtareas y dependencias')}</h3><IconButton label={t('Actualizar relaciones de la tarea')} disabled={loading || busy || mutation.busy} onClick={onRetry}><RefreshCw size={15}/></IconButton></header>
    {loading || error || !relations ? <DataMessage loading={loading} error={t(error)} onRetry={onRetry}/> : <>
      {!fresh && <p role="status" className="mb-3 text-xs text-warning">{t('La tarea cambió. Actualiza el detalle para gestionar sus relaciones.')}</p>}
      {relations.parent && <div className="mb-5"><h4 className="flex items-center gap-2 text-xs text-base-content/50"><ChevronUp size={14}/>{t('Tarea principal')}</h4><TaskRelationList items={[relations.parent]} onOpen={onOpen}/></div>}
      <div className="mb-5">
        <header className="flex flex-wrap items-center gap-2"><h4 className="flex flex-1 items-center gap-2 text-sm font-medium"><ListTree size={15}/>{t('Subtareas')}<span className="text-xs tabular-nums text-base-content/45">{relations.subtasks_completed}/{relations.subtasks_total}</span></h4>{editable && <><IconButton label={t('Vincular subtarea existente')} onClick={() => setLinking('subtask')}><Link size={15}/></IconButton>{task.lifecycle !== 'completed' && <IconButton label={t('Crear subtarea')} onClick={() => navigate(`/tasks/new?${new URLSearchParams({ parent:task.id,returnTo:location.pathname + location.search })}`)}><Plus size={15}/></IconButton>}</>}</header>
        {relations.subtasks_total > 0 && <progress className="progress progress-primary mt-2 h-1.5 w-full" value={relations.subtasks_completed} max={relations.subtasks_total} aria-label={t('Progreso de subtareas')}/>}
        {relations.subtasks.length ? <TaskRelationList items={relations.subtasks} onOpen={onOpen} busy={mutation.busy} onRemove={editable ? target => setRemoving({ target, operation: 'detach' }) : undefined}/> : <p className="mt-3 text-xs text-base-content/45">{t(relations.subtasks_total > 0 ? 'Hay subtareas fuera de tu alcance de lectura.' : 'Sin subtareas.')}</p>}
        {relations.unfinished_subtasks > 0 && <p className="mt-2 text-xs leading-relaxed text-base-content/55">{t('Puedes iniciar la tarea principal, pero debes completar todas sus subtareas antes de finalizarla.')}</p>}
      </div>
      <div className="mb-5"><header className="flex items-center justify-between gap-2"><h4 className="flex items-center gap-2 text-sm font-medium"><LockKeyhole size={15}/>{t('Bloqueada por')}{relations.blocking_count > 0 && <span className="text-xs text-warning">{relations.blocking_count}</span>}</h4>{editable && task.lifecycle === 'pending' && <IconButton label={t('Agregar requisito previo')} onClick={() => setLinking('prerequisite')}><Plus size={15}/></IconButton>}</header>
        {relations.blocked_by.length ? <TaskRelationList items={relations.blocked_by} onOpen={onOpen} busy={mutation.busy} onRemove={editable ? target => setRemoving({ target, operation: 'remove_dependency' }) : undefined}/> : <p className="mt-3 text-xs text-base-content/45">{t(relations.blocking_count > 0 ? 'Hay requisitos pendientes fuera de tu alcance de lectura.' : 'Sin requisitos previos pendientes.')}</p>}
        {relations.blocking_count > 0 && <p className="mt-2 text-xs leading-relaxed text-warning">{t('Completa los requisitos previos antes de tomar esta tarea.')}</p>}
      </div>
      <div><header className="flex items-center justify-between gap-2"><h4 className="flex items-center gap-2 text-sm font-medium"><GitBranch size={15}/>{t('Esta tarea bloquea a')}</h4>{editable&&<IconButton label={t('Agregar tarea a bloquear')} onClick={()=>setLinking('dependent')}><Plus size={15}/></IconButton>}</header>{relations.blocks.length ? <TaskRelationList items={relations.blocks} onOpen={onOpen} busy={mutation.busy} onRemove={editable ? target => setRemoving({ target, operation: 'remove_dependency' }) : undefined}/> : <p className="mt-3 text-xs text-base-content/45">{t('No hay tareas dependientes visibles.')}</p>}</div>
      {linking && <LinkTaskRelationModal task={task} relations={relations} kind={linking} onClose={() => setLinking(null)} onChanged={changed}/>}
      {removing && <IntegrationDialog title={t('Desvincular tarea')} onClose={() => { if (!mutation.busy) setRemoving(null) }} busy={mutation.busy}><p className="text-sm leading-relaxed text-base-content/65">{t(removing.operation === 'detach' ? 'Se quitará la relación con esta subtarea. La tarea conservará su historial y seguirá en el pool.' : 'Se retirará este requisito previo. La otra tarea conservará su historial y seguirá en el pool.')}</p><p className="mt-3 break-words text-sm font-semibold">{removing.target.title}</p>{mutation.error && <p role="alert" className="mt-4 text-sm text-error">{t(mutation.error)}</p>}<footer className="mt-5 flex justify-end gap-2 border-t border-base-300 pt-4"><TextButton label={t('Cancelar')} disabled={mutation.busy} onClick={() => setRemoving(null)}><X size={16}/></TextButton><TextButton label={t('Desvincular tarea')} variant="primary" disabled={mutation.busy} onClick={() => void mutation.run({ id: task.id, revision: task.revision, removing }, async (signal, key) => { await mutateTaskRelation(task.id, task.revision, removing.target, removing.operation, key, signal); changed() })}><Unlink size={16}/></TextButton></footer></IntegrationDialog>}
    </>}
  </section>
}
