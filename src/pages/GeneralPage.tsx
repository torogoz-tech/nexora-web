import OrganizationTimezoneSetting from '../components/OrganizationTimezoneSetting'
import PublicWebsiteSettings from '../components/PublicWebsiteSettings'
import OrganizationSettings from '../components/OrganizationSettings'
import { useApiData } from '../hooks/useApiData'
import { useTranslation } from '../hooks/useTranslation'
import { parseInstallationPreferences } from '../utils/parseInstallationPreferences'
import DataMessage from '../components/DataMessage'
import InstallationLanguageForm from '../components/InstallationLanguageForm'
export default function GeneralPage() {
  const { t } = useTranslation()
  const preferences = useApiData(
    '/api/v1/settings/general',
    parseInstallationPreferences,
  )
  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <h1 className="mb-7 text-xl font-semibold">{t('General')}</h1>
      <div className="divide-y divide-base-300">
        <OrganizationSettings />
        <PublicWebsiteSettings />
        <OrganizationTimezoneSetting />
        {preferences.data ? (
          <InstallationLanguageForm preferences={preferences.data} />
        ) : (
          <DataMessage
            loading={preferences.loading}
            error={preferences.error}
            onRetry={preferences.reload}
          />
        )}
      </div>
    </section>
  )
}
