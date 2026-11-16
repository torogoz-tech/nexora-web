import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { parseWorkflowDefinition } from '../utils/parseWorkflowDefinition'
import WorkflowEditor from '../components/WorkflowEditor'
import DataMessage from '../components/DataMessage'
import type { WorkflowEditorPageProps } from '../types/WorkflowEditorPageProps'
export default function WorkflowEditorPage({ id, focus }: WorkflowEditorPageProps) {
  const { t } = useTranslation()
  const data = useApiData(
    id ? `/api/v1/workflows/${encodeURIComponent(id)}` : null,
    parseWorkflowDefinition,
  )
  if (data.loading || data.error)
    return (
      <DataMessage
        loading={data.loading}
        error={t(data.error)}
        onRetry={data.reload}
      />
    )
  return (
    <section
      aria-label={id ? t('Editar workflow') : t('Crear workflow')}
      className="flex min-w-0 flex-1 flex-col"
    >
      <WorkflowEditor
        key={id ?? 'new'}
        workflow={id ? data.data : null}
        focus={focus}
        onReload={data.reload}
      />
    </section>
  )
}
