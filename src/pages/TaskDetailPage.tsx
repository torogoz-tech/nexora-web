import LinkedServiceRequests from '../components/LinkedServiceRequests'
import TaskWorkflowMigrationModal from '../components/TaskWorkflowMigrationModal'
import TaskCommitReferences from '../components/TaskCommitReferences'
import TaskReleaseExecution from '../components/TaskReleaseExecution'
import TaskStageHistory from '../components/TaskStageHistory'
import TaskTransitionBranches from '../components/TaskTransitionBranches'
import type {TaskTransitionBranch} from '../types/TaskTransitionBranch'
import TaskTransitionRuns from '../components/TaskTransitionRuns'
import TakeTaskWorkflowModal from '../components/TakeTaskWorkflowModal'
import TaskSectionNavigation from '../components/TaskSectionNavigation'
import TaskDocuments from '../components/TaskDocuments'
import TaskComments from '../components/TaskComments'
import TaskHistoryDialog from '../components/TaskHistoryDialog'
import TaskPeopleMetadata from '../components/TaskPeopleMetadata'
import ChangeTaskProjectModal from '../components/ChangeTaskProjectModal'
import TaskMetadataEditor from '../components/TaskMetadataEditor'
import TaskTypeBadge from '../components/TaskTypeBadge'
import TaskWorkflowTimeline from '../components/TaskWorkflowTimeline'
import TaskWorkLogs from '../components/TaskWorkLogs'
import WikiMarkdown from '../components/WikiMarkdown'
import { useContext, useState } from 'react'
import { ArrowLeft, Play, Pause, Archive, UserRoundCog, UserRoundPlus, RefreshCw, Pencil, FolderInput, History } from 'lucide-react'
import { workflowGuardOptions } from '../app/workflowGuardOptions'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { parseTaskDetails } from '../utils/parseTaskDetails'
import { parseWorkflowVersion } from '../utils/parseWorkflowVersion'
import { taskPoolActions } from '../utils/taskPoolActions'
import { mutatePoolTask } from '../services/mutatePoolTask'
import { transitionPoolTask } from '../services/transitionPoolTask'
import DataMessage from '../components/DataMessage'
import Dropdown from '../components/Dropdown'
import ReassignDeveloperTaskModal from '../components/ReassignDeveloperTaskModal'
import { parseTaskRelations } from '../utils/parseTaskRelations'
import { taskRelationRestrictions } from '../utils/taskRelationRestrictions'
import TaskRelationsPanel from '../components/TaskRelationsPanel'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { taskDetailPath } from '../utils/taskDetailPath'
import { taskReturnPath } from '../utils/taskReturnPath'
import RowAction from '../components/RowAction'
import IconButton from '../components/IconButton'
import TaskKnowledgePanel from '../components/TaskKnowledgePanel'
import type { TaskRelationSummary } from '../types/TaskRelationSummary'
export default function TaskDetailPage({ id }: { id: string }) {
  const navigate = useNavigate(), location = useLocation(), [params] = useSearchParams()
  const returnTo = taskReturnPath(params.get('returnTo'))
  const onOpen = (related: TaskRelationSummary) => navigate(taskDetailPath(related.id, location.pathname + location.search))
  const { t } = useTranslation(), { session } = useAuth(), permissions = useContext(WorkspacePermissionsContext), mutation = useIntegrationMutation()
  const [branches,setBranches]=useState<TaskTransitionBranch[]>([])
  const [migrating,setMigrating]=useState(false)
  const [taking,setTaking]=useState(false)
  const [historyOpen,setHistoryOpen]=useState(false)
  const [changingProject,setChangingProject]=useState(false)
  const [assigning, setAssigning] = useState(false), [transitionId, setTransitionId] = useState(''), [reason, setReason] = useState(''), [resolution, setResolution] = useState('')
  const [editingMetadata,setEditingMetadata]=useState(false)
  const data = useApiData(`/api/v1/tasks/${encodeURIComponent(id)}`, parseTaskDetails)
  const current = data.data
  const relations = useApiData(`/api/v1/tasks/${encodeURIComponent(id)}/relations`, parseTaskRelations)
  const restrictions = taskRelationRestrictions(relations.data, current?.revision ?? 0)
  const version = useApiData(current?.workflow_id && current.workflow_version_id ? `/api/v1/workflows/${encodeURIComponent(current.workflow_id)}/versions/${encodeURIComponent(current.workflow_version_id)}` : null, parseWorkflowVersion)
  const invalid = current && current.id !== id
  const liveTask = { id, project_id: current?.project_id ?? null, project_name: current?.project_name ?? null, title: current?.title ?? '', lifecycle: current?.lifecycle ?? 'pending', assignee_id: current?.assignee_id ?? null, workflow_version_id: current?.workflow_version_id ?? null, state_id: current?.state_id ?? null, priority: current?.priority ?? 'medium', blocked: current?.blocked ?? false, revision: current?.revision ?? 0, created_by: current?.created_by, purpose:current?.purpose,entry_workflow_id:current?.entry_workflow_id }
  const actions = current?.archived ? {reserve:false,take:false,assign:false,transition:false,pause:false,resume:false,completeGeneral:false,archive:false} : taskPoolActions(liveTask, session?.actorId, permissions?.role ?? null, permissions?.grants ?? [])
  const outgoing = version.data?.graph.transitions.filter(transition => transition.from === current?.state_id && !transition.automatic) ?? []
  const selected = outgoing.find(transition => transition.id === transitionId)
  const gitRequired=!!selected && (selected.steps?.some(step=>step.kind!=='advance_state'&&step.kind!=='notify'&&step.kind!=='require_approval'&&step.kind!=='handoff') || !!version.data?.graph.states.find(state=>state.id===selected.to)?.required_base_branch || !!version.data?.graph.states.find(state=>state.id===selected.from)?.required_base_branch)
  const invalidBranches=gitRequired&&(!current?.project_id||!branches.length||branches.some(branch=>!branch.repository_id||!branch.branch_name||!/^([a-fA-F0-9]{40}|[a-fA-F0-9]{64})$/.test(branch.expected_head_sha)))
  const terminal = selected && version.data?.graph.states.some(state => state.id === selected.to && state.terminal)
  const terminalBlocked = !!terminal && restrictions.complete
  const releasePipeline=version.data?.graph.transitions.find(edge=>edge.automatic&&edge.from===current?.state_id&&edge.steps?.some(step=>step.kind==='publish_release'))
  const canTransition = actions.transition
  const changed = () => { data.reload(); relations.reload(); window.dispatchEvent(new CustomEvent('nexora:invalidate',{detail:{projectId:null,topics:['tasks']}})); setTransitionId(''); setReason(''); setResolution('') }
  return <div className="flex min-w-0 items-start gap-3 sm:gap-5"><TaskSectionNavigation/><section className="min-w-0 flex-1" aria-label={t('Detalle de tarea')}>
    <header className="mb-7"><div className="flex justify-between gap-3"><RowAction to={returnTo} label={t('Volver')}><ArrowLeft size={16}/></RowAction><div className="flex flex-wrap items-center justify-end gap-2">{current&&!invalid&&(<><div id="task-actions" className="flex flex-wrap items-center gap-2">
        {actions.reserve && <IconButton label={t('Asignarme sin iniciar')} disabled={mutation.busy} onClick={() => void mutation.run({ task: id, revision: current.revision, operation: 'reserve' }, async (signal, key) => { await mutatePoolTask(liveTask, 'reserve', session!.actorId, key, signal); changed() })}><UserRoundPlus size={16}/></IconButton>}
        {(current.lifecycle==='pending'||current.lifecycle==='active'&&!current.assignee_id) && !current.archived && <IconButton label={t('Tomar tarea e iniciar workflow')} hint={!actions.take?t(current.assignee_id&&current.assignee_id!==session?.actorId?'Esta tarea está reservada para otra persona.':'Solo puedes iniciar tareas disponibles para ti.'):undefined} disabled={!actions.take || mutation.busy || restrictions.take} onClick={() => current.purpose!=='general'?setTaking(true):void mutation.run({ task: id, revision: current.revision, operation: 'take' }, async (signal, key) => { await mutatePoolTask(liveTask, 'take', session!.actorId, key, signal); changed() })}><Play size={16}/></IconButton>}
        {actions.pause && <IconButton label={t('Pausar tarea')} disabled={mutation.busy} onClick={()=>void mutation.run({task:id,revision:current.revision,operation:'pause'},async(signal,key)=>{await mutatePoolTask(liveTask,'pause',session!.actorId,key,signal);changed()})}><Pause size={16}/></IconButton>}
        {actions.resume && <IconButton label={t('Retomar tarea')} disabled={mutation.busy||restrictions.take} onClick={()=>void mutation.run({task:id,revision:current.revision,operation:'resume'},async(signal,key)=>{await mutatePoolTask(liveTask,'resume',session!.actorId,key,signal);changed()})}><Play size={16}/></IconButton>}
        {actions.completeGeneral && <button className="btn btn-sm btn-primary" disabled={mutation.busy||restrictions.take} onClick={()=>void mutation.run({task:id,revision:current.revision,operation:'complete-general'},async(signal,key)=>{await mutatePoolTask(liveTask,'complete-general',session!.actorId,key,signal);changed()})}>{t('Completar tarea general')}</button>}
        {actions.archive && <IconButton label={t('Archivar tarea')} disabled={mutation.busy} onClick={()=>void mutation.run({task:id,revision:current.revision,operation:'archive'},async(signal,key)=>{await mutatePoolTask(liveTask,'archive',session!.actorId,key,signal);changed()})}><Archive size={16}/></IconButton>}
        {actions.assign && <IconButton label={t('Cambiar proyecto')} disabled={mutation.busy||editingMetadata} onClick={()=>setChangingProject(true)}><FolderInput size={16}/></IconButton>}
        {actions.assign && <IconButton label={t('Cambiar responsable')} disabled={mutation.busy} onClick={() => setAssigning(true)}><UserRoundCog size={16}/></IconButton>}
      {canTransition&&selected&&<IconButton type="submit" form="task-transition" label={t('Avanzar tarea')} disabled={mutation.busy||terminalBlocked||invalidBranches}><Play size={16}/></IconButton>}</div></>)}{current&&!invalid&&actions.assign&&current.workflow_version_id&&current.lifecycle!=='completed'&&!current.archived&&<IconButton label={t('Actualizar versión del workflow')} onClick={()=>setMigrating(true)}><RefreshCw size={16}/></IconButton>}{current&&!invalid&&actions.assign&&<IconButton label={t('Editar tarea')} disabled={mutation.busy||editingMetadata} onClick={()=>{setEditingMetadata(true)}}><Pencil size={16}/></IconButton>}{current&&!invalid&&<IconButton label={t('Historial de la tarea')} onClick={()=>setHistoryOpen(true)}><History size={16}/></IconButton>}<IconButton label={t('Actualizar tarea')} disabled={mutation.busy || data.loading} onClick={() => { data.reload(); relations.reload(); version.reload() }}><RefreshCw size={16}/></IconButton></div></div><h1 className="mt-4 break-words text-xl font-semibold">{!invalid && current ? current.title : t('Detalle de tarea')}</h1>{current&&!invalid&&<p className="mt-2 text-xs text-base-content/45">{t('Revisión {0}',{'0':current.revision})}</p>}</header>
    {data.loading || data.error || invalid ? <DataMessage loading={data.loading} error={invalid ? t('El detalle no corresponde a esta tarea.') : t(data.error)} onRetry={data.reload}/> : current && <>
      {editingMetadata&&<TaskMetadataEditor key={current.revision} task={current} onClose={()=>setEditingMetadata(false)} onChanged={()=>{setEditingMetadata(false);changed()}}/>}
      <dl id="task-metadata" tabIndex={-1} className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6  text-sm sm:grid-cols-2">
        <div><dt className="text-base-content/40">{t('Estado')}</dt><dd className="mt-1">{current.lifecycle === 'pending' ? t('Pendiente') : current.lifecycle === 'paused' ? t('En pausa') : current.lifecycle === 'completed' ? t('Completada') : !current.assignee_id ? t('Lista para iniciar la siguiente etapa') : version.data?.graph.states.find(state => state.id === current.state_id)?.name ?? current.state_id}</dd></div>
        <TaskPeopleMetadata task={current}/>
        <div><dt className="text-base-content/40">{t('Prioridad')}</dt><dd className="mt-1">{t(({low:'Baja',medium:'Media',high:'Alta',critical:'Crítica'})[current.priority ?? 'medium'])}</dd></div>
        <div><dt className="text-base-content/40">{t('Tipo')}</dt><dd className="mt-1"><TaskTypeBadge code={current.type_code??''} name={current.type_name} projectId={current.project_id}/></dd></div>
        <div><dt className="text-base-content/40">{t('Proyecto')}</dt><dd className="mt-1">{current.project_id?<Link className="hover:underline" to={`/settings/projects/${encodeURIComponent(current.project_id)}`}>{current.project_name??current.project_id}</Link>:t('Sin proyecto')}</dd></div>
      </dl>

      <section id="task-context" tabIndex={-1} className="mt-6 scroll-mt-5 border-t border-base-300 pt-5"><header className="mb-3 flex items-center justify-between gap-2"><h2 className="text-sm font-medium">{t('Contexto y evidencia')}</h2></header>{current.context?<WikiMarkdown text={current.context} allowImages/>:<p className="text-xs text-base-content/45">{t('Sin contexto ni evidencia todavía.')}</p>}</section>
      {current.archived && <p className="mt-4 text-sm text-base-content/55">{t('Archivada')}</p>}
      {current.lifecycle === 'pending' && <p className="mt-4 text-xs text-base-content/55">{t('Asignar reserva el responsable. Tomar inicia el workflow seleccionado en la tarea.')}</p>}

      {actions.take && restrictions.take && <p role="status" className="mt-3 text-xs text-base-content/55">{t(relations.data && !relations.data.can_take ? 'La tarea está bloqueada. Revisa sus requisitos antes de iniciarla.' : 'Verifica las relaciones de la tarea antes de iniciarla.')}</p>}
      {canTransition && <form id="task-transition" className="mt-5 space-y-4 border-t border-base-300 pt-4" onSubmit={event => { event.preventDefault(); if (!selected || terminalBlocked || invalidBranches) return; void mutation.run({ id: current.id, revision: current.revision, transitionId, reason, resolution, branches }, async (signal, key) => { try { await transitionPoolTask(current, selected.id, reason, resolution, key, signal, gitRequired?branches:[]); changed() } finally { window.dispatchEvent(new CustomEvent('nexora:invalidate',{detail:{projectId:null,topics:['tasks']}})) } }) }}>
        {version.error && <DataMessage error={t(version.error)} onRetry={version.reload}/>}
        <label className="flex flex-col gap-2 text-xs">{t('Avanzar tarea')}<Dropdown label={t('Transición del workflow')} value={transitionId} onChange={value=>{setTransitionId(value);setBranches([])}} disabled={mutation.busy || version.loading} options={outgoing.map(transition => ({ value: transition.id, label: t('Ir a {0}', { '0': version.data?.graph.states.find(state => state.id === transition.to)?.name ?? transition.to }) }))} placeholder={t('Selecciona una transición')}/></label>
        {selected && <>
          {gitRequired&&<TaskTransitionBranches taskId={id} projectId={current.project_id} branches={branches} onChange={setBranches} disabled={mutation.busy}/> }
          {selected.guards.length > 0 && <p className="text-xs text-base-content/60">{t('Condiciones del workflow')}: {selected.guards.map(guard => guard.kind === 'required_field' ? `${t('Campo obligatorio')}: ${guard.field}` : t(workflowGuardOptions.find(option => option.value === guard.kind)?.label ?? guard.kind)).join(' · ')}</p>}
          <label className="flex flex-col gap-2 text-xs">{t('Motivo')}<textarea className="textarea w-full" value={reason} onChange={event => setReason(event.target.value)} required={selected.guards.some(guard => guard.kind === 'reason')} disabled={mutation.busy} maxLength={1000}/></label>
          <label className="flex flex-col gap-2 text-xs">{t('Resolución')}<textarea className="textarea w-full" value={resolution} onChange={event => setResolution(event.target.value)} required={selected.guards.some(guard => guard.kind === 'resolution')} disabled={mutation.busy} maxLength={8000}/></label>
          {terminalBlocked && <p role="status" className="text-xs text-warning">{t(relations.data?.unfinished_subtasks ? 'Completa todas las subtareas antes de finalizar la tarea principal.' : 'Actualiza las relaciones antes de finalizar esta tarea.')}</p>}

        </>}
      </form>}
      {current.resolution && <section className="mt-8 border-t border-base-300 pt-5"><h2 className="mb-3 font-semibold">{t('Resolución')}</h2><p className="whitespace-pre-wrap break-words text-sm text-base-content/65">{current.resolution}</p></section>}
      {!!current.acceptance_criteria?.length&&<section id="task-acceptance-criteria" className="mt-6 border-t border-base-300 pt-5"><h2 className="mb-3 text-sm font-medium">{t('Criterios de aceptación')}</h2><ol className="list-decimal space-y-3 pl-5">{current.acceptance_criteria.map((criterion,index)=><li key={index}><WikiMarkdown text={criterion}/></li>)}</ol></section>}
      <div id="task-time" tabIndex={-1} className="scroll-mt-5"><TaskTransitionRuns key={`${id}:runs:${current.revision}`} taskId={id} projectId={current.project_id} canRetry={!!permissions?.grants.some(grant=>grant.capability==='tasks:transition'&&(grant.project_id===null||grant.project_id===current.project_id))} onChanged={changed}/>{releasePipeline&&current.lifecycle==='active'&&!current.archived&&<TaskReleaseExecution task={current} transitionId={releasePipeline.id} onChanged={changed}/>}<TaskCommitReferences task={current} canManage={actions.assign} onChanged={changed}/><TaskWorkLogs taskId={id} archived={current.archived}/><TaskStageHistory key={`${id}:stages:${current.revision}`} taskId={id} completed={current.lifecycle==='completed'} currentTerminal={!!version.data?.graph.states.some(state=>state.id===current.state_id&&state.terminal)}/><TaskWorkflowTimeline key={`${id}:${current.revision}`} taskId={id} workflowId={current.workflow_id} workflowVersionId={current.workflow_version_id}/></div><div id="task-knowledge" tabIndex={-1} className="scroll-mt-5"><TaskKnowledgePanel knowledge={current.knowledge} projectId={current.project_id} task={current} canManage={actions.assign&&current.knowledge?.can_read} canLinkRequirements={actions.assign&&permissions?.grants.some(grant=>grant.capability==='documents:write'&&(grant.project_id===null||grant.project_id===current.project_id))} onChanged={changed}/></div>
      <div id="task-relations" tabIndex={-1} className="scroll-mt-5"><TaskRelationsPanel task={current} relations={relations.data} loading={relations.loading} error={relations.error} busy={mutation.busy} onRetry={() => { data.reload(); relations.reload() }} onChanged={changed} onOpen={onOpen}/></div>
      <div id="task-documents" tabIndex={-1} className="scroll-mt-5"><TaskDocuments taskId={id} projectId={current.project_id} canUpload={!current.archived}/></div>
      <LinkedServiceRequests kind="task" target={id}/><div id="task-comments" tabIndex={-1} className="scroll-mt-5"><TaskComments taskId={id} archived={current.archived}/></div>
      {mutation.error && <p role="alert" className="mt-4 rounded-xl border border-error/25 p-3 text-sm text-error">{t(mutation.error)}</p>}
    </>}
    {migrating&&current&&<TaskWorkflowMigrationModal task={current} onClose={()=>setMigrating(false)} onChanged={()=>{setMigrating(false);changed()}}/>}
    {taking&&current&&session&&<TakeTaskWorkflowModal task={liveTask} actorId={session.actorId} onClose={()=>setTaking(false)} onChanged={()=>{setTaking(false);changed()}}/>}
    {historyOpen&&<TaskHistoryDialog taskId={id} onClose={()=>setHistoryOpen(false)}/>}
    {changingProject&&current&&<ChangeTaskProjectModal task={current} onClose={()=>setChangingProject(false)} onChanged={()=>{setChangingProject(false);changed()}}/>}
    {assigning && current && <ReassignDeveloperTaskModal task={liveTask} workflowId={current.workflow_id ?? ''} onClose={() => setAssigning(false)} onChanged={() => { setAssigning(false); changed() }}/>}
  </section></div>
}
