import { useTranslation } from '../hooks/useTranslation'
import TaskTypeIconPicker from './TaskTypeIconPicker'
import type { TaskTypeIcon } from '../types/TaskTypeIcon'
import TextButton from './TextButton'
import { useState } from 'react'
import { Save } from 'lucide-react'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { writeTaskTypeSettings } from '../services/writeTaskTypeSettings'
import type { TaskTypeFormProps } from '../types/TaskTypeFormProps'
export default function TaskTypeForm({
  type,
  onSaved,
}: TaskTypeFormProps) {
  const { t } = useTranslation()
  const [purpose,setPurpose] = useState(type?.purpose ?? 'general')
  const [revision] = useState(type?.revision)
  const [code, setCode] = useState(type?.code ?? ''),
    [icon, setIcon] = useState<TaskTypeIcon>(type?.icon ?? 'list-todo'),
    [name, setName] = useState(type?.name ?? ''),
    [description, setDescription] = useState(type?.description ?? ''),
    [color, setColor] = useState(type?.color ?? ''),
    [reason, setReason] = useState('')
  const mutation = useIntegrationMutation()
  return (
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (mutation.busy) return
          const input = type
            ? {
                purpose,
                icon,
                name: name.trim(),
                description: description.trim(),
                color: color || null,
                expected_revision: revision,
                reason: reason.trim(),
              }
            : {
                code: code.trim(),
                purpose,
                icon,
                name: name.trim(),
                description: description.trim() || null,
                color: color || null,
              }
          void mutation.run(input, async (signal, key) => {
            await writeTaskTypeSettings(
              type
                ? `/api/v1/task-types/${encodeURIComponent(type.code)}/change`
                : '/api/v1/task-types',
              'POST',
              input,
              key,
              signal,
            )
            onSaved()
          })
        }}
      >
        <fieldset disabled={mutation.busy} className="space-y-4">
          <label className="flex flex-col gap-2 text-sm">
            {' '}
            {t('Código')}{' '}
            <input
              className="input w-full"
              aria-label={t('Código del tipo')}
              required
              pattern="[a-z0-9_-]{1,64}"
              maxLength={64}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={!!type}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            {' '}
            {t('Nombre')}{' '}
            <input
              className="input w-full"
              aria-label={t('Nombre del tipo')}
              required
              maxLength={160}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">{t('Propósito')}<select className="select w-full" aria-label={t('Propósito')} value={purpose} onChange={event=>setPurpose(event.target.value as typeof purpose)}><option value="general">{t('General')}</option><option value="product_design">{t('Diseño de producto')}</option><option value="implementation">{t('Implementación')}</option></select></label>
          <TaskTypeIconPicker value={icon} onChange={setIcon} />
          <label className="flex flex-col gap-2 text-sm">
            {' '}
            {t('Descripción')}{' '}
            <span className="text-xs text-base-content/40">
              {t('Opcional')}
            </span>
            <textarea
              className="textarea w-full"
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-base-300 p-3 text-sm">
            <input
              className="size-10 cursor-pointer rounded-lg"
              type="color"
              aria-label={t('Color del tipo')}
              value={color || '#6b7280'}
              onChange={(e) => setColor(e.target.value)}
            />
            <span className="flex-1">{t('Color del tipo')}</span>
            <input
              className="checkbox checkbox-sm"
              aria-label={t('Usar color del tema')}
              type="checkbox"
              checked={!color}
              onChange={(e) => setColor(e.target.checked ? '' : '#6b7280')}
            />
            <span className="text-xs">{t('Del tema')}</span>
          </label>
          {type && (
            <label className="flex flex-col gap-2 text-sm">
              {' '}
              {t('Motivo del cambio')}{' '}
              <textarea
                className="textarea w-full"
                required
                maxLength={4000}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
          )}
        </fieldset>
        {mutation.error && (
          <p role="alert" className="text-sm text-error">
            {t(mutation.error)}
          </p>
        )}
        <footer className="flex justify-end border-t border-base-300 pt-4">
          <TextButton
            type="submit"
            variant="primary"
            label={t('Guardar tipo de tarea')}
            disabled={
              mutation.busy ||
              !name.trim() ||
              !code.trim() ||
              (!!type && !reason.trim())
            }
          >
            <Save size={16} />
          </TextButton>
        </footer>
      </form>
  )
}
