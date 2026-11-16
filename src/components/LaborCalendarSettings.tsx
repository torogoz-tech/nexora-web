import { useTranslation } from '../hooks/useTranslation'
import type { LaborCalendarSettingsProps } from '../types/LaborCalendarSettingsProps'
import Dropdown from './Dropdown'
import AutosaveTextField from './AutosaveTextField'
export default function LaborCalendarSettings({ data, busy, onSave }: LaborCalendarSettingsProps) {
  const { t } = useTranslation()
  return <div className="space-y-8">
    <section>
      <h2 className="mb-4 font-semibold">{t('Inicio de las calificaciones')}</h2>
      <div className="grid items-start gap-5 sm:grid-cols-2"><div><p className="text-sm">{t('Calcular calificaciones desde')}</p><p className="mt-2 text-xs text-base-content/55">{t('Desde esta fecha se revisa la actividad diaria de los desarrolladores. Los días anteriores no se califican. No afecta las fechas de vacaciones y permisos.')}</p></div><AutosaveTextField autoSave type="date" label={t('Calcular calificaciones desde')} value={data.settings.starts_on} saveBlocked={busy} onCommit={starts_on => onSave('/api/v1/settings/labor-calendar', { starts_on, expected_revision: data.settings.revision })}/></div>
    </section>
    <section className="border-t border-base-300 pt-6"><h2 className="font-semibold">{t('Responsables de aprobación')}</h2><p className="mt-2 text-sm text-base-content/55">{t('Asigna un PMO, gerente o líder técnico para revisar vacaciones y permisos. Si no hay responsable, cualquier gerente o líder técnico de la organización puede aprobar. Nadie puede aprobar sus propias solicitudes.')}</p><ul className="mt-4 divide-y divide-base-300">{data.members.map(member => <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><span className="text-sm">{member.name}</span><Dropdown label={`${t('Responsable de aprobación')}: ${member.name}`} className="w-64 max-w-full" value={member.approver_id || ''} disabled={busy} options={[{ value: '', label: t('Sin responsable') }, ...data.approvers.filter(approver => approver.id !== member.id).map(approver => ({ value: approver.id, label: approver.name }))]} onChange={value => { void onSave(`/api/v1/settings/labor-calendar/members/${encodeURIComponent(member.id)}/approver`, { approver_id: value || null, expected_revision: member.approver_revision }) }} /></li>)}</ul>{!data.members.length && <p className="mt-4 text-sm text-base-content/50">{t('No hay miembros disponibles.')}</p>}</section>
  </div>
}
