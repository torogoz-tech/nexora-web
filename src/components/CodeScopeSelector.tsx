import { useTranslation } from '../hooks/useTranslation'
import IconButton from './IconButton'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import Dropdown from './Dropdown'
import type { CodeScopeSelectorProps } from '../types/CodeScopeSelectorProps'
export default function CodeScopeSelector({
  scope,
  selectRepository = true,
}: CodeScopeSelectorProps) {
  const { t } = useTranslation()
  const projects = scope.extraProject.data
    ? [scope.extraProject.data, ...scope.activeProjects]
    : scope.activeProjects
  return (
    <div className="mb-6 flex flex-wrap items-end gap-3">
      <label className="flex min-w-0 flex-1 flex-col gap-2 text-xs text-base-content/60">
        {' '}
        {t('Proyecto')}{' '}
        <Dropdown
          label={t('Seleccionar proyecto')}
          value={scope.projectId}
          onChange={scope.selectProject}
          disabled={scope.projects.status === 'loading'}
          placeholder={t('Selecciona un proyecto')}
          options={projects.map((project) => ({
            value: project.id,
            label: project.name,
          }))}
        />
      </label>
      {selectRepository && (
        <label className="flex min-w-0 flex-1 flex-col gap-2 text-xs text-base-content/60">
          {' '}
          {t('Repositorio')}{' '}
          <Dropdown
            label={t('Seleccionar repositorio')}
            value={scope.repositoryId}
            onChange={scope.selectRepository}
            disabled={!scope.projectId || scope.repositories.loading}
            placeholder={t('Selecciona un repositorio')}
            options={scope.repositoryItems.map((repository) => ({
              value: repository.id,
              label:
                repository.remote_full_name ??
                repository.requested_full_name ??
                repository.local_name ??
                repository.id,
            }))}
          />
        </label>
      )}
      {selectRepository && scope.repositories.data?.next_cursor && (
        <IconButton
          type="button"
          variant="ghost"
          onClick={() =>
            scope.changeRepositoryPage(scope.repositories.data!.next_cursor)
          }
          label={t('Más repositorios')}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </IconButton>
      )}
      {selectRepository && scope.repositoryAfter && (
        <IconButton
          type="button"
          variant="ghost"
          onClick={() => scope.changeRepositoryPage(null)}
          label={t('Primeros repositorios')}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </IconButton>
      )}
      {scope.projects.hasMore && (
        <IconButton
          type="button"
          variant="ghost"
          disabled={scope.projects.loadingMore}
          onClick={() => void scope.projects.loadMore()}
          label={t('Más proyectos')}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </IconButton>
      )}
    </div>
  )
}
