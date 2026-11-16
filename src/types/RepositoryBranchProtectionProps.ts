import type { RepositoryProfileProject } from './RepositoryProfileProject'
export type RepositoryBranchProtectionProps = {
 projects: RepositoryProfileProject[]
 provider: 'github' | 'gitlab'
}
