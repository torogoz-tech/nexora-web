import CorrectiveSubtaskFields from './CorrectiveSubtaskFields'
import type {SubtaskWork} from '../types/SubtaskWork'
import TaskGovernanceFields from './TaskGovernanceFields'
import TaskAcceptanceCriteriaEditor from './TaskAcceptanceCriteriaEditor'
import { validTaskAcceptanceCriteria } from '../utils/validTaskAcceptanceCriteria'
import MarkdownEditor from './MarkdownEditor'
import { useState } from 'react'
import { ChevronRight, Plus, RefreshCw, X } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useProjects } from '../hooks/useProjects'
import { useApiData } from '../hooks/useApiData'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { parseTaskPoolOptions } from '../utils/parseTaskPoolOptions'
import { createBoardTask } from '../services/createBoardTask'
import { createSubtask } from '../services/createSubtask'
import Dropdown from './Dropdown'
import IconButton from './IconButton'
import TextButton from './TextButton'
import DataMessage from './DataMessage'
import type { BoardTaskInput } from '../types/BoardTaskInput'
import type { CreateTaskFormProps } from '../types/CreateTaskFormProps'
export default function CreateTaskForm({ onCancel, onCreated, parent, initialProjectId = '', initialTypeCode = '' }: CreateTaskFormProps) {
  const { t } = useTranslation()
  const projects = useProjects(), mutation = useIntegrationMutation()
  const [projectId, setProjectId] = useState(parent?.project_id ?? initialProjectId), [typeCode, setTypeCode] = useState(initialTypeCode), [actorId, setActorId] = useState(''), [title, setTitle] = useState(''), [context, setContext] = useState(''), [priority, setPriority] = useState<BoardTaskInput['priority']>('medium')
  const [knowledgeKind,setKnowledgeKind]=useState<'requirement'|'feature'>('requirement'),[entryWorkflow,setEntryWorkflow]=useState(''),[primaryKnowledge,setPrimaryKnowledge]=useState('')
  const [subtaskWork,setSubtaskWork]=useState<SubtaskWork>({workKind:'decomposition'})
  const [criteria,setCriteria]=useState<string[]>([])
  const [uploading,setUploading]=useState(false)
  const options = useApiData(`/api/v1/tasks/options${projectId ? `?project_id=${encodeURIComponent(projectId)}` : ''}`, parseTaskPoolOptions)
  const types = options.data?.types ?? [], people = options.data?.assignees ?? []
  const selectedType = types.find(type => type.code === (typeCode || types.find(type => type.code === 'task')?.code || types[0]?.code))
  const validSubtask=!parent||subtaskWork.workKind==='decomposition'||!!projectId&&!!subtaskWork.testedRepositoryId&&/^(?:[a-fA-F0-9]{40}|[a-fA-F0-9]{64})$/.test(subtaskWork.testedCommitSha??'')
  const ready = validSubtask && validTaskAcceptanceCriteria(criteria) && new TextEncoder().encode(context.trim()).length <= 8000 && !!title.trim() && !!selectedType && !options.loading && !options.error && !mutation.busy && !uploading && (!actorId || people.some(person => person.actor_id === actorId))
  return <form className="space-y-6" onSubmit={event => {
      event.preventDefault()
      if (!ready || !selectedType) return
      const input: BoardTaskInput = { projectId: projectId || null, assigneeId: actorId || null, title, context, acceptanceCriteria:criteria, typeCode: selectedType.code, priority, subtaskWork:parent?subtaskWork:undefined, entryWorkflowId:selectedType.purpose==='general'?null:entryWorkflow||null, primaryRequirementId:(selectedType.purpose==='product_design'||selectedType.purpose==='general'&&knowledgeKind==='requirement')?primaryKnowledge||null:null, primaryFeatureId:(selectedType.purpose==='implementation'||selectedType.purpose==='general'&&knowledgeKind==='feature')?primaryKnowledge||null:null }
      void mutation.run(input, async (signal, key) => { const created = parent ? await createSubtask(parent, input, key, signal) : await createBoardTask(input, key, signal); onCreated(created.id) })
    }}>
      <header className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-xl font-semibold">{t(parent?'Crear subtarea':'Crear tarea')}</h1>      <div className="flex shrink-0 gap-2"><TextButton type="button" label={t('Cancelar')} disabled={mutation.busy} onClick={onCancel}><X size={16}/></TextButton><TextButton type="submit" label={mutation.busy ? t('Creando tarea…') : t(parent ? 'Crear subtarea' : 'Crear tarea')} variant="primary" disabled={!ready}><Plus size={16}/></TextButton></div></header>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-base-content/60">{t(parent ? 'La subtarea conservará el proyecto de su tarea principal y tendrá su propio responsable y workflow al tomarla.' : 'La tarea quedará pendiente en Tareas. Asignarla reserva el responsable; tomarla inicia su workflow y la muestra en el tablero.')}</p>
        <IconButton type="button" label={t('Actualizar opciones de la tarea')} disabled={mutation.busy} onClick={() => { options.reload(); projects.retry() }}><RefreshCw size={15}/></IconButton>
      </div>
      <fieldset disabled={mutation.busy} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {!parent && <label className="flex min-w-0 flex-col gap-2 text-xs">{t('Proyecto')}<Dropdown label={t('Proyecto de la tarea')} value={projectId} options={[{ value: '', label: t('Sin proyecto') }, ...projects.projects.filter(project => !project.archived).map(project => ({ value: project.id, label: project.name }))]} onChange={value => { setProjectId(value); setTypeCode(''); setActorId(''); setEntryWorkflow(''); setPrimaryKnowledge('') }}/></label>}
          <label className="flex min-w-0 flex-col gap-2 text-xs">{t('Tipo')}<Dropdown label={t('Tipo de tarea')} value={selectedType?.code ?? ''} required disabled={options.loading || !!options.error} options={types.map(type => ({ value: type.code, label: type.name }))} onChange={value=>{setTypeCode(value);setEntryWorkflow('');setPrimaryKnowledge('')}}/></label>
        </div>
        {!parent && projects.hasMore && <IconButton type="button" label={t('Más proyectos para la tarea')} disabled={projects.loadingMore} onClick={() => void projects.loadMore()}><ChevronRight size={16}/></IconButton>}
        {!parent && projects.pageError && <p role="alert" className="text-xs text-error">{t(projects.pageError)}</p>}
        <label className="flex flex-col gap-2 text-xs">{t('Título')}<input className="input w-full" aria-label={t('Título de la tarea')} value={title} onChange={event => setTitle(event.target.value)} required maxLength={256} autoFocus/></label>
        <MarkdownEditor label={t('Contexto de la tarea')} value={context} onChange={setContext} disabled={mutation.busy} onUploadingChange={setUploading}/>
        {parent&&<CorrectiveSubtaskFields value={subtaskWork} onChange={setSubtaskWork} projectId={projectId||null} disabled={mutation.busy}/>}
        <TaskGovernanceFields knowledgeKind={knowledgeKind} onKnowledgeKind={setKnowledgeKind} projectId={projectId} purpose={selectedType?.purpose??'general'} workflow={entryWorkflow} onWorkflow={setEntryWorkflow} knowledge={primaryKnowledge} onKnowledge={setPrimaryKnowledge} options={options.data} assignee={actorId}/>
        <TaskAcceptanceCriteriaEditor value={criteria} onChange={setCriteria} disabled={mutation.busy}/>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex min-w-0 flex-col gap-2 text-xs">{t('Responsable')}<Dropdown label={t('Responsable de la tarea')} value={actorId} disabled={options.loading || !!options.error} options={[{ value: '', label: t('Sin responsable') }, ...people.map(person => ({ value: person.actor_id, label: person.name }))]} onChange={setActorId}/></label>
          <label className="flex min-w-0 flex-col gap-2 text-xs">{t('Prioridad')}<Dropdown label={t('Prioridad de la tarea')} value={priority} options={[{value:'low',label:t('Baja')},{value:'medium',label:t('Media')},{value:'high',label:t('Alta')},{value:'critical',label:t('Crítica')}]} onChange={value => setPriority(value as BoardTaskInput['priority'])}/></label>
        </div>
      </fieldset>
      {!parent && projects.status !== 'ready' && projects.status !== 'loading' && <DataMessage error={t('No pudimos consultar los proyectos disponibles.')} onRetry={projects.retry}/>}
      {options.error && <DataMessage error={t(options.error)} onRetry={options.reload}/>}
      {mutation.error && <p role="alert" className="rounded-xl border border-error/25 p-3 text-sm text-error">{t(mutation.error)}</p>}

    </form>
}
