import type { Project } from './Project'
export type CreateProjectModalProps = {
  open: boolean
  onClose: () => void
  onCreated: (project: Project) => void
}
