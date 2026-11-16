import Pagination from './Pagination'
import { useTranslation } from '../hooks/useTranslation'
import type { KnowledgeVersionHistoryProps } from '../types/KnowledgeVersionHistoryProps'
import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { useApiData } from '../hooks/useApiData'
import { parseKnowledgeVersionPage } from '../utils/parseKnowledgeVersionPage'
import DataMessage from './DataMessage'
export default function KnowledgeVersionHistory({
  base,
  selected,
  published,
}: KnowledgeVersionHistoryProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false),
    [cursors,setCursors]=useState<(number|null)[]>([null])
  const before=cursors.at(-1)!
  const [params] = useSearchParams(),
    location = useLocation()
  const data = useApiData(
    open
      ? `${base}/versions?${new URLSearchParams({ limit: '20', ...(before ? { before: String(before) } : {}) })}`
      : null,
    parseKnowledgeVersionPage,
  )
  return (
    <details
      id="article-versions"
      className="mt-8 scroll-mt-6 border-t border-base-300 pt-5"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="cursor-pointer text-sm font-medium">
        {' '}
        {t('Versiones del artículo')}{' '}
      </summary>
      {open &&
        (data.loading || data.error ? (
          <DataMessage
            loading={data.loading}
            error={t(data.error)}
            onRetry={data.reload}
          />
        ) : (
          <>
            <ul className="mt-3 divide-y divide-base-300/60">
              {data.data?.items.map((version) => {
                const next = new URLSearchParams(params)
                next.set('version', version.id)
                return (
                  <li
                    key={version.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                  >
                    <Link
                      aria-current={
                        version.id === selected ? 'page' : undefined
                      }
                      className="hover:underline"
                      to={`${location.pathname}?${next}`}
                    >
                      {' '}
                      {t('Versión')} {version.number} · {version.title}
                    </Link>
                    <span className="text-xs text-base-content/45">
                      {version.id === published
                        ? t('Publicada')
                        : version.id === selected
                          ? t('En lectura')
                          : ''}
                    </span>
                  </li>
                )
              })}
            </ul>
            <Pagination page={cursors.length} count={data.data?.items.length} hasNext={data.data?.next_before!=null} onPrevious={()=>setCursors(values=>values.slice(0,-1))} onNext={()=>{if(data.data?.next_before!=null)setCursors(values=>[...values,data.data!.next_before!])}}/>
          </>
        ))}
    </details>
  )
}
