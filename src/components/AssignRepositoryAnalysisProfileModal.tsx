import { useContext, useState } from 'react'
import { Save, Search, X } from 'lucide-react'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { canManageAnalysisProfiles } from '../utils/canManageAnalysisProfiles'
import { useTranslation } from '../hooks/useTranslation'
import { useWorkCatalog } from '../hooks/useWorkCatalog'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { parseAnalysisProfilePage } from '../utils/parseAnalysisProfilePage'
import { assignRepositoryAnalysisProfile } from '../services/assignRepositoryAnalysisProfile'
import IntegrationDialog from './IntegrationDialog'
import Dropdown from './Dropdown'
import DataMessage from './DataMessage'
import TextButton from './TextButton'
import type { AssignRepositoryAnalysisProfileModalProps } from '../types/AssignRepositoryAnalysisProfileModalProps'
export default function AssignRepositoryAnalysisProfileModal({ projectId, repositoryId, assignment, onClose, onSaved }: AssignRepositoryAnalysisProfileModalProps) {
 const { t } = useTranslation(), permissions = useContext(WorkspacePermissionsContext), mutation = useIntegrationMutation()
 const allowed = canManageAnalysisProfiles(permissions) && assignment.can_manage
 const catalog = useWorkCatalog(allowed ? '/api/v1/analysis-profiles' : null, parseAnalysisProfilePage)
 const initialMode = assignment.mode ?? (assignment.profile ? 'manual' : 'legacy')
 const initialIds = assignment.profiles?.map(profile => profile.id) ?? (assignment.profile ? [assignment.profile.id] : [])
 const [mode, setMode] = useState(initialMode), [selected, setSelected] = useState(initialIds), [search, setSearch] = useState('')
 const changed = mode !== initialMode || mode === 'manual' && [...selected].sort().join(',') !== [...initialIds].sort().join(',')
 const valid = mode === 'automatic' || mode === 'manual' && selected.length > 0 && selected.length <= 64 && selected.every(id => catalog.items.some(profile => profile.id === id)) && !catalog.loading && !catalog.error
 const filtered = catalog.items.filter(profile => `${profile.name} ${profile.key} ${profile.version} ${profile.language_id}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
 return <IntegrationDialog className="max-h-[calc(100dvh-3rem)] overflow-y-auto" title={t('Asignar perfil de análisis')} onClose={onClose} busy={mutation.busy}>
  <form className="space-y-5" onSubmit={event => { event.preventDefault(); if (!allowed || !valid || !changed) return; const selection = { mode, profile_version_ids: mode === 'automatic' ? [] : selected }; void mutation.run({ projectId, repositoryId, revision: assignment.revision, ...selection }, async (signal, key) => { await assignRepositoryAnalysisProfile(projectId, repositoryId, assignment.revision, selection, key, signal); onSaved() }) }}>
   <p className="text-sm leading-relaxed text-base-content/60">{t('Los cambios se aplican a las nuevas sincronizaciones. Los trabajos solicitados conservan sus perfiles y versiones.')}</p>
   <label className="flex flex-col gap-2 text-sm">{t('Selección de perfiles')}<Dropdown label={t('Selección de perfiles')} value={mode} onChange={value => { if (value === 'automatic' || value === 'manual' || value === 'legacy') setMode(value) }} disabled={!allowed || mutation.busy} options={[{ value: 'automatic', label: t('Automático') }, { value: 'manual', label: t('Manual') }, ...(initialMode === 'legacy' ? [{ value: 'legacy', label: t('Configuración anterior del servidor') }] : [])]}/></label>
   {mode === 'automatic' && <p className="text-sm leading-relaxed text-base-content/60">{t('Nexora detecta los tipos de archivo y usa la versión más reciente de los perfiles importados. Cada archivo se analiza una sola vez.')}</p>}
   {mode === 'legacy' && <p className="text-sm leading-relaxed text-base-content/60">{t('Este repositorio conserva la configuración anterior del servidor hasta que elijas Automático o Manual.')}</p>}
   {!allowed && <DataMessage error={t('No tienes permiso para administrar los perfiles de análisis.')}/>}
   {mode === 'manual' && allowed && <fieldset disabled={mutation.busy} className="min-w-0 space-y-3"><legend className="mb-2 text-sm font-medium">{t('Versiones fijadas')} · {selected.length}/64</legend>
    <label className="input input-sm flex w-full items-center gap-2"><Search size={14} aria-hidden="true"/><input aria-label={t('Buscar perfiles de análisis')} value={search} onChange={event => setSearch(event.target.value)}/></label>
    {catalog.loading || catalog.error ? <DataMessage loading={catalog.loading} error={t(catalog.error)} onRetry={catalog.reload}/> : <div className="max-h-64 space-y-1 overflow-y-auto">{filtered.map(profile => <label key={profile.id} className="flex cursor-pointer items-start gap-3 rounded-xl px-2 py-3 hover:bg-base-200"><input type="checkbox" className="checkbox checkbox-sm mt-0.5 shrink-0" checked={selected.includes(profile.id)} disabled={!selected.includes(profile.id) && selected.length >= 64} onChange={event => setSelected(ids => event.target.checked ? [...ids, profile.id] : ids.filter(id => id !== profile.id))}/><span className="min-w-0"><span className="block break-words text-sm font-medium">{profile.name}</span><span className="block break-words text-xs text-base-content/50">{profile.version} · {profile.language_id} · {profile.key}</span></span></label>)}{!filtered.length && <p className="py-4 text-sm text-base-content/50">{t(catalog.items.length ? 'No hay perfiles que coincidan con la búsqueda.' : 'Importa un perfil en Configuración para poder asignarlo.')}</p>}</div>}
    <p className="text-xs leading-relaxed text-base-content/50">{t('Selecciona hasta 64 perfiles sin extensiones superpuestas. Sus versiones permanecerán fijadas.')}</p>
   </fieldset>}
   {mutation.error && <p role="alert" className="text-sm text-error">{t(mutation.error)}</p>}
   <footer className="flex justify-end gap-2 border-t border-base-300 pt-4"><TextButton label={t('Cancelar')} disabled={mutation.busy} onClick={onClose}><X size={16}/></TextButton><TextButton type="submit" label={t('Guardar asignación')} variant="primary" disabled={!allowed || !valid || mutation.busy || !changed}><Save size={16}/></TextButton></footer>
  </form>
 </IntegrationDialog>
}
