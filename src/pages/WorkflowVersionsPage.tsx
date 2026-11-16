import { useTranslation } from '../hooks/useTranslation'
import RowAction from '../components/RowAction'
import { Link } from 'react-router'
import { ArrowLeft, Pencil } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { parseWorkflowDefinition } from '../utils/parseWorkflowDefinition'
import WorkflowVersions from '../components/WorkflowVersions'
import DataMessage from '../components/DataMessage'
import type { WorkflowVersionsPageProps } from '../types/WorkflowVersionsPageProps'
export default function WorkflowVersionsPage({
  id,
}: WorkflowVersionsPageProps) {
  const { t } = useTranslation()
  const base = `/api/v1/workflows/${encodeURIComponent(id)}`
  const workflow = useApiData(base, parseWorkflowDefinition)
  return (
    <section
      className="flex min-w-0 flex-1 flex-col"
      aria-label={t('Versiones publicadas')}
    >
      <Link
        to="/settings/workflows"
        className="mb-5 inline-flex items-center gap-2 self-start text-xs text-base-content/55 hover:text-base-content"
      >
        <ArrowLeft size={14} /> {t('Volver a workflows')}{' '}
      </Link>
      {workflow.loading || workflow.error ? (
        <DataMessage
          loading={workflow.loading}
          error={t(workflow.error)}
          onRetry={workflow.reload}
        />
      ) : (
        workflow.data && (
          <>
            <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold">
                  {t('Versiones publicadas')}
                </h1>
                <p className="mt-1 text-sm text-base-content/50">
                  {workflow.data.name}
                </p>
              </div>
              <RowAction
                to={`/settings/workflows/${encodeURIComponent(id)}`}
                label={t('Ver borrador')}
              >
                <Pencil size={14} />
              </RowAction>
            </header>
            <WorkflowVersions key={base} basePath={base} />
          </>
        )
      )}
    </section>
  )
}
