import {lazy,Suspense} from 'react'
import {useSearchParams} from 'react-router'
import {ArrowLeft,RefreshCw} from 'lucide-react'
import {useApiData} from '../hooks/useApiData'
import {useTranslation} from '../hooks/useTranslation'
import {parseAnalysisProfileAssignment} from '../utils/parseAnalysisProfileAssignment'
import {parseRepositoryFile} from '../utils/parseRepositoryFile'
import RepositoryFileTree from '../components/RepositoryFileTree'
import Dropdown from '../components/Dropdown'
import RowAction from '../components/RowAction'
import IconButton from '../components/IconButton'
import DataMessage from '../components/DataMessage'
const CodeViewer=lazy(()=>import('../components/MonacoCodeViewer'))
export default function RepositoryFilesPage({projectId,repositoryId}:{projectId:string;repositoryId:string}){
 const {t}=useTranslation(),[params,setParams]=useSearchParams()
 const base=`/api/v1/projects/${encodeURIComponent(projectId)}/repositories/${encodeURIComponent(repositoryId)}`
 const assignment=useApiData(base+'/analysis-profile',parseAnalysisProfileAssignment),report=assignment.data?.last_selection
 const group=params.get('group')??'all',selected=params.get('file')??''
 const paths=report?[...new Set(group==='skipped'?report.skipped_files?.map(f=>f.path)??[]:group==='uncovered'?report.uncovered_files:group==='excluded'?report.excluded_files:group==='decoded'?report.decoded_files?.map(f=>f.path)??[]:group==='all'?[...report.profiles.flatMap(p=>p.files),...report.uncovered_files,...report.excluded_files,...(report.skipped_files?.map(f=>f.path)??[])]:report.profiles.find(p=>p.id===group)?.files??[])]:[]
 const commit=assignment.data?.last_source_commit
 const file=useApiData(selected&&paths.includes(selected)&&commit?base+'/file?'+new URLSearchParams({path:selected,commit}):null,parseRepositoryFile)
 const returnTo=params.get('returnTo')
 const back=returnTo?.startsWith('/code/')&&!returnTo.startsWith('//')?returnTo:`/code/repositories/${projectId}/${repositoryId}`
 const change=(key:string,value:string)=>{const next=new URLSearchParams(params);next.set(key,value);if(key==='group')next.delete('file');setParams(next,{replace:true})}
 const warning=report?.skipped_files?.find(f=>f.path===selected)?.reason
 const extension=selected.split('.').at(-1)??''
 const language=({cs:'csharp',ts:'typescript',tsx:'typescript',js:'javascript',jsx:'javascript',css:'css',html:'html',json:'json',md:'markdown',rs:'rust',py:'python',razor:'html'} as Record<string,string>)[extension]??'plaintext'
 return <section className="min-w-0 flex-1"><header className="mb-5 flex items-center justify-between gap-3"><RowAction to={back} label={t('Volver')}><ArrowLeft size={16}/></RowAction><h1 className="flex-1 text-xl font-semibold">{t('Archivos del análisis')}</h1><IconButton label={t('Actualizar repositorio')} onClick={()=>{assignment.reload();file.reload()}}><RefreshCw size={16}/></IconButton></header>{assignment.loading||assignment.error?<DataMessage loading={assignment.loading} error={t(assignment.error)} onRetry={assignment.reload}/>:<><Dropdown label={t('Filtrar archivos')} value={group} options={[{value:'all',label:t('Todos los archivos')},...(report?.profiles.map(p=>({value:p.id,label:p.name}))??[]),{value:'skipped',label:t('Archivos con observaciones')},{value:'uncovered',label:t('Archivos sin perfil compatible')},{value:'excluded',label:t('Archivos excluidos')},{value:'decoded',label:t('Archivos con codificación convertida')}]} onChange={v=>change('group',v)}/><div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]"><aside className="max-h-[65dvh] overflow-y-auto border-r border-base-300 pr-3" aria-label={t('Árbol de archivos')}><RepositoryFileTree paths={paths} selected={selected} onSelect={p=>change('file',p)}/>{!paths.length&&<p className="text-sm text-base-content/50">{t('Sin archivos')}</p>}</aside><section className="min-w-0"><h2 className="mb-3 break-all font-mono text-sm">{selected}</h2>{warning&&<p className="mb-4 text-xs text-warning">{warning}</p>}{!selected?<p className="text-sm text-base-content/50">{t('Selecciona un archivo para ver su código.')}</p>:!commit?<DataMessage message={t('Actualiza el análisis para consultar su código.')}/>:file.loading||file.error?<DataMessage loading={file.loading} error={t(file.error)} onRetry={file.reload}/>:file.data?.content!==null&&file.data?<div className="[&>div]:h-[65dvh]"><Suspense fallback={<DataMessage loading/>}><CodeViewer key={selected} code={file.data.content} language={language} label={selected}/></Suspense></div>:<p className="text-sm text-base-content/55">{file.data?.warning??t('No podemos visualizar este archivo como texto.')}</p>}{commit&&<p className="mt-3 break-all font-mono text-xs text-base-content/40">{commit}</p>}</section></div></>}</section>
}
