// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { WorkspacePermissionsContext } from '../src/app/WorkspacePermissionsContext'
import RepositoryBranchProtection from '../src/components/RepositoryBranchProtection'
import { parseRepositoryBranchProtection } from '../src/utils/parseRepositoryBranchProtection'
const api = vi.hoisted(() => ({ read: vi.fn(), mutate: vi.fn() }))
vi.mock('../src/services/readApiJson', () => ({ readApiJson: api.read }))
vi.mock('../src/services/apiFetch', () => ({ apiFetch: api.mutate }))
const plan = { provider: 'github', branches: ['main', 'develop', 'stage', 'preprod'].map(name => ({ name, status: 'existing', verified: false })), verified: false, requires_human_merge_gate: true, limitations: [] }
const empty = { revision: 0, status: 'unconfigured', required_checks: [], plan: null, result: null }
beforeEach(() => { api.read.mockReset().mockResolvedValue(empty); api.mutate.mockReset() })
afterEach(cleanup)
it('shows the fixed policy and read status without management controls to developers', async () => {
 render(<WorkspacePermissionsContext value={{ actor_id: 'dev', role: 'developer', grants: [] }}><RepositoryBranchProtection projects={[{ id: 'p', name: 'Project', repository_id: 'r' }]} provider="github"/></WorkspacePermissionsContext>)
 await screen.findByText('Sin configurar')
 expect(api.read.mock.calls[0][0]).toBe('/api/v1/projects/p/repositories/r/branch-protection')
 expect(screen.queryByText('Preparar vista previa')).toBeNull()
 expect(screen.getByText(/main, develop, stage y preprod requieren PR/)).toBeTruthy()
})
it('requires explicit GitHub checks and a current provider preview before applying its revision', async () => {
 const prepared = { ...empty, revision: 3, status: 'prepared', required_checks: ['CI / build'], plan }
 api.mutate.mockResolvedValue({ ok: true, json: async () => prepared })
 render(<WorkspacePermissionsContext value={{ actor_id: 'manager', role: 'manager', grants: [] }}><RepositoryBranchProtection projects={[{ id: 'p', name: 'Project', repository_id: 'r' }]} provider="github"/></WorkspacePermissionsContext>)
 await screen.findByText('Sin configurar')
 const preview = screen.getByText('Preparar vista previa') as HTMLButtonElement
 const apply = screen.getByText('Aplicar protección de ramas') as HTMLButtonElement
 expect(preview.disabled).toBe(true)
 expect(apply.disabled).toBe(true)
 fireEvent.change(screen.getByRole('textbox'), { target: { value: 'CI / build\nCI / build' } })
 fireEvent.click(preview)
 await screen.findByText('Vista previa preparada')
 expect(JSON.parse(api.mutate.mock.calls[0][1].body)).toEqual({ required_checks: ['CI / build'] })
 expect(apply.disabled).toBe(false)
 fireEvent.change(screen.getByRole('textbox'), { target: { value: 'CI / test' } })
 expect(apply.disabled).toBe(true)
 fireEvent.click(preview)
 await waitFor(() => expect(apply.disabled).toBe(false))
 api.mutate.mockResolvedValueOnce({ ok: false, status: 409, json: async () => ({ title: 'revision conflict' }) })
 fireEvent.click(apply)
 await screen.findByText('La protección cambió. Actualiza y prepara una nueva vista previa.')
 expect(JSON.parse(api.mutate.mock.calls[2][1].body)).toEqual({ expected_revision: 3 })
 expect(apply.disabled).toBe(true)
 expect(screen.getByText('Vista previa preparada')).toBeTruthy()
})
it('retains the previous status when a refresh fails', async () => {
 render(<RepositoryBranchProtection projects={[{ id: 'p', name: 'Project', repository_id: 'r' }]} provider="gitlab"/>)
 await screen.findByText('Sin configurar')
 api.read.mockRejectedValueOnce(Error('secret-provider-token'))
 fireEvent.click(screen.getByText('Actualizar protección de ramas'))
 await screen.findByText('No pudimos consultar la protección de ramas. Vuelve a intentarlo.')
 expect(screen.getByText('Sin configurar')).toBeTruthy()
 expect(screen.queryByText('secret-provider-token')).toBeNull()
})
it('rejects malformed stored responses', () => {
 expect(() => parseRepositoryBranchProtection({ ...empty, revision: -1 })).toThrow()
 expect(() => parseRepositoryBranchProtection({ ...empty, required_checks: [42] })).toThrow()
})
it('allows GitLab pipeline-only configuration and isolates project selection', async () => {
 render(<WorkspacePermissionsContext value={{ actor_id: 'admin', role: 'super_admin', grants: [] }}><RepositoryBranchProtection projects={[{ id: 'p', name: 'Project', repository_id: 'r' }]} provider="gitlab"/></WorkspacePermissionsContext>)
 await screen.findByText('Sin configurar')
 expect((screen.getByText('Preparar vista previa') as HTMLButtonElement).disabled).toBe(false)
 expect(screen.getByText('GitLab exige un pipeline correcto. Puedes dejar vacía la lista de comprobaciones.')).toBeTruthy()
})
it('rejects forged verification and drops provider operations from the display model', () => {
 expect(() => parseRepositoryBranchProtection({ ...empty, status: 'applied', result: plan })).toThrow()
 const parsed = parseRepositoryBranchProtection({ ...empty, status: 'prepared', revision: 1, plan: { ...plan, operations: [{ body: { token: 'secret' } }] } })
 expect(JSON.stringify(parsed)).not.toContain('secret')
 expect(parsed.plan?.branches.map(branch => branch.name)).toEqual(['main', 'develop', 'stage', 'preprod'])
})

it('explains missing base branches without exposing raw provider errors', async () => {
 api.mutate.mockResolvedValueOnce({ ok: false, status: 409, json: async () => ({ title: 'Conflict: All four base branches must exist before protection; bootstrap missing branches separately secret-token' }) })
 render(<WorkspacePermissionsContext value={{ actor_id: 'admin', role: 'super_admin', grants: [] }}><RepositoryBranchProtection projects={[{ id: 'p', name: 'Project', repository_id: 'r' }]} provider="gitlab"/></WorkspacePermissionsContext>)
 await screen.findByText('Sin configurar')
 fireEvent.click(screen.getByText('Preparar vista previa'))
 await screen.findByText('Crea las ramas faltantes en el proveedor y prepara una nueva vista previa. Nexora no crea ramas automáticamente.')
 expect(screen.queryByText(/secret-token/)).toBeNull()
 expect((screen.getByText('Aplicar protección de ramas') as HTMLButtonElement).disabled).toBe(true)
})
