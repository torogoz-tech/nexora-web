import type { EffectivePermissions } from '../types/EffectivePermissions'
export function canOpenWorkspacePath(path: string, permissions: EffectivePermissions) {
  if (permissions.role === 'user' || permissions.role === 'supervisor') return path.startsWith('/requests') || path.startsWith('/settings/mcp') || path === '/settings/security' || path === '/profile'
  if((path === '/settings/request-types' || path.startsWith('/settings/request-types/')) || path === '/requests/types') return ['manager','super_admin'].includes(permissions.role ?? '')
  if(path === '/requests' || path.startsWith('/requests/')) return permissions.role !== null
  if (path === '/team/members') return permissions.role !== null
  if (path === '/notifications' || path === '/profile' || path === '/profile/mcp-history') return true
  const has = (capability: string, installation = false) => permissions.grants.some(grant => grant.capability === capability && (!installation || grant.project_id === null))
  if (path === '/settings/mcp' || path === '/settings/mcp/history') return true
  if (path === '/settings/security') return permissions.role !== null
  if (path === '/settings/oidc') return has('installation:manage', true)
  if (path === '/settings/accounts' || path === '/settings/notifications') return true
  if (path === '/settings/task-types') return has('task-types:read',true) || has('installation:manage',true)
  if (path.startsWith('/settings/analysis-profiles')) return has('analysis-profiles:read',true) || has('installation:manage',true)
  if (path === '/team/projects') return has('projects:read') || has('installation:manage',true)
  if (path === '/settings/projects') return has('projects:read') || has('installation:manage',true)
  if (path === '/settings/members') return has('members:read',true) || has('actors:manage',true) || has('installation:manage',true)
  if (path.startsWith('/settings/members/')) return permissions.role !== null
  if (path.startsWith('/settings')) return has('installation:manage', true)
  if (path === '/code/analyses') return ['technical_lead', 'pmo', 'manager', 'super_admin'].some(role => role === permissions.role)
  if (path.startsWith('/code')) return has('repositories:read')
  if (path.startsWith('/knowledge')) return has('organization-knowledge:read') || has('documents:read') || has('knowledge:read')
  if (path.startsWith('/projects') || path.startsWith('/organization')) return has('projects:read') || has('installation:manage',true)
  if (path.startsWith('/tasks')) return permissions.role !== null || has('tasks:read')
  if (path.startsWith('/boards')) return has('tasks:read')
  if (path.startsWith('/calendar/')) return permissions.role !== null
  if (['/calendar', '/ratings', '/overtime', '/approvals'].includes(path)) return permissions.role !== null
  return false
}
