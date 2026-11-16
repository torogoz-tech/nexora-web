export type CreateTaskFormProps = {
  parent?: { id: string; revision: number; project_id: string | null }
  initialProjectId?: string
  initialTypeCode?: string
  onCancel: () => void
  onCreated: (id: string) => void
}
