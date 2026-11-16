import { useEffect, useId, useRef, useState } from 'react'
import { Bold, Italic, Heading2, List, ListChecks, Code, Quote, ImagePlus, Info, Network } from 'lucide-react'
import Tooltip from './Tooltip'
import IconButton from './IconButton'
import WikiMarkdown from './WikiMarkdown'
import { uploadTaskEvidence } from '../services/uploadTaskEvidence'
import { useTranslation } from '../hooks/useTranslation'
import type { MarkdownEditorProps } from '../types/MarkdownEditorProps'
export default function MarkdownEditor({hint,allowDiagrams=false,uploadImage=uploadTaskEvidence,allowImages=true,value, onChange, disabled = false, maxLength = 8000, label, onUploadingChange}: MarkdownEditorProps) {
 const {t} = useTranslation(), id = useId(), input = useRef<HTMLTextAreaElement>(null)
 const [preview,setPreview] = useState(false), [error,setError] = useState('')
 const fileInput=useRef<HTMLInputElement>(null),latest=useRef(value),uploads=useRef(0),[uploading,setUploading]=useState(false)
 useEffect(()=>{latest.current=value},[value])
 const change=(next:string)=>{latest.current=next;onChange(next)}
 const upload=async(files:File[])=>{
  if(disabled||!files.length)return
  if(files.length>8){setError(t('Pega hasta 8 imágenes a la vez.'));return}
  const start=input.current?.selectionStart??latest.current.length,end=input.current?.selectionEnd??start
  const items=files.map(file=>({file,token:`![Subiendo imagen…](nexora-upload:${crypto.randomUUID()})`}))
  const next=latest.current.slice(0,start)+'\n'+items.map(item=>item.token).join('\n')+'\n'+latest.current.slice(end)
  if(new TextEncoder().encode(next).length>maxLength){setError(t('El contenido admite hasta {0} bytes.',{'0':maxLength}));return}
  change(next);setError('');uploads.current++;setUploading(true);onUploadingChange?.(true)
  for(const item of items){
   try{const image=await uploadImage(item.file);const markdown=`![${image.name.replace(/[[\]\r\n]/g,'')}](<${image.url}>)`;const updated=latest.current.replace(item.token,markdown);if(new TextEncoder().encode(updated).length>maxLength)throw Error(t('El contenido admite hasta {0} bytes.',{'0':maxLength}));change(updated)}
   catch(error){change(latest.current.replace(item.token,''));setError(t(error instanceof Error?error.message:'No pudimos guardar la imagen. Vuelve a pegarla para reintentar.'))}
  }
  uploads.current--;if(!uploads.current){setUploading(false);onUploadingChange?.(false)}
 }
 const insert = (before: string, after = '') => {
  const start = input.current?.selectionStart ?? value.length, end = input.current?.selectionEnd ?? start
  const next = latest.current.slice(0,start) + before + latest.current.slice(start,end) + after + latest.current.slice(end)
  if (new TextEncoder().encode(next).length > maxLength) {setError(t('El contenido admite hasta {0} bytes.',{'0':maxLength}));return false}
  change(next); setError('')
  requestAnimationFrame(() => { input.current?.focus(); input.current?.setSelectionRange(start + before.length,end + before.length) }); return true
 }
 const controls = [{label:'Negrita',Icon:Bold,before:'**',after:'**'},{label:'Cursiva',Icon:Italic,before:'_',after:'_'},{label:'Encabezado',Icon:Heading2,before:'\n## '},{label:'Lista',Icon:List,before:'\n- '},{label:'Lista de tareas',Icon:ListChecks,before:'\n- [ ] '},{label:'Código',Icon:Code,before:'`',after:'`'},{label:'Cita',Icon:Quote,before:'\n> '}]
 return <div className="min-w-0"><div className="mb-2 flex items-center gap-2 text-xs" id={`${id}-label`}>{label}{hint&&<Tooltip label={hint}><Info size={14} tabIndex={0} aria-label={hint}/></Tooltip>}</div><div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 focus-within:border-primary">
 <div className="flex flex-wrap items-center justify-between gap-2 border-b border-base-300 bg-base-200/40 p-2"><div className="flex gap-1" role="tablist" aria-label={t('Editor Markdown')}>{[false,true].map(p => <button key={String(p)} type="button" role="tab" aria-selected={preview===p} aria-controls={`${id}-panel`} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${preview===p?'bg-base-300':'text-base-content/50'}`} onClick={() => setPreview(p)}>{t(p?'Vista previa':'Escribir')}</button>)}</div><div className="flex flex-wrap gap-0.5">{controls.map(({label,Icon,before,after}) => <IconButton key={label} type="button" label={t(label)} disabled={disabled||preview} onClick={() => insert(before,after)}><Icon size={15}/></IconButton>)}{allowDiagrams&&<IconButton type="button" label={t('Insertar diagrama')} disabled={disabled||preview} onClick={()=>insert('\n```mermaid\nflowchart LR\n  A[Inicio] --> B[Proceso]\n  B --> C[Fin]\n```\n')}><Network size={16}/></IconButton>}{allowImages&&<IconButton type="button" label={t('Insertar imagen')} disabled={disabled||preview} onClick={() => fileInput.current?.click()}><ImagePlus size={16}/></IconButton>}</div></div>
 <input ref={fileInput} type="file" className="hidden" accept="image/png,image/jpeg,image/webp" multiple aria-label={t('Adjuntar imágenes')} onChange={event=>{void upload(Array.from(event.target.files??[]));event.target.value=''}}/>
 <div id={`${id}-panel`} role="tabpanel">{preview ? <div className="min-h-60 p-5">{value.trim()?<WikiMarkdown text={value} allowImages/>:<p className="text-sm text-base-content/40">{t('Nada que previsualizar todavía.')}</p>}</div>:<textarea onPaste={event=>{if(!allowImages)return;const files=Array.from(event.clipboardData.items).filter(item=>item.kind==='file'&&item.type.startsWith('image/')).map(item=>item.getAsFile()).filter((file):file is File=>file!==null);if(files.length){event.preventDefault();void upload(files)}}} onDragOver={event=>{if(allowImages&&event.dataTransfer.types.includes('Files'))event.preventDefault()}} onDrop={event=>{if(allowImages&&event.dataTransfer.files.length){event.preventDefault();void upload(Array.from(event.dataTransfer.files))}}} ref={input} className="block min-h-60 w-full resize-y bg-transparent p-5 text-sm leading-7 outline-none" aria-labelledby={`${id}-label`} value={value} disabled={disabled} maxLength={maxLength} onChange={e=>{change(e.target.value);setError(new TextEncoder().encode(e.target.value).length > maxLength ? t('El contenido admite hasta {0} bytes.',{'0':maxLength}) : '')}}/>}</div>
 <div className="flex justify-between gap-3 border-t border-base-300 px-4 py-2 text-xs text-base-content/40"><span>{t(uploading?'Guardando evidencia…':allowImages?'Markdown · Pega o arrastra imágenes aquí':'Markdown')}</span><span>{new TextEncoder().encode(value).length}/{maxLength}</span></div></div>{error&&<p role="alert" className="mt-2 text-xs text-error">{error}</p>}</div>
}
