import { useTranslation } from '../hooks/useTranslation'
import { useState } from 'react'
import type { PullRequestFileViewProps } from '../types/PullRequestFileViewProps'
export default function PullRequestFileView({
  file,
}: PullRequestFileViewProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const lines = file.patch?.split('\n') ?? []
  return (
    <details
      className="rounded-xl border border-base-300"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="cursor-pointer break-all px-4 py-3 font-mono text-xs">
        {file.path}
        <span className="ml-3 font-sans text-base-content/45">
          {file.status}
        </span>
      </summary>
      {open && (
        <div className="overflow-x-auto border-t border-base-300">
          {file.patch ? (
            <pre className="p-4 text-xs leading-6">
              <code>
                {lines.slice(0, 400).map((line, index) => (
                  <span
                    key={index}
                    className={`block ${line.startsWith('+') ? 'text-success' : line.startsWith('-') ? 'text-error' : line.startsWith('@@') ? 'text-info' : 'text-base-content/70'}`}
                  >
                    {line || ' '}
                  </span>
                ))}
              </code>
            </pre>
          ) : (
            <p className="p-4 text-xs text-base-content/50">
              {' '}
              {t(
                'El proveedor no devolvió un diff de texto para este archivo.',
              )}{' '}
            </p>
          )}
          {(file.patch_truncated || lines.length > 400) && (
            <p className="px-4 pb-4 text-xs text-warning">
              {' '}
              {t(
                'Vista parcial. Consulta el diff completo en el proveedor.',
              )}{' '}
            </p>
          )}
        </div>
      )}
    </details>
  )
}
