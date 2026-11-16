import { useContext } from 'react'
import { WorkspaceNavigationContext } from '../app/WorkspaceNavigationContext'
export function useWorkspaceNavigation() {
  return useContext(WorkspaceNavigationContext)
}
