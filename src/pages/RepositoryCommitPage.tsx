import {useState} from 'react'
import {ArrowLeft,GitCommitHorizontal} from 'lucide-react'
import {useTranslation} from '../hooks/useTranslation'
import {useApiData} from '../hooks/useApiData'
import {parseRepositoryCommit} from '../utils/parseRepositoryCommit'
import CodeViewer from '../components/CodeViewer'
import Pagination from '../components/Pagination'
import RowAction from '../components/RowAction'
import DataMessage from '../components/DataMessage'
export default function RepositoryCommitPage({projectId,repositoryId,sha}:{projectId:string;repositoryId:string;sha:string}){
 const {t,dateLocale}=useTranslation(),[page,setPage]=useState(1),[selected,setSelected]=useState('')
 const data=useApiData(`/api/v1/projects/${encodeURIComponent(projectId)}/repositories/${encodeURIComponent(repositoryId)}/commits/${sha}?page=${page}`,parseRepositoryCommit)
 const commit=data.data,file=commit?.files.find(file=>file.path===selected)??commit?.files[0]
 return <section className="min-w-0 flex-1"><header className="mb-6"><RowAction to={`/code/repositories/${projectId}/${repositoryId}`} label={t('Volver al repositorio')}><ArrowLeft size={16}/></RowAction><h1 className="mt-4 flex items-center gap-2 text-xl font-semibold"><GitCommitHorizontal size={20}/>{t('Commit')} <code className="text-sm">{sha.slice(0,12)}</code></h1></header>{data.loading||data.error?<DataMessage loading={data.loading} error={data.error} onRetry={data.reload}/>:commit?<><p className="whitespace-pre-wrap break-words font-medium">{commit.message}</p><p className="mt-3 text-sm text-base-content/55">{commit.author} · <time dateTime={commit.created_at}>{new Date(commit.created_at).toLocaleString(dateLocale)}</time></p><div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]"><aside className="min-w-0"><h2 className="mb-3 font-semibold">{t('Archivos modificados')}</h2><ul className="space-y-1">{commit.files.map(item=><li key={item.path}><button type="button" className={`w-full rounded-lg px-3 py-2 text-left text-sm ${item.path===file?.path?'bg-base-200':'hover:bg-base-200/50'}`} onClick={()=>setSelected(item.path)} aria-pressed={item.path===file?.path}><span className="block break-all">{item.path}</span><span className="text-xs text-base-content/45">{item.status}</span></button></li>)}</ul><Pagination page={page} hasNext={commit.has_more} onPrevious={()=>setPage(page-1)} onNext={()=>setPage(page+1)}/></aside><div className="min-w-0">{file&&<><h2 className="mb-3 break-all font-mono text-sm">{file.path}</h2>{file.patch?<CodeViewer height="clamp(24rem, calc(100dvh - 17rem), 64rem)" code={file.patch} language="diff" label={file.path}/>:<p className="text-sm text-base-content/55">{t('El proveedor no incluye una comparación de texto para este archivo.')}</p>}</>}</div></div></>:null}</section>
}
