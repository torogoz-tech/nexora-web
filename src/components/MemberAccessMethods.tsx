import { KeyRound, ShieldCheck } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import type { OrganizationMember } from '../types/OrganizationMember'
export default function MemberAccessMethods({member}:{member:OrganizationMember}){
  const {t}=useTranslation()
  const unknown=member.has_password===null||member.oidc_providers===null
  return <div className="flex flex-wrap gap-2 text-xs">
    {member.has_password&&<span className="inline-flex items-center gap-1.5 rounded-lg bg-base-200 px-2 py-1"><KeyRound size={13}/>{t('Usuario y contraseña')}{member.local_login_enabled===false&&<span className="text-base-content/50">({t('Deshabilitado')})</span>}</span>}
    {member.oidc_providers?.map((provider,index)=><span key={index} title={provider.name} className="inline-flex items-center gap-1.5 rounded-lg bg-base-200 px-2 py-1"><ShieldCheck size={13}/>OIDC · {provider.name}{!provider.enabled&&<span className="text-base-content/50">({t('Deshabilitado')})</span>}</span>)}
    {unknown?<span className="text-base-content/50">{t('Método de acceso no disponible')}</span>:!member.has_password&&!member.oidc_providers?.length?<span className="text-warning">{t('Sin método de acceso configurado')}</span>:null}
  </div>
}
