import { useId, useRef } from 'react'
import { Link } from 'react-router'
import { CalendarDays, LogOut, Moon, Sun, UserRound } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useTranslation } from '../hooks/useTranslation'
import UserAvatar from './UserAvatar'

export default function UserMenu() {
  const { session, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { t } = useTranslation()
  const id = useId()
  const panel = useRef<HTMLDivElement>(null)
  const ThemeIcon = isDark ? Sun : Moon
  return <>
    <button type="button" popoverTarget={id} aria-label={t('Menú de usuario')}
      className="flex rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
      <UserAvatar actorId={session?.actorId} name={session?.displayName ?? session?.actorId} />
    </button>
    <div ref={panel} id={id} popover="auto" aria-label={t('Menú de usuario')}
      className="fixed inset-auto bottom-4 left-16 m-0 w-64 rounded-2xl border border-base-300 bg-base-200 p-2 text-base-content shadow-xl backdrop:bg-transparent">
      <div className="mb-2 border-b border-base-300 px-3 py-3">
        <p className="truncate text-sm font-semibold">{session?.displayName ?? t('Mi cuenta')}</p>
      </div>
      <Link to="/profile" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-base-300" onClick={()=>panel.current?.hidePopover()}><UserRound size={18} aria-hidden="true"/>{t('Mi perfil')}</Link>
      <Link to="/calendar" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-base-300" onClick={()=>panel.current?.hidePopover()}><CalendarDays size={18} aria-hidden="true"/>{t('Permisos y vacaciones')}</Link>
      <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-base-300" onClick={toggleTheme}>
        <ThemeIcon size={18} aria-hidden="true" />
        {isDark ? t('Activar tema claro') : t('Activar tema oscuro')}
      </button>
      <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-base-300" onClick={() => { panel.current?.hidePopover(); void logout() }}>
        <LogOut size={18} aria-hidden="true" />{t('Cerrar sesión')}
      </button>
    </div>
  </>
}
