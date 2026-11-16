import type { InstallationPreferences } from './InstallationPreferences'
import type { TranslationParams } from './TranslationParams'
export type LocaleContextValue = {
  language: InstallationPreferences['language']
  dateLocale: string
  t: (source: string | null | undefined, params?: TranslationParams) => string
  applyPreferences: (preferences: InstallationPreferences) => void
}
