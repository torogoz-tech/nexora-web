import { createContext } from 'react'
import { translate } from '../i18n/translate'
import type { LocaleContextValue } from '../types/LocaleContextValue'
export const LocaleContext = createContext<LocaleContextValue>({
  language: 'es',
  dateLocale: 'es-SV',
  t: (source, params) => translate('es', source, params),
  applyPreferences: () => {},
})
