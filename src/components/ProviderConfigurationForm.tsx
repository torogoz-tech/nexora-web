import WebhookSecretField from './WebhookSecretField'
import { generateWebhookSecret } from '../utils/generateWebhookSecret'
import { useTranslation } from '../hooks/useTranslation'
import IconButton from './IconButton'
import SettingsRow from './SettingsRow'
import { Save } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { integrationRequest } from '../services/integrationRequest'
import { parseGitConfiguration } from '../utils/parseGitConfiguration'
import type { ProviderConfigurationFormProps } from '../types/ProviderConfigurationFormProps'
export default function ProviderConfigurationForm({
  provider,
  configuration,
  onSaved,
}: ProviderConfigurationFormProps) {
  const { t } = useTranslation()
  const mutation = useIntegrationMutation()
  const github = provider === 'github'
  const [values, setValues] = useState<Record<string, string>>(() => ({
    client_id: configuration?.client_id ?? '',
    ...(github && !configuration ? { webhook_secret: generateWebhookSecret() } : {}),
    ...(github ? { app_id: configuration?.app_id ?? '' } : {}),
    redirect_uri:
      configuration?.redirect_uri ??
      `${window.location.origin}/api/v1/git/${provider}/callback`,
  }))
  const [enabled, setEnabled] = useState(configuration?.enabled ?? true)
  const fields = [
    ...(github ? [['app_id', 'App ID', 'text']] : []),
    ['client_id', 'Client ID', 'text'],
    ['client_secret', 'Client secret', 'password'],
    ...(github
      ? [
          ['private_key_pem', t('Clave privada PEM'), 'textarea'],
          ['webhook_secret', t('Secreto del webhook'), 'password'],
        ]
      : []),
    ['redirect_uri', t('URL de retorno'), 'url'],
  ]
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input = {
      ...values,
      enabled,
      expected_revision: configuration?.revision ?? 0,
    }
    await mutation.run({ provider, input }, async (signal, key) => {
      const saved = parseGitConfiguration(
        await integrationRequest(
          `/api/v1/git/${provider}/configuration`,
          'POST',
          input,
          key,
          signal,
        ),
        provider,
      )
      onSaved(saved)
    })
  }
  return (
    <form id="git-provider-configuration" onSubmit={submit} aria-busy={mutation.busy}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm leading-relaxed text-base-content/55">
          {github ? t('Usa las credenciales de la GitHub App de tu instalación.') : t('Usa una aplicación OAuth de GitLab con acceso de lectura a la API.')}
        </p>
        <IconButton type="submit" variant="primary" disabled={mutation.busy} label={t('Guardar configuración')} aria-busy={mutation.busy}><Save size={16}/></IconButton>
      </div>
      {configuration && <p className="mb-5 text-xs leading-relaxed text-base-content/50">{t('Para reemplazar la configuración debes introducir de nuevo sus secretos.')}</p>}
      <fieldset disabled={mutation.busy} className="min-w-0 divide-y divide-base-300">
        <section className="pb-5">
          <h2 className="text-base font-semibold">{t('Conexión')}</h2>
          <SettingsRow label={t('Habilitar integración')}>
            <div className="flex justify-end"><input aria-label={t('Habilitar integración')} type="checkbox" className="toggle toggle-sm" checked={enabled} onChange={event => setEnabled(event.target.checked)}/></div>
          </SettingsRow>
          <SettingsRow label={t('URL de retorno')} description={t('La URL de retorno debe coincidir con la permitida por el servidor y con la registrada en') + ' ' + (github ? 'GitHub' : 'GitLab')}>
            <input aria-label={t('URL de retorno')} className="input input-sm w-full" name="redirect_uri" type="url" required maxLength={2048} value={values.redirect_uri} onChange={event => setValues(current => ({...current,redirect_uri:event.target.value}))}/>
          </SettingsRow>
        </section>
        <section className="py-6">
          <h2 className="text-base font-semibold">{t('Credenciales')}</h2>
          {github && <p className="mt-3 mb-2 text-xs leading-relaxed text-base-content/55">{t('En GitHub, habilita Contents y Pull requests como Read-only. Metadata se incluye automáticamente. Si la app ya está instalada, aprueba los nuevos permisos en la instalación.')}</p>}
          {fields.filter(([name]) => !['redirect_uri','webhook_secret'].includes(name)).map(([name,label,type]) => (
            <SettingsRow key={name} label={label}>
              {type === 'textarea' ? <textarea aria-label={label} className="textarea min-h-40 w-full resize-y font-mono text-xs" name={name} required maxLength={16384} spellCheck={false} autoComplete="off" value={values[name] ?? ''} onChange={event => setValues(current => ({...current,[name]:event.target.value}))}/>
                : <input aria-label={label} className="input input-sm w-full" name={name} type={type} required minLength={1} maxLength={name === 'client_secret' ? 8192 : 2048} autoComplete={type === 'password' ? 'new-password' : 'off'} value={values[name] ?? ''} onChange={event => setValues(current => ({...current,[name]:event.target.value}))}/>}
            </SettingsRow>
          ))}
          <p className="text-xs leading-relaxed text-base-content/45">{t('. Los secretos se envían a la API y no se guardan en este navegador.').replace(/^\.\s*/, '')}</p>
        </section>
        {github && <section className="py-6">
          <h2 className="mb-5 text-base font-semibold">Webhook</h2>
          <div className="max-w-full"><WebhookSecretField value={values.webhook_secret ?? ''} disabled={mutation.busy} onChange={value => setValues(current => ({...current,webhook_secret:value}))}/></div>
        </section>}
      </fieldset>
      {mutation.error && <p role="alert" className="mt-4 text-sm text-error">{t(mutation.error)}</p>}
    </form>
  )
}
