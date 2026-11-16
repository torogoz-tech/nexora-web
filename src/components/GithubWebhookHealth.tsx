import { useEffect, useState } from 'react'
import { RefreshCw, Webhook } from 'lucide-react'
import { apiFetch } from '../services/apiFetch'
import { useTranslation } from '../hooks/useTranslation'
import { getGithubWebhookHealth } from '../services/getGithubWebhookHealth'
import type { GithubWebhookHealth as Health } from '../types/GithubWebhookHealth'
import RowAction from './RowAction'
export default function GithubWebhookHealth() {
  const { t } = useTranslation()
  const [health, setHealth] = useState<Health | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    void getGithubWebhookHealth(controller.signal).then(value => { if (!controller.signal.aborted) setHealth(value) }).catch(() => { if (!controller.signal.aborted) setError(true) })
    return () => controller.abort()
  }, [])
  async function check() {
    setBusy(true); setError(false)
    try {
      const response = await apiFetch('/api/v1/git/github/webhook-health', { method: 'POST' }, 30000)
      setHealth(await getGithubWebhookHealth())
      if (!response.ok) setError(true)
    } catch { setError(true) } finally { setBusy(false) }
  }
  const checked = health?.status.current && health.status.configuration_verified
  return <section className="mt-8 border-t border-base-300 pt-6">
    <header className="mb-3 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 font-semibold"><Webhook size={18}/>{t('Recepción de cambios')}</h2>
      <RowAction label={t('Comprobar y sincronizar webhook')} disabled={busy} onClick={() => void check()}><RefreshCw size={16} className={busy ? 'animate-spin' : undefined}/></RowAction>
    </header>
    <p className="text-sm text-base-content/65">{t('El webhook es compartido por la GitHub App y sus repositorios autorizados.')}</p>
    <p className="mt-3 text-sm">{t(checked ? 'URL y secreto sincronizados con GitHub.' : 'La configuración del webhook necesita comprobarse.')}</p>
    {health?.status.url && <p className="mt-2 break-all font-mono text-xs text-base-content/60">{health.status.url}</p>}
    {checked && !health.status.push_subscribed && <p className="mt-3 text-sm text-warning">{t('Activa el evento Push en la configuración de tu GitHub App.')}</p>}
    <p className="mt-3 text-xs text-base-content/60">{health?.last_delivery_at ? `${t('Última entrega recibida')}: ${new Date(health.last_delivery_at).toLocaleString()}` : t('Todavía no se ha recibido una entrega de GitHub. La comprobación no simula un push.')}</p>
    {error && <p role="alert" className="mt-3 text-sm text-error">{t('No pudimos comprobar el webhook. Revisa la GitHub App y vuelve a intentarlo.')}</p>}
  </section>
}
