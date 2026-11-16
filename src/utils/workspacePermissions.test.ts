import { describe, expect, it } from 'vitest'
import { canOpenWorkspacePath } from './canOpenWorkspacePath'
import { parseEffectivePermissions } from './parseEffectivePermissions'
import { parseOrganizationMembers } from './parseOrganizationMembers'
import { memberRoleLabel } from './memberRoleLabel'
import { workspaceNavigationForRole } from './workspaceNavigationForRole'
describe('effective workspace permissions', () => {
  const lead = parseEffectivePermissions({ actor_id: 'lead', role: 'technical_lead', grants: [{ capability: 'tasks:read', project_id: 'assigned-project' }, { capability: 'repositories:read', project_id: 'assigned-project' }] })
  it('lets scoped leads use work and code but denies installation administration', () => {
    expect(canOpenWorkspacePath('/tasks', lead)).toBe(true)
    expect(canOpenWorkspacePath('/code', lead)).toBe(true)
    expect(canOpenWorkspacePath('/settings/members', lead)).toBe(false)
    expect(canOpenWorkspacePath('/settings/workflows', lead)).toBe(false)
    expect(canOpenWorkspacePath('/profile', lead)).toBe(true)
    expect(canOpenWorkspacePath('/knowledge', lead)).toBe(false)
    expect(canOpenWorkspacePath('/settings', { ...lead, grants: [{ capability: 'installation:manage', project_id: 'project' }] })).toBe(false)
  })
  it('requires server grants rather than inferring permissions from role names', () => {
    expect(canOpenWorkspacePath('/settings', { ...lead, role: 'super_admin', grants: [] })).toBe(false)
    expect(canOpenWorkspacePath('/settings', { ...lead, grants: [{ capability: 'installation:manage', project_id: null }] })).toBe(true)
    expect(() => parseEffectivePermissions({ actor_id: 'lead', role: 'invented', grants: [] })).toThrow()
  })
  it('keeps the job position independent from a recognized technical-lead role', () => {
    const member = parseOrganizationMembers([{ id: 'lead', name: 'Ana', username: 'ana', email: '', active: true, role: 'technical_lead', position: 'Staff Engineer', position_revision: 3 }])[0]
    expect(member.position).toBe('Staff Engineer')
    expect(member.role).toBe('technical_lead')
    expect(memberRoleLabel(member.role)).toBe('Líder Técnico')
  })
})

it('shows global configuration to managers from their effective grants, including repositories',()=>{
 const permissions=parseEffectivePermissions({actor_id:'manager',role:'manager',grants:[{capability:'installation:manage',project_id:null},{capability:'connections:manage',project_id:null},{capability:'repositories:read',project_id:null}]})
 for(const path of ['/settings','/settings/projects','/settings/members','/settings/workflows','/settings/labor-calendar','/settings/openai','/settings/email','/settings/integrations','/code'])expect(canOpenWorkspacePath(path,permissions)).toBe(true)
 expect(canOpenWorkspacePath('/settings',{...permissions,grants:[]})).toBe(false)
})

it('opens technical catalogs with read grants without exposing administrative screens',()=>{
 const permissions=parseEffectivePermissions({actor_id:'lead',role:'technical_lead',grants:[{capability:'connections:read',project_id:null},{capability:'repositories:read',project_id:null},{capability:'task-types:read',project_id:null},{capability:'analysis-profiles:read',project_id:null},{capability:'organization-knowledge:read',project_id:null}]})
 for(const path of ['/settings/accounts','/code','/settings/task-types','/settings/analysis-profiles','/knowledge'])expect(canOpenWorkspacePath(path,permissions)).toBe(true)
 for(const path of ['/settings','/settings/integrations','/settings/task-types/new','/settings/members'])expect(canOpenWorkspacePath(path,permissions)).toBe(false)
})

it('allows a technical lead to read projects and members without granting project writes',()=>{
 const permissions=parseEffectivePermissions({actor_id:'lead',role:'technical_lead',grants:[{capability:'projects:read',project_id:'project'},{capability:'members:read',project_id:null}]})
 expect(canOpenWorkspacePath('/settings/projects',permissions)).toBe(true)
 expect(canOpenWorkspacePath('/settings/members',permissions)).toBe(true)
 expect(canOpenWorkspacePath('/settings',{...permissions})).toBe(false)
})

it('places role-appropriate administration in Equipo and isolates OIDC from General',()=>{
 const manager=parseEffectivePermissions({actor_id:'manager',role:'manager',grants:[{capability:'installation:manage',project_id:null},{capability:'projects:read',project_id:null}]})
 const team=workspaceNavigationForRole(manager.role).find(item=>item.id==='work')
 expect(team?.label).toBe('Equipo')
 expect(team?.items.map(item=>item.path)).toEqual(expect.arrayContaining(['/team/projects','/team/members','/settings/labor-calendar','/settings/products']))
 expect(canOpenWorkspacePath('/settings/oidc',manager)).toBe(true)
 expect(canOpenWorkspacePath('/settings/oidc',{...manager,grants:[]})).toBe(false)
})
