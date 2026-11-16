import StandardEmojiPicker from './StandardEmojiPicker'
import MarkdownEditor from './MarkdownEditor'
import IntegrationDialog from './IntegrationDialog'
import {useState} from 'react'
import {MessageSquare,Send,Smile,Sticker} from 'lucide-react'
import {useApiData} from '../hooks/useApiData'
import {useIntegrationMutation} from '../hooks/useIntegrationMutation'
import {useTranslation} from '../hooks/useTranslation'
import {parseTaskComments} from '../utils/parseTaskComments'
import {apiFetch} from '../services/apiFetch'
import OrganizationStickerPicker from './OrganizationStickerPicker'
import TaskCreatorIdentity from './TaskCreatorIdentity'
import TaskCommentBody from './TaskCommentBody'
import IconButton from './IconButton'
import TextButton from './TextButton'
import DataMessage from './DataMessage'
import Pagination from './Pagination'
export default function TaskComments({taskId,archived=false}:{taskId:string;archived?:boolean}){
 const {t,dateLocale}=useTranslation(),[cursors,setCursors]=useState<(string|null)[]>([null]),[body,setBody]=useState(''),[uploading,setUploading]=useState(false),[picker,setPicker]=useState<'emoji'|'sticker'|null>(null),mutation=useIntegrationMutation()
 const after=cursors.at(-1),data=useApiData(`/api/v1/tasks/${encodeURIComponent(taskId)}/comments?limit=20${after?`&after=${encodeURIComponent(after)}`:''}`,parseTaskComments)
 const insert=(text:string)=>{setBody(v=>(v+' '+text).trimStart());setPicker(null)}
 return <section className="mt-8 border-t border-base-300 pt-5" aria-label={t('Comentarios')}><h2 className="mb-5 flex items-center gap-2 font-semibold"><MessageSquare size={18}/>{t('Comentarios')}</h2><DataMessage loading={data.loading} error={data.error} onRetry={data.reload}/><ul className="space-y-6">{data.data?.items.map(c=><li key={c.id}><header className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs"><TaskCreatorIdentity actorId={c.actor_id} name={c.actor_name}/><time className="text-base-content/45" dateTime={c.created_at}>{new Date(c.created_at).toLocaleString(dateLocale)}</time></header><div className="pl-12"><TaskCommentBody body={c.body}/></div></li>)}</ul>{!data.loading&&!data.error&&!data.data?.items.length&&<p className="text-sm text-base-content/45">{t('Todavía no hay comentarios.')}</p>}{(after||data.data?.next_after)&&<Pagination page={cursors.length} count={data.data?.items.length??0} hasNext={!!data.data?.next_after} onPrevious={()=>setCursors(v=>v.slice(0,-1))} onNext={()=>setCursors(v=>[...v,data.data!.next_after!])}/>}
 {!archived&&<form className="mt-6" onKeyDown={event=>{if((event.ctrlKey||event.metaKey)&&event.shiftKey&&event.key.toLowerCase()==='e'){event.preventDefault();setPicker('emoji')}}} onSubmit={e=>{e.preventDefault();if(uploading||!body.trim()||new TextEncoder().encode(body).length>8000)return;void mutation.run({taskId,body},async(signal,key)=>{const response=await apiFetch(`/api/v1/tasks/${encodeURIComponent(taskId)}/comments`,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({body:body.trim()}),signal});if(!response.ok)throw Error('No pudimos agregar el comentario.');setBody('');data.reload()})}}><MarkdownEditor label={t('Agregar comentario')} value={body} onChange={setBody} disabled={mutation.busy} onUploadingChange={setUploading}/><div className="mt-2 flex justify-between gap-3"><div className="flex gap-1"><IconButton label={t('Emojis')} onClick={()=>setPicker(picker==='emoji'?null:'emoji')}><Smile size={17}/></IconButton><IconButton label={t('Stickers')} onClick={()=>setPicker(picker==='sticker'?null:'sticker')}><Sticker size={17}/></IconButton></div><TextButton type="submit" label={t('Enviar comentario')} disabled={mutation.busy||uploading||!body.trim()||new TextEncoder().encode(body).length>8000}><Send size={16}/></TextButton></div>{picker&&<IntegrationDialog title={t(picker==='emoji'?'Emojis':'Stickers')} onClose={()=>setPicker(null)}><div className="flex max-h-80 flex-wrap gap-2 overflow-y-auto p-1" aria-label={t(picker==='emoji'?'Emojis':'Stickers')}>{picker==='emoji'?<StandardEmojiPicker onSelect={insert}/>:<OrganizationStickerPicker onSelect={insert}/>}</div></IntegrationDialog>}{mutation.error&&<p role="alert" className="mt-2 text-sm text-error">{t(mutation.error)}</p>}</form>}
 </section>
}
