import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { integrationRequest } from '../services/integrationRequest'
import { requireRecord } from '../utils/requireRecord'
import IconButton from './IconButton'
import TextButton from './TextButton'
import IntegrationDialog from './IntegrationDialog'
import type { MemberPositionEditorProps } from '../types/MemberPositionEditorProps'

export default function MemberPositionEditor({ member, onSaved }: MemberPositionEditorProps) {
  const { t } = useTranslation()
  const mutation = useIntegrationMutation()
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState('')

  async function save() {
    const input = { position: position.trim(), expected_revision: member.position_revision ?? 0 }
    const saved = await mutation.run({ id: member.id, ...input }, async (signal, key) => {
      const result = requireRecord(await integrationRequest(`/api/v1/settings/members/${encodeURIComponent(member.id)}/position`, 'PATCH', input, key, signal))
      if (!Number.isSafeInteger(result.position_revision)) throw Error('La configuración recibida no es válida.')
      onSaved(input.position, Number(result.position_revision))
    })
    if (saved) setOpen(false)
  }

  return <>
    {!member.archived && <IconButton label={t('Editar posición de {0}', { '0': member.name })} onClick={() => { setPosition(member.position ?? ''); mutation.clearError(); setOpen(true) }}><Pencil size={16}/></IconButton>}
    {open && <IntegrationDialog title={t('Editar posición laboral')} busy={mutation.busy} onClose={() => setOpen(false)}>
      <form className="space-y-5" onSubmit={event => { event.preventDefault(); void save() }}>
        <p className="text-sm text-base-content/60">{member.name}</p>
        <label className="flex flex-col gap-2 text-sm">{t('Posición laboral')}<input autoFocus className="input w-full" value={position} maxLength={160} disabled={mutation.busy} placeholder={t('Ejemplo: Ingeniero de software sénior')} onChange={event => setPosition(event.target.value)}/></label>
        {mutation.error && <p role="alert" className="text-sm text-error">{t(mutation.error)}</p>}
        <div className="flex justify-end gap-2"><TextButton type="button" label={t('Cancelar')} disabled={mutation.busy} onClick={() => setOpen(false)}/><TextButton type="submit" label={t('Guardar cambios')} variant="primary" disabled={mutation.busy || position.trim() === (member.position ?? '')} aria-busy={mutation.busy}/></div>
      </form>
    </IntegrationDialog>}
  </>
}
