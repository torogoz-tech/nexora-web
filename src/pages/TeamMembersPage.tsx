import {useState} from 'react'
import {Link} from 'react-router'
import {Search,RefreshCw} from 'lucide-react'
import {useApiData} from '../hooks/useApiData'
import {useTranslation} from '../hooks/useTranslation'
import {useAlphabeticOrder} from '../hooks/useAlphabeticOrder'
import {parseTeamMembers} from '../utils/parseTeamMembers'
import {memberRoleLabel} from '../utils/memberRoleLabel'
import UserAvatar from '../components/UserAvatar'
import IconButton from '../components/IconButton'
import AlphabeticSortButton from '../components/AlphabeticSortButton'
import Pagination from '../components/Pagination'
import DataMessage from '../components/DataMessage'
export default function TeamMembersPage(){
 const {t}=useTranslation(),order=useAlphabeticOrder(),data=useApiData('/api/v1/team/members',parseTeamMembers)
 const [search,setSearch]=useState(''),[page,setPage]=useState(1)
 const members=(data.data??[]).filter(member=>`${member.name} ${member.position}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())).sort((a,b)=>order.compare(a.name,b.name)||a.id.localeCompare(b.id))
 const totalPages=Math.max(1,Math.ceil(members.length/20)),current=Math.min(page,totalPages),visible=members.slice((current-1)*20,current*20)
 return <section className="min-w-0 flex-1"><header className="mb-5 flex flex-wrap items-center justify-between gap-3"><h1 className="text-xl font-semibold">{t('Miembros')}</h1><div className="flex items-center gap-2"><AlphabeticSortButton descending={order.descending} onChange={value=>{order.setDescending(value);setPage(1)}}/><IconButton label={t('Actualizar miembros')} onClick={data.reload} disabled={data.loading}><RefreshCw size={16}/></IconButton></div></header><label className="input input-sm mb-5 flex w-full items-center gap-2"><Search size={15}/><input aria-label={t('Buscar miembros')} placeholder={t('Buscar miembros')} value={search} onChange={event=>{setSearch(event.target.value);setPage(1)}}/></label>{data.loading||data.error?<DataMessage loading={data.loading} error={t(data.error)} onRetry={data.reload}/>:<><ul className="divide-y divide-base-300">{visible.map(member=><li key={member.id}><Link to={`/settings/members/${encodeURIComponent(member.id)}`} className="flex min-w-0 items-center gap-3 rounded-xl px-2 py-4 hover:bg-base-200/40"><UserAvatar actorId={member.id} name={member.name} revision={member.avatar_revision}/><div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold">{member.name}</p>{member.position&&<p className="mt-1 break-words text-xs text-base-content/55">{member.position}</p>}</div><span className="text-xs text-base-content/55">{t(memberRoleLabel(member.role))}</span></Link></li>)}</ul>{!members.length&&<p className="py-6 text-sm text-base-content/50">{t('No hay miembros que coincidan con la búsqueda.')}</p>}<Pagination page={current} totalPages={totalPages} total={members.length} count={visible.length} hasNext={current<totalPages} onPrevious={()=>setPage(current-1)} onNext={()=>setPage(current+1)} onPage={setPage}/></>}</section>
}
