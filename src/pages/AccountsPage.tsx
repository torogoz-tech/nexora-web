import AlphabeticSortButton from '../components/AlphabeticSortButton'
import {useAlphabeticOrder} from '../hooks/useAlphabeticOrder'
import {useContext} from 'react'
import {WorkspacePermissionsContext} from '../app/WorkspacePermissionsContext'
import { useTranslation } from '../hooks/useTranslation'
import IconButton from '../components/IconButton'
import Dropdown from '../components/Dropdown'
import { useState } from 'react'
import { Plug, RefreshCw, Search } from 'lucide-react'
import { useGitAccounts } from '../hooks/useGitAccounts'
import { filterGitAccounts } from '../utils/filterGitAccounts'
import ConnectAccountModal from '../components/ConnectAccountModal'
import GitAccountRow from '../components/GitAccountRow'
import ConnectionAccessModal from '../components/ConnectionAccessModal'
import RevokeConnectionModal from '../components/RevokeConnectionModal'
import DataMessage from '../components/DataMessage'
import type { GitConnection } from '../types/GitConnection'
import type { GitProvider } from '../types/GitProvider'
export default function AccountsPage() {
 const order=useAlphabeticOrder()
  const { t } = useTranslation()
  const manageable=useContext(WorkspacePermissionsContext)?.grants.some(g=>['installation:manage','connections:manage'].includes(g.capability)&&g.project_id===null)
  const accounts = useGitAccounts()
  const [search, setSearch] = useState('')
  const [provider, setProvider] = useState<GitProvider | 'all'>('all')
  const [connecting, setConnecting] = useState(false)
  const [access, setAccess] = useState<GitConnection | null>(null)
  const [revoking, setRevoking] = useState<GitConnection | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const visible = filterGitAccounts(accounts.accounts, search, provider).sort((a,b)=>order.compare(a.remote_login,b.remote_login))
  return (
    <section aria-label={t('Conexiones Git')} className="flex flex-1 flex-col">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {manageable&&<IconButton
          type="button"
          variant="primary"
          onClick={() => setConnecting(true)}
          label={t('Conectar cuenta')}
        >
          <Plug size={15} />
        </IconButton>}
        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:ml-auto sm:flex sm:w-auto">
          <label className="input input-sm min-w-0 w-full sm:w-48">
            <Search size={15} />
            <input
              aria-label={t('Buscar cuentas')}
              placeholder={t('Buscar cuentas…')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <AlphabeticSortButton descending={order.descending} onChange={order.setDescending}/><Dropdown
            label={t('Filtrar cuentas por proveedor')}
            value={provider}
            onChange={(value) => setProvider(value as GitProvider | 'all')}
            options={[
              { value: 'all', label: t('Todos los proveedores') },
              { value: 'github', label: 'GitHub' },
              { value: 'gitlab', label: 'GitLab' },
            ]}
            className="order-3 col-span-2 w-full sm:order-none sm:w-52"
          />
          <IconButton
            type="button"
            variant="ghost"
            disabled={accounts.loading}
            onClick={accounts.reload}
            label={t('Actualizar cuentas')}
          >
            <RefreshCw size={15} />
          </IconButton>
        </div>
      </div>
      {notice && (
        <p role="status" className="my-3 text-sm text-success">
          {t(notice)}
        </p>
      )}
      {accounts.loading || accounts.error ? (
        <DataMessage
          loading={accounts.loading}
          error={t(accounts.error)}
          onRetry={accounts.reload}
        />
      ) : visible.length === 0 ? (
        <p
          role="status"
          className="py-12 text-center text-sm text-base-content/50"
        >
          {accounts.accounts.length
            ? t('No hay cuentas que coincidan con tu búsqueda.')
            : t(
                'Todavía no hay cuentas conectadas. Conecta una cuenta para comenzar.',
              )}
        </p>
      ) : (
        <ul className="divide-y divide-base-300">
          {visible.map((account) => (
            <GitAccountRow
              key={account.id}
              account={account}
              onAccess={setAccess}
              onRevoke={setRevoking}
            />
          ))}
        </ul>
      )}
      {connecting && (
        <ConnectAccountModal
          onClose={() => setConnecting(false)}
          onConnected={() => {
            setConnecting(false)
            setSearch('')
            setProvider('all')
            accounts.reload()
            setNotice('Cuenta conectada.')
          }}
        />
      )}
      {access && (
        <ConnectionAccessModal
          connection={access}
          onClose={() => setAccess(null)}
        />
      )}{' '}
      {revoking && (
        <RevokeConnectionModal
          connection={revoking}
          onClose={() => setRevoking(null)}
          onRevoked={() => {
            accounts.reload()
            setNotice('Cuenta revocada.')
          }}
        />
      )}
    </section>
  )
}
