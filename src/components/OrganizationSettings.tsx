import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { parseOrganizationProfile } from '../utils/parseOrganizationProfile'
import type { OrganizationProfile } from '../types/OrganizationProfile'
import DataMessage from './DataMessage'
import OrganizationLogoSetting from './OrganizationLogoSetting'
import OrganizationTextSetting from './OrganizationTextSetting'
import OrganizationCountrySetting from './OrganizationCountrySetting'
export default function OrganizationSettings() {
  const { t } = useTranslation(),
    remote = useApiData(
      '/api/v1/settings/organization',
      parseOrganizationProfile,
    ),
    [confirmed, setConfirmed] = useState<OrganizationProfile | null>(null)
  const profile =
    confirmed && (!remote.data || confirmed.revision >= remote.data.revision)
      ? confirmed
      : remote.data
  if (!profile)
    return (
      <DataMessage
        loading={remote.loading}
        error={remote.error}
        onRetry={remote.reload}
      />
    )
  const onUpdated = (next: OrganizationProfile) =>
    setConfirmed((current) =>
      !current || next.revision >= current.revision ? next : current,
    )
  return (
    <section aria-label={t('Organización')}>
      <h2 className="pt-6 text-base font-semibold">{t('Organización')}</h2>
      <div className="min-w-0">
        <OrganizationLogoSetting profile={profile} onUpdated={onUpdated} />
        {(
          [
            ['name', 'Nombre de la organización'],
            ['address', 'Dirección'],
            ['phone', 'Teléfono'],
          ] as const
        ).map(([field, label]) => (
          <OrganizationTextSetting
            key={field}
            profile={profile}
            onUpdated={onUpdated}
            field={field}
            label={label}
          />
        ))}
        <OrganizationCountrySetting profile={profile} onUpdated={onUpdated} />
      </div>
    </section>
  )
}
