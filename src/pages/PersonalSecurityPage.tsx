import { useContext, useState } from 'react'
import { ShieldCheck, KeyRound, RefreshCw } from 'lucide-react'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { useAuth } from '../hooks/useAuth'
import { useApiData } from '../hooks/useApiData'
import { useTranslation } from '../hooks/useTranslation'
import { apiFetch } from '../services/apiFetch'
import { parseTotpStatus } from '../utils/parseTotpStatus'
import { parsePasskeyStatus } from '../utils/parsePasskeyStatus'
import { decodeBase64Url, serializePasskeyRegistration } from '../utils/passkeyResponse'
import DataMessage from '../components/DataMessage'
import IconButton from '../components/IconButton'

export default function PersonalSecurityPage() {
  const { t } = useTranslation()
  const { session, logout } = useAuth()
  const permissions = useContext(WorkspacePermissionsContext)
  const actorId = session?.actorId
  const remote = useApiData(actorId ? `/api/v1/members/${encodeURIComponent(actorId)}/totp` : null, parseTotpStatus)
  const passkeys = useApiData('/api/v1/me/passkeys', parsePasskeyStatus)
  const [busy, setBusy] = useState(false)
  const [passkeyBusy, setPasskeyBusy] = useState(false)
  const passkeySupported = typeof window !== 'undefined' && !!window.PublicKeyCredential && !!navigator.credentials?.create
  const [error, setError] = useState('')
  const canManageExemption = permissions?.role === 'super_admin'
  async function changeExemption() {
    if (!remote.data || !actorId || busy || !canManageExemption) return
    setBusy(true)
    setError('')
    try {
      const response = await apiFetch(`/api/v1/members/${encodeURIComponent(actorId)}/totp`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ exempt: !remote.data.exempt }) })
      if (!response.ok) throw Error(t('No pudimos actualizar la exención.'))
      remote.reload()
      await logout()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('No pudimos actualizar la exención.'))
    } finally {
      setBusy(false)
    }
  }
  async function registerPasskey() {
    if (passkeyBusy || !passkeySupported) return
    setPasskeyBusy(true)
    setError('')
    try {
      const started = await apiFetch('/api/v1/me/passkeys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      if (!started.ok) throw Error(t('No pudimos iniciar el registro de Passkey.'))
      const challenge = await started.json() as { ceremony_id: string; challenge: PublicKeyCredentialCreationOptions & { challenge: string; user: PublicKeyCredentialUserEntity & { id: string }; excludeCredentials?: Array<PublicKeyCredentialDescriptor & { id: string }> } }
      const wireChallenge = challenge.challenge as unknown as { challenge: string; user: PublicKeyCredentialUserEntity & { id: string }; excludeCredentials?: Array<PublicKeyCredentialDescriptor & { id: string }> }
      const publicKey = { ...wireChallenge, challenge: decodeBase64Url(wireChallenge.challenge), user: { ...wireChallenge.user, id: decodeBase64Url(wireChallenge.user.id) }, excludeCredentials: wireChallenge.excludeCredentials?.map(item => ({ ...item, id: decodeBase64Url(item.id) })) } as PublicKeyCredentialCreationOptions
      const credential = await navigator.credentials.create({ publicKey })
      if (!(credential instanceof PublicKeyCredential)) throw Error(t('El navegador no devolvió una Passkey válida.'))
      const finished = await apiFetch(`/api/v1/me/passkeys/register/${encodeURIComponent(challenge.ceremony_id)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ response: serializePasskeyRegistration(credential), label: t('Passkey personal') }) })
      if (!finished.ok) throw Error(t('No pudimos completar el registro de Passkey.'))
      passkeys.reload()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('No pudimos registrar la Passkey.'))
    } finally {
      setPasskeyBusy(false)
    }
  }
  async function changePrimaryMethod(method: 'none' | 'totp' | 'passkey') {
    if (busy || !remote.data || !passkeys.data) return
    setBusy(true)
    setError('')
    try {
      const response = await apiFetch('/api/v1/me/security-method', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ method }) })
      if (!response.ok) throw Error(t('No pudimos actualizar el método de seguridad.'))
      remote.reload()
      passkeys.reload()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('No pudimos actualizar el método de seguridad.'))
    } finally {
      setBusy(false)
    }
  }
  return <section className="min-w-0 flex-1 pb-12" aria-label={t('Seguridad personal')}>
    <header className="mb-7 flex items-center justify-between gap-3"><div className="flex items-center gap-3"><ShieldCheck size={20} className="text-primary" /><div><h1 className="text-xl font-semibold">{t('Seguridad personal')}</h1><p className="mt-1 text-sm text-base-content/55">{t('Administra cómo proteges tu cuenta al iniciar sesión.')}</p></div></div><IconButton label={t('Actualizar seguridad personal')} disabled={remote.loading} onClick={remote.reload}><RefreshCw size={16} /></IconButton></header>
    <DataMessage loading={remote.loading} error={remote.error} onRetry={remote.reload} />
    {remote.data && <div className="max-w-3xl space-y-5">
      <section className="rounded-2xl border border-base-300 bg-base-200/20 p-5" aria-labelledby="personal-totp-title"><div className="flex items-start gap-3"><KeyRound size={19} className="mt-0.5 text-primary" /><div className="min-w-0 flex-1"><h2 id="personal-totp-title" className="font-semibold">{t('Código de autenticación')}</h2><p className="mt-2 text-sm text-base-content/60">{remote.data.enrolled ? t('Autenticador configurado') : t('Autenticador pendiente de configurar')}</p>{remote.data.enrolled ? <p className="mt-2 text-xs text-base-content/50">{t('Tu aplicación de autenticación se solicitará al iniciar sesión cuando la política de la organización lo requiera.')}</p> : <p className="mt-2 text-xs text-base-content/50">{t('Puedes configurarlo desde la pantalla de protección que aparece después de iniciar sesión.')}</p>}</div></div>{remote.data.enrolled && <label className="mt-5 flex items-center justify-between gap-3 border-t border-base-300 pt-4 text-sm">{t('Usar como método principal')}<input type="checkbox" className="toggle toggle-sm" checked={remote.data!.active_method === 'totp'} disabled={busy} onChange={() => void changePrimaryMethod(remote.data!.active_method === 'totp' ? 'none' : 'totp')} /></label>}{canManageExemption && <><label className="mt-5 flex items-center justify-between gap-3 border-t border-base-300 pt-4 text-sm">{t('Exento de TOTP')}<input type="checkbox" className="toggle toggle-sm" checked={remote.data.exempt} disabled={busy} onChange={() => void changeExemption()} /></label><p className="mt-2 text-xs text-base-content/50">{t('Solo el superadministrador puede conceder la exención. Al cambiarla se cierran tus sesiones.')}</p></>}</section>
      <section className="rounded-2xl border border-base-300 bg-base-200/20 p-5" aria-labelledby="personal-passkey-title"><div className="flex items-start gap-3"><ShieldCheck size={19} className="mt-0.5 text-primary" /><div className="min-w-0 flex-1"><h2 id="personal-passkey-title" className="font-semibold">{t('Passkey')}</h2><p className="mt-2 text-sm text-base-content/60">{passkeys.data?.enabled ? t('Passkey configurada') : t('No hay una Passkey configurada')}</p><p className="mt-2 text-xs text-base-content/50">{t('Usa la biometría o el PIN de tu dispositivo para iniciar sesión sin contraseña.')}</p>{passkeys.data?.credentials.map(credential => <p key={credential.id} className="mt-3 text-xs text-base-content/50">{credential.label} · {new Date(credential.created_at).toLocaleDateString()}</p>)}{passkeys.data?.enabled && <label className="mt-5 flex items-center justify-between gap-3 border-t border-base-300 pt-4 text-sm">{t('Usar como método principal')}<input type="checkbox" className="toggle toggle-sm" checked={passkeys.data.active_method === 'passkey'} disabled={busy} onChange={() => void changePrimaryMethod(passkeys.data?.active_method === 'passkey' ? 'none' : 'passkey')} /></label>}<button type="button" className="btn btn-sm btn-primary mt-4" disabled={passkeyBusy || !passkeySupported} onClick={() => void registerPasskey()}>{passkeyBusy ? t('Configurando…') : t('Configurar Passkey')}</button>{!passkeySupported && <p className="mt-2 text-xs text-warning">{t('Este navegador no admite Passkey.')}</p>}</div></div></section>
    </div>}
    {error && <p role="alert" className="mt-4 text-sm text-error">{error}</p>}
  </section>
}
