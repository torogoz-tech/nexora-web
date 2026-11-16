import { useSettingsResource } from '../hooks/useSettingsResource'
import { useTranslation } from '../hooks/useTranslation'
import { parseEmailAccessSettings } from '../utils/parseEmailAccessSettings'
import AutosaveTextField from './AutosaveTextField'
import DataMessage from './DataMessage'
import SettingsRow from './SettingsRow'
export default function PublicWebsiteSettings(){
  const {t}=useTranslation()
  const resource=useSettingsResource('/api/v1/settings/email-access',parseEmailAccessSettings)
  return <section><h2 className="pt-6 text-base font-semibold">{t('Acceso a la organización')}</h2>
    {resource.data?<SettingsRow label={t('URL pública de Nexora')} description={t('Dirección de esta web para los enlaces de invitación y recuperación. Usa HTTPS; en desarrollo se permite localhost.')}>
      <AutosaveTextField autoSave label={t('URL pública de Nexora')} type="url" placeholder="https://nexora.com" value={resource.data.public_web_url} saveBlocked={resource.busy} onCommit={async value=>{const current=resource.getCurrent();return !!current&&resource.save({public_web_url:value,expected_revision:current.revision})}}/>
    </SettingsRow>:<DataMessage loading={resource.loading} error={resource.error} onRetry={resource.reload}/>}
    {resource.data&&resource.error&&<p className="mt-2 text-xs text-error" role="alert">{t(resource.error)}</p>}
  </section>
}
