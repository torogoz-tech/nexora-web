import AlphabeticSortButton from '../components/AlphabeticSortButton'
import {useAlphabeticOrder} from '../hooks/useAlphabeticOrder'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router'
import { Download, Eye, RefreshCw, Search, Upload } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { canReadAnalysisProfiles } from '../utils/canReadAnalysisProfiles'
import { canManageAnalysisProfiles } from '../utils/canManageAnalysisProfiles'
import { useWorkCatalog } from '../hooks/useWorkCatalog'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { parseAnalysisProfilePage } from '../utils/parseAnalysisProfilePage'
import { exportAnalysisProfile } from '../services/exportAnalysisProfile'
import { downloadAnalysisProfile } from '../services/downloadAnalysisProfile'
import IconButton from '../components/IconButton'
import RowAction from '../components/RowAction'
import DataMessage from '../components/DataMessage'
import ImportAnalysisProfileModal from '../components/ImportAnalysisProfileModal'
export default function AnalysisProfilesPage() {
 const order=useAlphabeticOrder()
 const { t } = useTranslation(), navigate = useNavigate(), permissions=useContext(WorkspacePermissionsContext), allowed = canReadAnalysisProfiles(permissions), manageable=canManageAnalysisProfiles(permissions)||!!permissions?.grants.some(g=>g.capability==='analysis-profiles:contribute'&&g.project_id===null), mutation = useIntegrationMutation()
 const profiles = useWorkCatalog(allowed ? '/api/v1/analysis-profiles' : null, parseAnalysisProfilePage)
 const [search, setSearch] = useState(''), [importing, setImporting] = useState(false)
 const items = profiles.items.filter(profile => [profile.name, profile.key, profile.version, profile.language_id].some(value => value.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())))
 return <section className="flex min-w-0 flex-1 flex-col" aria-label={t('Perfiles de análisis')}>
  <header className="mb-5 flex items-center justify-between gap-3"><h1 className="text-xl font-semibold">{t('Perfiles de análisis')}</h1><div className="flex gap-2"><AlphabeticSortButton descending={order.descending} onChange={order.setDescending}/>{manageable && <IconButton label={t('Importar perfil de análisis')} variant="primary" onClick={() => setImporting(true)}><Upload size={16}/></IconButton>}<IconButton label={t('Actualizar perfiles de análisis')} disabled={!allowed || profiles.loading} onClick={profiles.reload}><RefreshCw size={16}/></IconButton></div></header>
  <p className="mb-5 text-sm leading-relaxed text-base-content/55">{t('Importa y exporta modelos declarativos completos. Cada versión conserva su contenido y puede asignarse explícitamente a un repositorio.')}</p>
  <label className="input input-sm mb-5 ml-auto w-full sm:w-72"><Search size={15}/><input value={search} placeholder={t('Buscar perfiles…')} aria-label={t('Buscar perfiles de análisis')} onChange={event => setSearch(event.target.value)}/></label>
  {!allowed ? <DataMessage error={t('No tienes permiso para administrar los perfiles de análisis.')}/> : profiles.loading || profiles.error ? <DataMessage loading={profiles.loading} error={t(profiles.error)} onRetry={profiles.reload}/> : items.length ? <div className="overflow-x-auto"><table className="table w-full"><thead><tr><th>{t('Perfil')}</th><th>{t('Versión')}</th><th>{t('Lenguaje principal')}</th><th>{t('Huella de contenido')}</th><th><span className="sr-only">{t('Acciones')}</span></th></tr></thead><tbody>{[...items].sort((a,b)=>order.compare(a.name,b.name)||order.compare(a.version,b.version)).map(profile => <tr key={profile.id}><td><span className="block font-medium">{profile.name}</span><span className="mt-1 block text-xs text-base-content/45">{profile.key}</span></td><td>{profile.version}</td><td>{profile.language_id}</td><td><span className="font-mono text-xs text-base-content/50" title={profile.checksum}>{profile.checksum.slice(0, 12)}</span></td><td><div className="flex justify-end gap-1"><RowAction to={`/settings/analysis-profiles/${encodeURIComponent(profile.id)}`} label={t('Ver versión del perfil')}><Eye size={15}/></RowAction><IconButton label={t('Exportar perfil de análisis')} disabled={mutation.busy} onClick={() => void mutation.run({ export: profile.id }, async signal => { downloadAnalysisProfile(await exportAnalysisProfile(profile.id, signal)) })}><Download size={15}/></IconButton></div></td></tr>)}</tbody></table></div> : <p className="py-12 text-center text-sm text-base-content/45">{t(search ? 'No hay perfiles que coincidan con la búsqueda.' : 'Todavía no hay perfiles de análisis importados.')}</p>}
  {mutation.error && <p role="alert" className="mt-4 text-sm text-error">{t(mutation.error)}</p>}
  {importing && <ImportAnalysisProfileModal onClose={() => setImporting(false)} onImported={id => { setImporting(false); profiles.reload(); navigate(`/settings/analysis-profiles/${encodeURIComponent(id)}`) }}/>}
 </section>
}
