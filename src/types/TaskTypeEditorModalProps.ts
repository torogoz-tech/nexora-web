import type { CatalogTaskType } from './CatalogTaskType'
export type TaskTypeEditorModalProps = {
  type?: CatalogTaskType
  onClose: () => void
  onSaved: () => void
}
