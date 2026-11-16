import AlphabeticSortButton from '../components/AlphabeticSortButton'
import {useAlphabeticOrder} from '../hooks/useAlphabeticOrder'
import {useRef,useState} from 'react'
import {Plus,Archive} from 'lucide-react'
import {useApiData} from '../hooks/useApiData'
import {useIntegrationMutation} from '../hooks/useIntegrationMutation'
import {useTranslation} from '../hooks/useTranslation'
import {parseOrganizationStickers} from '../utils/parseOrganizationStickers'
import {apiFetch} from '../services/apiFetch'
import IconButton from '../components/IconButton'
import TaskEvidenceImage from '../components/TaskEvidenceImage'
import DataMessage from '../components/DataMessage'
export default function StickersPage(){
 const order=useAlphabeticOrder()
 const {t}=useTranslation(),data=useApiData('/api/v1/stickers',parseOrganizationStickers),mutation=useIntegrationMutation(),input=useRef<HTMLInputElement>(null),[error,setError]=useState('')
 const upload=async(file:File)=>{setError('');if(!['image/png','image/jpeg','image/webp'].includes(file.type)||!file.size||file.size>4*1024*1024){setError(t('Usa una imagen PNG, JPEG o WebP de hasta 4 MB.'));return}await mutation.run({name:file.name,size:file.size},async(signal,key)=>{let binary='';const bytes=new Uint8Array(await file.arrayBuffer());for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));const response=await apiFetch('/api/v1/stickers',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key},signal,body:JSON.stringify({name:file.name.replace(/\.[^.]+$/,'').slice(0,80)||'Sticker',image_base64:btoa(binary)})});if(!response.ok)throw Error('No pudimos guardar el sticker.');data.reload()})}
 return <section className="min-w-0 flex-1"><header className="mb-6 flex items-center justify-between gap-3"><h1 className="text-xl font-semibold">{t('Stickers personalizados')}</h1><AlphabeticSortButton descending={order.descending} onChange={order.setDescending}/><IconButton label={t('Agregar sticker')} disabled={mutation.busy} onClick={()=>input.current?.click()}><Plus size={17}/></IconButton></header><p className="mb-5 text-sm text-base-content/55">{t('Disponibles para todo el equipo en los comentarios. Archivar conserva los stickers de comentarios anteriores.')}</p><input ref={input} className="hidden" type="file" accept="image/png,image/jpeg,image/webp" aria-label={t('Agregar sticker')} onChange={event=>{const file=event.target.files?.[0];if(file)void upload(file);event.target.value=''}}/><DataMessage loading={data.loading} error={data.error} onRetry={data.reload}/><ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">{data.data?.slice().sort((a,b)=>order.compare(a.name,b.name)).map(item=><li key={item.id} className="min-w-0"><div className="flex h-36 items-center justify-center overflow-hidden rounded-xl bg-base-200/40 p-3"><TaskEvidenceImage src={item.url} alt={item.name}/></div><div className="mt-2 flex items-center justify-between gap-2"><span className="truncate text-sm">{item.name}</span><IconButton label={t('Archivar sticker')} disabled={mutation.busy} onClick={()=>void mutation.run({archive:item.id},async(signal,key)=>{const response=await apiFetch(`/api/v1/stickers/${item.id}`,{method:'DELETE',headers:{'Idempotency-Key':key},signal});if(!response.ok)throw Error('No pudimos archivar el sticker.');data.reload()})}><Archive size={15}/></IconButton></div></li>)}</ul>{(error||mutation.error)&&<p role="alert" className="mt-4 text-sm text-error">{t(error||mutation.error)}</p>}</section>
}
