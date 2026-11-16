import { useState } from 'react'
import Pagination from '../components/Pagination'
import { ArrowLeft, History, RefreshCw } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { useTranslation } from '../hooks/useTranslation'
import { parsePersonalMcpKeys } from '../utils/parsePersonalMcpKeys'
import { isPersonalMcpKeyInactive } from '../utils/isPersonalMcpKeyInactive'
import PersonalMcpKeyRow from '../components/PersonalMcpKeyRow'
import DataMessage from '../components/DataMessage'
import IconButton from '../components/IconButton'
import RowAction from '../components/RowAction'
export default function PersonalMcpHistoryPage(){
 const {t}=useTranslation()
 const [cursors,setCursors]=useState<string[]>([''])
 const after=cursors.at(-1)!
 const remote=useApiData(`/api/v1/me/mcp-keys?status=inactive&limit=20${after?`&after=${encodeURIComponent(after)}`:''}`,parsePersonalMcpKeys)
 const data=remote.data
 const history=data?.items.filter(key=>isPersonalMcpKeyInactive(key,data.server_time))??[]
 return <section className="flex min-w-0 flex-1 flex-col" aria-labelledby="mcp-history-title">
  <header className="mb-6 flex items-start justify-between gap-3">
   <div><RowAction to="/settings/mcp" label={t('Volver a acceso MCP')}><ArrowLeft size={16}/></RowAction><h1 id="mcp-history-title" className="mt-4 flex items-center gap-2 text-xl font-semibold"><History size={21}/>{t('Historial de claves MCP')}</h1><p className="mt-2 text-sm text-base-content/55">{t('Claves revocadas y vencidas. Ya no permiten acceder a Nexora.')}</p></div>
   <IconButton label={t('Actualizar historial MCP')} disabled={remote.loading} onClick={remote.reload}><RefreshCw size={16}/></IconButton>
  </header>
  {!data?<DataMessage loading={remote.loading} error={t(remote.error)} onRetry={remote.reload}/>:history.length?<ul className="divide-y divide-base-300">{history.slice(0,20).map(key=><PersonalMcpKeyRow key={key.id} item={key} projects={data.projects} now={data.server_time}/>)}</ul>:<p className="py-8 text-sm text-base-content/50">{t('No tienes claves MCP revocadas ni vencidas.')}</p>}
  {data&&<Pagination page={cursors.length} count={Math.min(20,history.length)} busy={remote.loading} hasNext={!!data.next_after} onPrevious={()=>setCursors(values=>values.slice(0,-1))} onNext={()=>{if(data.next_after)setCursors(values=>[...values,data.next_after!])}}/>}
 </section>
}
