import { useTranslation } from '../hooks/useTranslation'
import { useOrganizationSetting } from '../hooks/useOrganizationSetting'
import { countryCodes } from '../app/countryCodes'
import Dropdown from './Dropdown'
import SettingsRow from './SettingsRow'
import SettingsSaveStatus from './SettingsSaveStatus'
import type { OrganizationSettingProps } from '../types/OrganizationSettingProps'
export default function OrganizationCountrySetting(
  props: OrganizationSettingProps,
) {
  const { t, dateLocale } = useTranslation(),
    mutation = useOrganizationSetting(props),
    regions = new Intl.DisplayNames([dateLocale], { type: 'region' })
  return (
    <form aria-label={t('País')} onSubmit={(event) => event.preventDefault()}>
      <SettingsRow label={t('País')}>
        <Dropdown
          label={t('País')}
          value={props.profile.country_code}
          disabled={mutation.busy}
          placeholder={t('Selecciona un país')}
          options={[
            { value: '', label: t('Sin especificar') },
            ...countryCodes
              .map((code) => ({ value: code, label: regions.of(code) ?? code }))
              .sort((a, b) => a.label.localeCompare(b.label, dateLocale)),
          ]}
          onChange={(value) =>
            void mutation.save({ field: 'country_code', value })
          }
        />
        <SettingsSaveStatus busy={mutation.busy} error={mutation.error} />
      </SettingsRow>
    </form>
  )
}
