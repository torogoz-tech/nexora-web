import type { ReactNode } from 'react'
import type { NavigationSubItem } from './NavigationSubItem'
export type SettingsContextNavigationProps = {heading: ReactNode;items: NavigationSubItem[];onClose:()=>void}
