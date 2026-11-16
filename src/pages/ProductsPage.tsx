import {useState} from 'react'
import {Link,useSearchParams} from 'react-router'
import {ArrowLeft,Plus,RefreshCw} from 'lucide-react'
import {useApiData} from '../hooks/useApiData'
import {useProjects} from '../hooks/useProjects'
import {useTranslation} from '../hooks/useTranslation'
import {parseProducts} from '../utils/parseProducts'
import type {Product} from '../types/Product'
import ProductEditor from '../components/ProductEditor'
import IconButton from '../components/IconButton'
import DataMessage from '../components/DataMessage'
import AlphabeticSortButton from '../components/AlphabeticSortButton'
export default function ProductsPage(){
 const {t}=useTranslation(),remote=useApiData('/api/v1/products',parseProducts),projects=useProjects(),[params,setParams]=useSearchParams(),[descending,setDescending]=useState(false)
 const editor=params.get('edit'),product=remote.data?.items.find(p=>p.id===editor)
 const saved=()=>{remote.reload();setParams({})}
 return <section className="min-w-0 flex-1 pb-12">{editor&&<Link to="/settings/products" className="mb-6 inline-flex items-center gap-2 text-sm"><ArrowLeft size={16}/>{t('Productos')}</Link>}<header className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-semibold">{t(editor?'Editar producto':'Productos')}</h1><p className="mt-2 text-sm text-base-content/55">{t('Agrupa proyectos técnicos bajo un producto que las personas puedan identificar en sus solicitudes.')}</p></div><div className="flex gap-2">{!editor&&<AlphabeticSortButton descending={descending} onChange={setDescending}/>}<IconButton label={t('Actualizar')} onClick={remote.reload}><RefreshCw size={16}/></IconButton>{!editor&&remote.data?.can_manage&&<IconButton label={t('Crear producto')} onClick={()=>setParams({edit:'new'})}><Plus size={16}/></IconButton>}</div></header><DataMessage loading={remote.loading} error={remote.error} onRetry={remote.reload}/>{editor&&remote.data?.can_manage&&(editor==='new'||product)?<ProductEditor key={editor} product={product} projects={projects.projects} loadingProjects={projects.status!=='ready'} hasMore={projects.hasMore} onMore={()=>void projects.loadMore()} onSaved={saved}/>:!editor&&<ul className="divide-y divide-base-300">{[...(remote.data?.items??[])].sort((a:Product,b:Product)=>(descending?-1:1)*a.name.localeCompare(b.name)).map(p=><li key={p.id} className="flex items-center justify-between gap-3 py-4"><div><Link to={`?edit=${p.id}`} className="font-medium hover:underline">{p.name}</Link><p className="mt-1 text-xs text-base-content/55">{p.project_ids?.length??0} {t('proyectos')}{p.archived&&` · ${t('Archivado')}`}</p></div></li>)}</ul>}</section>
}
