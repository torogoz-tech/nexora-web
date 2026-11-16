import {useState} from 'react'
import IconButton from './IconButton'
import TaskKnowledgeLinkModal from './TaskKnowledgeLinkModal'
import type {TaskDetails} from '../types/TaskDetails'
import { Link } from 'react-router'
import { ClipboardList, Layers, Plus } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import type { TaskKnowledge } from '../types/TaskKnowledge'
export default function TaskKnowledgePanel({ knowledge, projectId, task, canManage=false, canLinkRequirements=canManage, onChanged }: { knowledge?: TaskKnowledge; projectId: string | null; task?:TaskDetails; canManage?:boolean; canLinkRequirements?:boolean; onChanged?:()=>void }) {
  const { t } = useTranslation(),[linking,setLinking]=useState<'feature'|'requirement'|null>(null)
  const features=knowledge?.features??(knowledge?.feature?[knowledge.feature]:[])
  const article = (document: TaskKnowledge['documents'][number]) => `${document.kind === 'requirement' ? '/knowledge/requirements' : document.kind === 'business_rule' ? '/knowledge/rules' : document.kind === 'decision' ? '/knowledge/decisions' : '/knowledge'}?${new URLSearchParams({ project: projectId!, article: document.id })}`
  return <section className="mt-8 border-t border-base-300 pt-5" aria-label={t('Funcionalidad y requerimientos')}><h2 className="mb-4 text-base font-semibold">{t('Funcionalidad y requerimientos')}</h2>
    {!projectId ? <p className="text-sm text-base-content/50">{t('Esta tarea no está vinculada a un proyecto.')}</p> : !knowledge ? <p className="text-sm text-base-content/50">{t('La información de trazabilidad no está disponible.')}</p> : !knowledge.can_read ? <p className="text-sm text-base-content/50">{t('No tienes permiso para consultar el conocimiento relacionado.')}</p> : <div className="space-y-5">
      <div><h3 className="mb-2 flex items-center gap-2 text-sm font-medium"><Layers size={16}/>{t('Funcionalidad')}{canManage&&<IconButton label={t('Vincular funcionalidad')} onClick={()=>setLinking('feature')}><Plus size={15}/></IconButton>}</h3>{features.length ? features.map(feature=><Link key={feature.id} className={`mb-2 block text-sm hover:underline ${feature.archived ? 'text-base-content/45 line-through' : 'text-primary'}`} to={`/knowledge/features?${new URLSearchParams({project:projectId,q:feature.name})}`}>{feature.name}</Link>) : <p className="text-sm text-base-content/45">{t('Sin funcionalidad vinculada.')}</p>}</div>
      <div><h3 className="mb-2 flex items-center gap-2 text-sm font-medium"><ClipboardList size={16}/>{t('Requerimientos y documentos')}{canLinkRequirements&&<IconButton label={t('Vincular requerimiento')} onClick={()=>setLinking('requirement')}><Plus size={15}/></IconButton>}</h3>{knowledge.documents.length ? <ul className="space-y-2">{knowledge.documents.map(d => <li key={`${d.id}:${d.version_id}:${d.relation}`}><Link className="break-words text-sm text-primary hover:underline" to={article(d)}>{d.title}</Link></li>)}</ul> : <p className="text-sm text-base-content/45">{t('Sin requerimientos o documentos vinculados.')}</p>}{knowledge.has_more && <Link className="mt-3 inline-block text-sm text-primary hover:underline" to={`/knowledge/requirements?${new URLSearchParams({project:projectId})}`}>{t('Consultar más documentos del proyecto')}</Link>}</div>
    </div>}
    {linking&&task&&<TaskKnowledgeLinkModal task={task} kind={linking} onClose={()=>setLinking(null)} onChanged={()=>{setLinking(null);onChanged?.()}}/>}
  </section>
}
