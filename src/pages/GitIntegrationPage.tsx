import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useGitConfiguration } from '../hooks/useGitConfiguration'
import { useTranslation } from '../hooks/useTranslation'
import ProviderConfigurationForm from '../components/ProviderConfigurationForm'
import GithubWebhookHealth from '../components/GithubWebhookHealth'
import DataMessage from '../components/DataMessage'
import RowAction from '../components/RowAction'
import type { GitProviderConfiguration } from '../types/GitProviderConfiguration'
import type { GitIntegrationPageProps } from '../types/GitIntegrationPageProps'
export default function GitIntegrationPage({ provider }: GitIntegrationPageProps) {
  const { t } = useTranslation()
  const remote = useGitConfiguration(provider)
  const [saved, setSaved] = useState<GitProviderConfiguration | null>(null)
  const configuration = saved ?? remote.data?.configuration ?? null
  const name = provider === 'github' ? 'GitHub' : 'GitLab'
  return <section className="flex min-w-0 flex-1 flex-col">
    <header className="mb-7 flex items-center gap-3">
      <RowAction to="/settings/integrations" label={t('Volver a integraciones')}><ArrowLeft size={17}/></RowAction>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-base-200"><span aria-hidden="true" className="size-5 bg-current" style={{mask:`url(/icons/${provider}.svg) center / contain no-repeat`}}/></span>
      <h1 className="text-xl font-semibold">{name}</h1>
    </header>
    {remote.loading || remote.error ? <DataMessage loading={remote.loading} error={remote.error} onRetry={remote.reload}/>
      : remote.data?.status === 'restricted' ? <p className="text-sm text-base-content/55">{t('Administrada por tu instalación')}</p>
      : <ProviderConfigurationForm key={`${provider}:${configuration?.revision ?? 0}`} provider={provider} configuration={configuration} onSaved={setSaved}/>}
    {provider === 'github' && configuration?.enabled && remote.data?.status !== 'restricted' && <GithubWebhookHealth key={configuration.revision}/>}
  </section>
}
