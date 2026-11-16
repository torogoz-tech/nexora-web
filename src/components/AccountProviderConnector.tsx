import { useTranslation } from '../hooks/useTranslation'
import TextButton from './TextButton'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { X, GitPullRequest, GitBranch, Plug } from 'lucide-react'
import { useGitConfiguration } from '../hooks/useGitConfiguration'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { startGitConnection } from '../services/startGitConnection'
import { parseGitConnection } from '../utils/parseGitConnection'
import { parseGithubConsent } from '../utils/parseGithubConsent'
import GithubInstallationPicker from './GithubInstallationPicker'
import type { GithubConsent } from '../types/GithubConsent'
import type { AccountProviderConnectorProps } from '../types/AccountProviderConnectorProps'
export default function AccountProviderConnector({
  provider,
  onConnected,
}: AccountProviderConnectorProps) {
  const { t } = useTranslation()
  const configuration = useGitConfiguration(provider)
  const config = configuration.data?.configuration
  const mutation = useIntegrationMutation()
  const [consent, setConsent] = useState<GithubConsent | null>(null)
  const github = provider === 'github'
  const Icon = github ? GitPullRequest : GitBranch
  const sameOrigin = config
    ? new URL(config.redirect_uri).origin === window.location.origin
    : true
  return (
    <>
      <article className="rounded-xl border border-base-300 p-4">
        <div className="flex items-center gap-3">
          <Icon size={21} className="text-base-content/60" />
          <h3 className="font-semibold">{github ? 'GitHub' : 'GitLab'}</h3>
        </div>
        <p className="mt-3 text-sm text-base-content/55">
          {github
            ? t('Autoriza tu cuenta y elige la instalación de tu organización.')
            : t(
                'Autoriza tu cuenta para acceder a sus repositorios y merge requests.',
              )}
        </p>
        {configuration.data?.status === 'missing' && (
          <p className="mt-3 text-xs text-base-content/55">
            {' '}
            {t('Este proveedor todavía no está configurado.')}{' '}
            <Link className="link" to="/settings/integrations">
              {' '}
              {t('Ir a Integraciones')}{' '}
            </Link>
          </p>
        )}
        {config?.enabled === false && (
          <p className="mt-3 text-xs text-base-content/55">
            {' '}
            {t('La integración está deshabilitada.')}{' '}
            <Link className="link" to="/settings/integrations">
              {' '}
              {t('Revisar integración')}{' '}
            </Link>
          </p>
        )}
        {!sameOrigin && (
          <p className="mt-3 text-xs leading-relaxed text-warning">
            {' '}
            {t(
              'El retorno de autorización usa otro dominio. Solicita al administrador que unifique el dominio de la web y su retorno.',
            )}{' '}
          </p>
        )}
        {configuration.error && (
          <p role="alert" className="mt-3 text-sm text-error">
            {t(configuration.error)}{' '}
            <TextButton
              type="button"
              label={t('Reintentar')}
              onClick={configuration.reload}
            >
              <RefreshCw size={16} aria-hidden="true" />
            </TextButton>
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <TextButton
            type="button"
            variant="primary"
            disabled={
              mutation.busy ||
              configuration.loading ||
              !!configuration.error ||
              configuration.data?.status === 'missing' ||
              config?.enabled === false ||
              !sameOrigin
            }
            onClick={() =>
              void mutation.run(
                { provider, connect: crypto.randomUUID() },
                async (signal) => {
                  const value = await startGitConnection(provider, signal)
                  if (github) setConsent(parseGithubConsent(value))
                  else {
                    parseGitConnection(value)
                    onConnected()
                  }
                },
              )
            }
            label={
              mutation.busy
                ? t('Esperando autorización…')
                : t('Conectar con ') + (github ? 'GitHub' : 'GitLab')
            }
            aria-busy={mutation.busy}
          >
            <Plug size={14} />
          </TextButton>
          {mutation.busy && (
            <TextButton
              type="button"
              variant="ghost"
              onClick={mutation.cancel}
              label={t('Cancelar')}
            >
              <X size={16} aria-hidden="true" />
            </TextButton>
          )}
        </div>
        {mutation.error && (
          <p role="alert" className="mt-3 text-sm text-error">
            {t(mutation.error)}
          </p>
        )}
      </article>
      {consent && (
        <GithubInstallationPicker
          consent={consent}
          onCancel={() => setConsent(null)}
          onDone={onConnected}
        />
      )}
    </>
  )
}
