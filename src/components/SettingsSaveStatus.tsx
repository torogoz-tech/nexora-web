import { useTranslation } from '../hooks/useTranslation'
export default function SettingsSaveStatus({
  busy,
  error,
}: {
  busy: boolean
  error: string | null
}) {
  const { t } = useTranslation()
  if (busy || !error) return null
  return (
    <p className="pb-3 text-xs text-error" role="alert">
      {t(error)}
    </p>
  )
}
