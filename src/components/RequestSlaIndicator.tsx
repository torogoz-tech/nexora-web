import { useTranslation } from '../hooks/useTranslation'
import type { ServiceRequest } from '../types/ServiceRequest'
export default function RequestSlaIndicator({ request }: { request: ServiceRequest }) {
  const { t } = useTranslation()
  if (!request.sla) return <span className="text-xs text-base-content/50">{t('Sin SLA configurado')}</span>
  const sla = request.sla
  return <dl className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
    {(['response', 'resolution'] as const).map(kind => <div key={kind}><dt className="text-base-content/60">{t(kind === 'response' ? 'Primera atención' : 'Resolución')} · {t(sla.clock === 'continuous' ? '24/7' : 'Horario laboral')}</dt><dd className={sla[`${kind}_status`] === 'breached' ? 'text-error' : sla[`${kind}_status`] === 'met' ? 'text-success' : ''}>{t(({ running: 'En plazo', met: 'Cumplido', breached: 'Vencido' })[sla[`${kind}_status`]])} · {new Date(sla[`${kind}_due_at`]).toLocaleString()}</dd></div>)}
  </dl>
}
