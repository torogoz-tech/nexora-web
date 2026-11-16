export type InboxNotification = {
  id: string
  kind: string
  title: string
  body: string
  url: string | null
  created_at: string
  read_at: string | null
  archived_at: string | null
}
