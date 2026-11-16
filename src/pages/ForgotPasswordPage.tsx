import { useEffect,useRef,useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from '../hooks/useTranslation'
import AuthLayout from '../layouts/AuthLayout'
import TextButton from '../components/TextButton'
import { submitPublicEmailAction } from '../services/submitPublicEmailAction'
export default function ForgotPasswordPage(){
  const {t}=useTranslation()
  const [email,setEmail]=useState(''),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState<string|null>(null)
  const request=useRef<AbortController|null>(null)
  useEffect(()=>()=>request.current?.abort(),[])
  async function submit(){
    if(busy)return;const controller=new AbortController();request.current=controller;setBusy(true);setError(null)
    try{await submitPublicEmailAction('/api/v1/auth/password/request',{email},controller.signal);if(!controller.signal.aborted)setDone(true)}catch(e){if(!controller.signal.aborted)setError(e instanceof Error&&e.name!=='TypeError'?e.message:'No pudimos completar la solicitud. Vuelve a intentarlo.')}finally{if(!controller.signal.aborted)setBusy(false)}
  }
  return <AuthLayout><h1 className="mb-6 text-center text-xl">{t('Recuperar contraseña')}</h1><section className="auth-panel p-5">
    {done?<p role="status" className="text-sm leading-relaxed">{t('Si existe una cuenta local habilitada con ese correo, recibirás un enlace para recuperar el acceso. Revisa también la carpeta de spam.')}</p>:<form className="space-y-4" onSubmit={e=>{e.preventDefault();void submit()}}>
      <p className="text-sm leading-relaxed text-base-content/60">{t('Introduce el correo configurado para tu cuenta local. Si accedes con un proveedor externo, recupera tu contraseña en ese proveedor.')}</p>
      <label className="flex flex-col gap-2 text-sm">{t('Correo electrónico')}<input className="input w-full" type="email" required maxLength={320} autoComplete="email" value={email} disabled={busy} onChange={e=>setEmail(e.target.value)}/></label>
      {error&&<p role="alert" className="text-sm text-error">{t(error)}</p>}
      <TextButton className="w-full" type="submit" variant="primary" label={t('Enviar enlace de recuperación')} disabled={busy} aria-busy={busy}/>
    </form>}
    <Link className="mt-5 block text-center text-sm underline underline-offset-4" to="/login">{t('Volver a iniciar sesión')}</Link>
  </section></AuthLayout>
}
