import TaskTransitionBranchLookup from './TaskTransitionBranchLookup'
import {useLayoutEffect,useRef,useState} from 'react'
import {Plus,Trash2,ChevronLeft,ChevronRight} from 'lucide-react'
import {useApiData} from '../hooks/useApiData'
import {parseRepositoryPage} from '../utils/parseRepositoryPage'
import {useTranslation} from '../hooks/useTranslation'
import type {TaskTransitionBranch} from '../types/TaskTransitionBranch'
import Dropdown from './Dropdown'
import IconButton from './IconButton'
import DataMessage from './DataMessage'
export default function TaskTransitionBranches({taskId,projectId,branches,onChange,disabled}:{taskId:string;projectId:string|null;branches:TaskTransitionBranch[];onChange:(branches:TaskTransitionBranch[])=>void;disabled?:boolean}){
 const {t}=useTranslation(),[cursors,setCursors]=useState<(string|null)[]>([null]),after=cursors.at(-1)
 const data=useApiData(projectId?`/api/v1/projects/${encodeURIComponent(projectId)}/repositories?limit=100${after?`&after=${encodeURIComponent(after)}`:''}`:null,parseRepositoryPage)
 const latest=useRef(branches);useLayoutEffect(()=>{latest.current=branches},[branches])
 const repos=data.data?.items.filter(repo=>repo.authorization_status==='authorized'&&!repo.archived&&repo.source_kind!=='local_snapshot')??[]
 function change(index:number,patch:Partial<TaskTransitionBranch>){onChange(latest.current.map((row,i)=>i===index?{...row,...patch}:row))}
 if(!projectId)return <p role="alert" className="text-xs text-warning">{t('Las acciones de Git requieren vincular la tarea a un proyecto con repositorios autorizados.')}</p>
 return <section className="space-y-3" aria-label={t('Ramas para esta transición')}>
  <header className="flex items-center justify-between gap-2"><h3 className="text-xs font-medium">{t('Ramas para esta transición')}</h3><div className="flex gap-1">{cursors.length>1&&<IconButton label={t('Página anterior')} onClick={()=>setCursors(v=>v.slice(0,-1))}><ChevronLeft size={14}/></IconButton>}{data.data?.next_cursor&&<IconButton label={t('Página siguiente')} onClick={()=>setCursors(v=>[...v,data.data!.next_cursor])}><ChevronRight size={14}/></IconButton>}<IconButton label={t('Agregar rama')} disabled={disabled||branches.length>=8} onClick={()=>onChange([...branches,{repository_id:'',branch_name:'',expected_head_sha:''}])}><Plus size={14}/></IconButton></div></header>
  <DataMessage loading={data.loading} error={t(data.error)} onRetry={data.reload}/>
  {branches.map((branch,index)=><div key={index} className="space-y-2 border-l-2 border-base-300 pl-3"><div className="flex items-end gap-2"><label className="flex min-w-0 flex-1 flex-col gap-1 text-xs">{t('Repositorio')}<Dropdown label={t('Repositorio')} value={branch.repository_id} disabled={disabled} options={[...(branch.repository_id&&!repos.some(r=>r.id===branch.repository_id)?[{value:branch.repository_id,label:branch.repository_id}]:[]),...repos.map(repo=>({value:repo.id,label:repo.remote_full_name??repo.requested_full_name??repo.id}))]} onChange={repository_id=>change(index,{repository_id,expected_head_sha:''})}/></label><IconButton label={t('Quitar rama')} disabled={disabled} onClick={()=>onChange(branches.filter((_,i)=>i!==index))}><Trash2 size={14}/></IconButton></div><div className="grid gap-2 sm:grid-cols-2"><label className="flex min-w-0 flex-col gap-1 text-xs">{t('Rama publicada')}<input className="input input-sm w-full" value={branch.branch_name} maxLength={255} disabled={disabled} onChange={e=>change(index,{branch_name:e.target.value,expected_head_sha:''})}/></label><label className="flex min-w-0 flex-col gap-1 text-xs">{t('Commit esperado')}<input className="input input-sm w-full font-mono" value={branch.expected_head_sha} maxLength={64} disabled={disabled} onChange={e=>change(index,{expected_head_sha:e.target.value.trim()})}/></label></div><TaskTransitionBranchLookup taskId={taskId} branch={branch} disabled={disabled} onChange={expected_head_sha=>change(index,{expected_head_sha})}/></div>)}
  <p className="text-xs leading-relaxed text-base-content/50">{t('Nexora verificará estas ramas y commits en Git antes de avanzar. Si el repositorio cambió, tendrás que revisar la nueva versión.')}</p>
 </section>
}
