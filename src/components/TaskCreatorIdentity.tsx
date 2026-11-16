import {Link} from 'react-router'
import {useState} from 'react'
import {useApiData} from '../hooks/useApiData'
import {parseMemberProfile} from '../utils/parseMemberProfile'
import {useAuth} from '../hooks/useAuth'
import UserAvatar from './UserAvatar'
import Tooltip from './Tooltip'
import { useTranslation } from '../hooks/useTranslation'
import type { TaskCreator } from '../types/TaskCreator'
export default function TaskCreatorIdentity({ creator, name, actorId, compact = false, resolveProfile = true }: { creator?: TaskCreator; name?: string | null; actorId: string; compact?: boolean; resolveProfile?: boolean }) {
 const { t } = useTranslation()
 const {session}=useAuth()
 const [year]=useState(()=>new Date().getFullYear())
 const profile=useApiData(!creator && resolveProfile ? `/api/v1/members/${encodeURIComponent(actorId)}/profile?year=${year}` : null,parseMemberProfile)
 const identity=creator??profile.data?.member
 const label = identity?.name || name || (session?.actorId===actorId?session.displayName:undefined) || t(profile.loading?'Cargando creador…':'Identidad no disponible')
 const details=<span className="flex flex-col gap-1"><span className="font-semibold">{label}</span>{identity?.position&&<span className="text-base-content/65">{identity.position}</span>}</span>
 return <Tooltip label={details} className="min-w-0 max-w-full"><Link aria-label={[label,identity?.position].filter(Boolean).join(', ')} to={`/settings/members/${encodeURIComponent(actorId)}`} className="flex min-w-0 items-center gap-2.5 rounded-lg hover:underline focus-visible:outline-2 focus-visible:outline-primary"><UserAvatar actorId={actorId} revision={identity?.avatar_revision} name={label}/><div className={compact ? "hidden min-w-0 @min-[1100px]/task-list:block" : "min-w-0"}><p className="break-words font-medium">{label}</p>{identity?.position && <p className="mt-0.5 break-words text-xs text-base-content/50">{identity.position}</p>}</div></Link></Tooltip>
}
