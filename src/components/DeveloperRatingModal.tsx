import { useRef, useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { writeDeveloperRating } from '../services/writeDeveloperRating'
import type { DeveloperRatingModalProps } from '../types/DeveloperRatingModalProps'
import MarkdownEditor from './MarkdownEditor'
import {uploadRatingEvidence} from '../services/uploadRatingEvidence'
import IntegrationDialog from './IntegrationDialog'
import Dropdown from './Dropdown'
import TextButton from './TextButton'
export default function DeveloperRatingModal({ actorId, projects, onClose, onCreated }: DeveloperRatingModalProps) {
  const { t } = useTranslation(), mutation = useIntegrationMutation()
  const [project, setProject] = useState(''), [score, setScore] = useState(''), [reason, setReason] = useState(''), [date, setDate] = useState(()=>{const now=new Date();return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`}), [files,setFiles]=useState<{id:string;name:string}[]>([]), [uploading,setUploading]=useState(false), [fileError,setFileError]=useState('')
  const fileInput=useRef<HTMLInputElement>(null)
  const attach=async(file:File,image=false)=>{if(files.length>=20)throw Error('Adjunta hasta 20 archivos.');const result=await uploadRatingEvidence(actorId,project,file,image);setFiles(previous=>[...previous,result]);return result}
  async function submit() {
    if(mutation.busy||uploading||new TextEncoder().encode(reason).length>4000)return
    const body = { project_id: project || null, score: Number(score), reason: reason.trim(), date, evidence_ids: files.map(file=>file.id) }
    if (await mutation.run(body, (signal, key) => writeDeveloperRating(actorId, body, signal, key))) onCreated()
  }
  return <IntegrationDialog title={t('Valorar trabajo')} busy={mutation.busy} onClose={onClose}><form className="space-y-4" onSubmit={event => { event.preventDefault(); void submit() }}>
    <p className="text-sm text-base-content/60">{t('La valoración queda en el historial y se promedia con los demás registros del día.')}</p>
    <label className="flex flex-col gap-2 text-sm">{t('Proyecto')}<Dropdown label={t('Proyecto')} value={project} onChange={value=>{setProject(value);setFiles([]);setReason('')}} options={[{value:"",label:t("Sin proyecto")},...projects.map(p => ({ value: p.id, label: p.name }))]} disabled={mutation.busy||uploading}/></label>
    <div className="grid grid-cols-2 gap-4"><label className="flex flex-col gap-2 text-sm">{t('Fecha del trabajo')}<input className="input w-full" type="date" required value={date} onChange={event => setDate(event.target.value)} disabled={mutation.busy}/></label><label className="flex flex-col gap-2 text-sm">{t('Puntuación de 0 a 5')}<input className="input w-full" type="number" min="0" max="5" step="0.01" required value={score} onChange={event => setScore(event.target.value)} disabled={mutation.busy}/></label></div>

    <MarkdownEditor hint={t("La evidencia pertenece a esta valoración y no se publica en Conocimiento.")} label={t('Motivo')} value={reason} onChange={setReason} maxLength={4000} disabled={mutation.busy||uploading} onUploadingChange={setUploading} uploadImage={file=>attach(file,true)}/>
    <div className="space-y-2"><TextButton type="button" label={t('Adjuntar evidencia')} disabled={mutation.busy||uploading} onClick={()=>fileInput.current?.click()}/><input ref={fileInput} className="hidden" type="file" multiple aria-label={t('Adjuntar evidencia')} onChange={event=>{const selected=Array.from(event.target.files??[]);event.target.value='';void(async()=>{setUploading(true);setFileError('');try{if(files.length+selected.length>20)throw Error('Adjunta hasta 20 archivos.');for(const file of selected)await attach(file)}catch(error){setFileError(error instanceof Error?error.message:'No pudimos guardar la evidencia.')}finally{setUploading(false)}})()}}/>
    {files.map(file=><div key={file.id} className="flex items-center justify-between gap-3 text-xs"><span className="break-all">{file.name}</span><button className="btn btn-xs btn-ghost" type="button" onClick={()=>{setFiles(previous=>previous.filter(item=>item.id!==file.id));setReason(value=>value.split('\n').filter(line=>!line.includes(`/rating-evidence/${file.id}/content`)).join('\n'))}}>{t('Quitar')}</button></div>)}</div>
    {fileError&&<p role="alert" className="text-sm text-error">{t(fileError)}</p>}
    {mutation.error && <p role="alert" className="text-sm text-error">{t(mutation.error)}</p>}
    <footer className="flex justify-end gap-2"><TextButton label={t('Cancelar')} type="button" onClick={onClose} disabled={mutation.busy}/><TextButton label={t('Registrar valoración')} type="submit" variant="primary" disabled={mutation.busy || uploading || new TextEncoder().encode(reason).length>4000 || score === '' || !reason.trim() || !date}/></footer>
  </form></IntegrationDialog>
}
