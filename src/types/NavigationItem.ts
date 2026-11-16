import type { LucideIcon } from 'lucide-react'
import type { NavigationSubItem } from './NavigationSubItem'

export type NavigationItem = {
  id: string
  label: string
  icon: LucideIcon
  description: string
  items: NavigationSubItem[]
}
