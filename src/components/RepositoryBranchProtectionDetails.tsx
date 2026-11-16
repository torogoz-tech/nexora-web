import { useContext, useState } from 'react'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { useTranslation } from '../hooks/useTranslation'
import { useRepositoryBranchProtection } from '../hooks/useRepositoryBranchProtection'
import { repositoryBranchProtectionPath } from '../utils/repositoryBranchProtectionPath'
import { branchProtectionStatusLabel } from '../utils/branchProtectionStatusLabel'
import type { RepositoryBranchProtectionDetailsProps } from '../types/RepositoryBranchProtectionDetailsProps'
export default function RepositoryBranchProtectionDetails({ projectId, repositoryId, provider }: RepositoryBranchProtectionDetailsProps) {
 const { t } = useTranslation()
 const permissions = useContext(WorkspacePermissionsContext)
 const canManage = permissions?.role === 'manager' || permissions?.role === 'super_admin'
 const state = useRepositoryBranchProtection(repositoryBranchProtectionPath(projectId, repositoryId))
 const [editedChecks, setChecks] = useState<string | null>(null)
 const checks = editedChecks ?? state.data?.required_checks.join('\n') ?? ''
 const requiredChecks = [...new Set(checks.split('\n').map(check => check.trim()).filter(Boolean))]
 const report = state.data?.result?.verified ? state.data.result : state.data?.plan
 return <div className="space-y-4 rounded-2xl border border-base-300 p-5">
  <p className="text-sm leading-relaxed text-base-content/65">{t('main, develop, stage y preprod requieren PR, al menos una aprobación y CI correcto. Sin push directo, force push ni eliminación para desarrolladores. Nexora respeta estos controles al integrar.')}</p>
  <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm" role="status">{t(state.data ? branchProtectionStatusLabel(state.data.status) : state.busy ? 'Consultando protección de ramas…' : 'Estado de protección pendiente de verificar')}</p><button type="button" className="btn btn-ghost btn-sm" disabled={state.busy} onClick={state.reload}>{t('Actualizar protección de ramas')}</button></div>
  {state.error && <p role="alert" className="text-sm text-error">{t(state.error)}</p>}
  {report && <ul className="divide-y divide-base-300 text-sm">{report.branches.map(branch => <li key={branch.name} className="flex flex-wrap justify-between gap-2 py-2"><code>{branch.name}</code><span className="text-base-content/60">{t(branch.verified && state.data?.status === 'applied' ? 'Verificada' : 'Incluida en la vista previa')}</span></li>)}</ul>}
  {report?.has_limitations && <p className="text-sm text-warning">{t(provider === 'gitlab' ? 'En GitLab, propietarios y mantenedores con permiso para retirar la protección pueden eliminar ramas desde la interfaz o API.' : 'El proveedor presenta limitaciones. Revisa sus reglas y permisos administrativos antes de integrar.')}</p>}
  {state.data?.status === 'failed' && <p role="alert" className="text-sm text-error">{t('La operación no quedó verificada. Revisa los permisos y controles del proveedor y prepara una nueva vista previa.')}</p>}
  {canManage && <div className="space-y-3 border-t border-base-300 pt-4">
   <label className="block text-sm"><span className="mb-2 block font-medium">{t('Comprobaciones de CI requeridas')}</span><textarea className="textarea w-full font-mono" rows={3} value={checks} disabled={state.busy} onChange={event => { setChecks(event.target.value); state.invalidatePreview() }}/></label>
   <p className="text-xs leading-relaxed text-base-content/60">{t(provider === 'github' ? 'Escribe los nombres exactos de las comprobaciones de GitHub, uno por línea. Debes indicar al menos una comprobación.' : 'GitLab exige un pipeline correcto. Puedes dejar vacía la lista de comprobaciones.')}</p>
   <div className="flex flex-wrap gap-2"><button type="button" className="btn btn-outline btn-sm" disabled={state.busy || provider === 'github' && !requiredChecks.length} onClick={() => void state.mutate('preview', requiredChecks)}>{t('Preparar vista previa')}</button><button type="button" className="btn btn-primary btn-sm" disabled={state.busy || state.previewRevision === null} onClick={() => void state.mutate('apply', requiredChecks)}>{t('Aplicar protección de ramas')}</button></div>
   <p className="text-xs text-base-content/50">{t('La vista previa consulta el proveedor. Aplicar modifica sus reglas y verifica el resultado.')}</p>
  </div>}
 </div>
}
