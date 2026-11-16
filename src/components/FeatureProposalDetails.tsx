import WikiMarkdown from './WikiMarkdown'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Check, X } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { decideFeatureProposal } from '../services/decideFeatureProposal'
import TextButton from './TextButton'
import IconButton from './IconButton'
import type { FeatureProposalDetailsProps } from '../types/FeatureProposalDetailsProps'
export default function FeatureProposalDetails({ projectId, proposal, features, canDecide, onClose, onSaved }: FeatureProposalDetailsProps) {
  const { t } = useTranslation()
  const request = useRef<AbortController | null>(null)
  const attempt = useRef<{ payload: string; key: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    return () => request.current?.abort()
  }, [])
  async function decide(decision: 'approved' | 'rejected') {
    if (request.current) return
    const controller = new AbortController()
    request.current = controller
    setSaving(true)
    setError(null)
    const payload = JSON.stringify([decision, proposal.revision])
    if (attempt.current?.payload !== payload) attempt.current = { payload, key: crypto.randomUUID() }
    try {
      await decideFeatureProposal(projectId, proposal.id, proposal.revision, decision, '', attempt.current.key, controller.signal)
      if (!controller.signal.aborted) onSaved()
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure instanceof Error && !['TypeError', 'TimeoutError'].includes(failure.name) ? failure.message : 'No pudimos confirmar la decisión. Revisa los datos y vuelve a intentarlo.')
    } finally {
      request.current = null
      if (!controller.signal.aborted) setSaving(false)
    }
  }
  return (<section aria-labelledby="feature-proposal-title">
    <div className="min-w-0">
      <div className="mb-5"><IconButton label={t('Volver al catálogo')} disabled={saving} onClick={onClose}><ArrowLeft size={16}/></IconButton></div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 id="feature-proposal-title" className="font-serif text-2xl">{t('Propuesta de funcionalidades')}</h1>
        <div className="flex flex-wrap items-center gap-2">{canDecide&&proposal.status==='pending'&&        <div className="flex flex-wrap gap-2">
          <TextButton label={t('Rechazar propuesta')} variant="error" disabled={saving} onClick={() => void decide('rejected')}><X size={15} /></TextButton>
          <TextButton label={t('Aprobar propuesta')} variant="primary" aria-busy={saving} disabled={saving} onClick={() => void decide('approved')}><Check size={15} /></TextButton>
        </div>}</div>
      </div>
      <a className="mt-4 block font-medium hover:underline" href={`/knowledge/requirements?${new URLSearchParams({ project: projectId, article: proposal.requirement_id })}`}>{proposal.requirement_title}</a>
      <div className="mt-3"><WikiMarkdown text={proposal.reason} allowImages/></div>
      <p className="mt-3 text-xs text-base-content/50">{t('Propuesto por')}: {proposal.proposed_by}</p>
      <ul className="mt-5 divide-y divide-base-300">
        {proposal.links.map((link, index) => <li key={index} className="py-4">
          <div className="flex flex-wrap items-center gap-2"><strong className="break-words">{link.feature_id ? features.find(feature => feature.id === link.feature_id)?.name ?? link.feature_id : features.find(feature => feature.id === proposal.result?.feature_ids[index])?.name ?? link.name}</strong><span className="badge badge-sm badge-ghost">{link.feature_id ? t('Existente') : t('Nueva funcionalidad')}</span></div>
          {link.description && <div className="mt-2"><WikiMarkdown text={link.description} allowImages/></div>}
          <div className="mt-2"><p className="font-medium">{t('Impacto')}</p><WikiMarkdown text={link.impact} allowImages/></div>
        </li>)}
      </ul>
      <h3 className="mt-4 font-medium">{proposal.status === 'approved' ? t('Tareas creadas') : t('Tareas propuestas')} ({proposal.result?.task_ids.length ?? proposal.tasks.length})</h3>
      <ul className="mt-2 list-inside list-disc text-sm text-base-content/65">{proposal.tasks.map((task, index) => <li key={index}>{typeof task.definition === 'object' && task.definition !== null && 'title' in task.definition && typeof task.definition.title === 'string' ? task.definition.title : t('Tarea propuesta')}</li>)}</ul>
      {proposal.decision_reason && <p className="mt-5 whitespace-pre-wrap break-words text-sm"><strong>{t('Motivo de la decisión')}: </strong>{proposal.decision_reason}</p>}
      {error && <p role="alert" className="mt-3 text-sm text-error">{t(error)}</p>}
    </div>
    </section>
  )
}
