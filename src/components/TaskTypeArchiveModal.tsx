import { useTranslation } from '../hooks/useTranslation'
import TextButton from './TextButton'
import { Archive, ArchiveRestore } from 'lucide-react'
import IntegrationDialog from './IntegrationDialog'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { writeTaskTypeSettings } from '../services/writeTaskTypeSettings'
import type { TaskTypeEditorModalProps } from '../types/TaskTypeEditorModalProps'
export default function TaskTypeArchiveModal({
  type,
  onClose,
  onSaved,
}: TaskTypeEditorModalProps) {
  const { t } = useTranslation()
  const mutation = useIntegrationMutation()
  if (!type) return null
  return (
    <IntegrationDialog
      title={`${type.archived ? t('Restaurar') : t('Archivar')} tipo de tarea`}
      busy={mutation.busy}
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          const input = {
            expected_revision: type.revision,
            archived: !type.archived,
          }
          void mutation.run(input, async (signal, key) => {
            await writeTaskTypeSettings(
              `/api/v1/task-types/${encodeURIComponent(type.code)}/change`,
              'POST',
              input,
              key,
              signal,
            )
            onSaved()
          })
        }}
      >
        <p className="text-sm text-base-content/60">
          {type.name}.{' '}
          {type.archived
            ? t(
                'Volverá a estar disponible para los proyectos que lo tengan seleccionado.',
              )
            : t(
                'Dejará de estar disponible para crear tareas. Las tareas existentes se conservan.',
              )}
        </p>
        {mutation.error && (
          <p role="alert" className="text-sm text-error">
            {t(mutation.error)}
          </p>
        )}
        <footer className="flex justify-end">
          <TextButton
            type="submit"
            variant="primary"
            label={
              type.archived
                ? t('Restaurar tipo de tarea')
                : t('Archivar tipo de tarea')
            }
            disabled={mutation.busy}
          >
            {type.archived ? (
              <ArchiveRestore size={16} />
            ) : (
              <Archive size={16} />
            )}
          </TextButton>
        </footer>
      </form>
    </IntegrationDialog>
  )
}
