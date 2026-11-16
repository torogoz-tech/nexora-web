import { useTranslation } from '../hooks/useTranslation'
import IconButton from '../components/IconButton'
import { Link } from 'react-router'
import { Menu, Settings } from 'lucide-react'
import { useWorkspaceNavigation } from '../hooks/useWorkspaceNavigation'
import OrganizationMark from '../components/OrganizationMark'
import UserMenu from '../components/UserMenu'
import NotificationsButton from '../components/NotificationsButton'

import type { PrimaryNavigationProps } from '../types/PrimaryNavigationProps'

export default function PrimaryNavigation({
  activeId,
  onNavigate,
  showContextToggle = true,
  sidebarOpen,
  onToggleSidebar,
}: PrimaryNavigationProps) {
  const { t } = useTranslation()
  const navigation = useWorkspaceNavigation()
  const settings = navigation.find(area => area.id === 'settings')
  return (
    <aside
      className="z-20 flex min-h-0 flex-col overflow-y-auto items-center gap-5 border-r border-base-300 bg-base-100 px-2 py-4"
      aria-label={t('Navegación principal')}
    >
      <Link
        to="/profile"
        aria-label={t('Nexora, inicio')}
        onClick={onNavigate}
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-content"
      >
        <OrganizationMark />
      </Link>
      {showContextToggle && (
        <IconButton
          type="button"
          variant="ghost"
          className="lg:hidden"
          aria-expanded={sidebarOpen}
          aria-controls="context-sidebar"
          onClick={onToggleSidebar}
          label={
            sidebarOpen
              ? t('Cerrar navegación contextual')
              : t('Abrir navegación contextual')
          }
        >
          <Menu size={20} aria-hidden="true" />
        </IconButton>
      )}
      <nav
        className="flex shrink-0 flex-col gap-2"
        aria-label={t('Áreas de Nexora')}
      >
        {navigation.filter(area => area.id !== 'settings').map(({ id, label, icon: Icon, items }) => (
          <Link
            key={id}
            to={items[0]!.path}
            title={t(label)}
            onClick={onNavigate}
            aria-label={t(label)}
            aria-current={activeId === id ? 'page' : undefined}
            className={`flex size-10 items-center justify-center rounded-xl transition-colors hover:bg-base-200 ${activeId === id ? 'bg-base-300 text-base-content' : 'text-base-content/55'}`}
          >
            <Icon size={20} aria-hidden="true" />
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex shrink-0 flex-col items-center gap-3 pt-5">
        <NotificationsButton />
        {settings && <Link
          to={settings.items[0]!.path}
          title={t(settings.label)}
          aria-label={t(settings.label)}
          aria-current={activeId === 'settings' ? 'page' : undefined}
          onClick={onNavigate}
          className={`flex size-10 items-center justify-center rounded-xl transition-colors hover:bg-base-200 ${activeId === 'settings' ? 'bg-base-300 text-base-content' : 'text-base-content/55'}`}
        ><Settings size={20} aria-hidden="true" /></Link>}
        <UserMenu />
      </div>
    </aside>
  )
}
