import type { Project } from './Project'
export type ProjectTaskTypesModalProps = {
  project: Project
  onClose: () => void
  onSaved: () => void
}
