import Pagination from './Pagination'
import { useTranslation } from '../hooks/useTranslation'
import type { KnowledgeReviewArticleProps } from '../types/KnowledgeReviewArticleProps'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { parseKnowledgeContributionDetail } from '../utils/parseKnowledgeContributionDetail'
import { knowledgeReviewStates } from '../app/knowledgeReviewStates'
import DataMessage from './DataMessage'
import WikiArticle from './WikiArticle'
import IconButton from './IconButton'
export default function KnowledgeReviewArticle({
  base,
  id,
  repositoryName,
  live,
}: KnowledgeReviewArticleProps) {
  const { t, dateLocale } = useTranslation()
  const [offset, setOffset] = useState(0),
    [params] = useSearchParams()
  const data = useApiData(
    `${base}/${encodeURIComponent(id)}?offset=${offset}&limit=20`,
    parseKnowledgeContributionDetail,
  )
  const c = data.data?.contribution
  const back = new URLSearchParams(params)
  back.delete('article')
  const title =
    c?.draft.statement
      .split('\n')
      .find((line) => line.trim())
      ?.replace(/^#+\s*/, '')
      .slice(0, 150) ?? ''
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Link
          className="inline-flex items-center gap-2 text-xs text-base-content/50"
          to={`/code/knowledge?${back}`}
        >
          <ArrowLeft size={14} /> {t('Volver al índice')}{' '}
        </Link>
        {!live && (
          <IconButton
            type="button"
            label={t('Actualizar aporte técnico')}
            onClick={data.reload}
            disabled={data.loading}
          >
            <RefreshCw size={16} />
          </IconButton>
        )}
      </div>
      {data.loading || data.error || c?.id !== id ? (
        <DataMessage
          loading={data.loading}
          error={
            data.error ??
            (c ? t('El aporte no corresponde a esta consulta.') : null)
          }
          onRetry={data.reload}
        />
      ) : (
        c && (
          <WikiArticle
            title={title}
            category={t('Code Reviews · Aporte técnico')}
            sections={[
              {
                id: 'section-analysis',
                title: t('Contenido'),
                text: c.draft.statement,
              },
              ...(c.draft.evidence.length
                ? [
                    {
                      id: 'section-evidence',
                      title: t('Referencias de código'),
                      items: c.draft.evidence.map(
                        (e) =>
                          `${e.path} · Líneas ${e.start_line}–${e.start_line + e.line_count - 1}`,
                      ),
                    },
                  ]
                : []),
              ...(c.reason
                ? [
                    {
                      id: 'section-review-reason',
                      title: t('Motivo de la revisión'),
                      text: c.reason,
                    },
                  ]
                : []),
            ]}
            metadata={[
              { label: t('Repositorio'), value: repositoryName },
              {
                label: t('Estado'),
                value: t(knowledgeReviewStates[c.state] ?? c.state),
              },
              {
                label: t('Vigencia'),
                value: c.effective
                  ? t('Aceptado y vigente')
                  : c.validity === 'needs_review'
                    ? t('Requiere revisión')
                    : t('Sin vigencia efectiva'),
              },
              { label: t('Revisión'), value: String(c.revision) },
              { label: t('Autor de la revisión'), value: c.actor },
              {
                label: t('Fecha'),
                value: new Date(c.created_at).toLocaleString(dateLocale),
              },
              { label: t('Snapshot de origen'), value: c.snapshot },
              {
                label: t('Tipo de aporte'),
                value:
                  {
                    explanation: t('Explicación'),
                    decision: t('Decisión'),
                    relation: t('Relación'),
                  }[c.draft.kind] ?? c.draft.kind,
              },
            ]}
            notices={
              c.effective
                ? []
                : [
                    c.validity === 'needs_review'
                      ? t(
                          'El código cambió respecto a este aporte; necesita revisión.',
                        )
                      : t('Este aporte no es conocimiento aceptado y vigente.'),
                  ]
            }
          >
            <section className="mt-8 border-t border-base-300 pt-5">
              <h2 className="mb-4 font-serif text-xl">
                {t('Historial de revisión')}
              </h2>
              <ol className="space-y-4">
                {data.data?.history.map((item) => (
                  <li
                    key={item.revision}
                    className="border-l-2 border-base-300 pl-4 text-sm"
                  >
                    <p>
                      {' '}
                      {t('Revisión')} {item.revision} ·{' '}
                      {t(knowledgeReviewStates[item.state] ?? item.state)}
                    </p>
                    <p className="mt-1 break-words text-xs text-base-content/45">
                      {item.actor} ·{' '}
                      {new Date(item.created_at).toLocaleString(dateLocale)}
                    </p>
                    {item.reason && (
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm text-base-content/70">
                        {item.reason}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
              <Pagination page={Math.floor(offset/20)+1} hasNext={data.data?.next_offset!=null} onPrevious={()=>setOffset(Math.max(0,offset-20))} onNext={()=>{if(data.data?.next_offset!=null)setOffset(data.data.next_offset)}}/>
            </section>
          </WikiArticle>
        )
      )}
    </>
  )
}
