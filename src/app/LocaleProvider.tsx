import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { LocaleContext } from './LocaleContext'
import { translate } from '../i18n/translate'
import { parseInstallationPreferences } from '../utils/parseInstallationPreferences'
import { subscribeInstallationPreferences } from '../services/subscribeInstallationPreferences'
import type { TranslationParams } from '../types/TranslationParams'
import type { InstallationPreferences } from '../types/InstallationPreferences'
export default function LocaleProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<InstallationPreferences['language']>(
    () => {
      try {
        return localStorage.getItem('nexora-language-cache') === 'en'
          ? 'en'
          : 'es'
      } catch {
        return 'es'
      }
    },
  )
  const revision = useRef(0)
  const applyPreferences = useCallback((value: InstallationPreferences) => {
    if (value.revision < revision.current) return
    const changed = revision.current !== value.revision
    revision.current = value.revision
    setLanguage(value.language)
    try {
      localStorage.setItem('nexora-language-cache', value.language)
    } catch {
      /* Cache is optional. */
    }
    if (changed)
      window.dispatchEvent(
        new CustomEvent('nexora:invalidate', {
          detail: { projectId: null, topics: ['preferences'] },
        }),
      )
  }, [])
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])
  useEffect(() => {
    const controller = new AbortController()
    const refresh = () =>
      fetch('/api/v1/public/preferences', {
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(15000),
        ]),
      })
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then((value) => {
          if (!controller.signal.aborted)
            applyPreferences(parseInstallationPreferences(value))
        })
        .catch(() => {})
    void refresh()
    void subscribeInstallationPreferences(controller.signal, applyPreferences)
    window.addEventListener('focus', refresh)
    return () => {
      controller.abort()
      window.removeEventListener('focus', refresh)
    }
  }, [applyPreferences])
  const value = useMemo(
    () => ({
      language,
      dateLocale: language === 'es' ? 'es-SV' : 'en-US',
      t: (source: string | null | undefined, params?: TranslationParams) =>
        translate(language, source, params),
      applyPreferences,
    }),
    [language, applyPreferences],
  )
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}
