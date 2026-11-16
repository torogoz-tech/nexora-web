import { parseTotpStatus } from '../utils/parseTotpStatus'
import { useContext, useState } from 'react'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { useApiData } from '../hooks/useApiData'
import { useTranslation } from '../hooks/useTranslation'
import { apiFetch } from '../services/apiFetch'
import { useAuth } from '../hooks/useAuth'
export default function MemberTotpSettings({memberId}:{memberId:string}){
 const permissions=useContext(WorkspacePermissionsContext)
 const admin=permissions?.role==='super_admin'
 const remote=useApiData(admin?`/api/v1/members/${encodeURIComponent(memberId)}/totp`:null,parseTotpStatus)
 const {language}=useTranslation();const en=language==='en'
 const auth=useAuth()
 const [busy,setBusy]=useState(false);const [error,setError]=useState('')
 async function change(){if(!remote.data||busy)return;setBusy(true);setError('');try{const response=await apiFetch(`/api/v1/members/${encodeURIComponent(memberId)}/totp`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({exempt:!remote.data.exempt})});if(!response.ok)throw Error(en?'Could not update the exemption.':'No pudimos actualizar la exención.');remote.reload();if(memberId===auth.session?.actorId)await auth.logout()}catch(e){setError(e instanceof Error?e.message:'Error')}finally{setBusy(false)}}
 if(!admin)return null
 return <section className="mt-6 border-t border-base-300 pt-5"><h2 className="text-sm font-semibold">{en?'Account security':'Seguridad de la cuenta'}</h2>{remote.data&&<><p className="mt-2 text-xs text-base-content/55">{remote.data.enrolled?(en?'Authenticator configured':'Autenticador configurado'):(en?'Authenticator not yet configured':'Autenticador pendiente de configurar')}</p><label className="mt-4 flex items-center justify-between gap-3 text-sm">{en?'Exempt from TOTP':'Exento de TOTP'}<input type="checkbox" className="toggle toggle-sm" checked={remote.data.exempt} disabled={busy} onChange={()=>void change()}/></label><p className="mt-2 text-xs text-base-content/55">{en?'Only the superadministrator can grant an exemption. Changing it ends this member’s sessions.':'Solo el superadministrador puede conceder la exención. Al cambiarla se cierran las sesiones del miembro.'}</p></>}{(error||remote.error)&&<p role="alert" className="mt-2 text-xs text-error">{error||remote.error}</p>}</section>
}
