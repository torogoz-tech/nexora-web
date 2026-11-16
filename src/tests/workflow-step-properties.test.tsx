// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WorkflowStepEditor from '../components/WorkflowStepEditor'
import { workflowStepOrderValid } from '../utils/workflowStepOrderValid'
import type { WorkflowStep } from '../types/WorkflowStep'
beforeEach(() => {
  HTMLElement.prototype.hidePopover = vi.fn()
})
afterEach(cleanup)
describe('step properties and ordering', () => {
  it('allows notification before advancement while preventing advancement deletion', () => {
    render(<WorkflowStepEditor steps={[{ kind: 'advance_state' }, { kind: 'notify', channel: 'email' }]} onChange={vi.fn()} />)
    expect((screen.getAllByRole('button', { name: 'Subir paso' })[1] as HTMLButtonElement).disabled).toBe(false)
    expect((screen.getAllByRole('button', { name: 'Quitar paso' })[0] as HTMLButtonElement).disabled).toBe(true)
  })
  it('edits notification channel and shows its actual recipient', () => {
    const change = vi.fn()
    render(<WorkflowStepEditor steps={[{ kind: 'advance_state' }, { kind: 'notify', channel: 'email' }]} onChange={change} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Configurar paso' })[1]!)
    fireEvent.click(screen.getByRole('combobox', { name: 'Canal de notificación' }))
    fireEvent.click(screen.getByRole('option', { hidden: true, name: 'Notificación interna' }))
    expect(change).toHaveBeenCalledWith([{ kind: 'advance_state' }, { kind: 'notify', channel: 'in_app' }])
    expect(screen.getByText('Destinatario')).toBeTruthy()
  })
  it('preserves a pinned repository when editing branches', () => {
    const change = vi.fn(), steps: WorkflowStep[] = [{ kind: 'create_pull_request', source_branch: 'develop', target_branch: 'stage', repository_id: 'repo_existing' }, { kind: 'advance_state' }]
    render(<WorkflowStepEditor steps={steps} onChange={change} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Configurar paso' })[0]!)
    fireEvent.change(screen.getByLabelText('Rama de destino'), { target: { value: 'main' } })
    expect(change).toHaveBeenCalledWith([{ ...steps[0], target_branch: 'main' }, steps[1]])
  })
  it('does not offer a duplicate approval if one already exists as a condition', () => {
    render(<WorkflowStepEditor steps={[]} hasApprovalGuard onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('combobox', { name: 'Tipo de paso' }))
    expect(screen.queryByRole('option', { hidden: true, name: 'Solicitar aprobación' })).toBeNull()
  })
  it('accepts only preconditions, a single advancement, then notifications', () => {
    expect(workflowStepOrderValid([{ kind: 'verify_push' }, { kind: 'advance_state' }, { kind: 'notify', channel: 'email' }])).toBe(true)
    expect(workflowStepOrderValid([{ kind: 'advance_state' }, { kind: 'require_approval' }])).toBe(false)
    expect(workflowStepOrderValid([{ kind: 'advance_state' }, { kind: 'advance_state' }])).toBe(false)
  })
})
