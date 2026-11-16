import { useTranslation } from '../hooks/useTranslation'
import type { PullRequestStatusProps } from '../types/PullRequestStatusProps'
export default function PullRequestStatus({
  state,
  draft,
}: PullRequestStatusProps) {
  const { t } = useTranslation()
  return (
    <span
      className={`badge badge-sm shrink-0 ${draft ? 'badge-ghost' : state === 'open' ? 'badge-success' : state === 'merged' ? 'badge-primary' : 'badge-error'}`}
    >
      {draft
        ? t('Borrador')
        : state === 'open'
          ? t('Abierta')
          : state === 'merged'
            ? t('Integrada')
            : t('Cerrada')}
    </span>
  )
}
