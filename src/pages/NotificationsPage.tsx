import { useState } from 'react'
import { useApiData } from '../hooks/useApiData'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { useTranslation } from '../hooks/useTranslation'
import { parseNotificationRecipients } from '../utils/parseNotificationRecipients'
import { readApiJson } from '../services/readApiJson'
import { writeGeneralSettings } from '../services/writeGeneralSettings'
import DataMessage from '../components/DataMessage'
import SettingsSaveStatus from '../components/SettingsSaveStatus'
import NotificationRecipientRow from '../components/NotificationRecipientRow'
import type { NotificationRecipient } from '../types/NotificationRecipient'
export default function NotificationsPage() {
  const { t } = useTranslation(),
    remote = useApiData(
      '/api/v1/settings/notification-recipients',
      parseNotificationRecipients,
    ),
    mutation = useIntegrationMutation()
  const [updates, setUpdates] = useState<Record<string, NotificationRecipient>>(
    {},
  )
  async function change(next: NotificationRecipient) {
    const input = {
      email: next.email,
      assignments: next.assignments,
      approvals: next.approvals,
      expected_revision: next.revision,
    }
    return mutation.run(
      { actor: next.actor_id, input },
      async (signal, key) => {
        try {
          const value = await writeGeneralSettings(
            `/api/v1/settings/notification-recipients/${encodeURIComponent(next.actor_id)}`,
            'PUT',
            input,
            signal,
            key,
          )
          const parsed = parseNotificationRecipients([value])[0]!
          setUpdates((old) => ({ ...old, [parsed.actor_id]: parsed }))
        } catch (error) {
          try {
            const latest = parseNotificationRecipients(
              await readApiJson(
                '/api/v1/settings/notification-recipients',
                signal,
              ),
            )
            setUpdates((old) => ({
              ...old,
              ...Object.fromEntries(
                latest.map((item) => [item.actor_id, item]),
              ),
            }))
          } catch {
            /* Retain confirmed recipient data while offline. */
          }
          throw error
        }
      },
    )
  }
  return (
    <section className="min-w-0">
      <h1 className="text-xl font-semibold">
        {t('Notificaciones por correo')}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-base-content/55">
        {t(
          'Configura el correo de cada miembro y los eventos que desea recibir.',
        )}
      </p>
      <p className="mt-2 text-xs text-base-content/45">
        {t(
          'Solo se envían avisos a personas activas con acceso al proyecto y permisos vigentes.',
        )}
      </p>
      {!remote.data ? (
        <DataMessage
          loading={remote.loading}
          error={remote.error}
          onRetry={remote.reload}
        />
      ) : (
        <ul className="mt-6 divide-y divide-base-300/60">
          {remote.data.map((row) => {
            const current =
              updates[row.actor_id] &&
              updates[row.actor_id].revision >= row.revision
                ? updates[row.actor_id]
                : row
            return (
              <NotificationRecipientRow
                key={row.actor_id}
                recipient={current!}
                busy={mutation.busy}
                onChange={change}
              />
            )
          })}
        </ul>
      )}
      <SettingsSaveStatus busy={mutation.busy} error={mutation.error} />
    </section>
  )
}
