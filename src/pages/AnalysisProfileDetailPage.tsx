import { lazy, Suspense, useContext } from 'react'
import { ArrowLeft, Download, RefreshCw } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { canReadAnalysisProfiles } from '../utils/canReadAnalysisProfiles'
import { useApiData } from '../hooks/useApiData'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { parseAnalysisProfileDetail } from '../utils/parseAnalysisProfileDetail'
import { exportAnalysisProfile } from '../services/exportAnalysisProfile'
import { downloadAnalysisProfile } from '../services/downloadAnalysisProfile'
import IconButton from '../components/IconButton'
import RowAction from '../components/RowAction'
import DataMessage from '../components/DataMessage'
const JsonCodeViewer = lazy(() => import('../components/JsonCodeViewer'))
export default function AnalysisProfileDetailPage({ id }: { id: string }) {
 const { t } = useTranslation(), permissions=useContext(WorkspacePermissionsContext), allowed = canReadAnalysisProfiles(permissions), mutation = useIntegrationMutation()
 const data = useApiData(allowed ? `/api/v1/analysis-profiles/${encodeURIComponent(id)}` : null, parseAnalysisProfileDetail), profile = data.data
 const invalid = profile && profile.id !== id
 return <section className="flex min-w-0 flex-1 flex-col" aria-label={t('Versión del perfil de análisis')}>
  <header className="mb-6 flex items-center justify-between gap-3"><RowAction to="/settings/analysis-profiles" label={t('Volver a perfiles de análisis')}><ArrowLeft size={16}/></RowAction><div className="flex gap-2"><IconButton label={t('Actualizar perfil de análisis')} disabled={!allowed || data.loading} onClick={data.reload}><RefreshCw size={16}/></IconButton>{profile && !invalid && <IconButton label={t('Exportar perfil de análisis')} disabled={mutation.busy} onClick={() => void mutation.run({ export: id }, async signal => { downloadAnalysisProfile(await exportAnalysisProfile(id, signal)) })}><Download size={16}/></IconButton>}</div></header>
  {!allowed ? <DataMessage error={t('No tienes permiso para administrar los perfiles de análisis.')}/> : data.loading || data.error || invalid ? <DataMessage loading={data.loading} error={t(invalid ? 'El perfil recibido no corresponde a esta versión.' : data.error)} onRetry={data.reload}/> : profile && <>
   <h1 className="text-xl font-semibold">{profile.name}</h1><p className="mt-2 text-sm text-base-content/55">{profile.key} · {profile.version} · {profile.language_id}</p>
   <dl className="my-5 text-xs"><dt className="text-base-content/45">{t('Huella de contenido')}</dt><dd className="mt-2 break-all font-mono text-base-content/65">{profile.checksum}</dd></dl>
   <p className="mb-5 text-sm leading-relaxed text-base-content/55">{t('Esta versión es inmutable. Su compatibilidad estructural no garantiza la cobertura semántica de cualquier repositorio.')}</p>
   <Suspense fallback={<DataMessage loading/>}><JsonCodeViewer value={JSON.stringify(profile.package, null, 2)} label={t('Paquete JSON del perfil de análisis')}/></Suspense>
  </>}
  {mutation.error && <p role="alert" className="mt-4 text-sm text-error">{t(mutation.error)}</p>}
 </section>
}
