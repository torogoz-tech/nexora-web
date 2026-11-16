import { navigation as defaultNavigation } from '../app/navigation'
import { useLocation } from 'react-router'
import { useWorkspaceNavigation } from './useWorkspaceNavigation'
export function useNavigation() {
  const { pathname } = useLocation()
  const navigation = useWorkspaceNavigation()
  return (
    navigation.find((item) => item.items.some(page => pathname === page.path || (page.path !== '/settings' && pathname.startsWith(page.path + '/')))) ??
    navigation.find((item) => item.id === pathname.split('/')[1]) ??
    navigation[0] ?? defaultNavigation[0]!
  )
}
