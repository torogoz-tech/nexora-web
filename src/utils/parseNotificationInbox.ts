import type { NotificationInboxPage } from '../types/NotificationInboxPage'
export function parseNotificationInbox(value: unknown): NotificationInboxPage {
  if (!value || typeof value !== 'object') throw new Error('La bandeja de notificaciones no es válida.')
  const page = value as Record<string, unknown>
  if (!Array.isArray(page.items) || typeof page.total !== 'number' || typeof page.unread_count !== 'number') throw new Error('La bandeja de notificaciones no es válida.')
  return {
    total: page.total,
    unread_count: page.unread_count,
    items: page.items.map((value) => {
      const row = value as Record<string, unknown>
      if (!row || typeof row.id !== 'string' || typeof row.title !== 'string' || typeof row.body !== 'string' || typeof row.created_at !== 'string') throw new Error('La notificación no es válida.')
      return {
        id: row.id, kind: typeof row.kind === 'string' ? row.kind : '', title: row.title, body: row.body,
        url: typeof row.url === 'string' && row.url.startsWith('/') && !row.url.startsWith('//') ? row.url : null,
        created_at: row.created_at,
        read_at: typeof row.read_at === 'string' ? row.read_at : null,
        archived_at: typeof row.archived_at === 'string' ? row.archived_at : null,
      }
    }),
  }
}
