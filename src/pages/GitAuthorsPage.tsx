import { useSearchParams } from 'react-router'
import { useProjectPreference } from '../hooks/useProjectPreference'
import {useIntegrationMutation} from '../hooks/useIntegrationMutation'
import {archiveGitAuthor} from '../services/archiveGitAuthor'
import Pagination from '../components/Pagination'
import { usableGitAuthorEmail } from '../utils/usableGitAuthorEmail'
import { useState } from 'react'
import { Archive, ArchiveRestore, ChevronRight, Link, RefreshCw, Search, UserRoundCheck } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useProjects } from '../hooks/useProjects'
import { useApiData } from '../hooks/useApiData'
import { parseGitAuthorPage } from '../utils/parseGitAuthorPage'
import { parseGitAliasPage } from '../utils/parseGitAliasPage'
import { parseGitAliasOptions } from '../utils/parseGitAliasOptions'
import Dropdown from '../components/Dropdown'
import IconButton from '../components/IconButton'
import DataMessage from '../components/DataMessage'
import GitAliasList from '../components/GitAliasList'
import GitAliasFormModal from '../components/GitAliasFormModal'
import RevokeGitAliasModal from '../components/RevokeGitAliasModal'
import type { GitAuthorObservation } from '../types/GitAuthorObservation'
import type { GitAuthorAlias } from '../types/GitAuthorAlias'
export default function GitAuthorsPage() {
 const { t, dateLocale } = useTranslation(), projects = useProjects(), mutation=useIntegrationMutation()
 const [params,setParams] = useSearchParams()
 const selectedProject = useProjectPreference(params.get('project'))
 const projectId = selectedProject && !['organization','none'].includes(selectedProject) ? selectedProject : ''
 const setProjectId = (id:string) => { const next=new URLSearchParams(params);next.set('project',id);setParams(next) }
 const [search, setSearch] = useState(''), [tab, setTab] = useState<'authors' | 'aliases' | 'archived'>('authors'), [memberId, setMemberId] = useState('')
 const [authorCursors, setAuthorCursors] = useState(['']), [aliasCursors, setAliasCursors] = useState(['']), [creating, setCreating] = useState(false), [observed, setObserved] = useState<GitAuthorObservation | undefined>(), [revoking, setRevoking] = useState<GitAuthorAlias | null>(null)
 const authorQuery = new URLSearchParams({ limit: '20', unlinked_only: 'true', archived_only: String(tab==='archived'), ...(projectId ? { project_id: projectId } : {}), ...(search.trim() ? { search: search.trim() } : {}), ...(authorCursors.at(-1) ? { after: authorCursors.at(-1)! } : {}) })
 const aliasQuery = new URLSearchParams({ limit: '50', ...(projectId ? { project_id: projectId } : {}), ...(memberId ? { member_id: memberId } : {}), ...(aliasCursors.at(-1) ? { after: aliasCursors.at(-1)! } : {}) })
 const authors = useApiData(`/api/v1/git-authors?${authorQuery}`, parseGitAuthorPage)
 const aliases = useApiData(`/api/v1/git-author-aliases?${aliasQuery}`, parseGitAliasPage)
 const options = useApiData(`/api/v1/git-author-aliases/options${projectId ? `?project_id=${encodeURIComponent(projectId)}` : ''}`, parseGitAliasOptions)
 const projectName = (id: string) => projects.projects.find(project => project.id === id)?.name ?? t('Proyecto autorizado')
 const refresh = () => { authors.reload(); aliases.reload(); options.reload() }
 const saved = () => { setCreating(false); setObserved(undefined); setRevoking(null); setAuthorCursors(['']); refresh() }
 const page = tab !== 'aliases' ? authors : aliases, cursors = tab !== 'aliases' ? authorCursors : aliasCursors
 const previous = () => tab !== 'aliases' ? setAuthorCursors(values => values.slice(0, -1)) : setAliasCursors(values => values.slice(0, -1))
 const next = () => { if (page.data?.next_after) { const cursor = page.data.next_after; if (tab !== 'aliases') setAuthorCursors(values => [...values, cursor]); else setAliasCursors(values => [...values, cursor]) } }
 return <section className="flex min-w-0 flex-1 flex-col" aria-label={t('Autores Git')}>
  <header className="mb-5 flex items-center justify-between gap-3"><h1 className="text-xl font-semibold">{t('Autores')}</h1><div className="flex gap-2">{options.data?.can_manage && <IconButton label={t('Vincular autor Git')} variant="primary" onClick={() => { setObserved(undefined); setCreating(true) }}><Link size={16}/></IconButton>}<IconButton label={t('Actualizar autores y alias')} disabled={authors.loading || aliases.loading} onClick={refresh}><RefreshCw size={16}/></IconButton></div></header>
  <p className="mb-5 text-sm leading-relaxed text-base-content/55">{t('Relaciona los correos de los commits con sus desarrolladores. La autoría y la cuenta que envía el push se conservan por separado.')}</p>
  <div role="tablist" aria-label={t('Autores y alias')} className="tabs tabs-border mb-5"><button type="button" role="tab" aria-selected={tab === 'authors'} aria-controls="git-authors-panel" className={`tab ${tab !== 'aliases' ? 'tab-active' : ''}`} onClick={() => {setTab('authors');setAuthorCursors([''])}}>{t('Autores observados')}</button><button type="button" role="tab" aria-selected={tab === 'aliases'} aria-controls="git-aliases-panel" className={`tab ${tab === 'aliases' ? 'tab-active' : ''}`} onClick={() => setTab('aliases')}>{t('Alias vinculados')}</button><button type="button" role="tab" aria-selected={tab==='archived'} aria-controls="git-authors-panel" className={`tab ${tab==='archived'?'tab-active':''}`} onClick={()=>{setTab('archived');setAuthorCursors([''])}}>{t('Autores archivados')}</button></div>
  <div className="mb-5 flex flex-wrap gap-3"><Dropdown label={t('Filtrar autores por proyecto')} className="min-w-48 flex-1" value={projectId} onChange={value => { setProjectId(value); setMemberId(''); setAuthorCursors(['']); setAliasCursors(['']) }} options={[{ value: '', label: t('Todos los proyectos autorizados') }, ...projects.projects.filter(project => !project.archived).map(project => ({ value: project.id, label: project.name }))]}/>{tab !== 'aliases' ? <label className="input input-sm min-w-48 flex-1"><Search size={15}/><input aria-label={t('Buscar autores Git')} placeholder={t('Buscar autor o correo…')} value={search} onChange={event => { setSearch(event.target.value); setAuthorCursors(['']) }}/></label> : <Dropdown label={t('Filtrar alias por miembro')} className="min-w-48 flex-1" value={memberId} onChange={value => { setMemberId(value); setAliasCursors(['']) }} options={[{ value: '', label: t('Todos los miembros visibles') }, ...(options.data?.actors ?? []).map(actor => ({ value: actor.id, label: actor.username ? `${actor.name} (@${actor.username})` : actor.name }))]}/>} {projects.hasMore && <IconButton label={t('Más proyectos')} disabled={projects.loadingMore} onClick={() => void projects.loadMore()}><ChevronRight size={16}/></IconButton>}</div>
  {options.data?.can_manage && !options.data.can_manage_global && !projectId && <p className="mb-4 text-xs text-base-content/50">{t('Selecciona un proyecto para vincular sus autores y administrar sus alias.')}</p>}
  {mutation.error&&<p role="alert" className="mb-4 text-sm text-error">{t(mutation.error)}</p>}
  {options.error && <DataMessage error={t(options.error)} onRetry={options.reload}/>}
  {projects.status !== 'ready' && projects.status !== 'loading' && <DataMessage error={t('No pudimos consultar los proyectos disponibles.')} onRetry={projects.retry}/>}
  <div id={tab !== 'aliases' ? 'git-authors-panel' : 'git-aliases-panel'} role="tabpanel" className="min-w-0">
   {page.loading || page.error ? <DataMessage loading={page.loading} error={t(page.error)} onRetry={page.reload}/> : tab === 'aliases' ? <GitAliasList items={aliases.data?.items ?? []} projectName={projectName} canManage={!!options.data?.can_manage && (!!projectId || options.data.can_manage_global)} canManageGlobal={options.data?.can_manage_global} onRevoke={setRevoking}/> : authors.data?.items.length ? <div className="overflow-x-auto"><table className="table w-full"><thead><tr><th>{t('Autor del commit')}</th><th>{t('Atribución')}</th><th>{t('Proyecto')}</th><th>{t('Commit recibido')}</th><th><span className="sr-only">{t('Acciones')}</span></th></tr></thead><tbody>{authors.data.items.map(author => <tr key={author.id}><td><span className="block break-words font-medium">{author.author_name || t('Autor sin nombre')}</span><span className="mt-1 block break-all text-xs text-base-content/50">{author.author_email ?? t('Correo no disponible')}</span><span className="mt-1 block text-xs text-base-content/40">{author.provider === 'github' ? 'GitHub' : 'GitLab'} · {author.host}</span></td><td className="text-sm">{author.actor_id ? <span className="inline-flex items-center gap-2"><UserRoundCheck size={14} className="shrink-0 text-success"/>{author.actor_name ?? t('Miembro atribuido')}</span> : <span className="text-base-content/45">{t('Sin vincular')}</span>}</td><td className="text-xs text-base-content/55">{projectName(author.project_id)}</td><td><code className="text-xs">{author.commit_sha.slice(0, 12)}</code><time className="mt-1 block text-xs text-base-content/40" dateTime={author.occurred_at}>{new Date(author.occurred_at).toLocaleDateString(dateLocale)}</time></td><td className="text-right"><div className="flex justify-end gap-1">{options.data?.can_manage && (!!projectId || options.data.can_manage_global) && <IconButton label={t(tab==='archived'?'Restaurar autor Git':'Archivar autor Git')} disabled={mutation.busy} onClick={()=>void mutation.run({id:author.id,archived:tab!=='archived'},async(signal,key)=>{await archiveGitAuthor(author.id,tab!=='archived',key,signal);setAuthorCursors(['']);authors.reload()})}>{tab==='archived'?<ArchiveRestore size={15}/>:<Archive size={15}/>}</IconButton>}{tab!=='archived' && !author.actor_id && usableGitAuthorEmail(author.author_email) && options.data?.can_manage && (!!projectId || options.data.can_manage_global) && <IconButton label={t('Vincular autor Git')} onClick={() => { setObserved(author); setCreating(true) }}><Link size={15}/></IconButton>}</div></td></tr>)}</tbody></table></div> : <p className="py-12 text-center text-sm text-base-content/50">{t('No hay autores recibidos que coincidan con estos filtros.')}</p>}
  </div>
  {(cursors.length>1||page.data?.has_more)&&<Pagination page={cursors.length} busy={page.loading} hasNext={!!page.data?.next_after} onPrevious={previous} onNext={next}/>}
  {creating && <GitAliasFormModal observed={observed} onClose={() => setCreating(false)} onSaved={saved}/>}
  {revoking && <RevokeGitAliasModal alias={revoking} onClose={() => setRevoking(null)} onSaved={saved}/>}
 </section>
}
