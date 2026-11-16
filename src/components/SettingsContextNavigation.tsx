import { useContext, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { ArrowDown, ArrowUp, Check, GripVertical, ListFilter, RotateCcw } from 'lucide-react'
import { NavigationOrderContext } from '../app/NavigationOrderContext'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { useTranslation } from '../hooks/useTranslation'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { moveNavigationPath } from '../utils/moveNavigationPath'
import { writeNavigationOrder } from '../services/writeNavigationOrder'
import IconButton from './IconButton'
import type { SettingsContextNavigationProps } from '../types/SettingsContextNavigationProps'
export default function SettingsContextNavigation({items,onClose,heading}:SettingsContextNavigationProps){
 const {t}=useTranslation(),{pathname}=useLocation(),order=useContext(NavigationOrderContext),permissions=useContext(WorkspacePermissionsContext)
 const [editing,setEditing]=useState(false),[dragged,setDragged]=useState<string|null>(null)
 const mutation=useIntegrationMutation()
 const allowed=permissions?.grants.some(g=>g.capability==='installation:manage'&&g.project_id===null)&&order.data?.can_manage
 async function save(paths:string[]){
  if(!allowed||!order.data||mutation.busy)return
  await mutation.run({paths,revision:order.data.revision},async(signal,key)=>{order.onSaved(await writeNavigationOrder(paths,order.data!.revision,signal,key))})
 }
 function move(from:string,to:string){if(order.data)void save(moveNavigationPath(order.data.paths,from,to))}
 return <><header className="mb-6 flex items-start gap-3 px-2 pt-1">{heading}{allowed&&<div className="flex shrink-0 gap-1">{editing&&<IconButton label={t('Restablecer orden del menú')} disabled={mutation.busy} onClick={()=>void save([])}><RotateCcw size={14}/></IconButton>}<IconButton label={t(editing?'Terminar de ordenar':'Ordenar menú de Configuración')} disabled={mutation.busy} onClick={()=>setEditing(value=>!value)}>{editing?<Check size={14}/>:<ListFilter size={14}/>}</IconButton></div>}</header><nav aria-label={t('Submenú de Configuración')} className="flex min-w-0 flex-col gap-1">
  {editing&&allowed&&<p className="mb-3 px-2 text-xs leading-relaxed text-base-content/50">{t('Arrastra las opciones o usa las flechas. El orden se guarda para toda la organización.')}</p>}
  {items.map(({path,label,icon:Icon},index)=><div key={path} className="flex min-w-0 items-center gap-1" onDragOver={event=>{if(editing&&!mutation.busy){event.preventDefault();event.dataTransfer.dropEffect='move'}}} onDrop={event=>{event.preventDefault();if(dragged&&!mutation.busy)move(dragged,path);setDragged(null)}}>
   {editing&&allowed?<><button type="button" draggable={!mutation.busy} disabled={mutation.busy} aria-label={t('Mover {0}',{'0':t(label)})} onDragStart={event=>{setDragged(path);event.dataTransfer.setData('text/plain',path);event.dataTransfer.effectAllowed='move'}} onDragEnd={()=>setDragged(null)} className="cursor-grab rounded-lg p-1 text-base-content/40"><GripVertical size={14}/></button><span className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-3 text-sm"><Icon size={16} className="shrink-0"/><span className="truncate">{t(label)}</span></span><IconButton label={t('Subir {0}',{'0':t(label)})} disabled={mutation.busy||index===0} onClick={()=>move(path,items[index-1]!.path)}><ArrowUp size={13}/></IconButton><IconButton label={t('Bajar {0}',{'0':t(label)})} disabled={mutation.busy||index===items.length-1} onClick={()=>move(path,items[index+1]!.path)}><ArrowDown size={13}/></IconButton></>:<Link to={path} className="context-nav-item min-w-0 flex-1" aria-current={pathname===path||(path!=='/settings'&&pathname.startsWith(path+'/'))?'page':undefined} onClick={onClose}><Icon size={16} className="shrink-0" aria-hidden="true"/><span className="min-w-0 truncate">{t(label)}</span></Link>}
  </div>)}
  {mutation.error&&<p role="alert" className="mt-2 px-2 text-xs text-error">{t(mutation.error)}</p>}
 </nav></>
}
