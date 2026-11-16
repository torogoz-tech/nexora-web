import Pagination from './Pagination'
import { useTranslation } from '../hooks/useTranslation'
import type { KnowledgeCodeReviewsProps } from '../types/KnowledgeCodeReviewsProps'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ChevronLeft, ChevronRight, GitPullRequest } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { parseRepository } from '../utils/parseRepository'
import { parseRepositoryPage } from '../utils/parseRepositoryPage'
import { parseKnowledgeContributionPage } from '../utils/parseKnowledgeContributionPage'
import { knowledgeReviewStates } from '../app/knowledgeReviewStates'
import Dropdown from './Dropdown'
import IconButton from './IconButton'
import DataMessage from './DataMessage'
import KnowledgeReviewArticle from './KnowledgeReviewArticle'
export default function KnowledgeCodeReviews({
  projectId,
  search,
  live,
}: KnowledgeCodeReviewsProps) {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams(),
    [repoAfter, setRepoAfter] = useState<string | null>(null),
    [offset, setOffset] = useState(0),
    [status, setStatus] = useState('all')
  const repositories = useApiData(
    `/api/v1/projects/${encodeURIComponent(projectId)}/repositories?${new URLSearchParams({ limit: '100', ...(repoAfter ? { after: repoAfter } : {}) })}`,
    parseRepositoryPage,
  )
  const pageChoices = (repositories.data?.items ?? []).filter(
    (item) => !item.archived && item.authorization_status === 'authorized',
  )
  const repositoryId = params.get('repository') ?? pageChoices[0]?.id ?? ''
  const extraRepository = useApiData(
    repositoryId &&
      !pageChoices.some((item) => item.id === repositoryId) &&
      !repositories.loading
      ? `/api/v1/projects/${encodeURIComponent(projectId)}/repositories/${encodeURIComponent(repositoryId)}`
      : null,
    parseRepository,
  )
  const choices =
    extraRepository.data &&
    extraRepository.data.project_id === projectId &&
    !extraRepository.data.archived &&
    extraRepository.data.authorization_status === 'authorized'
      ? [extraRepository.data, ...pageChoices]
      : pageChoices
  const selected = choices.find((item) => item.id === repositoryId)
  const base = `/api/v1/projects/${encodeURIComponent(projectId)}/repositories/${encodeURIComponent(repositoryId)}/knowledge`
  const article = params.get('article')
  const data = useApiData(
    repositoryId && !article
      ? `${base}?${new URLSearchParams({ offset: String(offset), limit: '20', ...(status !== 'all' ? { status } : {}) })}`
      : null,
    parseKnowledgeContributionPage,
  )
  const repositoryName =
    selected?.remote_full_name ??
    selected?.requested_full_name ??
    selected?.local_name ??
    repositoryId
  if (
    repositories.loading ||
    repositories.error ||
    extraRepository.loading ||
    extraRepository.error
  )
    return (
      <DataMessage
        loading={repositories.loading || extraRepository.loading}
        error={repositories.error ?? extraRepository.error}
        onRetry={() => {
          repositories.reload()
          extraRepository.reload()
        }}
      />
    )
  if (!selected)
    return (
      <>
        <Dropdown
          label={t('Repositorio')}
          placeholder={t('Selecciona un repositorio')}
          value=""
          options={choices.map((item) => ({
            value: item.id,
            label: item.remote_full_name ?? item.local_name ?? item.id,
          }))}
          onChange={(value) => {
            const next = new URLSearchParams(params)
            next.set('repository', value)
            next.delete('article')
            setParams(next)
            setOffset(0)
          }}
        />
        <DataMessage
          message={
            repositoryId
              ? t(
                  'El repositorio seleccionado no está disponible en esta página.',
                )
              : t('No hay repositorios autorizados en esta página.')
          }
        />
        {repositories.data?.next_cursor && (
          <IconButton
            type="button"
            label={t('Más repositorios')}
            onClick={() => {
              setRepoAfter(repositories.data!.next_cursor)
              setOffset(0)
            }}
          >
            <ChevronRight size={16} />
          </IconButton>
        )}
        {repoAfter && (
          <IconButton
            type="button"
            label={t('Primeros repositorios')}
            onClick={() => {
              setRepoAfter(null)
              setOffset(0)
            }}
          >
            <ChevronLeft size={16} />
          </IconButton>
        )}
      </>
    )
  const items = (data.data?.items ?? []).filter((item) =>
    item.draft.statement
      .toLocaleLowerCase()
      .includes(search.toLocaleLowerCase()),
  )
  return (
    <>
      {!article && (
        <header className="mb-7">
          <h1 className="font-serif text-3xl">{t('Aportes técnicos')}</h1>
          <p className="mt-3 text-sm leading-relaxed text-base-content/55">
            {' '}
            {t(
              'Lee los aportes sobre el código, sus referencias y su historial de revisión.',
            )}{' '}
          </p>
        </header>
      )}
      <div className="mb-7 flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1">
          <Dropdown
            label={t('Repositorio')}
            value={repositoryId}
            options={choices.map((item) => ({
              value: item.id,
              label:
                item.remote_full_name ??
                item.requested_full_name ??
                item.local_name ??
                item.id,
            }))}
            onChange={(value) => {
              const next = new URLSearchParams(params)
              next.set('repository', value)
              next.delete('article')
              setParams(next)
              setOffset(0)
            }}
          />
        </div>
        {repositories.data?.next_cursor && (
          <IconButton
            type="button"
            label={t('Más repositorios')}
            onClick={() => {
              setRepoAfter(repositories.data!.next_cursor)
              setOffset(0)
            }}
          >
            <ChevronRight size={16} />
          </IconButton>
        )}
        {repoAfter && (
          <IconButton
            type="button"
            label={t('Primeros repositorios')}
            onClick={() => {
              setRepoAfter(null)
              setOffset(0)
            }}
          >
            <ChevronLeft size={16} />
          </IconButton>
        )}
        {!article && (
          <Dropdown
            label={t('Estado del aporte')}
            value={status}
            options={[
              { value: 'all', label: t('Todos los estados') },
              ...Object.entries(knowledgeReviewStates).map(
                ([value, label]) => ({ value, label: t(label) }),
              ),
            ]}
            onChange={(value) => {
              setStatus(value)
              setOffset(0)
            }}
            className="w-full sm:w-48"
          />
        )}
      </div>
      {article ? (
        <KnowledgeReviewArticle
          key={`${base}:${article}`}
          base={base}
          id={article}
          repositoryName={repositoryName}
          live={live}
        />
      ) : (
        <>
          {data.loading || data.error ? (
            <DataMessage
              loading={data.loading}
              error={t(data.error)}
              onRetry={data.reload}
            />
          ) : (
            <>
              <h2 className="font-serif text-xl">
                {' '}
                {t('Aportes técnicos del repositorio')}{' '}
              </h2>
              <ul className="divide-y divide-base-300/60">
                {items.map((item) => (
                  <li key={item.id} className="py-5">
                    <Link
                      className="group flex items-start gap-3"
                      to={`/code/knowledge?${new URLSearchParams({ project: projectId, repository: repositoryId, article: item.id })}`}
                    >
                      <GitPullRequest
                        size={17}
                        className="mt-1 shrink-0 text-base-content/35"
                      />
                      <span className="min-w-0">
                        <span className="line-clamp-2 break-words text-base font-medium group-hover:underline">
                          {item.draft.statement
                            .replace(/^#+\s*/, '')
                            .slice(0, 180)}
                        </span>
                        <span className="mt-1.5 block text-xs text-base-content/45">
                          {t(knowledgeReviewStates[item.state] ?? item.state)} ·{' '}
                          {item.validity === 'needs_review'
                            ? t('Requiere revisión')
                            : item.effective
                              ? t('Vigente')
                              : t('Sin vigencia efectiva')}{' '}
                          {t('· Revisión')} {item.revision}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {items.length === 0 && (
                <DataMessage
                  message={
                    search
                      ? t('No hay aportes que coincidan en esta página.')
                      : t(
                          'Todavía no hay aportes técnicos en este repositorio.',
                        )
                  }
                />
              )}
              <Pagination page={Math.floor(offset/20)+1} hasNext={data.data?.next_offset!=null} onPrevious={()=>setOffset(Math.max(0,offset-20))} onNext={()=>{if(data.data?.next_offset!=null)setOffset(data.data.next_offset)}}/>
            </>
          )}
        </>
      )}
    </>
  )
}
