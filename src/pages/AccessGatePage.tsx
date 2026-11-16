import { useEffect, useEffectEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import TotpSetupScreen from '../components/TotpSetupScreen'
import TotpVerificationScreen from '../components/TotpVerificationScreen'
import AuthLayout from '../layouts/AuthLayout'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { parseBrowserSession } from '../utils/parseBrowserSession'
import { browserHeaders } from '../services/browserHeaders'


export default function AccessGatePage() {
 const navigate=useNavigate()
 const [params,setParams]=useSearchParams()
 const auth=useAuth()
 const {language}=useTranslation()
 const en=language==='en'
 const challenge=auth.session?.nextStep?auth.session:null
 const [stage,setStage]=useState(challenge?.nextStep??'')
 const [remaining,setRemaining]=useState(0)
 const [secret,setSecret]=useState('')
 const [uri,setUri]=useState('')
 const [code,setCode]=useState('')
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 async function advance(action:string) {
  if(!challenge||busy)return
  setBusy(true);setError('')
  try {
   const response=await fetch('/api/v1/auth/gate',{method:'POST',credentials:'same-origin',headers:browserHeaders({'Content-Type':'application/json'}),body:JSON.stringify({action,code}),signal:AbortSignal.timeout(15000)})
   if(!response.ok)throw new Error(response.status===401?(en?'The code is invalid or this access attempt expired. Sign in again if necessary.':'El código no es válido o este intento de acceso expiró. Si es necesario, inicia sesión de nuevo.'):(en?'We could not continue. After several incorrect codes, wait five minutes.':'No pudimos continuar. Después de varios códigos incorrectos, espera cinco minutos.'))
   const value=await response.json()
   if(value.stage==='ready') {
    auth.acceptSession(parseBrowserSession(value));navigate('/profile',{replace:true});return
   }
   setStage(value.stage);setRemaining(value.remaining_skips??0)
   if(value.secret)setSecret(value.secret)
   if(value.uri)setUri(value.uri)
  }catch(failure){setError(failure instanceof Error?failure.message:'Error')}
  finally{setBusy(false)}
 }
 const checkStatus=useEffectEvent(()=>{void advance('status')})
 useEffect(()=>{if(auth.status==='checking'||auth.status==='unavailable')return;if(!challenge){navigate(auth.status==='authenticated'?'/profile':'/login',{replace:true});return}const timer=window.setTimeout(()=>checkStatus(),0);return()=>window.clearTimeout(timer)},[challenge,navigate,auth.status])
 function leave(){void auth.logout().then(()=>navigate('/login',{replace:true}))}
 const pending=stage==='pending_role'
 const confirming=stage==='totp_verify'||params.get('step')==='verify'
 return <AuthLayout>
  {!pending&&stage==='totp_enroll'&&<p className="mb-2 text-center text-xs font-medium text-base-content/45">{en?`Step ${confirming?2:1} of 2`:`Paso ${confirming?2:1} de 2`}</p>}
  <h1 className="mb-5 text-center text-xl font-semibold">{pending?(en?'Waiting for access approval':'Esperando autorización de acceso'):confirming?(en?'Verify your identity':'Verifica tu identidad'):(en?'Link your authenticator':'Vincula tu autenticador')}</h1>
  <section className="auth-panel space-y-4 p-5">
   {pending?<><p className="text-sm leading-relaxed">{en?'Your identity has been verified. The administrator must assign you a role before you can access the organization.':'Tu identidad está verificada. El administrador debe asignarte un rol antes de que puedas acceder a la organización.'}</p><p className="text-sm leading-relaxed text-base-content/65">{en?'There is no set waiting time. Access may not be approved if the administrator considers it unnecessary. Contact your administrator.':'No hay un tiempo de espera establecido. Es posible que el administrador no autorice el acceso si no lo considera necesario. Comunícate con él.'}</p><button className="btn btn-block" disabled={busy} onClick={()=>void advance('status')}>{en?'Check access':'Comprobar acceso'}</button></>:confirming?
    <TotpVerificationScreen code={code} busy={busy} invalid={!!error} enrolling={stage==='totp_enroll'} onChange={setCode} onVerify={()=>void advance('verify')} onBack={()=>{setError('');setParams({})}}/>:
    <TotpSetupScreen secret={secret} uri={uri} busy={busy} onSetup={()=>void advance('setup')} onContinue={()=>{setError('');setParams({step:'verify'})}}/>
   }
   {error&&<p role="alert" className="text-sm text-error">{error}</p>}
  </section>
  {stage==='totp_enroll'&&!confirming&&<div className="mt-4 text-center"><p className="text-xs text-base-content/50">{en?`${remaining} skips remaining.`:`Puedes omitirlo ${remaining} veces más.`}</p>{remaining>0&&<button className="btn btn-ghost btn-sm mt-2" disabled={busy} onClick={()=>void advance('skip')}>{en?'Skip for now':'Omitir por ahora'}</button>}</div>}
  <div className="mt-3 text-center"><button className="btn btn-ghost btn-sm text-base-content/55" disabled={busy} onClick={leave}>{en?'Back to sign in':'Volver al inicio de sesión'}</button></div>
 </AuthLayout>
}
