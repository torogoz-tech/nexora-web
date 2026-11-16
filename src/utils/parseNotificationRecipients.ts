import type { NotificationRecipient } from '../types/NotificationRecipient'
export function parseNotificationRecipients(
  value: unknown,
): NotificationRecipient[] {
  if (
    !Array.isArray(value) ||
    value.some(
      (v) =>
        !v ||
        typeof v !== 'object' ||
        !['actor_id', 'name', 'email'].every((k) => typeof v[k] === 'string') ||
        typeof v.assignments !== 'boolean' ||
        typeof v.approvals !== 'boolean' ||
        !Number.isSafeInteger(v.revision) ||
        v.revision < 0,
    )
  )
    throw Error('La configuración recibida no es válida.')
  return value
}
