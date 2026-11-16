import Tooltip from './Tooltip'
import { useTranslation } from '../hooks/useTranslation'
import IconButton from './IconButton'
import { Check, Palette } from 'lucide-react'
import { workflowStateColors } from '../app/workflowStateColors'
import type { WorkflowStateColorPickerProps } from '../types/WorkflowStateColorPickerProps'
export default function WorkflowStateColorPicker({
  label = 'Color del estado',
  value,
  onChange,
}: WorkflowStateColorPickerProps) {
  const { t } = useTranslation()
  return (
    <fieldset className="min-w-0 rounded-xl border border-base-300 bg-base-200/30 p-3">
      <legend className="px-1 text-xs font-medium">
        {t(label)}
      </legend>
      <div className="flex flex-wrap items-center gap-2">
        <IconButton
          type="button"
          variant={!value ? 'primary' : 'ghost'}
          aria-pressed={!value}
          onClick={() => onChange(undefined)}
          label={t('Del tema')}
        >
          <Palette size={15} aria-hidden="true" />
        </IconButton>
        {workflowStateColors.map((color) => (
          <Tooltip key={color.value} label={t(color.name)}>
            <button
              type="button"
              aria-label={t('Usar color {0}', {
                '0': t(color.name).toLocaleLowerCase(),
              })}
              aria-pressed={value?.toUpperCase() === color.value}
              onClick={() => onChange(color.value)}
              className="flex size-8 items-center justify-center rounded-lg border border-base-content/15 outline-offset-2"
              style={{ backgroundColor: color.value }}
            >
              {value?.toUpperCase() === color.value && (
                <Check
                  size={16}
                  strokeWidth={3}
                  aria-hidden="true"
                  className="rounded bg-black/35 p-0.5 text-white"
                />
              )}
            </button>
          </Tooltip>
        ))}
      </div>
      <label className="relative mt-3 flex cursor-pointer items-center gap-3 rounded-lg border border-base-300 bg-base-100 px-3 py-2 focus-within:border-base-content">
        <span
          className="size-8 shrink-0 rounded-lg border border-base-content/15"
          style={{ backgroundColor: value ?? 'var(--color-base-content)' }}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-xs">{t('Color personalizado')}</span>
          <span className="mt-1 block font-mono text-[11px] text-base-content/50">
            {value ?? t('Automático según el tema')}
          </span>
        </span>
        <input
          type="color"
          aria-label={t(label)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          value={value ?? '#6B7280'}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
        />
      </label>
    </fieldset>
  )
}
