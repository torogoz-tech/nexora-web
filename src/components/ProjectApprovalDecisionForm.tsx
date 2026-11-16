import { parseApprovalFacts } from '../utils/parseApprovalFacts'
import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import type { PendingApproval } from '../types/PendingApproval'
import IntegrationDialog from './IntegrationDialog'
import DataMessage from './DataMessage'
import TextButton from './TextButton'
export default function ProjectApprovalDecisionForm({ item, approved, busy, error, onClose, onSubmit }: { item: PendingApproval; approved: boolean; busy: boolean; error: string | null; onClose: () => void; onSubmit: (input: unknown) => Promise<void> }) {
  const { t } = useTranslation()
  const facts = useApiData(item.path, parseApprovalFacts)
  const [reason, setReason] = useState('')
  const current = facts.data?.status === 'pending' && facts.data.revision === item.revision
  return <IntegrationDialog title={t(approved ? 'Aprobar solicitud' : 'Rechazar solicitud')} busy={busy} onClose={onClose}>
    {!facts.data ? <DataMessage loading={facts.loading} error={facts.error} onRetry={facts.reload} /> : <form className="space-y-4" onSubmit={event => { event.preventDefault(); if (!busy && current && item.canDecide && reason.trim()) void onSubmit({ expected_revision: facts.data!.revision, decision: approved ? 'approved' : 'rejected', reason: reason.trim(), approval_expires_in_seconds: 3600 }) }}>
      <p className="font-medium">{item.title}</p><p className="text-sm">{facts.data.from} → {facts.data.to}</p>{facts.data.reason && <p className="whitespace-pre-wrap text-sm text-base-content/65">{facts.data.reason}</p>}
      {!current && <p role="alert" className="text-sm text-warning">{t('La solicitud cambió. Actualiza la bandeja antes de decidir.')}</p>}
      <label className="flex flex-col gap-2 text-sm">{t('Motivo')}<textarea required maxLength={4000} value={reason} onChange={event => setReason(event.target.value)} className="textarea min-h-24 w-full" disabled={busy} /></label>
      {error && <p role="alert" className="text-sm text-error">{t(error)}</p>}
      <div className="flex justify-end gap-2"><TextButton label={t('Cancelar')} type="button" onClick={onClose} disabled={busy} /><TextButton label={t(approved ? 'Aprobar solicitud' : 'Rechazar solicitud')} type="submit" variant="primary" disabled={busy || !current || !item.canDecide || !reason.trim()} /></div>
    </form>}
  </IntegrationDialog>
}
