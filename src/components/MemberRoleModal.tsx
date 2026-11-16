import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { useContext, useEffect, useState } from 'react'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { useTranslation } from '../hooks/useTranslation'
import { getMemberRole } from '../services/getMemberRole'
import { getProjects } from '../services/getProjects'
import { writeMemberRole } from '../services/writeMemberRole'
import { memberRoleLabel } from '../utils/memberRoleLabel'
import type { OrganizationMember } from '../types/OrganizationMember'
import type { MemberRole } from '../types/MemberRole'
import type { Project } from '../types/Project'
import IntegrationDialog from './IntegrationDialog'
import Dropdown from './Dropdown'
import TextButton from './TextButton'
export default function MemberRoleModal({ member, onClose, onSaved }: {
  member: OrganizationMember
  onClose: () => void
  onSaved: () => void
}) {
  const { t } = useTranslation()
  const permissions=useContext(WorkspacePermissionsContext)
  const admin=permissions?.grants.some(g=>g.capability==='installation:manage'&&g.project_id===null)??false
  const globalScope=admin||(permissions?.grants.some(g=>g.capability==='member-projects:manage'&&g.project_id===null)??false)
  const canSelect=(id:string)=>admin||(permissions?.grants.some(g=>g.capability==='member-projects:manage'&&(g.project_id===null||g.project_id===id))??false)
  const mutation = useIntegrationMutation()
  const [role, setRole] = useState<MemberRole | ''>('')
  const [allProjects, setAllProjects] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [revision, setRevision] = useState<number | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsReady, setProjectsReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [projectError, setProjectError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const assignment = await getMemberRole(member.id, controller.signal)
        if (controller.signal.aborted) return
        setRole(assignment.role ?? '')
        setAllProjects(assignment.all_projects)
        setSelected(assignment.project_ids)
        setRevision(assignment.revision)
        if (assignment.role === 'super_admin') return
        try {
          const items: Project[] = []
          const cursors = new Set<string>()
          let after: string | undefined
          do {
            const page = await getProjects(controller.signal, true, after)
            items.push(...page.items)
            after = page.next_cursor ?? undefined
            if (after && cursors.has(after)) throw Error('invalid-response')
            if (after) cursors.add(after)
          } while (after)
          if (!controller.signal.aborted) {
            setProjects(items)
            setProjectsReady(true)
          }
        } catch {
          if (!controller.signal.aborted) setProjectError(true)
        }
      } catch (error) {
        if (!controller.signal.aborted) setLoadError(error instanceof Error && error.name === 'Error' ? error.message : 'No pudimos consultar el rol del miembro. Vuelve a intentarlo.')
      }
    }
    void load()
    return () => controller.abort()
  }, [member.id, attempt])
  const external=role==='user'||role==='supervisor'
  const readOnly = role === 'super_admin'
  async function save() {
    if (!role || role === 'super_admin' || revision === null || (!external && !allProjects && (!projectsReady || selected.length === 0))) return
    const payload = { role, all_projects: external ? false : allProjects, project_ids: external || allProjects ? [] : selected, expected_revision: revision }
    const ok = await mutation.run({ memberId: member.id, ...payload }, async (signal, key) => {
      await writeMemberRole(member.id, payload, signal, key)
    })
    if (ok) onSaved()
  }
  return <IntegrationDialog title={t(admin?'Configurar rol de {0}':'Configurar proyectos de {0}', { '0': member.name })} busy={mutation.busy} onClose={onClose}>
    {revision === null ? <div className="space-y-4">
      {loadError ? <><p role="alert" className="text-sm text-error">{t(loadError)}</p><TextButton label={t('Reintentar')} onClick={() => { setLoadError(null); setAttempt(value => value + 1) }}/></> : <p role="status" className="text-sm text-base-content/55">{t('Cargando rol del miembro…')}</p>}
    </div> : readOnly ? <div className="space-y-4"><p className="font-medium">{t(memberRoleLabel(role))}</p><p className="text-sm text-base-content/65">{t('Este rol se configura únicamente durante la instalación y tiene acceso a todos los proyectos.')}</p><div className="flex justify-end"><TextButton label={t('Cerrar')} onClick={onClose}/></div></div> : <form className="space-y-5" onSubmit={event => { event.preventDefault(); void save() }}>
      {admin&&<div className="flex flex-col gap-2 text-sm"><span>{t('Rol')}</span><Dropdown label={t('Rol')} required value={role} placeholder={t('Selecciona un rol')} disabled={mutation.busy} options={(['user','supervisor','developer','technical_lead','pmo','manager'] as const).map(value=>({value,label:t(memberRoleLabel(value))}))} onChange={value=>setRole(value as Exclude<MemberRole,'super_admin'>)}/></div>}
      {!external&&<fieldset className="space-y-3" disabled={mutation.busy}><legend className="mb-3 text-sm font-medium">{t('Alcance de proyectos')}</legend>
        <label className="flex cursor-pointer items-start gap-3 text-sm"><input type="checkbox" className="toggle toggle-sm shrink-0" checked={allProjects} disabled={!globalScope} onChange={event => setAllProjects(event.target.checked)}/><span>{t('Todos los proyectos, incluidos los futuros')}</span></label>
        {!allProjects && <><p className="text-xs text-base-content/55">{t('Selecciona uno o más proyectos.')}</p>{projectError ? <p role="alert" className="text-sm text-error">{t('No pudimos cargar los proyectos. Cierra y vuelve a abrir la configuración.')}</p> : !projectsReady ? <p role="status" className="text-sm text-base-content/55">{t('Cargando proyectos…')}</p> : <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-base-300 p-3">{projects.length === 0 && <p className="text-sm text-base-content/55">{t('No hay proyectos disponibles.')}</p>}{projects.map(project => <label key={project.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm hover:bg-base-200"><input type="checkbox" className="checkbox checkbox-sm" checked={selected.includes(project.id)} disabled={!canSelect(project.id)} onChange={event => setSelected(value => event.target.checked ? [...value, project.id] : value.filter(id => id !== project.id))}/><span className="min-w-0 break-words">{project.name}{project.archived ? ` (${t('Archivado')})` : ''}</span></label>)}{selected.filter(id => !projects.some(project => project.id === id)).map(id => <label key={id} className="flex items-center gap-3 p-2 text-sm"><input type="checkbox" className="checkbox checkbox-sm" checked disabled={!canSelect(id)} onChange={() => setSelected(value => value.filter(valueId => valueId !== id))}/>{t('Proyecto no disponible')}</label>)}</div>}</>}
      </fieldset>}
      {mutation.error && <p role="alert" className="text-sm text-error">{t(mutation.error)}</p>}
      <div className="flex justify-end gap-2"><TextButton type="button" label={t('Cancelar')} disabled={mutation.busy} onClick={onClose}/><TextButton type="submit" variant="primary" label={t('Guardar cambios')} disabled={mutation.busy || !role || (!external && !allProjects && (!projectsReady || selected.length === 0))} aria-busy={mutation.busy}/></div>
    </form>}
  </IntegrationDialog>
}
