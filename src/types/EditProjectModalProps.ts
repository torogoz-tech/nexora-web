import type { Project } from './Project'
export type EditProjectModalProps = {
  project: Project
  onClose: () => void
  onSaved: (project: Project) => void
}
