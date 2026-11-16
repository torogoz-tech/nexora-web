import { useState } from 'react'
import { Unlink, X } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { revokeGitAlias } from '../services/revokeGitAlias'
import IntegrationDialog from './IntegrationDialog'
import TextButton from './TextButton'
import type { GitAuthorAlias } from '../types/GitAuthorAlias'
export default function RevokeGitAliasModal({ alias, onClose, onSaved }: { alias: GitAuthorAlias; onClose: () => void; onSaved: () => void }) {
 const { t } = useTranslation(), mutation = useIntegrationMutation(), [reason, setReason] = useState('')
 return <IntegrationDialog title={t('Revocar alias Git')} onClose={onClose} busy={mutation.busy}><form className="space-y-4" onSubmit={event => { event.preventDefault(); if (!reason.trim()) return; void mutation.run({ id: alias.id, revision: alias.revision, reason: reason.trim() }, async (signal, key) => { await revokeGitAlias(alias, reason, key, signal); onSaved() }) }}><p className="text-sm leading-relaxed text-base-content/60">{t('Los commits ya atribuidos conservarán su historial. Este alias dejará de utilizarse para nuevas atribuciones.')}</p><p className="break-words text-sm font-medium">{alias.email} · {alias.actor_name}</p><label className="flex flex-col gap-2 text-xs">{t('Motivo')}<textarea className="textarea min-h-20 w-full" value={reason} onChange={event => setReason(event.target.value)} required maxLength={1000} disabled={mutation.busy}/></label>{mutation.error && <p role="alert" className="text-sm text-error">{t(mutation.error)}</p>}<footer className="flex justify-end gap-2 border-t border-base-300 pt-4"><TextButton label={t('Cancelar')} disabled={mutation.busy} onClick={onClose}><X size={16}/></TextButton><TextButton type="submit" label={t('Revocar alias')} variant="primary" disabled={mutation.busy || !reason.trim()}><Unlink size={16}/></TextButton></footer></form></IntegrationDialog>
}
