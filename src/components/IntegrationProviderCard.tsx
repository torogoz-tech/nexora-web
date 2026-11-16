import { useTranslation } from '../hooks/useTranslation'
import { RefreshCw } from 'lucide-react'
import IconButton from './IconButton'
import RowAction from './RowAction'
import { useState } from 'react'
import { X, Check, Settings2, Power, PowerOff } from 'lucide-react'
import { useGitConfiguration } from '../hooks/useGitConfiguration'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { integrationRequest } from '../services/integrationRequest'
import { parseGitConfiguration } from '../utils/parseGitConfiguration'
import IntegrationDialog from './IntegrationDialog'
import type { IntegrationProviderCardProps } from '../types/IntegrationProviderCardProps'
export default function IntegrationProviderCard({
  provider,
}: IntegrationProviderCardProps) {
  const { t } = useTranslation()
  const configuration = useGitConfiguration(provider)
  const config = configuration.data?.configuration
  const mutation = useIntegrationMutation()
  const [changing, setChanging] = useState(false)
  const github = provider === 'github'
  const name = github ? 'GitHub' : 'GitLab'
  const sameOrigin = config
    ? new URL(config.redirect_uri).origin === window.location.origin
    : true
  const changed = () => {
    configuration.reload()
  }
  return (
    <>
      <article className="rounded-2xl border border-base-300 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-base-200">
            <span
              aria-hidden="true"
              className="size-5 bg-current"
              style={{
                mask: `url(/icons/${provider}.svg) center / contain no-repeat`,
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-h-8 flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">{name}</h2>
              <div className="flex shrink-0 items-center gap-1">
                {configuration.data &&
                  configuration.data.status !== 'restricted' && (
                    <RowAction
                      label={t('Configurar {0}', { '0': name })}
                      to={`/settings/integrations/${provider}`}
                    >
                      <Settings2 size={16} aria-hidden="true" />
                    </RowAction>
                  )}
                {config && (
                  <RowAction
                    label={`${config.enabled ? t('Deshabilitar') : t('Habilitar')} ${name}`}
                    disabled={mutation.busy}
                    onClick={() => setChanging(true)}
                  >
                    {config.enabled ? (
                      <PowerOff size={16} aria-hidden="true" />
                    ) : (
                      <Power size={16} aria-hidden="true" />
                    )}
                  </RowAction>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-base-content/55">
              {github
                ? t(
                    'Configura la GitHub App que utilizará esta instalación de Nexora.',
                  )
                : t(
                    'Configura la aplicación OAuth de GitLab para esta instalación de Nexora.',
                  )}
            </p>
            {configuration.data?.status === 'restricted' && (
              <p className="mt-2 text-xs text-base-content/50">
                {' '}
                {t('Administrada por tu instalación')}{' '}
              </p>
            )}
            {config && (
              <p className="mt-2 break-all text-xs text-base-content/45">
                {config.host}
                {config.slug ? ` · ${config.slug}` : ''}
                {' · '}
                {config.enabled ? t('Habilitada') : t('Deshabilitada')}
              </p>
            )}
          </div>
        </div>
        {config && !sameOrigin && (
          <p className="mt-4 text-xs leading-relaxed text-warning">
            {' '}
            {t(
              'El retorno está configurado en otro dominio. Solicita al administrador que unifique el dominio de Nexora y el retorno de autorización.',
            )}{' '}
          </p>
        )}
        {configuration.error && (
          <p role="alert" className="mt-4 text-sm text-error">
            {t(configuration.error)}{' '}
            <IconButton
              type="button"
              label={t('Reintentar')}
              onClick={configuration.reload}
            >
              <RefreshCw size={16} aria-hidden="true" />
            </IconButton>
          </p>
        )}
        {mutation.error && (
          <p role="alert" className="mt-4 text-sm text-error">
            {t(mutation.error)}
          </p>
        )}
      </article>
      {changing && config && (
        <IntegrationDialog
          title={`${config.enabled ? t('Deshabilitar') : t('Habilitar')} ${name}`}
          busy={mutation.busy}
          onClose={() => setChanging(false)}
        >
          <p className="text-sm leading-relaxed text-base-content/60">
            {config.enabled
              ? t(
                  'Se detendrán las nuevas autorizaciones y las operaciones que necesiten esta integración.',
                )
              : t(
                  'La integración volverá a aceptar conexiones y operaciones autorizadas.',
                )}
          </p>
          {mutation.error && (
            <p role="alert" className="mt-4 text-sm text-error">
              {t(mutation.error)}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <IconButton
              type="button"
              variant="ghost"
              disabled={mutation.busy}
              onClick={() => setChanging(false)}
              label={t('Cancelar')}
            >
              <X size={16} aria-hidden="true" />
            </IconButton>
            <IconButton
              type="button"
              variant="primary"
              disabled={mutation.busy}
              onClick={() =>
                void mutation.run(
                  {
                    provider,
                    revision: config.revision,
                    enabled: !config.enabled,
                  },
                  async (signal, key) => {
                    parseGitConfiguration(
                      await integrationRequest(
                        `/api/v1/git/${provider}/configuration`,
                        'PATCH',
                        {
                          enabled: !config.enabled,
                          expected_revision: config.revision,
                        },
                        key,
                        signal,
                      ),
                      provider,
                    )
                    setChanging(false)
                    changed()
                  },
                )
              }
              label={mutation.busy ? t('Guardando…') : t('Confirmar')}
              aria-busy={mutation.busy}
            >
              <Check size={16} aria-hidden="true" />
            </IconButton>
          </div>
        </IntegrationDialog>
      )}
    </>
  )
}
