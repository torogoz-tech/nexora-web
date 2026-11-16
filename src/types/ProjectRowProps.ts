import type { Project } from './Project'
export type ProjectRowProps = {
  canManage?: boolean
  project: Project
  onEdit: (project: Project) => void
  onArchive: (project: Project) => void
}
