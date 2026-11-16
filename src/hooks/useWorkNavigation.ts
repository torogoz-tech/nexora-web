import { useContext } from 'react'
import { WorkNavigationContext } from '../app/WorkNavigationContext'
export function useWorkNavigation() {
  const value = useContext(WorkNavigationContext)
  if (!value)
    throw new Error('El contexto de navegación del trabajo no está disponible.')
  return value
}
