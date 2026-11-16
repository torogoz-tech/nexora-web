vi.mock('../src/hooks/useAuth',()=>({useAuth:()=>({session:null})}))
import { afterEach, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { parseMemberRoleAssignment } from '../src/utils/parseMemberRoleAssignment'
import { parseOrganizationMembers } from '../src/utils/parseOrganizationMembers'
import { getMemberRole } from '../src/services/getMemberRole'
import { writeMemberRole } from '../src/services/writeMemberRole'
import { sessionStore } from '../src/app/sessionStore'
import MemberProfile from '../src/components/MemberProfile'
const member = { id: 'person', name: 'Ana', username: 'ana', email: '', active: true }
const assignment = { role: 'developer', all_projects: false, project_ids: ['project'], revision: 4 }
afterEach(() => { sessionStore.current = null; vi.unstubAllGlobals() })
it('accepts predefined roles and rejects malformed assignment metadata', () => {
  for (const role of ['developer', 'pmo', 'manager', 'super_admin', null]) expect(parseMemberRoleAssignment({ ...assignment, role }).role).toBe(role)
  for (const change of [{ role: 'admin' }, { revision: -1 }, { revision: 0.5 }, { all_projects: 'true' }, { project_ids: [1] }, { role: undefined }]) expect(() => parseMemberRoleAssignment({ ...assignment, ...change })).toThrow()
})
it('keeps legacy roles unknown and validates optional directory roles', () => {
  const legacy = parseOrganizationMembers([member])[0]!
  expect(legacy.role).toBeUndefined()
  expect(renderToStaticMarkup(createElement(MemberProfile, { member: legacy, onClose: () => {} }))).toContain('Rol no disponible')
  const current = parseOrganizationMembers([{ ...member, role: 'pmo', role_all_projects: true, role_project_ids: [], role_revision: 2 }])[0]!
  expect(current.role).toBe('pmo')
  expect(current.role_all_projects).toBe(true)
  expect(renderToStaticMarkup(createElement(MemberProfile, { member: current, onClose: () => {} }))).toContain('PMO')
  for (const change of [{ role: 'admin' }, { role_revision: -1 }, { role_all_projects: 1 }, { role_project_ids: [1] }]) expect(() => parseOrganizationMembers([{ ...member, ...change }])).toThrow()
})
it('reads the role from its authoritative endpoint', async () => {
  sessionStore.current = null
  const request = vi.fn().mockResolvedValue(new Response(JSON.stringify(assignment)))
  vi.stubGlobal('fetch', request)
  expect(await getMemberRole('person', new AbortController().signal)).toEqual(assignment)
  expect(request.mock.calls[0]![0]).toBe('/api/v1/settings/members/person/role')
})
it('uses PUT, observed revision and an idempotency key when assigning a role', async () => {
  sessionStore.current = null
  const request = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
  vi.stubGlobal('fetch', request)
  const body = { role: 'manager' as const, all_projects: true, project_ids: [], expected_revision: 4 }
  await writeMemberRole('person', body, new AbortController().signal, 'stable-role-key')
  const [path, options] = request.mock.calls[0]!
  expect(path).toBe('/api/v1/settings/members/person/role')
  expect(options.method).toBe('PUT')
  expect(JSON.parse(options.body)).toEqual(body)
  expect(new Headers(options.headers).get('Idempotency-Key')).toBe('stable-role-key')
})
it('explains denied access and rejects revision conflicts without silent success', async () => {
  sessionStore.current = null
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 403 })))
  await expect(getMemberRole('person', new AbortController().signal)).rejects.toThrow('superadministrador humano')
  const body = { role: 'developer' as const, all_projects: false, project_ids: ['project'], expected_revision: 4 }
  await expect(writeMemberRole('person', body, new AbortController().signal, 'key')).rejects.toThrow('superadministrador humano')
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 409 })))
  await expect(writeMemberRole('person', body, new AbortController().signal, 'key')).rejects.toThrow('El rol cambió')
})
