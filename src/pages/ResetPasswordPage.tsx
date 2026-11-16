import { useEffect,useRef,useState } from 'react'
import { Link } from 'react-router'
import AuthLayout from '../layouts/AuthLayout'
import TextButton from '../components/TextButton'
import { useTranslation } from '../hooks/useTranslation'
import { useEmailActionToken } from '../hooks/useEmailActionToken'
import { submitPublicEmailAction } from '../services/submitPublicEmailAction'
export default function ResetPasswordPage(){
  const {t}=useTranslation(),token=useEmailActionToken('nxr')
  const [password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState<string|null>(null)
  const request=useRef<AbortController|null>(null);useEffect(()=>()=>request.current?.abort(),[])
  async function submit(){
    if(busy||!token)return;if(password!==confirm){setError('Las contraseñas no coinciden.');return}
    const controller=new AbortController();request.current=controller;setBusy(true);setError(null)
    try{await submitPublicEmailAction('/api/v1/auth/password/complete',{token,password},controller.signal);if(!controller.signal.aborted){setDone(true);setPassword('');setConfirm('')}}catch(e){if(!controller.signal.aborted)setError(e instanceof Error&&e.name!=='TypeError'?e.message:'No pudimos completar la solicitud. Vuelve a intentarlo.')}finally{if(!controller.signal.aborted)setBusy(false)}
  }
  return <AuthLayout><h1 className="mb-6 text-center text-xl">{t('Restablecer contraseña')}</h1><section className="auth-panel p-5">
    {done?<p role="status" className="text-sm leading-relaxed">{t('Tu contraseña se actualizó. Las sesiones anteriores se cerraron; inicia sesión con tu nueva contraseña.')}</p>:!token?<p role="alert" className="text-sm text-error">{t('El enlace no es válido, venció o ya fue utilizado. Solicita uno nuevo.')}</p>:<form className="space-y-4" onSubmit={e=>{e.preventDefault();void submit()}}>
      <label className="flex flex-col gap-2 text-sm">{t('Nueva contraseña')}<input className="input w-full" type="password" autoComplete="new-password" required minLength={12} maxLength={1024} value={password} disabled={busy} onChange={e=>setPassword(e.target.value)}/></label>
      <label className="flex flex-col gap-2 text-sm">{t('Confirmar contraseña')}<input className="input w-full" type="password" autoComplete="new-password" required minLength={12} maxLength={1024} value={confirm} disabled={busy} onChange={e=>setConfirm(e.target.value)}/></label>
      <p className="text-xs text-base-content/55">{t('Usa al menos 12 caracteres.')}</p>{error&&<p role="alert" className="text-sm text-error">{t(error)}</p>}
      <TextButton className="w-full" type="submit" variant="primary" label={t('Cambiar contraseña')} disabled={busy} aria-busy={busy}/>
    </form>}
    <Link className="mt-5 block text-center text-sm underline underline-offset-4" to={done?'/login':'/forgot-password'}>{t(done?'Volver a iniciar sesión':'Solicitar otro enlace')}</Link>
  </section></AuthLayout>
}
