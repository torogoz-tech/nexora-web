import Pagination from './Pagination'
import { useTranslation } from '../hooks/useTranslation'
import TextButton from './TextButton'
import IconButton from './IconButton'
import RowAction from './RowAction'
import Dropdown from './Dropdown'
import { useState } from 'react'
import {
  RefreshCw,
  X,
  Plug,
  ExternalLink,
} from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { parseGithubInstallationPage } from '../utils/parseGithubInstallationPage'
import { parseGitConnection } from '../utils/parseGitConnection'
import { safeExternalUrl } from '../utils/safeExternalUrl'
import { integrationRequest } from '../services/integrationRequest'
import IntegrationDialog from './IntegrationDialog'
import DataMessage from './DataMessage'
import type { GithubInstallationPickerProps } from '../types/GithubInstallationPickerProps'
export default function GithubInstallationPicker({
  consent,
  onDone,
  onCancel,
}: GithubInstallationPickerProps) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState('')
  const mutation = useIntegrationMutation()
  const base = `/api/v1/git/github/authorizations/${encodeURIComponent(consent.id)}`
  const installations = useApiData(
    `${base}/installations?page=${page}&limit=20`,
    parseGithubInstallationPage,
  )
  const installUrl = installations.data
    ? safeExternalUrl(installations.data.installation_url)
    : null
  return (
    <IntegrationDialog
      title={t('Elegir instalación de GitHub')}
      busy={mutation.busy}
      onClose={onCancel}
    >
      <p className="mb-5 text-sm text-base-content/55">
        {' '}
        {t('Autorizaste la cuenta')}{' '}
        <strong className="text-base-content">{consent.remote_login}</strong>
        {t(
          '. Selecciona la instalación con los repositorios que utilizará Nexora.',
        )}{' '}
      </p>
      {installations.loading || installations.error ? (
        <DataMessage
          loading={installations.loading}
          error={t(installations.error)}
          onRetry={installations.reload}
        />
      ) : (
        <>
          <label className="flex flex-col gap-2 text-sm">
            {' '}
            {t('Instalación')}{' '}
            <Dropdown
              label={t('Instalación')}
              value={selected}
              onChange={setSelected}
              disabled={mutation.busy}
              placeholder={t('Selecciona una instalación')}
              options={(installations.data?.items ?? []).map((item) => ({
                value: item.id,
                label: `${item.account_login} · ${item.repository_selection === 'all' ? t('Todos los repositorios') : 'Repositorios seleccionados'}`,
              }))}
            />
          </label>
          {installations.data?.items.length === 0 && (
            <p className="mt-4 text-sm text-base-content/55">
              {' '}
              {t(
                'No hay instalaciones disponibles para esta cuenta. Instala la App y actualiza la lista.',
              )}{' '}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {installUrl && (
              <RowAction href={installUrl} label={t('Instalar GitHub App')}>
                <ExternalLink size={14} />
              </RowAction>
            )}
            <IconButton
              variant="ghost"
              type="button"
              disabled={mutation.busy}
              onClick={installations.reload}
              label={t('Actualizar')}
            >
              <RefreshCw size={16} aria-hidden="true" />
            </IconButton>

          </div>
          <Pagination page={page} busy={mutation.busy} hasNext={!!installations.data?.next_page} onPrevious={()=>{setPage(page-1);setSelected('')}} onNext={()=>{if(installations.data?.next_page){setPage(installations.data.next_page);setSelected('')}}}/>
        </>
      )}
      {mutation.error && (
        <p role="alert" className="mt-4 text-sm text-error">
          {t(mutation.error)}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <TextButton
          type="button"
          variant="ghost"
          disabled={mutation.busy}
          onClick={onCancel}
          label={t('Cancelar')}
        >
          <X size={16} aria-hidden="true" />
        </TextButton>
        <TextButton
          type="button"
          variant="primary"
          disabled={mutation.busy || !selected || installations.loading}
          onClick={() =>
            void mutation.run({ base, selected }, async (signal, key) => {
              parseGitConnection(
                await integrationRequest(
                  `${base}/connections`,
                  'POST',
                  { installation_id: selected },
                  key,
                  signal,
                ),
              )
              onDone()
            })
          }
          label={mutation.busy ? t('Conectando…') : t('Conectar instalación')}
          aria-busy={mutation.busy}
        >
          <Plug size={16} aria-hidden="true" />
        </TextButton>
      </div>
    </IntegrationDialog>
  )
}
