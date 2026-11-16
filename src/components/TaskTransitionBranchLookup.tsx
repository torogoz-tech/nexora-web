import {useEffect,useLayoutEffect,useRef,useState} from 'react'
import {RefreshCw} from 'lucide-react'
import {apiFetch} from '../services/apiFetch'
import {requireRecord} from '../utils/requireRecord'
import {useTranslation} from '../hooks/useTranslation'
import {validGitBranch} from '../utils/validGitBranch'
import type {TaskTransitionBranch} from '../types/TaskTransitionBranch'
import IconButton from './IconButton'
export default function TaskTransitionBranchLookup({taskId,branch,disabled,onChange}:{taskId:string;branch:TaskTransitionBranch;disabled?:boolean;onChange:(sha:string)=>void}){
 const {t}=useTranslation(),[busy,setBusy]=useState(false),[error,setError]=useState(''),pending=useRef<AbortController|null>(null),latest=useRef(branch)
 useLayoutEffect(()=>{latest.current=branch},[branch])
 useEffect(()=>()=>pending.current?.abort(),[])
 async function lookup(){
  if(busy||!branch.repository_id||!validGitBranch(branch.branch_name))return
  const controller=new AbortController();pending.current=controller;setBusy(true);setError('')
  try{
   const path=branch.branch_name.split('/').map(encodeURIComponent).join('/')
   const response=await apiFetch(`/api/v1/tasks/${encodeURIComponent(taskId)}/transition-repositories/${encodeURIComponent(branch.repository_id)}/branches/${path}`,{signal:controller.signal})
   if(!response.ok)throw Error(response.status===404?'La rama no existe en el repositorio. Publícala en Git y vuelve a consultar.':'No pudimos verificar la rama. Revisa el acceso al repositorio.')
   const value=requireRecord(await response.json())
   if(value.repository_id!==branch.repository_id||value.branch_name!==branch.branch_name||typeof value.expected_head_sha!=='string'||!/^([a-fA-F0-9]{40}|[a-fA-F0-9]{64})$/.test(value.expected_head_sha))throw Error('La respuesta de Git no corresponde a esta rama.')
   if(!controller.signal.aborted&&latest.current.repository_id===branch.repository_id&&latest.current.branch_name===branch.branch_name)onChange(value.expected_head_sha)
  }catch(failure){if(!controller.signal.aborted)setError(failure instanceof Error?failure.message:'No pudimos verificar la rama. Revisa el acceso al repositorio.')}
  finally{if(!controller.signal.aborted){setBusy(false);pending.current=null}}
 }
 return <div><IconButton label={t('Consultar commit en Git')} disabled={disabled||busy||!branch.repository_id||!validGitBranch(branch.branch_name)} aria-busy={busy} onClick={()=>void lookup()}><RefreshCw size={14}/></IconButton>{error&&<p role="alert" className="mt-2 text-xs text-error">{t(error)}</p>}</div>
}
