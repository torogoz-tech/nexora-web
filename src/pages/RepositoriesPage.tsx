import AlphabeticSortButton from '../components/AlphabeticSortButton'
import {useAlphabeticOrder} from '../hooks/useAlphabeticOrder'
import { Link } from 'react-router'
import { remoteRepositoryProfilePath } from '../utils/remoteRepositoryProfilePath'
import { useState } from 'react'
import { Eye, GitBranch, Link2, Plug, RefreshCw, Search } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useGitAccounts } from '../hooks/useGitAccounts'
import {useRepositoryCatalog} from '../hooks/useRepositoryCatalog'
import type { RemoteRepository } from '../types/RemoteRepository'
import Pagination from '../components/Pagination'
import Dropdown from '../components/Dropdown'
import IconButton from '../components/IconButton'
import RowAction from '../components/RowAction'
import LinkRepositoryModal from '../components/LinkRepositoryModal'
import DataMessage from '../components/DataMessage'
export default function RepositoriesPage() {
 const order=useAlphabeticOrder()
  const { t } = useTranslation()
  const accounts = useGitAccounts()
  const active = accounts.accounts.filter(account => account.status === 'active')
  const [selection,setSelection] = useState({connection:'',page:1})
  const connection = active.find(account => account.id === selection.connection) ?? active[0]
  const page = connection?.id === selection.connection ? selection.page : 1
  const [search,setSearch] = useState('')
  const [link,setLink] = useState<{repository:RemoteRepository;connectionId:string}|null>(null)
  const repositories=useRepositoryCatalog(connection?.id)
  const matches=repositories.items.filter(item=>item.full_name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
  matches.sort((a,b)=>order.compare(a.full_name,b.full_name))
  const items=matches.slice((page-1)*20,page*20)
  const error = accounts.error ?? repositories.error
  return <section aria-label={t('Repositorios')} className="flex min-w-0 flex-1 flex-col">
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-xl font-semibold">{t('Repositorios')}</h1><div className="flex items-center gap-1"><RowAction label={t('Conectar cuenta')} to="/settings/accounts"><Plug size={16}/></RowAction><IconButton label={t('Actualizar repositorios')} disabled={accounts.loading||repositories.loading} onClick={()=>{accounts.reload();repositories.reload()}}><RefreshCw size={16}/></IconButton></div></header>
    {active.length>0 && <div className="mb-6 flex flex-wrap items-center gap-3"><AlphabeticSortButton descending={order.descending} onChange={value=>{order.setDescending(value);setSelection({connection:connection?.id??'',page:1})}}/><div className="min-w-0 flex-1"><Dropdown label={t('Cuenta conectada')} value={connection?.id ?? ''} options={active.map(account=>({value:account.id,label:`${account.provider === 'github'?'GitHub':'GitLab'} · ${account.remote_login}${account.installation_id ? ` · ${account.installation_id}` : ''}`}))} onChange={value=>{setSelection({connection:value,page:1});setSearch('')}}/></div><label className="input input-sm w-full sm:w-60"><Search size={15}/><input aria-label={t('Buscar repositorios…')} placeholder={t('Buscar repositorios…')} value={search} onChange={event=>{setSearch(event.target.value);setSelection({connection:connection?.id??'',page:1})}}/></label></div>}
    {connection&&!repositories.loading&&!error&&<Pagination page={page} count={items.length} total={matches.length} busy={false} hasNext={page*20<matches.length} onPrevious={()=>setSelection({connection:connection.id,page:page-1})} onNext={()=>setSelection({connection:connection.id,page:page+1})}/>}
    {accounts.loading||repositories.loading||error ? <DataMessage loading={accounts.loading||repositories.loading} error={error} onRetry={()=>{accounts.reload();repositories.reload()}}/>
      : !connection ? <DataMessage message={t('Conecta una cuenta de GitHub o GitLab para explorar sus repositorios.')}/>
      : items.length===0 ? <DataMessage message={t(search ? 'No hay repositorios que coincidan con la búsqueda.' : 'La cuenta conectada no tiene repositorios disponibles en esta página.')}/>
      : <ul className="divide-y divide-base-300">{items.map(repository=><li key={repository.remote_id} className="flex items-center gap-3 py-5"><GitBranch size={19} className="shrink-0 text-base-content/50"/><h2 className="min-w-0 flex-1 break-words text-sm font-semibold">{<Link className="hover:underline" to={remoteRepositoryProfilePath(connection!.id,repository)}>{repository.full_name}</Link>}</h2><RowAction label={t('Ver perfil del repositorio')} to={remoteRepositoryProfilePath(connection!.id,repository)}><Eye size={16}/></RowAction><IconButton label={t('Vincular repositorio')} onClick={()=>setLink({repository,connectionId:connection!.id})}><Link2 size={16}/></IconButton></li>)}</ul>}
    {link && <LinkRepositoryModal key={`${link.connectionId}:${link.repository.remote_id}`} repository={link.repository} connectionId={link.connectionId} onClose={()=>setLink(null)}/>}
  </section>
}
