import KnowledgeReviewControls from './KnowledgeReviewControls'
import AlphabeticSortButton from './AlphabeticSortButton'
import {useAlphabeticOrder} from '../hooks/useAlphabeticOrder'
import {useWorkCatalog} from '../hooks/useWorkCatalog'
import {useContext,useState} from 'react'
import {Link,useSearchParams,useNavigate} from 'react-router'
import {Plus,Pencil,ArrowLeft,BookOpen,ChevronLeft,ChevronRight} from 'lucide-react'
import {WorkspacePermissionsContext} from '../app/WorkspacePermissionsContext'
import {useApiData} from '../hooks/useApiData'
import {useTranslation} from '../hooks/useTranslation'
import {parseOrganizationDocuments} from '../utils/parseOrganizationDocuments'
import {parseOrganizationDocument} from '../utils/parseOrganizationDocument'
import TaskCreatorIdentity from './TaskCreatorIdentity'
import WikiMarkdown from './WikiMarkdown'
import IconButton from './IconButton'
import Pagination from './Pagination'
import DataMessage from './DataMessage'
export default function OrganizationKnowledge({kind,search,title}:{kind:string;search:string;title:string}){
 const {t}=useTranslation(),permissions=useContext(WorkspacePermissionsContext),[params,setParams]=useSearchParams(),[page,setPage]=useState(1),navigate=useNavigate(),article=params.get('article'),revision=params.get('revision'),order=useAlphabeticOrder()
 const list=useWorkCatalog(`/api/v1/knowledge/organization/documents?${new URLSearchParams({kind,search})}`,parseOrganizationDocuments)
 const items=[...list.items].sort((a,b)=>order.compare(a.title,b.title))
 const currentPage=Math.min(page,Math.max(1,Math.ceil(items.length/20)))
 const detail=useApiData(article?`/api/v1/knowledge/organization/documents/${encodeURIComponent(article)}${revision?`?revision=${encodeURIComponent(revision)}`:''}`:null,parseOrganizationDocument)
 const canWrite=permissions?.role&&['technical_lead','pmo','manager','super_admin'].includes(permissions.role)
 const open=(id:string|null,version?:number)=>{const next=new URLSearchParams(params);if(id)next.set('article',id);else next.delete('article');if(version)next.set('revision',String(version));else next.delete('revision');setParams(next)}
 const edit=()=>navigate(`/knowledge/editor/${article??'new'}?${new URLSearchParams({source:'organization',project:'organization',kind})}`)
 return <section className="min-w-0"><header className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-serif text-3xl">{detail.data?.title??title}</h1><p className="mt-2 text-xs text-base-content/45">{t('General de la organización · Disponible para todos los proyectos')}</p></div><div className="flex gap-2">{!article&&<AlphabeticSortButton descending={order.descending} onChange={value=>{order.setDescending(value);setPage(1)}}/>}{article&&<IconButton label={t('Volver')} onClick={()=>open(null)}><ArrowLeft size={16}/></IconButton>}{canWrite&&(!article||detail.data)&&<IconButton label={t(article?'Editar documento':'Crear documento')} onClick={edit}>{article?<Pencil size={16}/>:<Plus size={16}/>}</IconButton>}</div></header>
 {article?<><DataMessage loading={detail.loading} error={detail.error} onRetry={detail.reload}/>{detail.data&&<><div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs"><TaskCreatorIdentity actorId={detail.data.created_by} name={detail.data.author_name}/><div className="flex items-center gap-2"><IconButton label={t('Revisión anterior')} disabled={detail.data.revision<=1} onClick={()=>open(article,detail.data!.revision-1)}><ChevronLeft size={15}/></IconButton><span>{t('Revisión {0}',{'0':detail.data.revision})}</span><IconButton label={t('Revisión actual')} disabled={!revision} onClick={()=>open(article)}><ChevronRight size={15}/></IconButton></div></div><KnowledgeReviewControls kind="organization_document" id={detail.data.id} revision={detail.data.revision} onChanged={detail.reload}/><WikiMarkdown text={detail.data.body??''} allowImages/></>}</>:<><DataMessage loading={list.loading} error={list.error} onRetry={list.reload}/><ul className="divide-y divide-base-300">{items.slice((currentPage-1)*20,currentPage*20).map(d=><li key={d.id} className="py-4"><Link to={`?${new URLSearchParams({project:'organization',article:d.id})}`} className="flex items-center gap-3 hover:underline"><BookOpen size={18}/><span className="break-words">{d.title}</span></Link></li>)}</ul>{!list.loading&&!list.error&&!items.length&&<p className="py-8 text-sm text-base-content/45">{t('Todavía no hay artículos en esta sección.')}</p>}{items.length>20&&<Pagination page={currentPage} count={Math.min(20,Math.max(0,items.length-(currentPage-1)*20))} total={items.length} hasNext={currentPage*20<items.length} onPrevious={()=>setPage(currentPage-1)} onNext={()=>setPage(currentPage+1)}/>}</>}</section>
}
