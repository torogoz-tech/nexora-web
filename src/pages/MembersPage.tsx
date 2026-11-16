import AlphabeticSortButton from '../components/AlphabeticSortButton'
import {useAlphabeticOrder} from '../hooks/useAlphabeticOrder'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { useContext, useState } from 'react'
import { Link } from 'react-router'
import MemberWorkflowEditor from '../components/MemberWorkflowEditor'
import UserAvatar from '../components/UserAvatar'
import { ShieldUser, MailPlus, Search, Send, X, Mail, Workflow } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { parseOrganizationMembers } from '../utils/parseOrganizationMembers'
import { parseMemberInvitations } from '../utils/parseMemberInvitations'
import { writeMemberInvitation } from '../services/writeMemberInvitation'
import IconButton from '../components/IconButton'
import TextButton from '../components/TextButton'
import IntegrationDialog from '../components/IntegrationDialog'
import InviteMemberModal from '../components/InviteMemberModal'
import DataMessage from '../components/DataMessage'
import MemberPositionEditor from '../components/MemberPositionEditor'
import MemberRoleModal from '../components/MemberRoleModal'
import { memberRoleLabel } from '../utils/memberRoleLabel'
import MemberAccessMethods from '../components/MemberAccessMethods'
import MemberArchiveAction from '../components/MemberArchiveAction'
import Dropdown from '../components/Dropdown'
import type { OrganizationMember } from '../types/OrganizationMember'
import type { MemberInvitation } from '../types/MemberInvitation'
export default function MembersPage(){
 const order=useAlphabeticOrder()
  const {t,dateLocale}=useTranslation()
  const permissions=useContext(WorkspacePermissionsContext)
  const admin=permissions?.grants.some(g=>g.capability==='installation:manage'&&g.project_id===null)??false
  const manageProjects=permissions?.grants.some(g=>g.capability==='member-projects:manage')??false
  const members=useApiData('/api/v1/settings/members',parseOrganizationMembers)
  const invitations=useApiData(admin?'/api/v1/settings/invitations':null,parseMemberInvitations)
  const mutation=useIntegrationMutation()
  const [roleMember,setRoleMember]=useState<OrganizationMember|null>(null)
  const [positions, setPositions] = useState<Record<string, { position: string; position_revision: number }>>({})
  const [search,setSearch]=useState('')
  const [archiveFilter,setArchiveFilter]=useState('current')
  const [open,setOpen]=useState(false)
  const [revoke,setRevoke]=useState<MemberInvitation|null>(null)
  const matches=(...values:string[])=>values.join(' ').toLocaleLowerCase().includes(search.toLocaleLowerCase())
  const rows=members.data?.map(member => ({ ...member, ...(positions[member.id] && positions[member.id].position_revision >= (member.position_revision ?? 0) ? positions[member.id] : {}) })).filter(v=>(archiveFilter==='all'||archiveFilter==='archived'?archiveFilter==='all'||v.archived:!v.archived)&&matches(v.name,v.email,v.username,v.position??''))??[]
  const pending=archiveFilter==='archived'?[]:invitations.data?.filter(v=>v.status!=='accepted'&&matches(v.name,v.email))??[]
  const statuses={pending:'Invitación pendiente',accepted:'Aceptada',expired:'Invitación vencida',revoked:'Invitación revocada'}
  async function change(item:MemberInvitation,action:'resend'|'revoke'){
    const ok=await mutation.run({id:item.id,revision:item.revision,action},async(signal,key)=>{await writeMemberInvitation(`/api/v1/settings/invitations/${item.id}/${action}`,{expected_revision:item.revision},signal,key)})
    if(ok){setRevoke(null);invitations.reload()}
  }
  return <section className="flex min-w-0 flex-1 flex-col px-[clamp(1rem,2vw,2rem)] pt-[clamp(1rem,2vw,2rem)]">
    <header className="mb-6 flex items-center justify-between gap-4"><h1 className="text-xl font-semibold">{t('Miembros')}</h1>{admin&&<IconButton label={t('Invitar miembro')} disabled={mutation.busy} onClick={()=>setOpen(true)}><MailPlus size={18}/></IconButton>}</header>
    <div className="mb-6 flex flex-wrap items-center gap-3"><label className="input input-sm flex min-w-48 flex-1 items-center gap-2"><Search size={15}/><input aria-label={t('Buscar miembros')} placeholder={t('Buscar miembros')} value={search} onChange={e=>setSearch(e.target.value)}/></label><AlphabeticSortButton descending={order.descending} onChange={order.setDescending}/><Dropdown label={t('Filtrar usuarios')} value={archiveFilter} onChange={setArchiveFilter} className="w-full sm:w-44" options={[{value:'current',label:t('Sin archivar')},{value:'archived',label:t('Archivados')},{value:'all',label:t('Todos los usuarios')}]}/></div>
    {members.loading||members.error?<DataMessage loading={members.loading} error={members.error} onRetry={members.reload}/>:null}
    {invitations.loading||invitations.error?<DataMessage loading={invitations.loading} error={invitations.error} onRetry={invitations.reload}/>:null}
    <div className="min-w-0 overflow-x-auto rounded-2xl border border-base-300" aria-label={t('Miembros e invitaciones')}>
      <table className="w-full min-w-[56rem] text-left text-sm">
        <thead className="border-b border-base-300 bg-base-200/40 text-xs text-base-content/60"><tr><th className="px-4 py-3 font-medium">{t('Miembro')}</th><th className="px-4 py-3 font-medium">{t('Estado')}</th><th className="px-4 py-3 font-medium">{t('Rol')}</th><th className="px-4 py-3 font-medium">{t('Acceso')}</th><th className="px-4 py-3 font-medium">{t('Último ingreso')}</th><th className="px-4 py-3 text-right font-medium">{t('Acciones')}</th></tr></thead>
        <tbody className="divide-y divide-base-300">
          {[...rows].sort((a,b)=>order.compare(a.name,b.name)).map(member=><tr key={member.id} className="align-middle hover:bg-base-200/30">
            <td className="px-4 py-3"><div className="flex min-w-0 items-center gap-3"><Link to={`/settings/members/${encodeURIComponent(member.id)}`} aria-label={t('Ver perfil de {0}',{'0':member.name})}><UserAvatar actorId={member.id} revision={member.avatar_revision??0} name={member.name}/></Link><div className="min-w-0"><Link className="break-words font-semibold hover:underline" to={`/settings/members/${encodeURIComponent(member.id)}`}>{member.name}</Link><p className="mt-0.5 break-words text-xs text-base-content/55">{member.position || t('Sin posición laboral')}</p>{member.email&&<p className="mt-1 break-all text-xs text-base-content/55">{member.email}</p>}</div></div></td>
            <td className="px-4 py-3"><span className={`rounded-lg px-2 py-1 text-xs ${member.archived?'bg-base-200 text-base-content/55':member.active?'bg-success/10 text-success':'bg-warning/10 text-warning'}`}>{t(member.archived?'Archivado':member.active?'Activo':'Suspendido')}</span></td>
            <td className="px-4 py-3 text-xs text-base-content/65"><span className="inline-flex items-center gap-1.5"><ShieldUser size={13}/>{t(memberRoleLabel(member.role))}</span></td>
            <td className="px-4 py-3 text-xs text-base-content/65"><MemberAccessMethods member={member}/>{member.workflow_name&&<span className="mt-1 inline-flex items-center gap-1.5"><Workflow size={13}/>{member.workflow_name}</span>}</td>
            <td className="px-4 py-3 text-xs text-base-content/50">{member.last_login_at?<time dateTime={member.last_login_at}>{new Date(member.last_login_at).toLocaleString(dateLocale,{dateStyle:'short',timeStyle:'short'})}</time>:t('Sin ingresos registrados')}</td>
            <td className="px-4 py-3"><div className="flex justify-end gap-1"><MemberWorkflowEditor member={member} onSaved={members.reload}/>{admin&&<MemberPositionEditor member={member} onSaved={(position, position_revision) => setPositions(current => ({ ...current, [member.id]: { position, position_revision } }))}/>} {(admin||(manageProjects&&member.role!==null&&member.role!=='super_admin'))&&<IconButton disabled={member.archived} label={t(admin?'Configurar rol de {0}':'Configurar proyectos de {0}',{'0':member.name})} onClick={()=>setRoleMember(member)}><ShieldUser size={17}/></IconButton>}{admin&&<MemberArchiveAction member={member} onSaved={members.reload}/>}</div></td>
          </tr>)}
          {[...pending].sort((a,b)=>order.compare(a.name,b.name)).map(invitation=><tr key={invitation.id}><td className="px-4 py-3"><div className="flex items-center gap-3"><Mail size={18}/><div><strong>{invitation.name}</strong><p className="text-xs text-base-content/60">{invitation.email}</p></div></div></td><td className="px-4 py-3 text-xs">{t(statuses[invitation.status])}</td><td colSpan={3} className="px-4 py-3 text-xs text-base-content/50">{t('Vencimiento')}: {new Date(invitation.expires_at).toLocaleString(dateLocale)}</td><td className="px-4 py-3"><div className="flex justify-end gap-1">{['pending','expired'].includes(invitation.status)&&<><IconButton disabled={mutation.busy} label={t('Reenviar invitación')} onClick={()=>void change(invitation,'resend')}><Send size={16}/></IconButton><IconButton disabled={mutation.busy} label={t('Revocar invitación')} onClick={()=>{mutation.clearError();setRevoke(invitation)}}><X size={16}/></IconButton></>}</div></td></tr>)}
        </tbody>
      </table>
    </div>
    {!members.loading&&!invitations.loading&&!members.error&&!invitations.error&&rows.length+pending.length===0&&<p className="py-8 text-center text-sm text-base-content/55">{t('No hay miembros ni invitaciones que coincidan con la búsqueda.')}</p>}
    {roleMember&&<MemberRoleModal member={roleMember} onClose={()=>setRoleMember(null)} onSaved={()=>{setRoleMember(null);members.reload()}}/>}
    {mutation.error&&!open&&!revoke&&<p role="alert" className="mt-4 text-sm text-error">{t(mutation.error)}</p>}
    {open&&<InviteMemberModal onClose={()=>setOpen(false)} onCreated={()=>{setOpen(false);invitations.reload()}}/>}
    {revoke&&<IntegrationDialog title={t('Revocar invitación')} busy={mutation.busy} onClose={()=>{if(!mutation.busy)setRevoke(null)}}><p className="text-sm text-base-content/65">{t('El enlace enviado a {0} dejará de funcionar.',{'0':revoke.email})}</p>{mutation.error&&<p role="alert" className="mt-4 text-sm text-error">{t(mutation.error)}</p>}<div className="mt-6 flex justify-end gap-2"><TextButton label={t('Cancelar')} disabled={mutation.busy} onClick={()=>setRevoke(null)}/><TextButton label={t('Revocar invitación')} variant="error" disabled={mutation.busy} aria-busy={mutation.busy} onClick={()=>void change(revoke,'revoke')}/></div></IntegrationDialog>}
  </section>
}
