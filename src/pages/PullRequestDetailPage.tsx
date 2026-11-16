import { useTranslation } from '../hooks/useTranslation'
import PullRequestReviews from '../components/PullRequestReviews'
import PullRequestLinks from '../components/PullRequestLinks'
import { Link, useSearchParams } from 'react-router'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useCodeScope } from '../hooks/useCodeScope'
import { useApiData } from '../hooks/useApiData'
import { parsePullRequest } from '../utils/parsePullRequest'
import { safeExternalUrl } from '../utils/safeExternalUrl'
import CodeScopeSelector from '../components/CodeScopeSelector'
import DataMessage from '../components/DataMessage'
import PullRequestStatus from '../components/PullRequestStatus'
import PullRequestPart from '../components/PullRequestPart'
import type { PullRequestDetailPageProps } from '../types/PullRequestDetailPageProps'
export default function PullRequestDetailPage({
  number,
}: PullRequestDetailPageProps) {
  const { t } = useTranslation()
  const scope = useCodeScope()
  const [params, setParams] = useSearchParams()
  const kind = ['files', 'comments', 'checks', 'links', 'reviews'].includes(
    params.get('view') ?? '',
  )
    ? params.get('view')!
    : 'overview'
  const base = scope.canReadPullRequests
    ? `${scope.repositoryBase}/pull-requests/${number}`
    : null
  const request = useApiData(base, parsePullRequest)
  const pr = request.data
  const providerUrl = pr ? safeExternalUrl(pr.web_url) : null
  return (
    <section aria-label={`PR ${number}`} className="flex flex-1 flex-col">
      <CodeScopeSelector scope={scope} />
      <Link
        className="mb-6 inline-flex items-center gap-2 text-xs text-base-content/55 hover:text-base-content"
        to={`/code/pull-requests?${scope.query}`}
      >
        <ArrowLeft size={14} /> {t('Volver a Pull Requests')}{' '}
      </Link>
      {scope.loading || request.loading ? (
        <DataMessage loading />
      ) : scope.error || request.error ? (
        <DataMessage
          error={scope.error ?? request.error}
          onRetry={() => {
            scope.retry()
            request.reload()
          }}
        />
      ) : !scope.canReadPullRequests ? (
        <DataMessage
          message={t(
            'Selecciona un repositorio Git autorizado para consultar esta PR.',
          )}
        />
      ) : pr && base ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="break-words text-xl font-semibold">
                {pr.title}{' '}
                <span className="font-normal text-base-content/40">
                  #{pr.number}
                </span>
              </h1>
              <p className="mt-3 break-all font-mono text-xs text-base-content/50">
                {pr.source_branch} → {pr.target_branch}
              </p>
              <p className="mt-2 text-xs text-base-content/45">{pr.author}</p>
            </div>
            <PullRequestStatus state={pr.state} draft={pr.draft} />
          </div>
          {providerUrl && (
            <a
              className="mt-4 inline-flex w-fit items-center gap-2 text-xs text-base-content/55 hover:text-base-content"
              href={providerUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {' '}
              {t('Abrir en')}{' '}
              {scope.repository?.provider === 'gitlab' ? 'GitLab' : 'GitHub'}
              <ExternalLink size={13} />
            </a>
          )}
          <div
            role="tablist"
            aria-label={t('Detalle de PR')}
            className="tabs tabs-border mt-7 flex-nowrap overflow-x-auto"
          >
            {[
              ['overview', t('Resumen')],
              ['files', t('Archivos')],
              ['comments', t('Comentarios')],
              ['checks', 'Checks'],
              ['links', t('Vínculos')],
              ['reviews', 'Code Reviews'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={kind === id}
                className={`tab whitespace-nowrap ${kind === id ? 'tab-active' : ''}`}
                onClick={() => {
                  const next = new URLSearchParams(params)
                  next.set('project', scope.projectId)
                  next.set('repository', scope.repositoryId)
                  next.set('view', id!)
                  setParams(next)
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {kind === 'overview' ? (
            <div role="tabpanel" className="py-6">
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-base-content/70">
                {pr.description || t('Esta PR no tiene descripción.')}
              </p>
              {pr.head_sha && (
                <p className="mt-6 break-all font-mono text-xs text-base-content/40">
                  Commit: {pr.head_sha}
                </p>
              )}
            </div>
          ) : kind === 'reviews' ? (
            <PullRequestReviews key={base} basePath={base} projectId={scope.projectId} headSha={pr.head_sha} baseSha={pr.base_sha??''}/>
          ) : kind === 'links' ? (
            <PullRequestLinks
              key={base}
              basePath={base}
              projectId={scope.projectId}
            />
          ) : (
            <PullRequestPart
              key={`${base}-${kind}`}
              basePath={base}
              kind={kind as 'files' | 'comments' | 'checks'}
            />
          )}
        </>
      ) : null}
    </section>
  )
}
