import { useBranding } from '../hooks/useBranding'
import { useTranslation } from '../hooks/useTranslation'
import TextButton from '../components/TextButton'
import IconButton from '../components/IconButton'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { RefreshCw, Eye, EyeOff, KeyRound } from 'lucide-react'
import AuthLayout from '../layouts/AuthLayout'
import SessionStatus from '../components/SessionStatus'
import { useAuth } from '../hooks/useAuth'
import { useAuthenticationMethods } from '../hooks/useAuthenticationMethods'
import { login } from '../services/login'
import { startOidcLogin } from '../services/startOidcLogin'
import { getReturnPath } from '../utils/getReturnPath'

export default function LoginPage() {
  const { t } = useTranslation()
  const brand = useBranding()
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destination = getReturnPath(location.state?.from)
  const { methods, error: methodsError, retry } = useAuthenticationMethods()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const request = useRef<AbortController | null>(null)
  useEffect(() => () => request.current?.abort(), [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || !username.trim() || !password) return
    const controller = new AbortController()
    request.current = controller
    setBusy(true)
    setError(null)
    try {
      const session = await login(username.trim(), password, controller.signal)
      if (controller.signal.aborted) return
      setPassword('')
      if (session.nextStep) {
        auth.acceptSession(session)
        navigate('/access', { replace: true })
        return
      }
      auth.acceptSession(session)
      navigate(destination, { replace: true })
    } catch (failure) {
      if (!controller.signal.aborted)
        setError(
          failure instanceof Error &&
            failure.name !== 'TypeError' &&
            failure.name !== 'TimeoutError'
            ? failure.message
            : 'No pudimos conectar con Nexora. Inténtalo de nuevo.',
        )
    } finally {
      if (!controller.signal.aborted) setBusy(false)
    }
  }
  async function corporateLogin(id: string) {
    if (busy) return
    const controller = new AbortController()
    request.current = controller
    setBusy(true)
    setError(null)
    try {
      const session = await startOidcLogin(id, controller.signal)
      if (!controller.signal.aborted) {
        if (session.nextStep) {
        auth.acceptSession(session)
        navigate('/access', { replace: true })
        return
      }
      auth.acceptSession(session)
        navigate(destination, { replace: true })
      }
    } catch (failure) {
      if (!controller.signal.aborted)
        setError(
          failure instanceof Error
            ? failure.message
            : 'No pudimos completar el acceso corporativo.',
        )
    } finally {
      if (!controller.signal.aborted) setBusy(false)
    }
  }

  if (auth.status === 'checking' || auth.status === 'unavailable')
    return <SessionStatus />
  if (auth.session?.nextStep) return <Navigate to="/access" replace />
  if (auth.status === 'authenticated')
    return <Navigate to={destination} replace />
  return (
    <AuthLayout>
      <h1
        id="login-title"
        className="mb-6 text-center text-2xl font-light tracking-tight"
      >
        {' '}
        {brand.name.trim() || 'Nexora'}
      </h1>
      <section className="auth-panel p-5" aria-labelledby="login-title">
        {auth.notice && (
          <p role="status" className="mt-5 text-sm text-warning">
            {t(auth.notice)}
          </p>
        )}
        {error && (
          <p
            id="login-error"
            role="alert"
            className="mt-5 rounded-lg border border-error/25 bg-error/5 p-3 text-sm text-error"
          >
            {t(error)}
          </p>
        )}
        {methodsError ? (
          <div role="alert" className="mt-6">
            <p className="text-sm text-error">{t(methodsError)}</p>
            <TextButton
              type="button"
              variant="outline"
              className="mt-4"
              onClick={retry}
              label={t('Reintentar')}
            >
              <RefreshCw size={16} aria-hidden="true" />
            </TextButton>
          </div>
        ) : !methods ? (
          <p role="status" className="mt-6 text-sm text-base-content/55">
            {' '}
            {t('Consultando opciones de acceso…')}{' '}
          </p>
        ) : (
          <>
            {methods.local_enabled && (
              <form
                className="flex flex-col gap-4"
                onSubmit={submit}
                aria-describedby={error ? 'login-error' : undefined}
              >
                <label className="flex flex-col gap-2 text-sm font-normal">
                  {' '}
                  {t('Usuario')}{' '}
                  <input
                    className="input auth-input w-full font-normal"
                    name="username"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    maxLength={256}
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    disabled={busy}
                  />
                </label>
                <div className="flex flex-col gap-2 text-sm font-normal">
                  <div className="flex items-center justify-between gap-2"><label htmlFor="login-password">{t('Contraseña')}</label><Link className="text-xs text-base-content/60 underline underline-offset-4 hover:text-base-content" to="/forgot-password">{t('¿Olvidaste tu contraseña?')}</Link></div>
                  <span className="input auth-input flex w-full items-center">
                    <input
                      className="min-w-0 flex-1 font-normal"
                      id="login-password"
                      name="password"
                      type={visible ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      maxLength={8192}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      disabled={busy}
                    />
                    <IconButton
                      type="button"
                      variant="ghost"
                      aria-pressed={visible}
                      onClick={() => setVisible(!visible)}
                      label={
                        visible
                          ? t('Ocultar contraseña')
                          : t('Mostrar contraseña')
                      }
                    >
                      {visible ? (
                        <EyeOff size={16} aria-hidden="true" />
                      ) : (
                        <Eye size={16} aria-hidden="true" />
                      )}
                    </IconButton>
                  </span>
                </div>
                <TextButton
                  type="submit"
                  variant="primary"
                  className="min-h-10 w-full"
                  disabled={busy || !username.trim() || !password}
                  aria-busy={busy}
                  label={busy ? t('Conectando…') : t('Iniciar sesión')}
                ></TextButton>
              </form>
            )}
            {!methods.local_enabled && methods.oidc.length === 0 && (
              <p role="alert" className="mt-6 text-sm text-base-content/60">
                {' '}
                {t(
                  'No hay métodos de acceso habilitados. Contacta a tu administrador.',
                )}{' '}
              </p>
            )}
          </>
        )}
      </section>
      {methods && methods.oidc.length > 0 && (
        <div className="auth-secondary mt-4 space-y-3 text-center">
          {methods.oidc.map(provider=><TextButton key={provider.id} type="button" className="w-full" variant="outline" disabled={busy} onClick={()=>void corporateLogin(provider.id)} label={t('Continuar con {0}',{'0':provider.name})}><KeyRound size={16} aria-hidden="true"/></TextButton>)}
        </div>
      )}
      <p className="mt-6 text-center text-sm">
        {t('¿Necesitas acceso?')}{' '}<span className="auth-muted">{t('Contacta a tu administrador.')}</span>
      </p>
    </AuthLayout>
  )
}
