import { useContext } from 'react'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
export function useWorkspacePermission(capability: string, project?: string) {
  const permissions = useContext(WorkspacePermissionsContext)
  return permissions?.grants.some(grant => grant.capability === capability && (grant.project_id === null || (project === undefined || grant.project_id === project))) ?? false
}
