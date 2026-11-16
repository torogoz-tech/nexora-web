import { useTranslation } from '../hooks/useTranslation'
import TextButton from './TextButton'
import { X, Archive, ArchiveRestore } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { updateProject } from '../services/updateProject'
import type { ArchiveProjectModalProps } from '../types/ArchiveProjectModalProps'

export default function ArchiveProjectModal({
  project,
  onClose,
  onSaved,
}: ArchiveProjectModalProps) {
  const { t } = useTranslation()
  const dialog = useRef<HTMLDialogElement>(null)
  const request = useRef<AbortController | null>(null)
  const idempotencyKey = useRef<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const action = project.archived ? t('Restaurar') : t('Archivar')
  useEffect(() => {
    dialog.current?.showModal()
    return () => request.current?.abort()
  }, [])

  async function confirm() {
    if (request.current) return
    const controller = new AbortController()
    request.current = controller
    setSaving(true)
    setError(null)
    idempotencyKey.current ??= crypto.randomUUID()
    try {
      const saved = await updateProject(
        project.id,
        {
          name: project.name,
          description: project.description,
          archived: !project.archived,
          expected_revision: project.revision,
        },
        idempotencyKey.current,
        controller.signal,
      )
      if (!controller.signal.aborted) onSaved(saved)
    } catch (failure) {
      if (!controller.signal.aborted)
        setError(
          failure instanceof Error &&
            !['TypeError', 'TimeoutError', 'SyntaxError'].includes(failure.name)
            ? failure.message
            : 'No pudimos confirmar el cambio. Revisa la conexión y vuelve a intentarlo.',
        )
    } finally {
      request.current = null
      setSaving(false)
    }
  }
  return (
    <dialog
      ref={dialog}
      className="modal"
      aria-labelledby="archive-project-title"
      onClose={onClose}
      onCancel={(event) => {
        if (request.current) event.preventDefault()
      }}
    >
      <div className="modal-box max-w-sm border border-base-300 bg-base-100">
        <h2 id="archive-project-title" className="text-lg font-semibold">
          {action} {t('proyecto')}{' '}
        </h2>
        <p className="mt-4 break-words text-sm leading-relaxed text-base-content/65">
          {project.archived ? (
            <>
              {' '}
              {t('¿Restaurar')}{' '}
              <strong className="text-base-content">{project.name}</strong>
              {t('? Volverá a estar activo en el listado.')}{' '}
            </>
          ) : (
            <>
              {' '}
              {t('¿Archivar')}{' '}
              <strong className="text-base-content">{project.name}</strong>
              {t(
                '? Seguirá visible en el listado y podrás restaurarlo cuando lo necesites.',
              )}{' '}
            </>
          )}
        </p>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-error/25 bg-error/5 p-3 text-sm text-error"
          >
            {t(error)}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <TextButton
            type="button"
            variant="ghost"
            disabled={saving}
            onClick={() => dialog.current?.close()}
            label={t('Cancelar')}
          >
            <X size={16} aria-hidden="true" />
          </TextButton>
          <TextButton
            type="button"
            variant="primary"
            disabled={saving}
            onClick={() => void confirm()}
            label={
              saving ? t('Guardando…') : t('{0} proyecto', { '0': action })
            }
            aria-busy={saving}
          >
            {project.archived ? (
              <ArchiveRestore size={16} aria-hidden="true" />
            ) : (
              <Archive size={16} aria-hidden="true" />
            )}
          </TextButton>
        </div>
      </div>
      <form
        method="dialog"
        className="modal-backdrop"
        onSubmit={(event) => {
          if (request.current) event.preventDefault()
        }}
      >
        <button disabled={saving} aria-label={t('Cerrar confirmación')}>
          {' '}
          {t('Cerrar')}{' '}
        </button>
      </form>
    </dialog>
  )
}
