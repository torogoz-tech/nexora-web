import { useEffect,useRef,useState } from 'react'
import { Link } from 'react-router'
import AuthLayout from '../layouts/AuthLayout'
import TextButton from '../components/TextButton'
import { useTranslation } from '../hooks/useTranslation'
import { useEmailActionToken } from '../hooks/useEmailActionToken'
import { submitPublicEmailAction } from '../services/submitPublicEmailAction'
import { parseInvitationDetails } from '../utils/parseInvitationDetails'
import type { InvitationDetails } from '../types/InvitationDetails'
export default function AcceptInvitationPage(){
  const {t}=useTranslation(),token=useEmailActionToken('nxi')
  const [details,setDetails]=useState<InvitationDetails|null>(null)
  const [name,setName]=useState(''),[username,setUsername]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState('')
  const [busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState<string|null>(null)
  const request=useRef<AbortController|null>(null)
  useEffect(()=>{
    if(!token)return;const controller=new AbortController()
    submitPublicEmailAction('/api/v1/auth/invitations/inspect',{token},controller.signal).then(v=>{if(!controller.signal.aborted){const data=parseInvitationDetails(v);setDetails(data);setName(data.name)}}).catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error&&e.name!=='TypeError'?e.message:'No pudimos completar la solicitud. Vuelve a intentarlo.')})
    return()=>controller.abort()
  },[token])
  useEffect(()=>()=>request.current?.abort(),[])
  async function accept(){
    if(busy||!details)return;if(password!==confirm){setError('Las contraseñas no coinciden.');return}
    const controller=new AbortController();request.current=controller;setBusy(true);setError(null)
    try{await submitPublicEmailAction('/api/v1/auth/invitations/accept',{token,name,username,password},controller.signal);if(!controller.signal.aborted){setDone(true);setPassword('');setConfirm('')}}catch(e){if(!controller.signal.aborted)setError(e instanceof Error&&e.name!=='TypeError'?e.message:'No pudimos completar la solicitud. Vuelve a intentarlo.')}finally{if(!controller.signal.aborted)setBusy(false)}
  }
  return <AuthLayout><h1 className="mb-6 text-center text-xl">{t('Aceptar invitación')}</h1><section className="auth-panel p-5">
    {done?<p role="status" className="text-sm leading-relaxed">{t('Tu cuenta está lista. Ya puedes iniciar sesión. El administrador te asignará acceso a los proyectos.')}</p>:!token?<p role="alert" className="text-sm text-error">{t('El enlace no es válido, venció o ya fue utilizado. Solicita uno nuevo.')}</p>:!details?<p role={error?'alert':'status'} className={`text-sm ${error?'text-error':'text-base-content/55'}`}>{t(error??'Cargando…')}</p>:<form className="space-y-4" onSubmit={e=>{e.preventDefault();void accept()}}>
      <p className="text-sm text-base-content/60">{t('Únete a {0}',{'0':details.organization_name})}</p><p className="break-all text-xs text-base-content/50">{details.email}</p>
      <label className="flex flex-col gap-2 text-sm">{t('Nombre')}<input className="input w-full" autoComplete="name" required maxLength={160} value={name} onChange={e=>setName(e.target.value)} disabled={busy}/></label>
      <label className="flex flex-col gap-2 text-sm">{t('Usuario')}<input className="input w-full" autoComplete="username" autoCapitalize="none" spellCheck={false} pattern="[A-Za-z0-9@._+\\-]+" required maxLength={254} value={username} onChange={e=>setUsername(e.target.value)} disabled={busy}/></label>
      <label className="flex flex-col gap-2 text-sm">{t('Contraseña')}<input className="input w-full" type="password" autoComplete="new-password" minLength={12} maxLength={1024} required value={password} onChange={e=>setPassword(e.target.value)} disabled={busy}/></label>
      <label className="flex flex-col gap-2 text-sm">{t('Confirmar contraseña')}<input className="input w-full" type="password" autoComplete="new-password" minLength={12} maxLength={1024} required value={confirm} onChange={e=>setConfirm(e.target.value)} disabled={busy}/></label>
      <p className="text-xs text-base-content/55">{t('Usa al menos 12 caracteres.')}</p>{error&&<p role="alert" className="text-sm text-error">{t(error)}</p>}
      <TextButton className="w-full" type="submit" variant="primary" label={t('Crear mi cuenta')} disabled={busy} aria-busy={busy}/>
    </form>}
    <Link className="mt-5 block text-center text-sm underline underline-offset-4" to="/login">{t('Volver a iniciar sesión')}</Link>
  </section></AuthLayout>
}
