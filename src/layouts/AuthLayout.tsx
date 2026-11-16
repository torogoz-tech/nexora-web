import { useTranslation } from '../hooks/useTranslation'
import CodeCloud from '../components/CodeCloud'
import type { AuthLayoutProps } from '../types/AuthLayoutProps'
import OrganizationMark from '../components/OrganizationMark'
import ThemeToggle from '../components/ThemeToggle'

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  return (
    <main className="auth-layout relative isolate flex min-h-dvh flex-col items-center px-4 pt-12 pb-8 sm:pt-14">
      <CodeCloud />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div
        className="auth-brand mb-7 flex size-16 shrink-0 items-center justify-center rounded-2xl"
        aria-label="Nexora"
      >
        <OrganizationMark />
      </div>
      <div className="w-full max-w-xs">{children}</div>
      <footer className="mt-auto pt-20 text-center text-xs">
        <strong className="font-bold">Nexora</strong>{' '}
        {t('· Conocimiento compartido')}{' '}
      </footer>
    </main>
  )
}
