import { useState } from 'react'
import { useApiData } from '../hooks/useApiData'
import { useTranslation } from '../hooks/useTranslation'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { parseOrganizationTimezone } from '../utils/parseOrganizationTimezone'
import { organizationTimezoneOptions } from '../utils/organizationTimezoneOptions'
import { writeGeneralSettings } from '../services/writeGeneralSettings'
import type { OrganizationTimezone } from '../types/OrganizationTimezone'
import SettingsRow from './SettingsRow'
import SettingsSaveStatus from './SettingsSaveStatus'
import DataMessage from './DataMessage'
import Dropdown from './Dropdown'
export default function OrganizationTimezoneSetting() {
  const { t } = useTranslation(), mutation = useIntegrationMutation()
  const remote = useApiData('/api/v1/settings/timezone', parseOrganizationTimezone)
  const [confirmed, setConfirmed] = useState<OrganizationTimezone | null>(null)
  const data = confirmed && (!remote.data || confirmed.revision >= remote.data.revision) ? confirmed : remote.data
  async function change(timezone: string) {
    if (!data || timezone === data.timezone || mutation.busy) return
    const input = { timezone, expected_revision: data.revision }
    const saved = await mutation.run(input, async (signal, key) => {
      setConfirmed(parseOrganizationTimezone(await writeGeneralSettings('/api/v1/settings/timezone', 'PATCH', input, signal, key)))
    })
    if (!saved) { setConfirmed(null); remote.reload() }
  }
  return <section aria-label={t('Zona horaria de la organización')}>
    <h2 className="pt-6 text-base font-semibold">{t('Zona horaria')}</h2>
    {data ? <SettingsRow label={t('Zona horaria de la organización')} description={t('Se utiliza en el calendario laboral, las horas extras y el cierre diario de las calificaciones.')}>
      <div className="flex items-center gap-2" aria-busy={mutation.busy}><Dropdown label={t('Zona horaria de la organización')} value={data.timezone} options={organizationTimezoneOptions(data.timezone)} onChange={value => { void change(value) }} disabled={mutation.busy}/>{mutation.busy && <span aria-label={t('Guardando cambios')} role="status" className="loading loading-spinner loading-xs"/>}</div>
    </SettingsRow> : <DataMessage loading={remote.loading} error={remote.error} onRetry={remote.reload}/>}
    <SettingsSaveStatus busy={mutation.busy} error={mutation.error}/>
  </section>
}
