import { useTranslation } from '../hooks/useTranslation'
import TaskTypeGlyph from './TaskTypeGlyph'
import TextButton from './TextButton'
import { useState } from 'react'
import { Save } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { useWorkCatalog } from '../hooks/useWorkCatalog'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { parseProjectTaskTypeSelection } from '../utils/parseProjectTaskTypeSelection'
import { parseCatalogTaskTypePage } from '../utils/parseCatalogTaskTypePage'
import { writeTaskTypeSettings } from '../services/writeTaskTypeSettings'
import IntegrationDialog from './IntegrationDialog'
import DataMessage from './DataMessage'
import type { ProjectTaskTypesModalProps } from '../types/ProjectTaskTypesModalProps'
export default function ProjectTaskTypesModal({
  project,
  onClose,
  onSaved,
}: ProjectTaskTypesModalProps) {
  const { t } = useTranslation()
  const path = `/api/v1/projects/${encodeURIComponent(project.id)}/task-type-selection`
  const selection = useApiData(path, parseProjectTaskTypeSelection),
    catalog = useWorkCatalog('/api/v1/task-types', parseCatalogTaskTypePage),
    mutation = useIntegrationMutation()
  const [draft, setDraft] = useState<string[] | null>(null)
  const [baseline, setBaseline] = useState<number | null>(null)
  const codes = draft ?? selection.data?.codes ?? []
  return (
    <IntegrationDialog
      title={t('Tipos de tareas del proyecto')}
      busy={mutation.busy}
      onClose={onClose}
    >
      <p className="mb-4 text-sm text-base-content/50">{project.name}</p>
      {selection.loading ||
      catalog.loading ||
      selection.error ||
      catalog.error ? (
        <DataMessage
          loading={selection.loading || catalog.loading}
          error={selection.error ?? catalog.error}
          onRetry={() => {
            selection.reload()
            catalog.reload()
          }}
        />
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!selection.data) return
            const input = {
              codes,
              expected_revision: baseline ?? selection.data.revision,
            }
            void mutation.run(input, async (signal, key) => {
              await writeTaskTypeSettings(path, 'PUT', input, key, signal)
              onSaved()
            })
          }}
        >
          <p className="text-xs leading-relaxed text-base-content/50">
            {' '}
            {t(
              'Selecciona los tipos permitidos para nuevas tareas. Quitar un tipo conserva las tareas existentes.',
            )}{' '}
          </p>
          <fieldset
            disabled={mutation.busy}
            className="max-h-80 space-y-2 overflow-y-auto"
          >
            {catalog.items.map((type) => (
              <label
                key={type.code}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-base-300 px-3 py-3"
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={codes.includes(type.code)}
                  disabled={type.archived && !codes.includes(type.code)}
                  onChange={(e) => {
                    if (baseline === null) setBaseline(selection.data!.revision)
                    setDraft(
                      e.target.checked
                        ? [...codes, type.code]
                        : codes.filter((c) => c !== type.code),
                    )
                  }}
                />
                <TaskTypeGlyph
                  code={type.code}
                  icon={type.icon}
                  color={type.color}
                  size={16}
                />
                <span
                  className={`text-sm ${type.archived ? 'text-base-content/40 line-through' : ''}`}
                >
                  {type.name}
                </span>
                {type.archived && (
                  <span className="ml-auto text-xs text-base-content/40">
                    {' '}
                    {t('Archivado')}{' '}
                  </span>
                )}
              </label>
            ))}
          </fieldset>
          {!catalog.items.length && (
            <DataMessage
              message={t(
                'Crea primero los tipos en Configuración → Tipos de tareas.',
              )}
            />
          )}
          {mutation.error && (
            <p role="alert" className="text-sm text-error">
              {t(mutation.error)}
            </p>
          )}
          <footer className="flex justify-end border-t border-base-300 pt-4">
            <TextButton
              type="submit"
              variant="primary"
              label={t('Guardar tipos permitidos')}
              disabled={mutation.busy || draft === null}
            >
              <Save size={16} />
            </TextButton>
          </footer>
        </form>
      )}
    </IntegrationDialog>
  )
}
