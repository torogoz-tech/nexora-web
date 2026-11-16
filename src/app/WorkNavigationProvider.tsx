import { useWorkCatalog } from '../hooks/useWorkCatalog'
import { useLocation } from 'react-router'
import { parseVisibleTaskTypePage } from '../utils/parseVisibleTaskTypePage'
import { parseWorkflowPage } from '../utils/parseWorkflowPage'
import { WorkNavigationContext } from './WorkNavigationContext'
import type { WorkNavigationProviderProps } from '../types/WorkNavigationProviderProps'
export default function WorkNavigationProvider({
  area,
  children,
}: WorkNavigationProviderProps) {
  const { pathname } = useLocation()
  const category = area === 'work' ? pathname.split('/')[1] : area
  const types = useWorkCatalog(
    category === 'tasks' ? '/api/v1/me/task-types' : null,
    parseVisibleTaskTypePage,
  )
  const workflows = useWorkCatalog(
    category === 'boards' ? '/api/v1/workflows' : null,
    parseWorkflowPage,
  )
  return (
    <WorkNavigationContext value={{ types, workflows }}>
      {children}
    </WorkNavigationContext>
  )
}
