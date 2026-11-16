import type { DeveloperWorkflowAssignment } from './DeveloperWorkflowAssignment'
export type DeveloperWorkflowRemovalModalProps = {
  assignment: DeveloperWorkflowAssignment
  onClose: () => void
  onRemoved: () => void
}
