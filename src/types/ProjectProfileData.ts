import type { ProjectProfileIdentity } from './ProjectProfileIdentity'
import type { ProjectProfileMember } from './ProjectProfileMember'
import type { ProjectProfileCounts } from './ProjectProfileCounts'
import type { ProfileRepository } from './ProfileRepository'
import type { ProfilePriorityTask } from './ProfilePriorityTask'
import type { ProfileContribution } from './ProfileContribution'
import type { ProfileActivity } from './ProfileActivity'
export type ProjectProfileData = {
  project: ProjectProfileIdentity
  repositories: ProfileRepository[]
  members: ProjectProfileMember[]
  priority_tasks: ProfilePriorityTask[]
  counts: ProjectProfileCounts
  contributions: ProfileContribution[]
  activity: ProfileActivity[]
  year: number
}
