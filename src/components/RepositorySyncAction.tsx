import { useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useWorkspacePermission } from '../hooks/useWorkspacePermission'
import { useTranslation } from '../hooks/useTranslation'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { syncRepository } from '../services/syncRepository'
import { readApiJson } from '../services/readApiJson'
import { requireRecord } from '../utils/requireRecord'
import { repositorySyncLabel } from '../utils/repositorySyncLabel'
import type { RepositorySyncActionProps } from '../types/RepositorySyncActionProps'
import IconButton from './IconButton'
import Dropdown from './Dropdown'
export default function RepositorySyncAction({ projects, state, onComplete }: RepositorySyncActionProps) {
  const { t } = useTranslation()
  const mutation = useIntegrationMutation()
  const [project, setProject] = useState(projects.length === 1 ? projects[0].id : '')
  const [job, setJob] = useState<Awaited<ReturnType<typeof syncRepository>> | null>(null)
  const pollTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [pollError, setPollError] = useState(false)
  const active = ['queued', 'pending', 'running', 'leased'].includes(job?.state ?? state ?? '')
  const allowed = useWorkspacePermission('repositories:sync')
  const selectedAllowed = useWorkspacePermission('repositories:sync', project)
  const selected = projects.find(item => item.id === project)
  useEffect(() => {
    if (!job || !['queued', 'pending', 'running', 'leased'].includes(job.state)) return
    const controller = new AbortController()
    async function poll() {
      try {
        const result = requireRecord(await readApiJson(`/api/v1/projects/${encodeURIComponent(job!.project)}/jobs/${encodeURIComponent(job!.id)}`, controller.signal))
        if (controller.signal.aborted) return
        if (typeof result.state !== 'string') throw Error('Invalid job')
        if (['queued', 'pending', 'running', 'leased'].includes(result.state)) pollTimer.current = setTimeout(() => void poll(), 3000)
        else { setJob(current => current ? { ...current, state: String(result.state) } : null); onComplete() }
      } catch { if (!controller.signal.aborted) setPollError(true) }
    }
    pollTimer.current = setTimeout(() => void poll(), 1500)
    return () => { clearTimeout(pollTimer.current); controller.abort() }
  }, [job, onComplete])
  if (!allowed) return null
  return <div className="mt-3 space-y-2">
    {projects.length > 1 && <Dropdown label={t('Proyecto para sincronizar')} value={project} options={projects.map(item => ({ value: item.id, label: item.name }))} onChange={setProject} disabled={mutation.busy || active}/>}
    <div className="flex items-center gap-2"><IconButton label={t(!projects.length ? 'Vincula el repositorio a un proyecto para sincronizarlo.' : active ? 'Sincronización en curso' : 'Sincronizar repositorio')} disabled={!selected || !selectedAllowed || mutation.busy || active} aria-busy={mutation.busy || active} onClick={() => { if (selected) void mutation.run(selected, async (signal, key) => { setPollError(false); setJob(await syncRepository(selected.id, selected.repository_id, signal, key)) }) }}><RefreshCw size={16} className={mutation.busy || active ? 'animate-spin motion-reduce:animate-none' : ''}/></IconButton>{job && <span className="text-xs text-base-content/60" role="status">{t(repositorySyncLabel(job.state))}</span>}</div>
    {(mutation.error || pollError) && <p role="alert" className="text-xs text-error">{t(mutation.error || 'No pudimos consultar el progreso. Actualiza el repositorio para revisarlo.')}</p>}
  </div>
}
