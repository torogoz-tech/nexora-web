import { useTranslation } from '../hooks/useTranslation'
import IconButton from './IconButton'
import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import type { IntegrationDialogProps } from '../types/IntegrationDialogProps'
export default function IntegrationDialog({
  title,
  busy = false,
  className = '',
  onClose,
  children,
}: IntegrationDialogProps) {
  const { t } = useTranslation()
  const dialog = useRef<HTMLDialogElement>(null)
  const id = useId()
  useEffect(() => {
    dialog.current?.showModal()
  }, [])
  return (
    <dialog
      ref={dialog}
      className="modal"
      aria-labelledby={id}
      onClose={onClose}
      onCancel={(event) => {
        if (busy) event.preventDefault()
      }}
    >
      <div className={`modal-box w-full max-w-lg border border-base-300 bg-base-100 ${className}`}>
        <header className="mb-5 flex items-center justify-between gap-3">
          <h2 id={id} className="text-lg font-semibold">
            {title}
          </h2>
          <IconButton
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={onClose}
            label={t('Cerrar formulario')}
          >
            <X size={18} />
          </IconButton>
        </header>
        {children}
      </div>
    </dialog>
  )
}
