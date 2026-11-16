import { createContext } from 'react'
import type { WorkNavigationValue } from '../types/WorkNavigationValue'
export const WorkNavigationContext = createContext<WorkNavigationValue | null>(
  null,
)
