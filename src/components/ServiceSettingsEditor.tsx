import { useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useSettingsResource } from '../hooks/useSettingsResource'
import { parseServiceSettings } from '../utils/parseServiceSettings'
import SettingsRow from './SettingsRow'
import SettingsSaveStatus from './SettingsSaveStatus'
import AutosaveTextField from './AutosaveTextField'
import DataMessage from './DataMessage'
import Dropdown from './Dropdown'
import IconButton from './IconButton'
import type { ServiceSettingsEditorProps } from '../types/ServiceSettingsEditorProps'
export default function ServiceSettingsEditor({
  kind,
  title,
  description,
  fields,
  children,
}: ServiceSettingsEditorProps) {
  const { t } = useTranslation(),
    resource = useSettingsResource(
      `/api/v1/settings/services/${kind}`,
      parseServiceSettings,
    )
  const [validationError, setValidationError] = useState<string | null>(null)
  const pending = useRef<Record<string, string | number | boolean>>({})
  const requests = useRef<Promise<unknown>>(Promise.resolve())
  const [secretReset, setSecretReset] = useState(0)
  const data = resource.data
  if (!data)
    return (
      <section>
        <h1 className="text-xl font-semibold">{t(title)}</h1>
        <DataMessage
          loading={resource.loading}
          error={validationError ?? resource.error}
          onRetry={resource.reload}
        />
      </section>
    )
  function change(
    patch: Record<string, string | number | boolean>,
    secret?: string,
    remove = false,
  ): Promise<boolean> {
    const result = requests.current.then(async () => {
      const current = resource.getCurrent()
      if (!current) return false
      setValidationError(null)
      const changes = { ...pending.current, ...patch }
      pending.current = changes
      const ok = await resource.save({
        settings: { ...current.settings, ...changes },
        expected_revision: current.revision,
        ...(secret ? { secret } : {}),
        remove_secret: remove,
      })
      if (ok) pending.current = {}
      return ok
    })
    requests.current = result.catch(() => false)
    return result
  }

  return (
    <section aria-label={t(title)}>
      <h1 className="text-xl font-semibold">{t(title)}</h1>
      <p className="mt-2 text-xs leading-relaxed text-base-content/50">
        {t(description)}
      </p>
      <div className="min-w-0">
        <SettingsRow label={t('Activado')}>
          <div className="flex justify-end">
            <input
              type="checkbox"
              role="switch"
              aria-label={t('Activar {0}', { '0': t(title) })}
              className="toggle toggle-sm"
              checked={data.settings.enabled === true}
              disabled={resource.busy}
              onChange={(event) =>
                void change({ enabled: event.target.checked })
              }
            />
          </div>
        </SettingsRow>
        {fields.map((field) => (
          <SettingsRow key={field.key} label={t(field.label)}>
            <AutosaveTextField
              label={t(field.label)}
              value={String(data.settings[field.key] ?? '')}
              type={field.type}
              autoSave
              saveBlocked={resource.busy}
              maxLength={
                field.key === 'endpoint'
                  ? 2048
                  : field.key === 'sender_email'
                    ? 320
                    : 256
              }
              onCommit={(value) =>
                field.key === 'port'
                  ? /^\d+$/.test(value) &&
                    Number(value) >= 1 &&
                    Number(value) <= 65535
                    ? change({ port: Number(value) })
                    : (setValidationError(
                        'El puerto debe estar entre 1 y 65535.',
                      ),
                      Promise.resolve(false))
                  : change({ [field.key]: value })
              }
            />
          </SettingsRow>
        ))}
        {kind === 'openai' ? (
          <SettingsRow label={t('Esfuerzo de razonamiento')}>
            <Dropdown
              label={t('Esfuerzo de razonamiento')}
              value={String(data.settings.effort)}
              disabled={resource.busy}
              options={[
                { value: 'low', label: t('Bajo') },
                { value: 'medium', label: t('Medio') },
                { value: 'high', label: t('Alto') },
              ]}
              onChange={(value) => void change({ effort: value })}
            />
          </SettingsRow>
        ) : (
          <SettingsRow label={t('Seguridad de la conexión')}>
            <Dropdown
              label={t('Seguridad de la conexión')}
              value={String(data.settings.tls_mode)}
              disabled={resource.busy}
              options={[
                { value: 'starttls', label: 'STARTTLS' },
                { value: 'tls', label: 'TLS' },
              ]}
              onChange={(value) => void change({ tls_mode: value })}
            />
          </SettingsRow>
        )}
        <SettingsRow
          label={t(kind === 'openai' ? 'Token de OpenAI' : 'Contraseña SMTP')}
          description={t(
            data.has_secret
              ? 'Credencial configurada. Introduce otra para reemplazarla.'
              : 'La credencial se cifra en el servidor y nunca se devuelve al navegador.',
          )}
        >
          <div className="flex items-center gap-2">
            <AutosaveTextField
              key={`secret-${secretReset}`}
              label={t(
                kind === 'openai' ? 'Token de OpenAI' : 'Contraseña SMTP',
              )}
              value=""
              type="password"
              autoSave
              saveBlocked={resource.busy}
              maxLength={4096}
              placeholder={data.has_secret ? '••••••••' : t('Sin configurar')}
              onCommit={(value) => change({}, value)}
            />
            {data.has_secret && (
              <IconButton
                label={t('Quitar credencial')}
                disabled={resource.busy}
                onClick={() => {
                  setSecretReset((current) => current + 1)
                  void change({ enabled: false }, undefined, true)
                }}
              >
                <Trash2 size={16} />
              </IconButton>
            )}
          </div>
        </SettingsRow>
      </div>
      <SettingsSaveStatus
        busy={resource.busy}
        error={validationError ?? resource.error}
      />
      {children}
    </section>
  )
}
