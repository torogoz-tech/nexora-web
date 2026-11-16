import { useContext } from 'react'
import { useSearchParams } from 'react-router'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { useApiData } from '../hooks/useApiData'
import { useTranslation } from '../hooks/useTranslation'
import { parseOrganizationDocument } from '../utils/parseOrganizationDocument'
import { parseKnowledgeSubmission } from '../utils/parseKnowledgeSubmission'
import KnowledgeEditorForm from '../components/KnowledgeEditorForm'
import DataMessage from '../components/DataMessage'
export default function KnowledgeEditorPage({ id }: { id?: string }) {
  const { t } = useTranslation(),
    [params] = useSearchParams(),
    permissions = useContext(WorkspacePermissionsContext)
  const source = params.get('source') ?? 'contribution',
    kind = params.get('kind') ?? 'document',
    project = params.get('project') ?? 'organization'
  const organization = source === 'organization',
    projectId = project === 'organization' ? null : project
  const curated =
    !!permissions?.role &&
    ['technical_lead', 'pmo', 'manager', 'super_admin'].includes(
      permissions.role,
    )
  const org = useApiData(
    id && organization
      ? `/api/v1/knowledge/organization/documents/${encodeURIComponent(id)}`
      : null,
    parseOrganizationDocument,
  )
  const contribution = useApiData(
    id && !organization
      ? `/api/v1/knowledge/contributions/${encodeURIComponent(id)}`
      : null,
    parseKnowledgeSubmission,
  )
  const remote = organization ? org : contribution,
    document = remote.data
  if (
    !['organization', 'contribution'].includes(source) ||
    ![
      'document',
      'requirement',
      'business_rule',
      'decision',
      'best_practice',
      'security',
      'technical_debt',
    ].includes(kind) ||
    (!organization && !['document', 'technical_debt'].includes(kind)) ||
    (organization && projectId !== null)
  )
    return (
      <DataMessage
        error={t(
          'El recurso no está disponible o esta función no está habilitada en la API.',
        )}
      />
    )
  if (!permissions?.role || (organization && !curated))
    return (
      <DataMessage error={t('No tienes permisos para realizar esta acción.')} />
    )
  if (id && (remote.loading || remote.error || !document))
    return (
      <DataMessage
        loading={remote.loading}
        error={remote.error}
        onRetry={remote.reload}
      />
    )
  if (
    document &&
    (document.kind !== kind ||
      (!organization && contribution.data?.project_id !== projectId))
  )
    return (
      <DataMessage error={t('No tienes permisos para realizar esta acción.')} />
    )
  if (
    contribution.data &&
    !['ready', 'failed'].includes(contribution.data.status)
  )
    return (
      <DataMessage message={t('Preparando la documentación del archivo…')} />
    )
  return (
    <KnowledgeEditorForm
      key={`${source}:${project}:${id ?? 'new'}`}
      id={id}
      source={source}
      kind={kind}
      projectId={projectId}
      document={document ?? undefined}
      canEdit={curated || !id}
    />
  )
}
