import RequestsContextNavigation from '../components/RequestsContextNavigation'
import SettingsContextNavigation from '../components/SettingsContextNavigation'
import { useTranslation } from '../hooks/useTranslation'
import TasksContextNavigation from '../components/TasksContextNavigation'
import WorkContextNavigation from '../components/WorkContextNavigation'
import BoardsContextNavigation from '../components/BoardsContextNavigation'
import IconButton from '../components/IconButton'
import { Link, useLocation } from 'react-router'
import { X } from 'lucide-react'
import type { ContextSidebarProps } from '../types/ContextSidebarProps'

export default function ContextSidebar({
  active,
  onClose,
}: ContextSidebarProps) {
  const { t } = useTranslation()
  const Icon = active.icon
  const currentPath = useLocation().pathname
  const heading = <>
        <Icon
          size={21}
          className="mt-0.5 shrink-0 text-base-content/65"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold">{t(active.label)}</h2>
          <p className="mt-1 text-xs leading-relaxed text-base-content/50">
            {t(active.description)}
          </p>
        </div>
        <IconButton
          type="button"
          variant="ghost"
          className="lg:hidden"
          onClick={onClose}
          label={t('Cerrar panel lateral')}
        >
          <X size={18} aria-hidden="true" />
        </IconButton>
  </>
  return (
    <div
      key={active.id}
      className="context-sidebar-content flex min-h-full flex-col"
    >
      {active.id !== 'settings' && <header className="mb-6 flex items-start gap-3 px-2 pt-1">{heading}</header>}
      {active.id === 'settings' ? (
        <SettingsContextNavigation items={active.items} onClose={onClose} heading={heading}/>
      ) : active.id === 'requests' ? (
        <RequestsContextNavigation onClose={onClose} />
      ) : active.id === 'work' ? (
        <WorkContextNavigation onClose={onClose} />
      ) : active.id === 'tasks' ? (
        <TasksContextNavigation onClose={onClose} />
      ) : active.id === 'boards' ? (
        <BoardsContextNavigation onClose={onClose} />
      ) : (
        <nav
          aria-label={t('Submenú de {0}', { '0': t(active.label) })}
          className="flex flex-col gap-1"
        >
          {active.items.map(({ path, label, icon: ItemIcon }) => (
            <Link
              key={path}
              to={path}
              className="context-nav-item"
              aria-current={
                currentPath === path ||
                ((path === '/code/pull-requests' ||
                  path === '/settings/workflows' ||
                  path === '/settings/integrations') &&
                  currentPath.startsWith(path + '/'))
                  ? 'page'
                  : undefined
              }
              onClick={onClose}
            >
              <ItemIcon size={16} className="shrink-0" aria-hidden="true" />
              <span className="min-w-0 truncate">{t(label)}</span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
