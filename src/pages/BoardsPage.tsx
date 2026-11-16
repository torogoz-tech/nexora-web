import { useTranslation } from '../hooks/useTranslation'
import { Navigate } from 'react-router'
import { useWorkNavigation } from '../hooks/useWorkNavigation'
import DataMessage from '../components/DataMessage'
export default function BoardsPage() {
  const { t } = useTranslation()
  const { workflows } = useWorkNavigation()
  if (workflows.loading || workflows.error)
    return (
      <DataMessage
        loading={workflows.loading}
        error={t(workflows.error)}
        onRetry={workflows.reload}
      />
    )
  return workflows.items.length ? (
    <Navigate
      to={`/boards/${encodeURIComponent(workflows.items[0].id)}`}
      replace
    />
  ) : (
    <DataMessage
      message={t(
        'No tienes workflows disponibles para consultar sus tableros.',
      )}
    />
  )
}
