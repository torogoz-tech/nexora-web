import { useTranslation } from '../hooks/useTranslation'
import { taskTypeIcons } from '../app/taskTypeIcons'
import type { TaskTypeIconPickerProps } from '../types/TaskTypeIconPickerProps'
export default function TaskTypeIconPicker({
  value,
  onChange,
}: TaskTypeIconPickerProps) {
  const { t } = useTranslation()
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm">{t('Icono del tipo')}</legend>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {taskTypeIcons.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-label={t('Icono: {0}', { '0': t(option.label) })}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={`flex min-w-0 flex-col items-center justify-center gap-2 rounded-xl border px-1 py-3 text-xs outline-offset-2 transition-colors ${value === option.value ? 'border-base-content bg-base-200 text-base-content' : 'border-base-300 text-base-content/55 hover:bg-base-200 hover:text-base-content'}`}
          >
            <option.icon size={20} aria-hidden="true" />
            <span className="w-full break-words text-center text-[10px] leading-tight">
              {t(option.label)}
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  )
}
