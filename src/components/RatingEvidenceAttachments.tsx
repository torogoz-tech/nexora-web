import {useState} from 'react'
import {Download} from 'lucide-react'
import {apiFetch} from '../services/apiFetch'
import {useTranslation} from '../hooks/useTranslation'
import type {RatingEvidenceAttachment} from '../types/RatingEvidenceAttachment'
import IconButton from './IconButton'
export default function RatingEvidenceAttachments({files}:{files:RatingEvidenceAttachment[]}){
 const {t}=useTranslation(),[error,setError]=useState('')
 async function download(file:RatingEvidenceAttachment){try{setError('');const response=await apiFetch(`/api/v1/rating-evidence/${encodeURIComponent(file.id)}/content`);if(!response.ok)throw Error();const blob=await response.blob(),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch{setError(t('No pudimos descargar el archivo.'))}}
 return <div className="mt-3 space-y-2">{files.map(file=><div key={file.id} className="flex items-center gap-2 text-xs"><span className="min-w-0 flex-1 break-all">{file.name}</span><IconButton label={t('Descargar archivo')} onClick={()=>void download(file)}><Download size={14}/></IconButton></div>)}{error&&<p role="alert" className="text-xs text-error">{error}</p>}</div>
}
