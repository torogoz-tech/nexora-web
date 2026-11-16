import { useSearchParams } from 'react-router'
import { useProjectPreference } from './useProjectPreference'
import { useProjects } from './useProjects'
import { useApiData } from './useApiData'
import { parseProject } from '../utils/parseProject'
export function useProjectScope(allowOrganization = false) {
  const projects = useProjects()
  const [params] = useSearchParams()
  const remembered = useProjectPreference(params.get('project'))
  const active = projects.projects.filter((project) => !project.archived)
  const projectId = (remembered === '' || remembered === 'none' || (remembered === 'organization' && !allowOrganization) ? null : remembered) ?? active[0]?.id ?? ''
  const extra = useApiData(
    projectId && !(allowOrganization && projectId === 'organization') && !projects.projects.some((project) => project.id === projectId)
      ? `/api/v1/projects/${encodeURIComponent(projectId)}`
      : null,
    parseProject,
  )
  const choices = extra.data ? [extra.data, ...active] : active
  return {
    projectId,
    choices,
    projects,
    loading: projects.status === 'loading' || extra.loading,
    error:
      extra.error ??
      (projects.status !== 'loading' && projects.status !== 'ready'
        ? 'No pudimos consultar los proyectos.'
        : null),
    reload: () => {
      projects.retry()
      extra.reload()
    },
  }
}
