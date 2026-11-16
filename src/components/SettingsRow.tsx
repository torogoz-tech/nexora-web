import type { SettingsRowProps } from '../types/SettingsRowProps'
export default function SettingsRow({
  label,
  description,
  children,
}: SettingsRowProps) {
  return (
    <div className="grid items-start gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,20rem)] sm:gap-8">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-base-content/50">
            {description}
          </p>
        )}
      </div>
      <div className="min-w-0 sm:justify-self-stretch">{children}</div>
    </div>
  )
}
