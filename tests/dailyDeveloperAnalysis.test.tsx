// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import DailyDeveloperAnalysisPage from '../src/pages/DailyDeveloperAnalysisPage'
import { canOpenWorkspacePath } from '../src/utils/canOpenWorkspacePath'
import type { MemberRole } from '../src/types/MemberRole'
vi.mock('../src/services/readApiJson', () => ({ readApiJson: vi.fn() }))
import { readApiJson } from '../src/services/readApiJson'
afterEach(() => { cleanup(); vi.resetAllMocks() })
it('restricts the analysis page to leadership roles independently from repository grants', () => {
 for (const role of ['technical_lead', 'pmo', 'manager', 'super_admin'] as MemberRole[]) expect(canOpenWorkspacePath('/code/analyses', { actor_id: 'lead', role, grants: [] })).toBe(true)
 expect(canOpenWorkspacePath('/code/analyses', { actor_id: 'dev', role: 'developer', grants: [{ capability: 'repositories:read', project_id: 'p' }] })).toBe(false)
})
it('loads cached reports only and uses the organization closed date without starting AI', async () => {
 vi.mocked(readApiJson).mockImplementation(async path => path.endsWith('/members') ? { items: [{ id: 'dev', name: 'Developer' }], latest_date: '2026-11-08', timezone: 'America/El_Salvador' } : { member_id: 'dev', date: '2026-11-08', status: 'complete', report: { summary: 'Documented retry policy.' }, evidence: { items: [], counts: {} } })
 const view = render(<DailyDeveloperAnalysisPage/>)
 await waitFor(() => expect(view.getByText('Documented retry policy.')).toBeTruthy())
 expect(readApiJson).toHaveBeenCalledWith('/api/v1/developer-analyses?member_id=dev&date=2026-11-08', expect.any(AbortSignal))
 expect(view.getByLabelText('Fecha').getAttribute('max')).toBe('2026-11-08')
 const count = vi.mocked(readApiJson).mock.calls.length
 fireEvent.click(view.getByRole('button', { name: 'Actualizar' }))
 await waitFor(() => expect(vi.mocked(readApiJson).mock.calls.length).toBeGreaterThan(count))
 expect(vi.mocked(readApiJson).mock.calls.every(([path]) => path.startsWith('/api/v1/developer-analyses'))).toBe(true)
})
