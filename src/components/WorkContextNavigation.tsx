import { Link, useLocation, useSearchParams } from 'react-router'
import { useTranslation } from '../hooks/useTranslation'
import { useWorkNavigation } from '../hooks/useWorkNavigation'
import { useWorkspaceNavigation } from '../hooks/useWorkspaceNavigation'
import type { WorkContextNavigationProps } from '../types/WorkContextNavigationProps'
import TasksContextNavigation from './TasksContextNavigation'
import BoardsContextNavigation from './BoardsContextNavigation'
export default function WorkContextNavigation({ onClose }: WorkContextNavigationProps) {
  const { t } = useTranslation(), { pathname } = useLocation(), [params] = useSearchParams()
  const { types } = useWorkNavigation()
  const work = useWorkspaceNavigation().find(item => item.id === 'work')!
  return <div className="flex flex-col gap-1" aria-label={t('Submenú de {0}', { '0': t(work.label) })}>
    {work.items.map(({ path, label, icon: Icon }) => {
      const selected = pathname === path || pathname.startsWith(`${path}/`)
      return <div key={path}>
        <Link to={path} onClick={onClose} className="context-nav-item" aria-current={selected && !(path === '/tasks' && params.get('type')) && !(path === '/boards' && pathname !== '/boards') ? 'page' : undefined}>
          <Icon size={16} className="shrink-0" aria-hidden="true"/><span className="min-w-0 flex-1 truncate">{t(label)}</span>
          {path === '/tasks' && types.total !== null && <span className="rounded-md bg-base-100/60 px-2 py-0.5 text-xs tabular-nums text-base-content/60">{types.total}</span>}
        </Link>
        {selected && path === '/tasks' && <div className="ml-4 mt-1"><TasksContextNavigation onClose={onClose} hideAllLink/></div>}
        {selected && path === '/boards' && <div className="ml-4 mt-1"><BoardsContextNavigation onClose={onClose}/></div>}
      </div>
    })}
  </div>
}
