import type { InboxNotification } from './InboxNotification'
export type NotificationInboxPage = {
  items: InboxNotification[]
  unread_count: number
  total: number
}
