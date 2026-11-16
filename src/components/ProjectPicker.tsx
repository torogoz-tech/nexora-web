import { useTranslation } from '../hooks/useTranslation'
import IconButton from './IconButton'
import { ChevronRight } from 'lucide-react'
import Dropdown from './Dropdown'
import type { ProjectPickerProps } from '../types/ProjectPickerProps'
export default function ProjectPicker({
  scope,
  onChange,
  disabled = false,
}: ProjectPickerProps) {
  const { t } = useTranslation()
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Dropdown
        label={t('Seleccionar proyecto')}
        placeholder={t('Selecciona un proyecto')}
        value={scope.projectId}
        options={scope.choices.map((project) => ({
          value: project.id,
          label: project.name,
        }))}
        disabled={disabled || scope.loading}
        onChange={onChange}
      />
      {scope.projects.hasMore && (
        <IconButton
          type="button"
          variant="ghost"
          className="self-start"
          disabled={disabled || scope.projects.loadingMore}
          onClick={() => void scope.projects.loadMore()}
          label={t('Más proyectos')}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </IconButton>
      )}
      {scope.projects.pageError && (
        <p role="alert" className="text-xs text-error">
          {scope.projects.pageError}
        </p>
      )}
    </div>
  )
}
