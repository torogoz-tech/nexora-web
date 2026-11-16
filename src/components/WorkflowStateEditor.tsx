import WorkflowStatePolicyEditor from './WorkflowStatePolicyEditor'
import { useTranslation } from '../hooks/useTranslation'
import IconButton from './IconButton'
import WorkflowStateColorPicker from './WorkflowStateColorPicker'
import { Trash2 } from 'lucide-react'
import type { WorkflowStateEditorProps } from '../types/WorkflowStateEditorProps'
export default function WorkflowStateEditor({
  state,
  disabled,
  canDelete,
  onChange,
  onDelete,
}: WorkflowStateEditorProps) {
  const { t } = useTranslation()
  return (
    <section className="min-w-0 p-4" aria-label={t('Propiedades del estado')}>
      <fieldset disabled={disabled} className="flex min-w-0 flex-col gap-4">
        <div className="flex min-w-0 items-end gap-2">
          {' '}
          <label className="flex min-w-0 flex-1 flex-col gap-2 text-xs">
            {' '}
            {t('Nombre del estado')}{' '}
            <input
              className="input input-sm w-full"
              value={state.name}
              maxLength={160}
              onChange={(event) => onChange({ name: event.target.value })}
            />
          </label>{' '}
          <IconButton
            type="button"
            variant="ghost"
            disabled={disabled || !canDelete}
            onClick={onDelete}
            label={t('Eliminar estado')}
          >
            <Trash2 size={15} />
          </IconButton>
        </div>
        <label className="flex items-center justify-between gap-4 text-sm">
          <span>
            <span className="block">{t('Estado inicial')}</span>
            <span className="mt-1 block text-[11px] leading-4 text-base-content/45">
              {' '}
              {t('Aquí comienza el trabajo nuevo.')}{' '}
            </span>
          </span>
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={!!state.initial}
            disabled={disabled || state.initial}
            onChange={() => onChange({ initial: true })}
          />
        </label>
        <label className="flex items-center justify-between gap-4 text-sm">
          <span>
            <span className="block">{t('Estado final')}</span>
            <span className="mt-1 block text-[11px] leading-4 text-base-content/45">
              {' '}
              {t('Se considera una etapa completada.')}{' '}
            </span>
          </span>
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={!!state.terminal}
            onChange={(event) => onChange({ terminal: event.target.checked })}
          />
        </label>
        <WorkflowStatePolicyEditor state={state} disabled={disabled} onChange={onChange}/>
        <WorkflowStateColorPicker
          value={state.color}
          onChange={(color) => onChange({ color })}
        />
      </fieldset>
    </section>
  )
}
