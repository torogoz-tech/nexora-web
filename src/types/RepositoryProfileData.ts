import type { RepositoryProfileIdentity } from './RepositoryProfileIdentity'
import type { RepositoryProfileProject } from './RepositoryProfileProject'
import type { RepositoryProfilePullRequest } from './RepositoryProfilePullRequest'
import type { ProfilePriorityTask } from './ProfilePriorityTask'
import type { ProfileContribution } from './ProfileContribution'
import type { ProfileActivity } from './ProfileActivity'
export type RepositoryProfileData = {
 repository: RepositoryProfileIdentity
 projects: RepositoryProfileProject[]
 synchronization: { state: string | null; updated_at: string | null; last_error: string | null }
 pull_requests: RepositoryProfilePullRequest[]
 pull_requests_available: boolean
 counts: { tasks: number; analyses: number; pull_requests: number }
 priority_tasks: ProfilePriorityTask[]
 contributions: ProfileContribution[]
 activity: ProfileActivity[]
 year: number
}
