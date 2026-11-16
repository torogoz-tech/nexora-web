import { CalendarDays, Workflow } from 'lucide-react'
import { memberRoleLabel } from '../utils/memberRoleLabel'
import { useTranslation } from '../hooks/useTranslation'
import type { OrganizationMember } from '../types/OrganizationMember'
import MemberWorkflowEditor from './MemberWorkflowEditor'
import MemberAccessMethods from './MemberAccessMethods'
import MemberPhoto from './MemberPhoto'
import MemberEmail from './MemberEmail'
export default function MemberProfile({member,onSaved=()=>{}}:{member:OrganizationMember;onSaved?:()=>void}) {
 const {t,dateLocale}=useTranslation()
 return <aside aria-label={t('Perfil del miembro')} className="min-w-0">
  <MemberPhoto member={member}/>
  <h1 className="break-words text-2xl font-semibold tracking-tight">{member.name}</h1>
  {member.position && <p className="mt-2 break-words text-sm text-base-content/70">{member.position}</p>}
  <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-lg bg-base-200 px-2 py-1 text-xs">{t(memberRoleLabel(member.role))}</span><span className={`rounded-lg px-2 py-1 text-xs ${member.active?'bg-success/10 text-success':'bg-base-200 text-base-content/50'}`}>{t(member.archived?'Archivado':member.active?(!member.role&&member.has_password===false?'Pendiente de rol':'Activo'):'Suspendido')}</span></div>
  <dl className="mt-6 space-y-4 text-sm">
   <MemberEmail member={member}/>
   <div><dt className="mb-1 flex items-center gap-2 text-xs text-base-content/45"><Workflow size={14}/>{t('Workflow')}<span className="ml-auto"><MemberWorkflowEditor profile member={member} onSaved={onSaved}/></span></dt><dd className="break-words text-base-content/75">{member.workflow_name||t('Sin workflow asignado')}</dd></div>
   {member.created_at&&<div><dt className="mb-1 flex items-center gap-2 text-xs text-base-content/45"><CalendarDays size={14}/>{t('Miembro desde')}</dt><dd className="text-base-content/75">{new Date(member.created_at).toLocaleDateString(dateLocale)}</dd></div>}
  </dl>
  <section className="mt-6 border-t border-base-300 pt-5"><h2 className="mb-3 text-xs font-semibold text-base-content/55">{t('Métodos de acceso')}</h2><MemberAccessMethods member={member}/></section>
 </aside>
}
