import { useTranslation } from '../hooks/useTranslation'
import AutosaveTextField from './AutosaveTextField'
import type { NotificationRecipient } from '../types/NotificationRecipient'
export default function NotificationRecipientRow({
  recipient,
  busy,
  onChange,
}: {
  recipient: NotificationRecipient
  busy: boolean
  onChange: (value: NotificationRecipient) => Promise<boolean>
}) {
  const { t } = useTranslation()
  return (
    <li className="py-5">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_20rem]">
        <h2 className="text-sm font-medium">{recipient.name}</h2>
        <div>
          <AutosaveTextField
            label={t('Correo de {0}', { '0': recipient.name })}
            value={recipient.email}
            type="email"
            maxLength={320}
            disabled={busy}
            onCommit={(email) => onChange({ ...recipient, email })}
          />
          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            {(
              [
                ['assignments', 'Asignaciones de tareas'],
                ['approvals', 'Solicitudes de aprobación'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={recipient[key]}
                  disabled={busy}
                  onChange={(event) =>
                    void onChange({ ...recipient, [key]: event.target.checked })
                  }
                />
                {t(label)}
              </label>
            ))}
          </div>
        </div>
      </div>
    </li>
  )
}
