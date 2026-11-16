import Pagination from './Pagination'
import { useTranslation } from '../hooks/useTranslation'
import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { BookOpen } from 'lucide-react'
import {useWorkCatalog} from '../hooks/useWorkCatalog'
import { parseKnowledgeDocumentPage } from '../utils/parseKnowledgeDocumentPage'
import DataMessage from './DataMessage'
import type { KnowledgeCatalogProps } from '../types/KnowledgeCatalogProps'
export default function KnowledgeDocumentCatalog({
  projectId,
  kind,
  search,
  title,
  showHeading = false,
  descending = false,
}: KnowledgeCatalogProps) {
  const { t, dateLocale } = useTranslation()
  const [page,setPage]=useState(1)
  const location = useLocation()
  const query = new URLSearchParams({
    kind,

  })
  const data = useWorkCatalog(
    `/api/v1/projects/${encodeURIComponent(projectId)}/documents?${query}`,
    parseKnowledgeDocumentPage,
  )
  if (data.loading || data.error)
    return (
      <DataMessage
        loading={data.loading}
        error={t(data.error)}
        onRetry={data.reload}
      />
    )
  const items = data.items
    .filter((item) =>
      `${item.latest_title} ${item.code}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()),
    )
    .sort((a, b) => a.latest_title.localeCompare(b.latest_title,dateLocale,{numeric:true,sensitivity:'base'})*(descending?-1:1))
  const current=Math.min(page,Math.max(1,Math.ceil(items.length/20)))
  return (
    <section className="min-w-0" aria-label={title}>
      {showHeading && <h2 className="mb-1 font-serif text-xl">{title}</h2>}
      <ul className="divide-y divide-base-300/60">
        {items.slice((current-1)*20,current*20).map((item) => (
          <li key={item.id} className="py-5">
            <Link
              className="group flex items-start gap-3"
              to={`${location.pathname}?${new URLSearchParams({ project: projectId, article: item.id })}`}
            >
              <BookOpen
                size={17}
                className="mt-1 shrink-0 text-base-content/35"
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block break-words text-base font-medium group-hover:underline group-hover:underline-offset-4">
                  {item.latest_title}
                </span>
                <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-base-content/45">
                  <span>{item.code}</span>
                  <span>
                    {item.published_version_id
                      ? t('Tiene una versión publicada')
                      : t('Sin publicación')}
                  </span>
                  {item.needs_review && <span>{t('Requiere revisión')}</span>}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {items.length === 0 && (
        <p role="status" className="py-10 text-sm text-base-content/50">
          {search
            ? t('No hay artículos que coincidan en esta página.')
            : t('Todavía no hay artículos en esta sección.')}
        </p>
      )}
      {items.length>20&&<Pagination page={current} count={Math.min(20,Math.max(0,items.length-(current-1)*20))} total={items.length} hasNext={current*20<items.length} onPrevious={()=>setPage(current-1)} onNext={()=>setPage(current+1)}/>}
    </section>
  )
}
