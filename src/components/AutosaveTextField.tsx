import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Save } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { DebouncedFieldSave } from '../utils/DebouncedFieldSave'
import IconButton from './IconButton'
import type { AutosaveTextFieldProps } from '../types/AutosaveTextFieldProps'
export default function AutosaveTextField({
  label,
  value,
  onCommit,
  disabled,
  saveBlocked = false,
  autoSave = false,
  type = 'text',
  multiline,
  maxLength,
  placeholder,
}: AutosaveTextFieldProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<string | null>(null),
    [saving, setSaving] = useState(false),
    [error, setError] = useState<string | null>(null)
  const field = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null),
    controller = useRef<DebouncedFieldSave | null>(null)
  const latest = useRef({ value, onCommit, paused: !!disabled || saveBlocked })
  useLayoutEffect(() => {
    latest.current = { value, onCommit, paused: !!disabled || saveBlocked }
    controller.current?.setPaused(latest.current.paused)
  }, [value, onCommit, disabled, saveBlocked])
  useEffect(() => {
    const worker = new DebouncedFieldSave(
      {
        onCommit: (text) => latest.current.onCommit(text),
        shouldSave: (text) => text !== latest.current.value,
        isValid: () => field.current?.validity.valid ?? true,
        onInvalid: () => setError('Revisa el formato de este campo.'),
        onSaved: (text) =>
          setDraft((current) => (current === text ? null : current)),
        onSaving: setSaving,
        onError: () =>
          setError('No pudimos guardar los cambios. Vuelve a intentarlo.'),
      },
      autoSave ? 800 : null,
    )
    worker.setPaused(latest.current.paused)
    controller.current = worker
    return () => {
      worker.dispose()
      controller.current = null
    }
  }, [autoSave])
  const props = {
    ref: (element: HTMLInputElement | HTMLTextAreaElement | null) => {
      field.current = element
    },
    'aria-label': label,
    'aria-busy': saving,
    value: draft ?? value,
    disabled: !!disabled || (!autoSave && saving),
    maxLength,
    placeholder,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      const text = event.target.value
      setDraft(text)
      setError(null)
      controller.current?.edit(text)
    },
    onCompositionStart: () => controller.current?.setComposing(true),
    onCompositionEnd: (
      event: React.CompositionEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      const text = event.currentTarget.value
      setDraft(text)
      controller.current?.edit(text)
      controller.current?.setComposing(false)
    },
    onBlur: () => {
      if (autoSave) controller.current?.flush()
    },
    onKeyDown: (
      event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      if (event.nativeEvent.isComposing) return
      if (
        event.key === 'Enter' &&
        (!multiline || event.ctrlKey || event.metaKey)
      ) {
        event.preventDefault()
        controller.current?.flush()
      }
    },
  }
  return (
    <div className="min-w-0 flex-1">
      <div className="relative flex min-w-0 items-start gap-2">
        {multiline ? (
          <textarea
            {...props}
            className={`textarea min-h-20 w-full min-w-0 flex-1 resize-y ${autoSave ? 'pr-9' : ''}`}
          />
        ) : (
          <input
            {...props}
            type={type}
            autoComplete={type === 'password' ? 'new-password' : 'off'}
            className={`input input-sm w-full min-w-0 flex-1 ${autoSave ? 'pr-9' : ''}`}
          />
        )}
        {autoSave ? (
          saving && (
            <span
              aria-hidden="true"
              className="loading loading-spinner loading-xs pointer-events-none absolute top-2.5 right-3 motion-reduce:animate-none"
            />
          )
        ) : (
          <IconButton
            type="button"
            label={t('Guardar {0}', { '0': label })}
            disabled={disabled || saving || draft === null || draft === value}
            aria-busy={saving}
            onClick={() => controller.current?.flush()}
          >
            <Save size={16} aria-hidden="true" />
          </IconButton>
        )}
      </div>
      {error && (
        <p className="mt-2 text-xs text-error" role="alert">
          {t(error)}
        </p>
      )}
    </div>
  )
}
