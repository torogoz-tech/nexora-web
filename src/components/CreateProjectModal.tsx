import { useTranslation } from '../hooks/useTranslation'
import TextButton from './TextButton'
import IconButton from './IconButton'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { createProject } from '../services/createProject'
import { prepareProjectInput } from '../utils/prepareProjectInput'
import type { CreateProjectModalProps } from '../types/CreateProjectModalProps'

export default function CreateProjectModal({
  open,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const { t } = useTranslation()
  const dialog = useRef<HTMLDialogElement>(null)
  const request = useRef<AbortController | null>(null)
  const receipt = useRef<{ signature: string; key: string } | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      dialog.current?.showModal()
    } else dialog.current?.close()
  }, [open])
  useEffect(() => () => request.current?.abort(), [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (request.current) return
    setError(null)
    try {
      const input = prepareProjectInput(name, description)
      const signature = JSON.stringify(input)
      if (receipt.current?.signature !== signature)
        receipt.current = { signature, key: crypto.randomUUID() }
      const controller = new AbortController()
      request.current = controller
      setSaving(true)
      const project = await createProject(
        input,
        receipt.current.key,
        controller.signal,
      )
      if (controller.signal.aborted) return
      receipt.current = null
      onCreated(project)
      dialog.current?.close()
    } catch (failure) {
      if (!request.current?.signal.aborted)
        setError(
          failure instanceof Error &&
            !['TypeError', 'TimeoutError', 'SyntaxError'].includes(failure.name)
            ? failure.message
            : 'No pudimos confirmar la creación. Revisa la conexión y vuelve a intentarlo.',
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
      aria-labelledby="create-project-title"
      onClose={() => {
        setName('')
        setDescription('')
        setError(null)
        onClose()
      }}
      onCancel={(event) => {
        if (request.current) event.preventDefault()
      }}
    >
      <div className="modal-box w-full max-w-md border border-base-300 bg-base-100">
        <header className="mb-6 flex items-center justify-between gap-3">
          <h2 id="create-project-title" className="text-lg font-semibold">
            {' '}
            {t('Crear proyecto')}{' '}
          </h2>
          <IconButton
            type="button"
            variant="ghost"
            disabled={saving}
            onClick={() => dialog.current?.close()}
            label={t('Cerrar formulario')}
          >
            <X size={18} aria-hidden="true" />
          </IconButton>
        </header>
        <form
          onSubmit={submit}
          className="flex flex-col gap-5"
          aria-busy={saving}
        >
          <label className="flex flex-col gap-2 text-sm font-medium">
            {' '}
            {t('Nombre')}{' '}
            <input
              className="input w-full font-normal"
              name="project-name"
              required
              maxLength={160}
              autoComplete="off"
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={saving}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span>
              {' '}
              {t('Descripción')}{' '}
              <span className="font-normal text-base-content/45">
                {' '}
                {t('(opcional)')}{' '}
              </span>
            </span>
            <textarea
              className="textarea min-h-28 w-full resize-y font-normal"
              name="project-description"
              maxLength={4000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={saving}
            />
          </label>
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-error/25 bg-error/5 p-3 text-sm text-error"
            >
              {t(error)}
            </p>
          )}
          <div className="mt-1 flex justify-end gap-2">
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
              type="submit"
              variant="primary"
              disabled={saving || !name.trim()}
              label={saving ? t('Creando…') : t('Crear proyecto')}
              aria-busy={saving}
            >
              <Plus size={16} aria-hidden="true" />
            </TextButton>
          </div>
        </form>
      </div>
      <form
        method="dialog"
        className="modal-backdrop"
        onSubmit={(event) => {
          if (request.current) event.preventDefault()
        }}
      >
        <button disabled={saving} aria-label={t('Cerrar ventana de creación')}>
          {' '}
          {t('Cerrar')}{' '}
        </button>
      </form>
    </dialog>
  )
}
