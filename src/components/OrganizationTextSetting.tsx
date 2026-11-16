import { useTranslation } from '../hooks/useTranslation'
import { useOrganizationSetting } from '../hooks/useOrganizationSetting'
import SettingsRow from './SettingsRow'
import SettingsSaveStatus from './SettingsSaveStatus'
import AutosaveTextField from './AutosaveTextField'
import type { OrganizationTextSettingProps } from '../types/OrganizationTextSettingProps'
export default function OrganizationTextSetting(
  props: OrganizationTextSettingProps,
) {
  const { t } = useTranslation(),
    mutation = useOrganizationSetting(props),
    { field, label, profile } = props
  return (
    <form aria-label={t(label)} onSubmit={(event) => event.preventDefault()}>
      <SettingsRow label={t(label)}>
        <AutosaveTextField
          label={t(label)}
          value={profile[field]}
          autoSave
          multiline={field === 'address'}
          type={field === 'phone' ? 'tel' : 'text'}
          maxLength={field === 'address' ? 2000 : field === 'phone' ? 64 : 160}
          onCommit={(value) => mutation.save({ field, value })}
        />
        <SettingsSaveStatus busy={mutation.busy} error={mutation.error} />
      </SettingsRow>
    </form>
  )
}
