import {useContext} from 'react'
import {WorkspacePermissionsContext} from '../app/WorkspacePermissionsContext'
import { useTranslation } from '../hooks/useTranslation'
import RowAction from './RowAction'
import { GitPullRequest, GitBranch, UsersRound, Unplug } from 'lucide-react'
import type { GitAccountRowProps } from '../types/GitAccountRowProps'
export default function GitAccountRow({
  account,
  onAccess,
  onRevoke,
}: GitAccountRowProps) {
  const { t } = useTranslation()
  const manageable=useContext(WorkspacePermissionsContext)?.grants.some(g=>['installation:manage','connections:manage'].includes(g.capability)&&g.project_id===null)
  const Icon = account.provider === 'github' ? GitPullRequest : GitBranch
  return (
    <li className="flex flex-wrap items-center gap-3 py-5">
      <Icon size={20} className="shrink-0 text-base-content/50" />
      <div className="min-w-0 flex-1">
        <p
          className={`break-words text-sm font-semibold ${account.status === 'revoked' ? 'text-base-content/40 line-through' : ''}`}
        >
          {account.remote_login}
        </p>
        <p className="mt-1 break-all text-xs text-base-content/45">
          {account.host}
          {account.installation_id
            ? t(' · Instalación {0}', { '0': account.installation_id })
            : ''}
        </p>
        <p className="mt-1 text-xs text-base-content/45">
          {account.status === 'revoked' ? t('Revocada') : t('Activa')}
        </p>
      </div>
      {manageable && account.status === 'active' && (
        <div className="flex flex-wrap gap-1">
          <RowAction label={t('Proyectos')} onClick={() => onAccess(account)}>
            <UsersRound size={16} aria-hidden="true" />
          </RowAction>
          <RowAction label={t('Revocar')} onClick={() => onRevoke(account)}>
            <Unplug size={16} aria-hidden="true" />
          </RowAction>
        </div>
      )}
    </li>
  )
}
