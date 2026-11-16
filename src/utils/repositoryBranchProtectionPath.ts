export function repositoryBranchProtectionPath(project: string, repository: string) {
 return `/api/v1/projects/${encodeURIComponent(project)}/repositories/${encodeURIComponent(repository)}/branch-protection`
}
