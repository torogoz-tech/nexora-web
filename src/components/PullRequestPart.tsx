import Pagination from './Pagination'
import { useTranslation } from '../hooks/useTranslation'
import RowAction from './RowAction'
import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { useApiData } from '../hooks/useApiData'
import { parsePullRequestFiles } from '../utils/parsePullRequestFiles'
import { parsePullRequestComments } from '../utils/parsePullRequestComments'
import { parsePullRequestChecks } from '../utils/parsePullRequestChecks'
import { safeExternalUrl } from '../utils/safeExternalUrl'
import DataMessage from './DataMessage'
import PullRequestFileView from './PullRequestFileView'
import type { PullRequestPartProps } from '../types/PullRequestPartProps'
export default function PullRequestPart({
  basePath,
  kind,
}: PullRequestPartProps) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const path = `${basePath}/${kind}?page=${page}&limit=20`
  const files = useApiData(
    kind === 'files' ? path : null,
    parsePullRequestFiles,
  )
  const comments = useApiData(
    kind === 'comments' ? path : null,
    parsePullRequestComments,
  )
  const checks = useApiData(
    kind === 'checks' ? path : null,
    parsePullRequestChecks,
  )
  const current =
    kind === 'files' ? files : kind === 'comments' ? comments : checks
  if (current.loading || current.error)
    return (
      <DataMessage
        loading={current.loading}
        error={t(current.error)}
        onRetry={current.reload}
      />
    )
  return (
    <div className="mt-5">
      {current.data?.items.length === 0 && (
        <DataMessage message={t('No hay resultados en esta página.')} />
      )}
      {kind === 'files' && (
        <div className="flex flex-col gap-3">
          {files.data?.items.map((file) => (
            <PullRequestFileView key={file.path} file={file} />
          ))}
        </div>
      )}
      {kind === 'comments' && (
        <ul className="divide-y divide-base-300">
          {comments.data?.items.map((comment) => (
            <li key={comment.id} className="py-5">
              <p className="text-sm font-semibold">{comment.author}</p>
              {comment.path && (
                <p className="mt-1 break-all font-mono text-xs text-base-content/45">
                  {comment.path}
                  {comment.line ? `:${comment.line}` : ''}
                </p>
              )}
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-base-content/70">
                {comment.body}
              </p>
            </li>
          ))}
        </ul>
      )}
      {kind === 'checks' && (
        <ul className="divide-y divide-base-300">
          {checks.data?.items.map((check, index) => (
            <li
              key={`${check.name}-${index}`}
              className="flex flex-wrap items-center justify-between gap-3 py-4"
            >
              <span className="min-w-0 break-words text-sm">{check.name}</span>
              <span className="badge badge-outline badge-sm">
                {check.conclusion ?? check.status}
              </span>
              {safeExternalUrl(check.web_url) && (
                <RowAction
                  label={t('Ver detalle')}
                  href={safeExternalUrl(check.web_url)!}
                >
                  <ExternalLink size={16} aria-hidden="true" />
                </RowAction>
              )}
            </li>
          ))}
        </ul>
      )}
      {current.data && <Pagination page={page} count={current.data.items.length} hasNext={!!current.data.next_page} onPrevious={()=>setPage(page - 1)} onNext={()=>{if(current.data?.next_page)setPage(current.data!.next_page!)}}/>}
    </div>
  )
}
