import { QRCodeSVG } from 'qrcode.react'
import { useTranslation } from '../hooks/useTranslation'
import type { TotpSetupScreenProps } from '../types/TotpSetupScreenProps'
export default function TotpSetupScreen({secret, uri, busy, onSetup, onContinue}:TotpSetupScreenProps) {
  const {language}=useTranslation();const en=language==='en'
  return <div className="space-y-4">
    <p className="text-sm leading-relaxed text-base-content/65">{en?'Open your authenticator and scan this QR code to add your account.':'Abre tu autenticador y escanea este código QR para agregar tu cuenta.'}</p>
    {secret?<>
      <div className="mx-auto w-fit rounded-xl bg-white p-3"><QRCodeSVG value={uri} size={156}/></div>
      <details className="text-center text-xs text-base-content/60"><summary className="cursor-pointer py-1">{en?'Can’t scan the QR code?':'¿No puedes escanear el código QR?'}</summary><p className="mt-3 text-left">{en?'Enter this key manually in your authenticator:':'Introduce esta clave manualmente en tu autenticador:'}</p><code className="mt-2 block break-all rounded-lg bg-base-100 p-3 text-left font-mono leading-relaxed select-all">{secret}</code></details>
      <button type="button" className="btn btn-block" disabled={busy} onClick={onContinue}>{en?'Continue':'Continuar'}</button>
    </>:<button type="button" className="btn btn-block" disabled={busy} onClick={onSetup}>{en?'Show QR code':'Mostrar código QR'}</button>}
  </div>
}
