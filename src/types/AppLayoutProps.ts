import type { ReactNode } from 'react'
import type { NavigationItem } from './NavigationItem'

export type AppLayoutProps = {
  active: NavigationItem
  children: ReactNode
  wide?: boolean
  hideContext?: boolean
}
