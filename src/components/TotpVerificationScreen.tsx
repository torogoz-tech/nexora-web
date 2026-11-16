import OtpCodeInput from './OtpCodeInput'
import { useTranslation } from '../hooks/useTranslation'
import type { TotpVerificationScreenProps } from '../types/TotpVerificationScreenProps'
export default function TotpVerificationScreen({code,busy,invalid,enrolling,onChange,onVerify,onBack}:TotpVerificationScreenProps){
  const {language}=useTranslation();const en=language==='en'
  const complete=/^\d{6}$/.test(code)
  return <form className="space-y-5" onSubmit={event=>{event.preventDefault();if(complete&&!busy)onVerify()}}>
    <p className="text-sm leading-relaxed text-base-content/65">{en?'Enter the six-digit code shown in your authenticator.':'Introduce los seis dígitos que aparecen en tu autenticador.'}</p>
    <OtpCodeInput value={code} onChange={onChange} disabled={busy} invalid={invalid}/>
    <button className="btn btn-block" disabled={busy||!complete}>{busy?(en?'Verifying…':'Verificando…'):(en?'Verify and continue':'Verificar y continuar')}</button>
    {enrolling&&<button type="button" className="btn btn-ghost btn-block" disabled={busy} onClick={onBack}>{en?'Back to QR code':'Volver al código QR'}</button>}
  </form>
}
