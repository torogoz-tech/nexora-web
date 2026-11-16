import { useProjectPreference } from './useProjectPreference'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { useProjects } from './useProjects'
import { useApiData } from './useApiData'
import { parseRepository } from '../utils/parseRepository'
import { parseRepositoryPage } from '../utils/parseRepositoryPage'
import { parseProject } from '../utils/parseProject'
export function useCodeScope() {
  const projects = useProjects()
  const [params] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const activeProjects = projects.projects.filter(
    (project) => !project.archived,
  )
  const selectedProject = useProjectPreference(params.get('project'))
  const projectId = selectedProject && !['organization', 'none'].includes(selectedProject) ? selectedProject : activeProjects[0]?.id ?? ''
  const extraProject = useApiData(
    projectId && !activeProjects.some((project) => project.id === projectId)
      ? `/api/v1/projects/${encodeURIComponent(projectId)}`
      : null,
    parseProject,
  )
  const repositoryAfter = params.get('repo_after')
  const repositories = useApiData(
    projectId
      ? `/api/v1/projects/${encodeURIComponent(projectId)}/repositories?${new URLSearchParams({ limit: '100', ...(repositoryAfter ? { after: repositoryAfter } : {}) })}`
      : null,
    parseRepositoryPage,
  )
  const repositoryId =
    params.get('repository') ??
    repositories.data?.items.find(
      (repository) =>
        repository.authorization_status === 'authorized' &&
        !repository.archived,
    )?.id ??
    repositories.data?.items[0]?.id ??
    ''
  const pageRepository = repositories.data?.items.find(
    (repository) => repository.id === repositoryId,
  )
  const extraRepository = useApiData(
    projectId && repositoryId && !pageRepository && !repositories.loading
      ? `/api/v1/projects/${encodeURIComponent(projectId)}/repositories/${encodeURIComponent(repositoryId)}`
      : null,
    parseRepository,
  )
  const repository = pageRepository ?? extraRepository.data
  const repositoryItems =
    extraRepository.data && !pageRepository
      ? [extraRepository.data, ...(repositories.data?.items ?? [])]
      : (repositories.data?.items ?? [])
  function changeRepositoryPage(after: string | null) {
    const next = new URLSearchParams(params)
    if (after) next.set('repo_after', after)
    else next.delete('repo_after')
    navigate(`${location.pathname}?${next}`)
  }
  const root = location.pathname.startsWith('/code/pull-requests')
    ? '/code/pull-requests'
    : location.pathname.startsWith('/code/code-reviews') ? '/code/code-reviews' : '/code'
  function selectProject(id: string) {
    navigate(`${root}?${new URLSearchParams({ project: id })}`)
  }
  function selectRepository(id: string) {
    navigate(
      `${root}?${new URLSearchParams({ project: projectId, repository: id })}`,
    )
  }
  const query = new URLSearchParams({
    project: projectId,
    repository: repositoryId,
  }).toString()
  const repositoryBase =
    projectId && repositoryId
      ? `/api/v1/projects/${encodeURIComponent(projectId)}/repositories/${encodeURIComponent(repositoryId)}`
      : null
  return {
    loading:
      projects.status === 'loading' ||
      repositories.loading ||
      extraProject.loading ||
      extraRepository.loading,
    error:
      repositories.error ??
      extraProject.error ??
      extraRepository.error ??
      (projects.status !== 'ready' && projects.status !== 'loading'
        ? 'No pudimos consultar los proyectos.'
        : null),
    retry: () => {
      projects.retry()
      repositories.reload()
      extraProject.reload()
      extraRepository.reload()
    },
    projects,
    activeProjects,
    extraProject,
    projectId,
    repositories,
    repositoryItems,
    repositoryAfter,
    changeRepositoryPage,
    extraRepository,
    repositoryId,
    repository,
    selectProject,
    selectRepository,
    query,
    repositoryBase,
    canReadPullRequests:
      !!repository &&
      repository.source_kind !== 'local_snapshot' &&
      repository.authorization_status === 'authorized' &&
      !repository.archived,
  }
}
