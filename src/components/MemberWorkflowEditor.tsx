import {useContext,useState} from 'react'
import {Pencil,Workflow} from 'lucide-react'
import {WorkspacePermissionsContext} from '../app/WorkspacePermissionsContext'
import {useTranslation} from '../hooks/useTranslation'
import type {OrganizationMember} from '../types/OrganizationMember'
import IconButton from './IconButton'
import MemberWorkflowModal from './MemberWorkflowModal'
export default function MemberWorkflowEditor({member,onSaved,profile=false}:{member:OrganizationMember;onSaved:()=>void;profile?:boolean}){
 const {t}=useTranslation(),permissions=useContext(WorkspacePermissionsContext),[open,setOpen]=useState(false)
 const allowed=permissions?.grants.some(grant=>grant.capability==='workflow-assignments:manage'&&grant.project_id===null)
 if(!allowed||member.archived||!member.active)return null
 return <><IconButton label={t('Asignar workflow a {0}',{'0':member.name})} onClick={()=>setOpen(true)}>{profile?<Pencil size={14}/>:<Workflow size={17}/>}</IconButton>{open&&<MemberWorkflowModal member={member} onClose={()=>setOpen(false)} onSaved={()=>{setOpen(false);onSaved()}}/>}</>
}
