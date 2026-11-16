import { useState } from 'react'
import { Link2 } from 'lucide-react'
import { useProjects } from '../hooks/useProjects'
import { useTranslation } from '../hooks/useTranslation'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { linkRemoteRepository } from '../services/linkRemoteRepository'
import type { LinkRepositoryModalProps } from '../types/LinkRepositoryModalProps'
import IntegrationDialog from './IntegrationDialog'
import Dropdown from './Dropdown'
import TextButton from './TextButton'
import DataMessage from './DataMessage'
export default function LinkRepositoryModal({ repository, connectionId, onClose }: LinkRepositoryModalProps) {
  const { t } = useTranslation()
  const projects = useProjects()
  const mutation = useIntegrationMutation()
  const [project, setProject] = useState('')
  const [done, setDone] = useState(false)
  return <IntegrationDialog title={t('Vincular repositorio')} busy={mutation.busy} onClose={onClose}>
    <p className="mb-5 break-words text-sm font-medium">{repository.full_name}</p>
    {done ? <p role="status" className="text-sm">{t('Repositorio vinculado al proyecto.')}</p> : <form className="space-y-5" onSubmit={event => {event.preventDefault();void mutation.run({project,connectionId,remote:repository.remote_id},async(signal,key)=>{await linkRemoteRepository(project,connectionId,repository,signal,key);setDone(true)})}}>
      {projects.status !== 'ready' ? <DataMessage loading={projects.status === 'loading'} error={projects.status === 'loading' ? null : projects.status} onRetry={projects.retry}/> : <label className="flex flex-col gap-2 text-sm">{t('Proyecto')}<Dropdown label={t('Proyecto')} value={project} required options={projects.projects.filter(item=>!item.archived).map(item=>({value:item.id,label:item.name}))} disabled={mutation.busy} onChange={setProject}/></label>}
      {projects.hasMore && <TextButton type="button" label={t('Cargar más proyectos')} disabled={projects.loadingMore||mutation.busy} onClick={()=>void projects.loadMore()}/>}
      {projects.pageError && <p role="alert" className="text-sm text-error">{t(projects.pageError)}</p>}
      <p className="text-xs leading-relaxed text-base-content/55">{t('Nexora comprobará tus permisos y el acceso al repositorio antes de vincularlo.')}</p>
      {mutation.error && <p role="alert" className="text-sm text-error">{t(mutation.error)}</p>}
      <div className="flex justify-end gap-2"><TextButton label={t('Cancelar')} type="button" disabled={mutation.busy} onClick={onClose}/><TextButton label={t('Vincular repositorio')} type="submit" variant="primary" disabled={!project||mutation.busy} aria-busy={mutation.busy}><Link2 size={15}/></TextButton></div>
    </form>}
    {done && <div className="mt-6 flex justify-end"><TextButton type="button" label={t('Listo')} onClick={onClose}/></div>}
  </IntegrationDialog>
}
