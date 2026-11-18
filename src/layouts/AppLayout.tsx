import { useTranslation } from '../hooks/useTranslation'
import { useEffect, useRef, useState } from 'react'
import Page from '../components/Page'
import PrimaryNavigation from './PrimaryNavigation'
import ContextSidebar from './ContextSidebar'
import { useLocation } from 'react-router'

import type { AppLayoutProps } from '../types/AppLayoutProps'

export default function AppLayout({
  active,
  children,
  wide = false,
  hideContext = false,
}: AppLayoutProps) {
  const { t } = useTranslation()
  const { pathname, search } = useLocation()
  const knowledgeArticle = pathname.startsWith('/knowledge') && new URLSearchParams(search).has('article')
  const boardLayout = active.id === 'boards' || (active.id === 'work' && (pathname === '/boards' || pathname.startsWith('/boards/')))
  const hasContextSidebar = !hideContext
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const panel = useRef<HTMLElement>(null)

  useEffect(() => {
    const media = window.matchMedia('(min-width: 64rem)')
    const closeOnDesktop = () => {
      if (media.matches) setSidebarOpen(false)
    }
    media.addEventListener('change', closeOnDesktop)
    return () => media.removeEventListener('change', closeOnDesktop)
  }, [])

  useEffect(() => {
    if (!sidebarOpen || !hasContextSidebar) return
    const previous = document.activeElement as HTMLElement | null
    const element = panel.current
    element?.querySelector<HTMLElement>('button, a')?.focus()
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSidebarOpen(false)
      if (event.key !== 'Tab') return
      const controls = element?.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled)',
      )
      if (!controls?.length) return
      const first = controls[0]!
      const last = controls[controls.length - 1]!
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previous?.focus()
    }
  }, [sidebarOpen, hasContextSidebar])

  return (
    <div
      className={`nexora-shell ${hasContextSidebar ? '' : 'nexora-shell--without-context'} bg-base-200 text-base-content`}
    >
      <a
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-20 focus:z-50 focus:rounded-lg focus:bg-base-100 focus:p-3"
      >
        {' '}
        {t('Saltar al contenido')}{' '}
      </a>
      <PrimaryNavigation
        activeId={active.id}
        sidebarOpen={hasContextSidebar && sidebarOpen}
        showContextToggle={hasContextSidebar}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onNavigate={() => setSidebarOpen(false)}
      />
      {hasContextSidebar && sidebarOpen && (
        <button
          type="button"
          tabIndex={-1}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-label={t('Cerrar navegación')}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {hasContextSidebar && (
        <aside
          ref={panel}
          id="context-sidebar"
          role={sidebarOpen ? 'dialog' : undefined}
          aria-modal={sidebarOpen || undefined}
          aria-label={t('Panel contextual')}
          className={`context-sidebar min-h-0 min-w-0 overflow-y-auto border-r border-base-300 bg-base-200 p-3 ${sidebarOpen ? 'fixed inset-y-0 left-14 z-40 w-[min(20rem,calc(100vw-3.5rem))]' : 'hidden'} lg:static lg:block lg:w-auto`}
        >
          <ContextSidebar
            active={active}
            onClose={() => setSidebarOpen(false)}
          />
        </aside>
      )}
      <main
        id="main-content"
        tabIndex={-1}
        inert={(hasContextSidebar && sidebarOpen) || undefined}
        className="flex min-h-0 min-w-0 flex-col overflow-y-auto bg-base-100 outline-none"
      >
        <Page wide={wide || knowledgeArticle || pathname === '/code/releases'} viewport={boardLayout || pathname === '/calendar' || pathname === '/notifications'} fullWidth={boardLayout || pathname === '/calendar' || pathname === '/notifications' || pathname === '/tasks' || pathname.startsWith('/requests') || pathname === '/settings/members'}>
          {children}
        </Page>
      </main>
    </div>
  )
}
