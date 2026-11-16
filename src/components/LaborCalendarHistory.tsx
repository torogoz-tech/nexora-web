import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import type { LaborCalendarHistoryProps } from '../types/LaborCalendarHistoryProps'
import Dropdown from './Dropdown'
import LaborCalendarAgenda from './LaborCalendarAgenda'
export default function LaborCalendarHistory({ data, busy, initialMemberId, onAction }: LaborCalendarHistoryProps) {
 const { t } = useTranslation()
 const [selected, setSelected] = useState(initialMemberId ?? '')
 const [section, setSection] = useState<'members' | 'holidays'>('members')
 // Only identities already returned by the authorized calendar endpoint can be selected.
 const memberId = data.members.some(member => member.id === selected) ? selected : data.members[0]?.id ?? ''
 const member = data.members.find(value => value.id === memberId)
 const visible = { ...data, requests: data.requests.filter(request => request.actor_id === memberId), holidays: [] }
 return <div className="min-w-0 space-y-5">
  <div role="tablist" aria-label={t('Historial del calendario')} className="tabs tabs-border w-fit">
   <button type="button" role="tab" aria-selected={section === 'members'} className={`tab ${section === 'members' ? 'tab-active' : ''}`} onClick={() => setSection('members')}>{t('Por desarrollador')}</button>
   <button type="button" role="tab" aria-selected={section === 'holidays'} className={`tab ${section === 'holidays' ? 'tab-active' : ''}`} onClick={() => setSection('holidays')}>{t('Feriados y asuetos')}</button>
  </div>
  {section === 'members' ? member ? <>
   <label className="flex max-w-sm flex-col gap-2 text-sm">{t('Miembro')}<Dropdown label={t('Miembro')} value={memberId} options={data.members.map(item => ({value:item.id,label:item.name}))} onChange={setSelected}/></label>
   <LaborCalendarAgenda key={memberId} data={visible} busy={busy} selectedDate={null} title={t('Historial de {name}', {name:member.name})} kind="requests" standalone onShowAll={() => {}} onAction={onAction}/>
  </> : <p className="py-6 text-sm text-base-content/50">{t('No hay miembros disponibles.')}</p> : <LaborCalendarAgenda data={{...data,requests:[]}} busy={busy} selectedDate={null} title={t('Feriados y asuetos de la organización')} kind="holidays" standalone onShowAll={() => {}} onAction={onAction}/>}
 </div>
}
