import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import IconButton from './IconButton'
export default function TaskAcceptanceCriteriaEditor({value,onChange,disabled=false}:{value:string[];onChange:(value:string[])=>void;disabled?:boolean}) {
 const {t}=useTranslation()
 return <section aria-label={t('Criterios de aceptación')} className="space-y-3"><header className="flex items-center justify-between gap-3"><h2 className="text-sm font-medium">{t('Criterios de aceptación')}</h2><IconButton type="button" label={t('Agregar criterio')} disabled={disabled||value.length>=100} onClick={()=>onChange([...value,''])}><Plus size={16}/></IconButton></header>{value.map((criterion,index)=><div key={index} className="flex items-start gap-2"><span className="pt-2 text-xs text-base-content/45">{index+1}.</span><textarea aria-label={`${t('Criterio de aceptación')} ${index+1}`} className="textarea min-h-16 w-full" value={criterion} disabled={disabled} maxLength={4000} onChange={event=>onChange(value.map((item,i)=>i===index?event.target.value:item))}/><IconButton type="button" label={t('Eliminar criterio')} disabled={disabled} onClick={()=>onChange(value.filter((_,i)=>i!==index))}><Trash2 size={15}/></IconButton></div>)}</section>
}
