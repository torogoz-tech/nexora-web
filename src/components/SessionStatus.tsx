import { useTranslation } from '../hooks/useTranslation'
import TextButton from './TextButton'
import { RefreshCw, ChevronLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
export default function SessionStatus() {
  const { t } = useTranslation()
  const { status, retry, logout } = useAuth()
  return (
    <main className="flex min-h-dvh items-center justify-center bg-base-100 px-6 text-base-content">
      <div className="max-w-sm text-center" role="status">
        {status === 'checking' ? (
          <>
            <span className="loading loading-spinner motion-reduce:animate-none" />
            <p className="mt-4 text-sm">{t('Verificando tu sesión…')}</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold">
              {' '}
              {t('No pudimos verificar tu sesión')}{' '}
            </h1>
            <p className="mt-3 text-sm text-base-content/60">
              {' '}
              {t('Comprueba la conexión e inténtalo de nuevo.')}{' '}
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <TextButton
                type="button"
                variant="primary"
                onClick={retry}
                label={t('Reintentar')}
              >
                <RefreshCw size={16} aria-hidden="true" />
              </TextButton>
              <TextButton
                type="button"
                variant="ghost"
                onClick={() => void logout()}
                label={t('Volver al inicio de sesión')}
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </TextButton>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
