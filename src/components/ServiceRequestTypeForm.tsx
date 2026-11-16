import { useState } from 'react'
import { Save } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { writeServiceRequest } from '../services/writeServiceRequest'
import { requestCriticalities } from '../utils/requestCriticalities'
import type { ServiceRequestType } from '../types/ServiceRequestType'
import type { RequestSlaPolicy } from '../types/RequestSlaPolicy'
import type { WorkflowIcon } from '../types/WorkflowIcon'
import RequestTypeIconPicker from './RequestTypeIconPicker'
import RequestTypeGlyph from './RequestTypeGlyph'
import WorkflowStateColorPicker from './WorkflowStateColorPicker'
import Dropdown from './Dropdown'
import DataMessage from './DataMessage'
export default function ServiceRequestTypeForm({ item, onSaved }: { item?: ServiceRequestType; onSaved: () => void }) {
  const { t } = useTranslation()
  const [name, setName] = useState(item?.name ?? '')
  const [icon, setIcon] = useState<WorkflowIcon>(item?.icon ?? 'headset')
  const [color, setColor] = useState(item?.color ?? '#38BDF8')
  const [sla, setSla] = useState<Record<string, RequestSlaPolicy>>(item?.sla ?? {})
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  function update(level: string, field: keyof RequestSlaPolicy, value: string | number) {
    setSla(old => ({ ...old, [level]: { ...old[level]!, [field]: value } }))
  }
  async function save() {
    setBusy(true); setError('')
    try { await writeServiceRequest('/api/v1/requests/types', { ...(item ? { id: item.id, archived: item.archived, expected_revision: item.revision } : {}), name: name.trim(), icon, color, sla }); onSaved() }
    catch (e) { setError(e instanceof Error ? e.message : String(e)) }
    finally { setBusy(false) }
  }
  return <form onSubmit={e => { e.preventDefault(); if (!busy) void save() }}>
    <div className="mb-6 flex items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-2 text-sm font-medium"><RequestTypeGlyph icon={icon} color={color}/><span className="truncate">{name || t('Nuevo tipo')}</span></div><button className="btn btn-sm" disabled={busy || !name.trim()}><Save size={16}/>{t('Guardar cambios')}</button></div>
    <DataMessage error={error}/>
    <fieldset disabled={busy} className="min-w-0 space-y-8">
      <section><h2 className="mb-5 font-semibold">{t('Identidad')}</h2><div className="grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><div className="flex items-end gap-3"><RequestTypeIconPicker value={icon} onChange={setIcon}/><label className="flex min-w-0 flex-1 flex-col gap-2 text-sm">{t('Nombre')}<input required maxLength={120} className="input input-sm w-full" value={name} onChange={e => setName(e.target.value)}/></label></div><WorkflowStateColorPicker label="Color del tipo" value={color} onChange={value => setColor(value ?? '#38BDF8')}/></div></section>
      <section className="border-t border-base-300 pt-6"><h2 className="font-semibold">{t('SLA por criticidad')}</h2><p className="mt-2 max-w-2xl text-sm text-base-content/60">{t('Define primera atención y resolución. Usa horario laboral o atención continua 24/7 para los casos críticos.')}</p>
        <div className="mt-5 space-y-6">{requestCriticalities.map(c => <div key={c.value} className="grid items-start gap-4 lg:grid-cols-[minmax(130px,1fr)_3fr]">
          <label className="flex items-center justify-between gap-3 pt-1 text-sm"><span className={`badge badge-soft ${c.badge}`}>{t(c.label)}</span><input type="checkbox" className="toggle toggle-sm" aria-label={t(c.label)} checked={Boolean(sla[c.value])} onChange={e => setSla(old => { const next = { ...old }; if (e.target.checked) next[c.value] = { clock: c.value === 'critical' ? 'continuous' : 'business', response_minutes: 60, resolution_minutes: 480 }; else delete next[c.value]; return next })}/></label>
          {sla[c.value] ? <div className="grid min-w-0 gap-3 sm:grid-cols-3"><label className="flex min-w-0 flex-col gap-2 text-xs">{t('Cómputo del tiempo')}<Dropdown label={t('Cómputo del tiempo') + ' · ' + t(c.label)} value={sla[c.value]!.clock} options={[{value:'business',label:t('Horario laboral')},{value:'continuous',label:'24/7'}]} onChange={value => update(c.value, 'clock', value)}/></label>{(['response_minutes','resolution_minutes'] as const).map(field => <label key={field} className="flex min-w-0 flex-col gap-2 text-xs">{t(field === 'response_minutes' ? 'Primera atención (minutos)' : 'Resolución (minutos)')}<input className="input input-sm w-full" inputMode="numeric" pattern="[0-9]+" required value={sla[c.value]![field] || ''} onChange={e => { if (/^\d*$/.test(e.target.value)) update(c.value,field,Number(e.target.value)) }}/></label>)}</div> : <p className="pt-2 text-xs text-base-content/45">{t('Sin SLA')}</p>}
        </div>)}</div>
      </section>
    </fieldset>
  </form>
}
