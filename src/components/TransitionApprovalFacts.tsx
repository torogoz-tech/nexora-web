import {useTranslation} from '../hooks/useTranslation'
import type {TaskTransitionRun} from '../types/TaskTransitionRun'
export default function TransitionApprovalFacts({run}:{run:TaskTransitionRun}){
 const {t}=useTranslation(),branches=Array.isArray(run.parameters.branches)?run.parameters.branches:[]
 return <div className="space-y-2 rounded-lg bg-base-200 p-3 text-xs">
  <p>{t('Revisa los datos de esta solicitud antes de aprobar. El permiso solo se aplica a esta versión y estos commits.')}</p>
  <dl className="space-y-1"><div><dt className="font-medium">{t('Transición')}</dt><dd className="break-all">{run.transition_id}</dd></div><div><dt className="font-medium">{t('Revisión')}</dt><dd>{run.task_revision}</dd></div>{['reason','resolution'].map(key=>typeof run.parameters[key]==='string'&&run.parameters[key]&&<div key={key}><dt className="font-medium">{t(key==='reason'?'Motivo de la solicitud':'Resolución')}</dt><dd className="whitespace-pre-wrap break-words">{String(run.parameters[key])}</dd></div>)}</dl>
  {branches.map((value,index)=>{if(!value||typeof value!=='object')return null;const branch=value as Record<string,unknown>;return <div key={index} className="min-w-0 border-l-2 border-base-300 pl-2"><p className="break-all">{t('Repositorio')}: {String(branch.repository_id??'')}</p><p className="break-all">{t('Rama publicada')}: {String(branch.branch_name??'')}</p><p className="break-all font-mono">{String(branch.expected_head_sha??'')}</p></div>})}
 </div>
}
