import { useState } from 'react'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { useTranslation } from '../hooks/useTranslation'
import { parseInstallationPreferences } from '../utils/parseInstallationPreferences'
import { writeGeneralSettings } from '../services/writeGeneralSettings'
import SettingsRow from './SettingsRow'
import SettingsSaveStatus from './SettingsSaveStatus'
import type { InstallationLanguageFormProps } from '../types/InstallationLanguageFormProps'
export default function InstallationLanguageForm({
  preferences,
}: InstallationLanguageFormProps) {
  const { t, language, applyPreferences } = useTranslation(),
    mutation = useIntegrationMutation()
  const [confirmed, setConfirmed] = useState(preferences)
  const revision = Math.max(preferences.revision, confirmed.revision)
  function change(value: string) {
    if (value === language || mutation.busy) return
    void mutation.run({ language: value, revision }, async (signal, key) => {
      const data = parseInstallationPreferences(
        await writeGeneralSettings(
          '/api/v1/settings/general',
          'PUT',
          { language: value, expected_revision: revision },
          signal,
          key,
        ),
      )
      setConfirmed(data)
      applyPreferences(data)
    })
  }
  return (
    <section aria-label={t('Idioma')}>
      <h2 className="pt-6 text-base font-semibold">{t('Idioma')}</h2>
      <SettingsRow
        label={t('Idioma de la instancia')}
        description={t(
          'Se aplica a toda la interfaz y a todos los usuarios, incluido el inicio de sesión.',
        )}
      >
        <div className="flex justify-end">
          <div
            role="radiogroup"
            aria-label={t('Idioma de la instancia')}
            aria-busy={mutation.busy}
            onKeyDown={(event) => {
              if (
                mutation.busy ||
                ![
                  'ArrowLeft',
                  'ArrowRight',
                  'ArrowUp',
                  'ArrowDown',
                  'Home',
                  'End',
                ].includes(event.key)
              )
                return
              event.preventDefault()
              const target =
                event.key === 'Home'
                  ? 'es'
                  : event.key === 'End'
                    ? 'en'
                    : language === 'es'
                      ? 'en'
                      : 'es'
              change(target)
              event.currentTarget
                .querySelector<HTMLButtonElement>(`[data-language="${target}"]`)
                ?.focus()
            }}
            className="inline-flex rounded-xl border border-base-300 bg-base-200 p-1"
          >
            {[
              { value: 'es', label: 'Español' },
              { value: 'en', label: 'English' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                data-language={option.value}
                tabIndex={language === option.value ? 0 : -1}
                aria-checked={language === option.value}
                disabled={mutation.busy}
                onClick={() => change(option.value)}
                className={`rounded-lg px-4 py-2 text-sm transition-colors disabled:cursor-wait ${language === option.value ? 'bg-primary font-semibold text-primary-content' : 'text-base-content/55 hover:bg-base-300'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </SettingsRow>
      <SettingsSaveStatus busy={mutation.busy} error={mutation.error} />
    </section>
  )
}
