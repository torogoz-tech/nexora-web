import type { Project } from './Project'
export type ArchiveProjectModalProps = {
  project: Project
  onClose: () => void
  onSaved: (project: Project) => void
}
