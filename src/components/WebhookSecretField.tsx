import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Check, Copy, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { generateWebhookSecret } from '../utils/generateWebhookSecret'
import type { WebhookSecretFieldProps } from '../types/WebhookSecretFieldProps'
import IconButton from './IconButton'
export default function WebhookSecretField({ value, disabled, onChange }: WebhookSecretFieldProps) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const generation = useRef(0)
  useLayoutEffect(() => { generation.current += 1 }, [value])
  function change(next: string) {
    generation.current += 1
    setCopied(false)
    setError(null)
    onChange(next)
  }
  useEffect(() => () => { generation.current += 1 }, [])
  async function copy() {
    const current = generation.current
    try {
      await navigator.clipboard.writeText(value)
      if (current === generation.current) { setCopied(true); setError(null) }
    } catch {
      if (current === generation.current) setError('No pudimos copiar el secreto. Puedes mostrarlo y copiarlo manualmente.')
    }
  }
  return <div className="flex min-w-0 flex-col gap-2 text-sm">
    <label htmlFor="github-webhook-secret">{t('Secreto del webhook')}</label>
    <div className="flex min-w-0 flex-wrap items-center gap-1">
      <input id="github-webhook-secret" className="input min-w-0 flex-1 font-mono" name="webhook_secret" type={visible ? 'text' : 'password'} autoComplete="new-password" spellCheck={false} required minLength={32} maxLength={512} value={value} disabled={disabled} onChange={event => change(event.target.value)} />
      <IconButton type="button" disabled={disabled || !value} label={t(visible ? 'Ocultar secreto' : 'Mostrar secreto')} onClick={() => setVisible(current => !current)}>{visible ? <EyeOff size={16}/> : <Eye size={16}/>}</IconButton>
      <IconButton type="button" disabled={disabled || !value} label={t(copied ? 'Secreto copiado' : 'Copiar secreto')} onClick={() => void copy()}>{copied ? <Check size={16}/> : <Copy size={16}/>}</IconButton>
      <IconButton type="button" disabled={disabled} label={t(value ? 'Generar otro secreto' : 'Generar secreto')} onClick={() => { try { change(generateWebhookSecret()) } catch { setError('No pudimos generar el secreto. Abre Nexora mediante HTTPS y vuelve a intentarlo.') } }}><RefreshCw size={16}/></IconButton>
    </div>
    <p className="text-xs leading-relaxed text-base-content/55">{t('Nexora genera un secreto seguro y lo sincroniza con GitHub al guardar. Puedes comprobar la recepción de cambios al final de esta página.')}</p>
    <p className="text-xs leading-relaxed text-base-content/45">{t('El secreto permanece temporalmente en este formulario; al guardar se cifra en el servidor y no podrá consultarse de nuevo.')}</p>
    {error && <p role="alert" className="text-xs text-error">{t(error)}</p>}
  </div>
}
