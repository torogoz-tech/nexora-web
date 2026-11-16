import type { ProfileWorkflowTask } from './ProfileWorkflowTask'
import type { OrganizationMember } from './OrganizationMember'
import type { ProfileRepository } from './ProfileRepository'
import type { ProfileProject } from './ProfileProject'
import type { ProfilePriorityTask } from './ProfilePriorityTask'
import type { ProfileContribution } from './ProfileContribution'
import type { ProfileActivity } from './ProfileActivity'
export type MemberProfileData = {
 member: OrganizationMember
 projects: ProfileProject[]
 repositories: ProfileRepository[]
 workflow_tasks?: ProfileWorkflowTask[]
 priority_tasks: ProfilePriorityTask[]
 contributions: ProfileContribution[]
 activity: ProfileActivity[]
 year: number
}
