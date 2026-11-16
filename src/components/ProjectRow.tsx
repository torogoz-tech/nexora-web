import { Link } from 'react-router'
import { useTranslation } from '../hooks/useTranslation'
import RowAction from './RowAction'
import {
  Archive,
  ArchiveRestore,
  FolderKanban,
  Pencil,
} from 'lucide-react'
import type { ProjectRowProps } from '../types/ProjectRowProps'
export default function ProjectRow({
  project,
  canManage = true,
  onEdit,
  onArchive,
}: ProjectRowProps) {
  const { t } = useTranslation()
  const ArchiveIcon = project.archived ? ArchiveRestore : Archive
  return (
    <li className="flex flex-wrap items-center gap-3 py-5 sm:flex-nowrap">
      <FolderKanban
        size={20}
        className="shrink-0 text-base-content/50"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <h2
          className={`break-words text-sm font-semibold ${project.archived ? 'text-base-content/40 line-through' : ''}`}
        >
          {project.archived && (
            <span className="sr-only">{t('Archivado:')} </span>
          )}
          <Link to={`/projects/${encodeURIComponent(project.id)}`} className="hover:underline">{project.name}</Link>
        </h2>
      </div>
      {canManage && <div className="flex w-full justify-end gap-1 sm:w-auto">

        <RowAction
          label={t('Editar {0}', { '0': project.name })}
          onClick={() => onEdit(project)}
        >
          <Pencil size={14} aria-hidden="true" />
        </RowAction>
        <RowAction
          label={`${project.archived ? t('Restaurar') : t('Archivar')} ${project.name}`}
          onClick={() => onArchive(project)}
        >
          <ArchiveIcon size={14} aria-hidden="true" />
        </RowAction>
      </div>}
    </li>
  )
}
