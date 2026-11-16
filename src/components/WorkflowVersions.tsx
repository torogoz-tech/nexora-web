import { useTranslation } from '../hooks/useTranslation'
import Pagination from './Pagination'
import { workflowGuardOptions } from '../app/workflowGuardOptions'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { parseWorkflowVersionPage } from '../utils/parseWorkflowVersionPage'
import { parseWorkflowVersion } from '../utils/parseWorkflowVersion'
import WorkflowCanvas from './WorkflowCanvas'
import DataMessage from './DataMessage'
import type { WorkflowVersionsProps } from '../types/WorkflowVersionsProps'
export default function WorkflowVersions({ basePath }: WorkflowVersionsProps) {
  const { t, dateLocale } = useTranslation()
  const [cursors,setCursors]=useState<(number|null)[]>([null])
  const before=cursors.at(-1)!
  const [selected, setSelected] = useState<string | null>(null)
  const versions = useApiData(
    `${basePath}/versions?limit=20${before ? `&before=${before}` : ''}`,
    parseWorkflowVersionPage,
  )
  const detail = useApiData(
    selected ? `${basePath}/versions/${encodeURIComponent(selected)}` : null,
    parseWorkflowVersion,
  )
  return (
    <div className="min-w-0">
      {versions.loading || versions.error ? (
        <DataMessage
          loading={versions.loading}
          error={t(versions.error)}
          onRetry={versions.reload}
        />
      ) : (
        <>
          <ul className="divide-y divide-base-300">
            {versions.data?.items.map((version) => (
              <li key={version.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 rounded-lg py-3 text-left"
                  aria-label={t('Ver versión {0}', { '0': version.number })}
                  onClick={() => setSelected(version.id)}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">
                      {' '}
                      {t('Versión')} {version.number} · {version.name}
                    </span>
                    <span className="mt-1 block break-words text-xs text-base-content/50">
                      {version.reason}
                    </span>
                    <span className="mt-1 block text-xs text-base-content/35">
                      {new Date(version.published_at).toLocaleString(
                        dateLocale,
                      )}
                    </span>
                  </span>
                  <ChevronRight
                    size={15}
                    className="shrink-0 text-base-content/45"
                  />
                </button>
              </li>
            ))}
          </ul>
          {versions.data?.items.length === 0 && (
            <p className="py-4 text-sm text-base-content/50">
              {' '}
              {t('Este workflow todavía no tiene versiones publicadas.')}{' '}
            </p>
          )}
          <Pagination page={cursors.length} count={versions.data?.items.length} hasNext={versions.data?.next_before!=null} onPrevious={()=>setCursors(values=>values.slice(0,-1))} onNext={()=>{if(versions.data?.next_before!=null)setCursors(values=>[...values,versions.data!.next_before!])}}/>
        </>
      )}
      {detail.loading || detail.error ? (
        <DataMessage
          loading={detail.loading}
          error={t(detail.error)}
          onRetry={detail.reload}
        />
      ) : (
        detail.data && (
          <section
            className="mt-5 min-w-0 border-t border-base-300 pt-5"
            aria-label={t('Vista de versión {0}', { '0': detail.data.number })}
          >
            <p className="mb-2 text-sm font-medium">
              {' '}
              {t('Versión')} {detail.data.number} {t('· Solo lectura')}{' '}
            </p>
            <p className="mb-4 whitespace-pre-wrap break-words text-sm text-base-content/55">
              {detail.data.purpose}
            </p>
            <WorkflowCanvas
              key={detail.data.id}
              graph={detail.data.graph}
              selectedId=""
              onSelect={() => {}}
              readOnly
            />
            <ul className="mt-3 space-y-2 text-xs text-base-content/50">
              {detail.data.graph.transitions.map((edge) => (
                <li key={edge.id}>
                  {edge.name}:{' '}
                  {
                    detail.data!.graph.states.find(
                      (state) => state.id === edge.from,
                    )?.name
                  }{' '}
                  →{' '}
                  {
                    detail.data!.graph.states.find(
                      (state) => state.id === edge.to,
                    )?.name
                  }{' '}
                  ·{' '}
                  {edge.guards.length
                    ? edge.guards
                        .map((guard) =>
                          guard.kind === 'required_field'
                            ? t('Campo: {0}', { '0': guard.field })
                            : workflowGuardOptions.find(
                                (option) => option.value === guard.kind,
                              )?.label,
                        )
                        .join(' · ')
                    : t('Sin condiciones')}
                </li>
              ))}
            </ul>
          </section>
        )
      )}
    </div>
  )
}
