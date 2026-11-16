import TaskCreatorIdentity from './TaskCreatorIdentity'
import KnowledgePublishButton from './KnowledgePublishButton'
import { useTranslation } from '../hooks/useTranslation'
import { Link, useSearchParams } from 'react-router'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { parseKnowledgeDocument } from '../utils/parseKnowledgeDocument'
import { parseKnowledgeVersion } from '../utils/parseKnowledgeVersion'
import { getKnowledgeSections } from '../utils/getKnowledgeSections'
import DataMessage from './DataMessage'
import IconButton from './IconButton'
import WikiArticle from './WikiArticle'
import KnowledgeVersionHistory from './KnowledgeVersionHistory'
import type { KnowledgeArticleProps } from '../types/KnowledgeArticleProps'
export default function KnowledgeArticle({
  projectId,
  documentId,
  projectName,
  live,
}: KnowledgeArticleProps) {
  const { t, dateLocale } = useTranslation()
  const [params] = useSearchParams()
  const base = `/api/v1/projects/${encodeURIComponent(projectId)}/documents/${encodeURIComponent(documentId)}`
  const document = useApiData(base, parseKnowledgeDocument)
  const selected =
    params.get('version') ||
    document.data?.published_version_id ||
    document.data?.latest_version_id
  const version = useApiData(
    selected ? `${base}/versions/${encodeURIComponent(selected)}` : null,
    parseKnowledgeVersion,
  )
  const d = document.data,
    v = version.data
  const invalid =
    (d && (d.project_id !== projectId || d.id !== documentId)) ||
    (v &&
      (v.document_id !== documentId ||
        v.project_id !== projectId ||
        v.id !== selected ||
        v.content.kind !== d?.kind))
  const kinds = {
    document: t('Documento'),
    requirement: t('Requerimiento'),
    business_rule: t('Regla de negocio'),
    decision: t('Decisión técnica'),
    best_practice: t('Buena práctica'),
    security:t('Seguridad'),
    technical_debt: t('Deuda técnica'),
  }
  const routes = {
    document: '/knowledge',
    requirement: '/knowledge/requirements',
    business_rule: '/knowledge/rules',
    decision: '/knowledge/decisions',
    best_practice: '/knowledge/best-practices',
        security:'/knowledge/security',
    technical_debt: '/knowledge/technical-debt',
  }
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Link
          to={`${d ? routes[d.kind] : '/knowledge'}?${new URLSearchParams({ project: projectId })}`}
          className="inline-flex items-center gap-2 text-xs text-base-content/50 hover:text-base-content"
        >
          <ArrowLeft size={14} /> {t('Volver al índice')}{' '}
        </Link>
        {!live && (
          <IconButton
            type="button"
            label={t('Actualizar artículo')}
            disabled={document.loading || version.loading}
            onClick={() => {
              document.reload()
              version.reload()
            }}
          >
            <RefreshCw size={16} />
          </IconButton>
        )}
      </div>
      {document.loading ||
      version.loading ||
      document.error ||
      version.error ||
      invalid ? (
        <DataMessage
          loading={document.loading || version.loading}
          error={
            invalid
              ? t('La versión no corresponde a este artículo.')
              : (document.error ?? version.error)
          }
          onRetry={() => {
            document.reload()
            version.reload()
          }}
        />
      ) : (
        d &&
        v && (
          <WikiArticle
            toolbar={<><span className="badge badge-ghost">{t('Versión')} {v.number} · {v.id===d.published_version_id?t('Versión publicada'):t('Sin publicar')}</span><KnowledgePublishButton document={d} version={v} base={base} onPublished={()=>{document.reload();version.reload()}}/></>}
            title={v.title}
            category={`${kinds[d.kind]} · ${d.code}`}
            sections={getKnowledgeSections(v.content)}
            metadata={[
              { label: t('Proyecto'), value: projectName },
              { label: t('Versión'), value: String(v.number) },
              {
                label: t('Publicación'),
                value:
                  v.id === d.published_version_id
                    ? t('Versión publicada')
                    : v.id === d.latest_version_id
                      ? t('Última versión · sin publicar')
                      : t('Versión histórica · sin publicación vigente'),
              },
              {
                label: t('Origen'),
                value:
                  {
                    observed_code: t('Observado en código'),
                    declared_business: t('Declarado por el negocio'),
                    agent_proposed: t('Propuesto por un agente'),
                  }[v.origin] ?? v.origin,
              },
              { label: t('Autor de esta versión'), value: <TaskCreatorIdentity actorId={v.created_by}/> },
              {
                label: t('Fecha de la versión'),
                value: new Date(v.created_at).toLocaleString(dateLocale),
              },
            ]}
            notices={[
              ...(d.archived ? [t('Este artículo está archivado.')] : []),
              ...(v.needs_review ? [t('Esta versión requiere revisión.')] : []),
              ...(v.id !== d.published_version_id
                ? [
                    t(
                      'Estás leyendo una versión sin publicación vigente. Su contenido puede estar pendiente de aprobación.',
                    ),
                  ]
                : []),
            ]}
          >
            {v.reason && (
              <section className="mt-6 border-t border-base-300 pt-5">
                <h2 className="mb-2 text-sm font-medium">
                  {' '}
                  {t('Motivo de esta versión')}{' '}
                </h2>
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-base-content/60">
                  {v.reason}
                </p>
              </section>
            )}
            {v.evidence.length > 0 && (
              <section className="mt-6 border-t border-base-300 pt-5">
                <h2 className="mb-3 text-sm font-medium">
                  {' '}
                  {t('Evidencia del código')}{' '}
                </h2>
                <ul className="space-y-3">
                  {v.evidence.map((e, index) => (
                    <li
                      key={index}
                      className="break-words text-xs leading-relaxed text-base-content/60"
                    >
                      <span className="font-mono">
                        {e.path}:{e.start_line}–
                        {e.start_line + e.line_count - 1}
                      </span>
                      <span className="mt-1 block">
                        {' '}
                        {t('Repositorio:')} {e.repository_id} · Snapshot:{' '}
                        {e.snapshot_id}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <KnowledgeVersionHistory
              key={base}
              base={base}
              selected={v.id}
              published={d.published_version_id}
            />
          </WikiArticle>
        )
      )}
    </>
  )
}
