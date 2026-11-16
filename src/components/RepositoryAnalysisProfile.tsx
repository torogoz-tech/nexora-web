import {useLocation} from 'react-router'
import { useContext, useState } from 'react'
import { Boxes, Pencil, RefreshCw, Settings2 } from 'lucide-react'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { canManageAnalysisProfiles } from '../utils/canManageAnalysisProfiles'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { parseAnalysisProfileAssignment } from '../utils/parseAnalysisProfileAssignment'
import Dropdown from './Dropdown'
import RepositoryAnalysisProfileSelection from './RepositoryAnalysisProfileSelection'
import DataMessage from './DataMessage'
import IconButton from './IconButton'
import RowAction from './RowAction'
import AssignRepositoryAnalysisProfileModal from './AssignRepositoryAnalysisProfileModal'
import type { RepositoryAnalysisProfileProps } from '../types/RepositoryAnalysisProfileProps'
export default function RepositoryAnalysisProfile({ projects, onChanged }: RepositoryAnalysisProfileProps) {
 const location=useLocation()
 const { t } = useTranslation(), permissions = useContext(WorkspacePermissionsContext), administrative = canManageAnalysisProfiles(permissions)
 const [projectId, setProjectId] = useState(projects.length === 1 ? projects[0].id : ''), [editing, setEditing] = useState(false)
 const selected = projects.find(project => project.id === projectId)
 const data = useApiData(selected ? `/api/v1/projects/${encodeURIComponent(selected.id)}/repositories/${encodeURIComponent(selected.repository_id)}/analysis-profile` : null, parseAnalysisProfileAssignment)
 const assignment = data.data, invalid = assignment && assignment.repository_id !== selected?.repository_id
 return <section className="min-w-0" aria-label={t('Perfil de análisis del repositorio')}>
  <header className="mb-3 flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-sm font-semibold"><Boxes size={15}/>{t('Análisis del repositorio')}</h2><div className="flex gap-1">{administrative && <RowAction to="/settings/analysis-profiles" label={t('Administrar perfiles de análisis')}><Settings2 size={14}/></RowAction>}{selected && <IconButton label={t('Actualizar asignación del perfil')} disabled={data.loading} onClick={data.reload}><RefreshCw size={14}/></IconButton>}{administrative && assignment?.can_manage && !invalid && <IconButton label={t('Asignar perfil de análisis')} onClick={() => setEditing(true)}><Pencil size={14}/></IconButton>}</div></header>
  {projects.length > 1 && <Dropdown label={t('Proyecto del perfil de análisis')} value={projectId} placeholder={t('Selecciona un proyecto')} onChange={value => { setProjectId(value); setEditing(false) }} options={projects.map(project => ({ value: project.id, label: project.name }))}/>}
  {!selected ? <p className="mt-3 text-xs text-base-content/45">{t('Selecciona un proyecto vinculado para consultar su perfil de análisis.')}</p> : data.loading || data.error || invalid ? <DataMessage loading={data.loading} error={t(invalid ? 'La asignación no corresponde a este repositorio.' : data.error)} onRetry={data.reload}/> : <>
   {assignment?.mode === 'automatic' ? <p className="text-sm">{t('Automático')}<span className="mt-1 block text-xs leading-relaxed text-base-content/50">{t('Para cada extensión, la versión más reciente compatible se fija al solicitar la sincronización.')}</span></p> : (assignment?.profiles ?? (assignment?.profile ? [assignment.profile] : [])).length ? <ul className="space-y-3">{(assignment?.profiles ?? (assignment?.profile ? [assignment.profile] : [])).map(profile => <li key={profile.id}><p className="break-words text-sm font-medium">{profile.name}</p><p className="mt-1 break-words text-xs text-base-content/50">{profile.version} · {profile.language_id}</p><p className="mt-1 font-mono text-xs text-base-content/40" title={profile.checksum}>{profile.checksum.slice(0, 12)}</p></li>)}</ul> : <p className="mt-3 text-xs leading-relaxed text-base-content/50">{t('Sin perfil gestionado asignado. Puede existir una configuración del servidor.')}</p>}
   {assignment?.last_selection && <RepositoryAnalysisProfileSelection report={assignment.last_selection} browseBase={`/code/repositories/${encodeURIComponent(selected.id)}/${encodeURIComponent(selected.repository_id)}/files?${new URLSearchParams({returnTo:location.pathname+location.search})}`}/>}
  </>}

  {editing && selected && assignment && administrative && assignment.can_manage && !invalid && <AssignRepositoryAnalysisProfileModal key={`${selected.id}:${selected.repository_id}:${assignment.revision}`} projectId={selected.id} repositoryId={selected.repository_id} assignment={assignment} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); data.reload(); onChanged() }}/>}
 </section>
}
