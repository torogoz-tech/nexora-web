import PersonalRatingFeedback from '../components/PersonalRatingFeedback'
import PeerRatingAction from '../components/PeerRatingAction'
import Pagination from '../components/Pagination'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { parseDeveloperRatingDirectory } from '../utils/parseDeveloperRatingDirectory'
import DeveloperRatings from '../components/DeveloperRatings'
import Dropdown from '../components/Dropdown'
import DataMessage from '../components/DataMessage'
import IconButton from '../components/IconButton'
import { Plus } from 'lucide-react'
import DeveloperRatingModal from '../components/DeveloperRatingModal'
export default function DeveloperRatingsPage() {
  const { t } = useTranslation(), { session } = useAuth()
  const [cursors, setCursors] = useState<string[]>([''])
  const cursor = cursors.at(-1)!
  const directory = useApiData(`/api/v1/ratings${cursor ? `?after=${encodeURIComponent(cursor)}` : ''}`, parseDeveloperRatingDirectory)
  const [currentYear] = useState(() => new Date().getFullYear())
  const [selected, setSelected] = useState(''), [year, setYear] = useState(currentYear), [ratingOpen, setRatingOpen] = useState(false)
  const members = directory.data?.items ?? []
  const member = members.find(m => m.id === selected) ?? members.find(m => m.id === session?.actorId) ?? members[0]
  return <section className="min-w-0 flex-1"><header className="mb-6 flex items-center justify-between gap-3"><h1 className="text-xl font-semibold">{t('Calificaciones')}</h1>{member?.can_rate&&<IconButton label={t('Valorar trabajo')} onClick={()=>setRatingOpen(true)}><Plus size={16}/></IconButton>}</header>{directory.loading || directory.error ? <DataMessage loading={directory.loading} error={t(directory.error)} onRetry={directory.reload}/> : member ? <>
    <div className="mb-7 flex flex-wrap gap-3"><Dropdown label={t('Desarrollador')} className="min-w-56 flex-1" value={member.id} options={members.map(m => ({ value: m.id, label: m.name }))} onChange={setSelected}/><Dropdown label={t('Año de actividad')} className="w-28" value={String(year)} options={Array.from({ length: 5 }, (_, i) => { const y = currentYear - i; return { value: String(y), label: String(y) } })} onChange={value => setYear(Number(value))}/></div>
    {member.id===session?.actorId?<PersonalRatingFeedback key={year} year={year}/>:member.can_view_evaluations?<DeveloperRatings key={`${member.id}:${year}`} actorId={member.id} year={year} projects={member.projects}/>:<PeerRatingAction actorId={member.id} projects={member.projects} canRate={member.can_rate===true}/>}
    {(cursors.length>1||directory.data?.has_more)&&<Pagination page={cursors.length} busy={directory.loading} hasNext={!!directory.data?.next_after} onPrevious={()=>setCursors(values=>values.slice(0,-1))} onNext={()=>{if(directory.data?.next_after)setCursors(values=>[...values,directory.data!.next_after!])}}/>}{ratingOpen&&member&&<DeveloperRatingModal actorId={member.id} projects={member.projects} onClose={()=>setRatingOpen(false)} onCreated={()=>setRatingOpen(false)}/>}
  </> : <p className="text-sm text-base-content/55">{t('No hay desarrolladores autorizados para mostrar.')}</p>}</section>
}
