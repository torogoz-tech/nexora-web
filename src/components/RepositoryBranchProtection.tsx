import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import type { RepositoryBranchProtectionProps } from '../types/RepositoryBranchProtectionProps'
import Dropdown from './Dropdown'
import RepositoryBranchProtectionDetails from './RepositoryBranchProtectionDetails'
export default function RepositoryBranchProtection({ projects, provider }: RepositoryBranchProtectionProps) {
 const { t } = useTranslation()
 const [projectId, setProjectId] = useState(projects.length === 1 ? projects[0].id : '')
 const selected = projects.find(project => project.id === projectId)
 return <section aria-label={t('Protección de ramas')} className="space-y-4">
  <h2 className="font-semibold">{t('Protección de ramas')}</h2>
  {projects.length > 1 && <Dropdown label={t('Proyecto para la protección de ramas')} value={projectId} placeholder={t('Selecciona un proyecto')} options={projects.map(project => ({ value: project.id, label: project.name }))} onChange={setProjectId}/>}
  {selected ? <RepositoryBranchProtectionDetails key={`${selected.id}:${selected.repository_id}`} projectId={selected.id} repositoryId={selected.repository_id} provider={provider}/> : <p className="text-sm text-base-content/60">{t('Selecciona un proyecto vinculado para consultar la protección de ramas.')}</p>}
 </section>
}
