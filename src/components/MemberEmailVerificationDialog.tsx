import { MailCheck } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import type { MemberEmailVerificationDialogProps } from '../types/MemberEmailVerificationDialogProps'
import IntegrationDialog from './IntegrationDialog'
import OtpCodeInput from './OtpCodeInput'
import TextButton from './TextButton'

export default function MemberEmailVerificationDialog({ email, code, busy, error, onCodeChange, onVerify, onChangeAddress, onClose }: MemberEmailVerificationDialogProps) {
  const { t } = useTranslation()
  return <IntegrationDialog title={t('Verifica tu correo')} className="max-w-md" busy={busy} onClose={onClose}>
    <form className="space-y-6" onSubmit={event => { event.preventDefault(); onVerify() }}>
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-base-200"><MailCheck size={24}/></span>
        <div><p className="text-sm text-base-content/60">{t('Introduce el código que enviamos a')}</p><p className="mt-1 break-all text-sm font-medium">{email}</p></div>
      </div>
      <OtpCodeInput value={code} onChange={onCodeChange} disabled={busy} invalid={!!error}/>
      <p className="text-center text-xs leading-relaxed text-base-content/50">{t('El código vence en 15 minutos. Tu correo actual se conserva hasta verificarlo.')}</p>
      {error && <p role="alert" className="text-sm text-error">{t(error)}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3"><TextButton type="button" label={t('Cambiar dirección o reenviar')} disabled={busy} onClick={onChangeAddress}/><TextButton type="submit" variant="primary" label={t('Verificar correo')} disabled={busy || !/^\d{6}$/.test(code)} aria-busy={busy}/></div>
    </form>
  </IntegrationDialog>
}
