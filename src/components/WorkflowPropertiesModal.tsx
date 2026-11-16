import { useTranslation } from '../hooks/useTranslation'
import TextButton from './TextButton'
import { useEffect, useRef } from 'react'
import { Check, ArrowRight, Layers } from 'lucide-react'
import IntegrationDialog from './IntegrationDialog'
import type { WorkflowPropertiesModalProps } from '../types/WorkflowPropertiesModalProps'
export default function WorkflowPropertiesModal({
  kind,
  name,
  fullPage = false,
  onClose,
  children,
}: WorkflowPropertiesModalProps) {
  const { t } = useTranslation()
  const trigger = useRef(document.activeElement)
  useEffect(
    () => () => {
      if (trigger.current instanceof HTMLElement && trigger.current.isConnected)
        trigger.current.focus({ preventScroll: true })
    },
    [],
  )
  const Icon = kind === 'state' ? Layers : ArrowRight
  const content = <>
    <div className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-200/40 p-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-base-200">
        <Icon size={18} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-base-content/45">
          {kind === 'state' ? t('Estado') : t('Transición')}
        </p>
        <p className="break-words text-sm font-medium">
          {name || t('Sin nombre')}
        </p>
      </div>
    </div>
    {children}
    <footer className="mt-2 flex items-center justify-between gap-4 border-t border-base-300 pt-4">
      <p className="text-xs leading-relaxed text-base-content/45">
        {' '}
        {t('Los cambios quedan en el borrador del workflow.')}{' '}
      </p>
      <TextButton
        type="button"
        variant="primary"
        onClick={onClose}
        label={t('Listo')}
      >
        <Check size={16} aria-hidden="true" />
      </TextButton>
    </footer>
  </>
  if (fullPage) return <section className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 sm:p-6">{content}</section>
  return (
    <IntegrationDialog
      title={
        kind === 'state'
          ? t('Propiedades del estado')
          : t('Propiedades de la transición')
      }
      className="h-[calc(100dvh-2rem)] max-h-none w-[min(100vw-2rem,72rem)] max-w-none overflow-y-auto"
      onClose={onClose}
    >
      {content}
    </IntegrationDialog>
  )
}
