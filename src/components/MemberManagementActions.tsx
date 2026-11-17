import { useContext, useState } from 'react'
import { ShieldUser } from 'lucide-react'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { useTranslation } from '../hooks/useTranslation'
import type { OrganizationMember } from '../types/OrganizationMember'
import IconButton from './IconButton'
import MemberArchiveAction from './MemberArchiveAction'
import MemberPositionEditor from './MemberPositionEditor'
import MemberRoleModal from './MemberRoleModal'

export default function MemberManagementActions({ member, onSaved }: { member: OrganizationMember; onSaved: () => void }) {
  const { t } = useTranslation()
  const permissions = useContext(WorkspacePermissionsContext)
  const [roleMember, setRoleMember] = useState(false)
  const admin = permissions?.grants.some(grant => grant.capability === 'installation:manage' && grant.project_id === null) ?? false
  const manageProjects = permissions?.grants.some(grant => grant.capability === 'member-projects:manage') ?? false
  const canManageRole = admin || manageProjects && member.role !== null && member.role !== 'super_admin'
  if (!admin && !manageProjects) return null
  return <section className="mt-6 border-t border-base-300 pt-5" aria-label={t('Acciones del miembro')}>
    <h2 className="mb-3 text-xs font-semibold text-base-content/55">{t('Acciones')}</h2>
    <div className="flex flex-wrap gap-2">
      {admin && <MemberPositionEditor member={member} onSaved={() => onSaved()} />}
      {canManageRole && <IconButton disabled={member.archived} label={t(admin ? 'Configurar rol de {0}' : 'Configurar proyectos de {0}', { '0': member.name })} onClick={() => setRoleMember(true)}><ShieldUser size={16}/></IconButton>}
      {admin && <MemberArchiveAction member={member} onSaved={onSaved} />}
    </div>
    {roleMember && <MemberRoleModal member={member} onClose={() => setRoleMember(false)} onSaved={() => { setRoleMember(false); onSaved() }}/>} 
  </section>
}
