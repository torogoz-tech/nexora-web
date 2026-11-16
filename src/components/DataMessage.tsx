import { useTranslation } from '../hooks/useTranslation'
import IconButton from './IconButton'
import { RefreshCw } from 'lucide-react'
import type { DataMessageProps } from '../types/DataMessageProps'
export default function DataMessage({
  loading,
  error,
  message,
  onRetry,
}: DataMessageProps) {
  const { t } = useTranslation()
  if (!loading && !error && !message) return null
  return (
    <div className="py-12 text-center" role={error ? 'alert' : 'status'}>
      {loading && (
        <span className="loading loading-spinner loading-sm motion-reduce:animate-none" />
      )}
      <p
        className={`mt-3 text-sm ${error ? 'text-error' : 'text-base-content/55'}`}
      >
        {t(error ?? (loading ? 'Cargando…' : message))}
      </p>
      {error && onRetry && (
        <IconButton
          type="button"
          variant="outline"
          className="mt-4"
          onClick={onRetry}
          label={t('Reintentar')}
        >
          <RefreshCw size={16} aria-hidden="true" />
        </IconButton>
      )}
    </div>
  )
}
