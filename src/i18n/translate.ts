import en from './en.json'
import es from './es.json'
import type { Language } from '../types/Language'
import type { TranslationParams } from '../types/TranslationParams'
export function translate(
  language: Language,
  source: string | null | undefined,
  params: TranslationParams = {},
) {
  if (!source) return ''
  const dictionary: Record<string, string> = language === 'en' ? en : es
  const text = Object.hasOwn(dictionary, source) ? dictionary[source] : source
  return text.replace(/\{([^{}]+)\}/g, (match, key: string) =>
    key in params ? String(params[key] ?? '') : match,
  )
}
