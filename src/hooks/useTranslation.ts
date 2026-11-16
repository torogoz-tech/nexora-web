import { useContext } from 'react'
import { LocaleContext } from '../app/LocaleContext'
export function useTranslation() {
  return useContext(LocaleContext)
}
