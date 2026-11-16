import Pagination from '../components/Pagination'
import type { PullRequestsPageProps } from '../types/PullRequestsPageProps'
import { useTranslation } from '../hooks/useTranslation'
import IconButton from '../components/IconButton'
import Dropdown from '../components/Dropdown'
import { Link, useSearchParams } from 'react-router'
import {
  GitPullRequest,
  RefreshCw,
} from 'lucide-react'
import { useCodeScope } from '../hooks/useCodeScope'
import { useApiData } from '../hooks/useApiData'
import { parsePullRequestPage } from '../utils/parsePullRequestPage'
import CodeScopeSelector from '../components/CodeScopeSelector'
import DataMessage from '../components/DataMessage'
import PullRequestStatus from '../components/PullRequestStatus'
export default function PullRequestsPage({ reviews = false }: PullRequestsPageProps) {
  const { t } = useTranslation()
  const scope = useCodeScope()
  const [params, setParams] = useSearchParams()
  const state = ['open', 'closed', 'all'].includes(params.get('state') ?? '')
    ? params.get('state')!
    : 'open'
  const page =
    Number.isSafeInteger(Number(params.get('page'))) &&
    Number(params.get('page')) > 0 &&
    Number(params.get('page')) <= 10000
      ? Number(params.get('page'))
      : 1
  const path = scope.canReadPullRequests
    ? `${scope.repositoryBase}/pull-requests?${new URLSearchParams({ state, page: String(page), limit: '20' })}`
    : null
  const data = useApiData(path, parsePullRequestPage)
  function changePage(value: number) {
    const next = new URLSearchParams(params)
    next.set('project', scope.projectId)
    next.set('repository', scope.repositoryId)
    next.set('page', String(value))
    setParams(next)
  }
  return (
    <section aria-label="Pull Requests" className="flex flex-1 flex-col">
      <CodeScopeSelector scope={scope} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-sm font-semibold">{reviews ? 'Code Reviews' : 'Pull Requests'}</h1>
        <div className="flex items-center gap-2">
          <Dropdown
            label={t('Estado de las PR')}
            value={state}
            onChange={(value) => {
              const next = new URLSearchParams(params)
              next.set('project', scope.projectId)
              next.set('repository', scope.repositoryId)
              next.set('state', value)
              next.delete('page')
              setParams(next)
            }}
            options={[
              { value: 'open', label: t('Abiertas') },
              { value: 'closed', label: t('Cerradas') },
              { value: 'all', label: t('Todas') },
            ]}
            className="w-40"
          />
          <IconButton
            type="button"
            variant="ghost"
            disabled={!path || data.loading}
            onClick={data.reload}
            label="Actualizar PR"
          >
            <RefreshCw size={15} />
          </IconButton>
        </div>
      </div>
      {scope.loading ? (
        <DataMessage loading />
      ) : scope.error ? (
        <DataMessage error={t(scope.error)} onRetry={scope.retry} />
      ) : !scope.canReadPullRequests ? (
        <DataMessage
          message={t(
            'Selecciona un repositorio Git autorizado para consultar sus PR o merge requests.',
          )}
        />
      ) : data.error || data.loading ? (
        <DataMessage
          loading={data.loading}
          error={t(data.error)}
          onRetry={data.reload}
        />
      ) : data.data?.items.length === 0 ? (
        <DataMessage message={t('No hay PR para los filtros seleccionados.')} />
      ) : (
        <ul className="divide-y divide-base-300">
          {data.data?.items.map((pr) => (
            <li key={pr.number} className="py-5">
              <Link
                className="flex items-start gap-3 rounded-xl outline-offset-4"
                to={`/code/pull-requests/${pr.number}?${scope.query}${reviews ? '&view=reviews' : ''}`}
              >
                <GitPullRequest
                  size={19}
                  className="mt-0.5 shrink-0 text-base-content/55"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="min-w-0 break-words text-sm font-semibold">
                      {pr.title}
                    </h2>
                    <PullRequestStatus state={pr.state} draft={pr.draft} />
                  </div>
                  <p className="mt-2 text-xs text-base-content/50">
                    #{pr.number} · {pr.author}
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-base-content/40">
                    {pr.source_branch} → {pr.target_branch}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {data.data && <Pagination page={page} count={data.data.items.length} hasNext={!!data.data.next_page} onPrevious={()=>changePage(page - 1)} onNext={()=>{if(data.data?.next_page)changePage(data.data!.next_page!)}}/>}
    </section>
  )
}
