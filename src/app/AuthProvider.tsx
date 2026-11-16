import { useEffect, useRef, useState } from 'react'
import { authContext } from './authContext'
import { setSession } from '../services/setSession'
import { browserHeaders } from '../services/browserHeaders'
import { readBrowserSession } from '../services/readBrowserSession'
import { notifySessionChanged } from '../services/notifySessionChanged'
import type { Session } from '../types/Session'
import type { AuthContextValue } from '../types/AuthContextValue'
import type { AuthProviderProps } from '../types/AuthProviderProps'

export default function AuthProvider({ children }: AuthProviderProps) {
  const [session, updateSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<AuthContextValue['status']>('checking')
  const [notice, setNotice] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const current = useRef<Session | null>(null)
  const generation = useRef(0)
  function apply(value: Session | null) {
    current.current = value
    setSession(value)
    updateSession(value)
    setStatus(value && !value.nextStep ? 'authenticated' : 'anonymous')
  }
  function acceptSession(value: Session) {
    generation.current++
    apply(value)
    setNotice(null)
    notifySessionChanged()
  }
  async function logout() {
    generation.current++
    try {
      const response = await fetch('/api/v1/auth/session', { method: 'DELETE', credentials: 'same-origin', headers: browserHeaders(), signal: AbortSignal.timeout(10000) })
      if (!response.ok) throw Error('logout-unavailable')
      apply(null)
      setNotice(null)
      notifySessionChanged()
    } catch { setNotice('No pudimos cerrar la sesión. Inténtalo de nuevo.') }
  }
  useEffect(() => {
    const controller = new AbortController()
    const request = ++generation.current
    readBrowserSession(AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]))
      .then(value => { if (!controller.signal.aborted && generation.current === request) apply(value) })
      .catch(() => {
        if (controller.signal.aborted || generation.current !== request) return
        // A failed focus refresh must not unmount an already authenticated workspace.
        // The server still rejects revoked sessions, and expired sessions cannot stay open.
        if (!current.current || current.current.expiresAt <= Date.now()) setStatus('unavailable')
      })
    return () => controller.abort()
  }, [attempt])
  useEffect(() => {
    const refresh = () => setAttempt(value => value + 1)
    const changed = (event: StorageEvent) => { if (event.key === 'nexora:auth-change' || event.key === null) refresh() }
    const unauthorized = (event: Event) => {
      if ((event as CustomEvent<string>).detail === current.current?.sessionId) refresh()
    }
    const interval = window.setInterval(() => {
      if (current.current && current.current.expiresAt <= Date.now()) { current.current = null; refresh() }
    }, 1000)
    window.addEventListener('storage', changed)
    window.addEventListener('focus', refresh)
    window.addEventListener('nexora:unauthorized', unauthorized)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('storage', changed)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('nexora:unauthorized', unauthorized)
    }
  }, [])
  return <authContext.Provider value={{ session, status, notice, acceptSession, logout, retry: () => { setStatus('checking'); setAttempt(value => value + 1) } }}>{children}</authContext.Provider>
}
