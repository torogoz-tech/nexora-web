import { Bell } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { useLiveUpdates } from '../hooks/useLiveUpdates'
import { useNotificationSound } from '../hooks/useNotificationSound'
import { parseNotificationInbox } from '../utils/parseNotificationInbox'
import type { NotificationsButtonProps } from '../types/NotificationsButtonProps'
import RowAction from './RowAction'

export default function NotificationsButton({ count }: NotificationsButtonProps) {
  const { t } = useTranslation()
  useLiveUpdates(null)
  const remote = useApiData('/api/v1/notifications?folder=inbox&limit=1&offset=0', parseNotificationInbox)
  const unread = remote.data?.unread_count ?? count ?? 0
  useNotificationSound(remote.data)
  return <RowAction to="/notifications" label={unread > 0 ? t('Notificaciones, {0} sin leer', { '0': unread }) : t('Notificaciones')}>
    <span className="relative inline-flex">
      <Bell size={19} aria-hidden="true" />
      {unread > 0 && <span className="absolute -right-1 -top-1 size-2 rounded-full bg-red-400 ring-2 ring-base-100" aria-hidden="true" />}
    </span>
  </RowAction>
}
