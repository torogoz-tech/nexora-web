import { useState } from 'react'
import { Link, X } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { parseGitAliasOptions } from '../utils/parseGitAliasOptions'
import { writeGitAlias } from '../services/writeGitAlias'
import IntegrationDialog from './IntegrationDialog'
import Dropdown from './Dropdown'
import DataMessage from './DataMessage'
import TextButton from './TextButton'
import type { GitAuthorObservation } from '../types/GitAuthorObservation'
import type { GitProvider } from '../types/GitProvider'
export default function GitAliasFormModal({ observed, onClose, onSaved }: { observed?: GitAuthorObservation; onClose: () => void; onSaved: () => void }) {
 const { t } = useTranslation(), mutation = useIntegrationMutation()
 const [provider, setProvider] = useState<GitProvider>(observed?.provider ?? 'github'), [host, setHost] = useState(observed?.host ?? 'github.com'), [email, setEmail] = useState(observed?.author_email ?? ''), [actorId, setActorId] = useState('')
 const options = useApiData('/api/v1/git-author-aliases/options', parseGitAliasOptions)
 const ready = !mutation.busy && !options.loading && !options.error && options.data?.can_manage_global && options.data.actors.some(actor => actor.id === actorId) && !!email.trim() && !!host.trim()
 return <IntegrationDialog title={t('Vincular autor Git')} onClose={onClose} busy={mutation.busy}>
  <p className="mb-5 text-sm leading-relaxed text-base-content/60">{t('El vínculo aplica a toda la organización y atribuye los commits anteriores y futuros de este correo al miembro seleccionado.')}</p>
  <form autoComplete="off" className="space-y-4" onSubmit={event => { event.preventDefault(); if (!ready) return; const input = { provider, host: host.trim(), email: email.trim(), project_id: null }; void mutation.run({ actorId, input }, async (signal, key) => { await writeGitAlias(actorId, input, key, signal); onSaved() }) }}>
   <fieldset className="space-y-4" disabled={mutation.busy}>
    <div className="grid gap-4 sm:grid-cols-2"><label className="flex flex-col gap-2 text-xs">{t('Proveedor')}<Dropdown label={t('Proveedor Git del alias')} value={provider} onChange={value => { setProvider(value as GitProvider); setHost(value === 'gitlab' ? 'gitlab.com' : 'github.com') }} options={[{ value: 'github', label: 'GitHub' }, { value: 'gitlab', label: 'GitLab' }]}/></label><label className="flex flex-col gap-2 text-xs">{t('Host Git')}<input className="input input-sm w-full" value={host} onChange={event => setHost(event.target.value)} required maxLength={253} placeholder="github.com" autoComplete="off"/></label></div>
    <label className="flex flex-col gap-2 text-xs">{t('Correo del autor en Git')}<input className="input input-sm w-full" type="email" name="git-author-alias-email" autoCapitalize="none" spellCheck={false} value={email} onChange={event => setEmail(event.target.value)} required maxLength={320} autoComplete="off"/></label>
    <p className="text-xs leading-relaxed text-base-content/45">{t('El nombre del autor no se utiliza para identificar a una persona. El correo y el host deben coincidir con los datos del commit.')}</p>
    <label className="flex flex-col gap-2 text-xs">{t('Miembro')}<Dropdown label={t('Miembro del alias')} value={actorId} onChange={setActorId} required disabled={options.loading || !!options.error} placeholder={t('Selecciona un miembro')} options={(options.data?.actors ?? []).map(actor => ({ value: actor.id, label: actor.username ? `${actor.name} (@${actor.username})` : actor.name }))}/></label>
   </fieldset>
   {options.loading || options.error ? <DataMessage loading={options.loading} error={t(options.error)} onRetry={options.reload}/> : options.data && !options.data.can_manage ? <p role="alert" className="text-sm text-warning">{t('No tienes permiso para administrar alias en este ámbito.')}</p> : null}
   {mutation.error && <p role="alert" className="text-sm text-error">{t(mutation.error)}</p>}
   <footer className="flex justify-end gap-2 border-t border-base-300 pt-4"><TextButton label={t('Cancelar')} disabled={mutation.busy} onClick={onClose}><X size={16}/></TextButton><TextButton type="submit" label={t('Vincular autor')} variant="primary" disabled={!ready}><Link size={16}/></TextButton></footer>
  </form>
 </IntegrationDialog>
}
